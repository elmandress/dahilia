'use client'

// Portadas del blog. El texto de cada nota vive en el repo (src/content/blog)
// y cambiarlo requiere un deploy; la foto de portada no: se guarda en
// site_settings (claves en src/content/blog/hero.ts) y el sitio la toma al
// guardar. Se ve en la nota, en el listado, en Google Imágenes y en la
// tarjeta que aparece cuando alguien comparte el link.

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getAllArticles } from '@/content/blog'
import { CLUSTER_LABEL, type Article } from '@/content/blog/types'
import { blogHeroKey, blogHeroAltKey } from '@/content/blog/hero'
import { mediaPath, prepareImageForUpload, STORAGE_CACHE_SECONDS } from '@/lib/media'
import { notifySiteWideChange } from '@/lib/seo-notify'
import { useUnsavedWarning } from '@/lib/use-unsaved-warning'

const ARTICLES = getAllArticles()

/** Lo guardado en la base para una nota (null = lo de la nota original). */
interface Saved { src: string | null; alt: string | null }
/** Lo que se está editando: la foto (null = la original) y su descripción. */
interface Draft { src: string | null; alt: string }

const errorBox: React.CSSProperties = {
  background: 'rgba(182,49,74,0.08)', border: '1px solid rgba(182,49,74,0.24)', color: '#7a1e2f',
  padding: '10px 14px', borderRadius: 8, fontSize: 13,
}

export default function BlogAdminPage() {
  const [saved, setSaved] = useState<Record<string, Saved>>({})
  const [drafts, setDrafts] = useState<Record<string, Draft>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState<{ slug: string; what: 'upload' | 'save' } | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  // Para qué nota se abrió el selector de archivos (hay uno solo, compartido).
  const pickFor = useRef<string | null>(null)

  // Una nota abierta en edición = algo sin guardar.
  useUnsavedWarning(Object.keys(drafts).length > 0)

  const loadData = useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase.from('site_settings').select('key, value').like('key', 'blog_hero%')
    if (error) {
      setLoadError('No se pudieron leer las portadas guardadas (no es que no haya: no se pudo leer la base). Probá recargar la página.')
    } else {
      const values = new Map(((data ?? []) as Array<{ key: string; value: string }>).map((r) => [r.key, r.value]))
      const next: Record<string, Saved> = {}
      for (const a of ARTICLES) {
        next[a.slug] = { src: values.get(blogHeroKey(a.slug)) || null, alt: values.get(blogHeroAltKey(a.slug)) || null }
      }
      setSaved(next)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [loadData])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3500)
  }

  const setError = (slug: string, msg: string | null) =>
    setErrors((prev) => {
      const next = { ...prev }
      if (msg) next[slug] = msg
      else delete next[slug]
      return next
    })

  const closeDraft = (slug: string) =>
    setDrafts((prev) => {
      const next = { ...prev }
      delete next[slug]
      return next
    })

  const pickPhoto = (slug: string) => {
    pickFor.current = slug
    fileRef.current?.click()
  }

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // así se puede volver a elegir el mismo archivo
    const slug = pickFor.current
    if (!file || !slug) return
    if (!file.type.startsWith('image/')) {
      setError(slug, 'Elegí una foto (JPG o PNG).')
      return
    }
    setError(slug, null)
    setBusy({ slug, what: 'upload' })
    try {
      const prepared = await prepareImageForUpload(file)
      const path = mediaPath('blog', slug, `f.${prepared.ext}`)
      const supabase = createClient()
      const { error } = await supabase.storage
        .from('media')
        .upload(path, prepared.blob, { cacheControl: STORAGE_CACHE_SECONDS, contentType: prepared.contentType, upsert: false })
      if (error) throw error
      const { data } = supabase.storage.from('media').getPublicUrl(path)
      // Foto nueva, descripción nueva: la anterior describía otra imagen.
      setDrafts((prev) => ({ ...prev, [slug]: { src: data.publicUrl, alt: '' } }))
    } catch (err) {
      console.error('blog hero upload failed', err)
      setError(slug, 'No se pudo subir la foto. Probá de nuevo o con otra imagen.')
    } finally {
      setBusy(null)
    }
  }

  const save = async (a: Article) => {
    const draft = drafts[a.slug]
    if (!draft) return
    const alt = draft.alt.trim()
    if (draft.src && !alt) {
      setError(a.slug, 'Escribí qué se ve en la foto: lo leen Google y quienes usan lector de pantalla.')
      return
    }
    setError(a.slug, null)
    setBusy({ slug: a.slug, what: 'save' })
    // La descripción se guarda solo si hace falta: con foto propia, o si
    // cambia la de la foto original. Si no, se borra y queda la del repo.
    const keepAlt = alt !== '' && (draft.src !== null || alt !== (a.hero?.alt ?? ''))
    const updatedAt = new Date().toISOString()
    const upserts = [
      ...(draft.src ? [{ key: blogHeroKey(a.slug), value: draft.src, updated_at: updatedAt }] : []),
      ...(keepAlt ? [{ key: blogHeroAltKey(a.slug), value: alt, updated_at: updatedAt }] : []),
    ]
    const deletes = [
      ...(draft.src ? [] : [blogHeroKey(a.slug)]),
      ...(keepAlt ? [] : [blogHeroAltKey(a.slug)]),
    ]
    try {
      const supabase = createClient()
      if (upserts.length > 0) {
        const { error } = await supabase.from('site_settings').upsert(upserts, { onConflict: 'key' })
        if (error) throw error
      }
      if (deletes.length > 0) {
        const { error } = await supabase.from('site_settings').delete().in('key', deletes)
        if (error) throw error
      }
      setSaved((prev) => ({ ...prev, [a.slug]: { src: draft.src, alt: keepAlt ? alt : null } }))
      closeDraft(a.slug)
      notifySiteWideChange()
      showToast('Guardado. En unos segundos se ve en el sitio.')
    } catch (err) {
      console.error('blog hero save failed', err)
      setError(a.slug, 'No se pudo guardar. Probá de nuevo en un momento.')
    } finally {
      setBusy(null)
    }
  }

  const restore = async (a: Article) => {
    if (!confirm(`¿Volver a la foto original de "${a.title}"?`)) return
    setError(a.slug, null)
    setBusy({ slug: a.slug, what: 'save' })
    const { error } = await createClient()
      .from('site_settings')
      .delete()
      .in('key', [blogHeroKey(a.slug), blogHeroAltKey(a.slug)])
    setBusy(null)
    if (error) {
      setError(a.slug, 'No se pudo volver a la original. Probá de nuevo en un momento.')
      return
    }
    setSaved((prev) => ({ ...prev, [a.slug]: { src: null, alt: null } }))
    closeDraft(a.slug)
    notifySiteWideChange()
    showToast('Listo: volvió la foto original.')
  }

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h2>Blog</h2>
          <p>La foto de portada de cada nota: se ve en la nota, en el listado del blog, en Google Imágenes y cuando alguien comparte el link.</p>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: 20, fontSize: 13, lineHeight: 1.6, color: '#4A4143' }}>
        Conviene una foto horizontal: en la nota se recorta a 16:10 y en el listado a 4:3, así que lo importante
        tiene que quedar en el centro. Los textos de las notas viven en el código del sitio; para cambiarlos,
        pedíselo a Mati.
      </div>

      {loadError && <div role="alert" style={{ ...errorBox, marginBottom: 16 }}>{loadError}</div>}

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />

      {loading ? (
        <div className="admin-loading"><div className="admin-spinner" /></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {ARTICLES.map((a) => {
            const draft = drafts[a.slug]
            const custom = Boolean(saved[a.slug]?.src)
            const shownSrc = draft ? (draft.src ?? a.hero?.src ?? null) : (saved[a.slug]?.src ?? a.hero?.src ?? null)
            const currentAlt = saved[a.slug]?.alt ?? a.hero?.alt ?? ''
            const isBusy = busy?.slug === a.slug
            return (
              <div key={a.slug} className="admin-card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{
                  width: 132, flexShrink: 0, aspectRatio: '4 / 3', borderRadius: 8,
                  overflow: 'hidden', background: '#F4EEE6',
                }}>
                  {shownSrc && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={shownSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  )}
                </div>

                <div style={{ flex: '1 1 260px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <a
                      href={`/blog/${a.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#1F1A1B', fontWeight: 500, textDecoration: 'none' }}
                    >
                      {a.title} <span aria-hidden style={{ color: '#8C8285' }}>↗</span>
                    </a>
                    <div style={{ fontSize: 12, color: '#8C8285', marginTop: 2 }}>
                      {CLUSTER_LABEL[a.cluster]} · {custom ? 'Foto cambiada' : 'Foto original'}
                    </div>
                  </div>

                  {draft ? (
                    <>
                      <div className="admin-field" style={{ margin: 0 }}>
                        <label htmlFor={`alt-${a.slug}`}>¿Qué se ve en la foto?</label>
                        <input
                          id={`alt-${a.slug}`}
                          type="text"
                          maxLength={160}
                          value={draft.alt}
                          placeholder={a.hero?.alt ? `Ej.: ${a.hero.alt}` : 'Ej.: Cardigan de crochet crema sobre una silla'}
                          onChange={(e) => {
                            const alt = e.target.value
                            setDrafts((prev) => ({ ...prev, [a.slug]: { ...draft, alt } }))
                          }}
                        />
                        <span className="field-hint">Una frase corta y concreta. La leen Google y quienes usan lector de pantalla.</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button type="button" className="admin-btn admin-btn-primary admin-btn-sm" disabled={isBusy} onClick={() => save(a)}>
                          Guardar
                        </button>
                        <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" disabled={isBusy} onClick={() => pickPhoto(a.slug)}>
                          Elegir otra foto
                        </button>
                        <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" disabled={isBusy} onClick={() => closeDraft(a.slug)}>
                          Cancelar
                        </button>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" disabled={isBusy} onClick={() => pickPhoto(a.slug)}>
                        Cambiar foto
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        disabled={isBusy}
                        onClick={() => setDrafts((prev) => ({ ...prev, [a.slug]: { src: saved[a.slug]?.src ?? null, alt: currentAlt } }))}
                      >
                        Editar descripción
                      </button>
                      {custom && (
                        <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" disabled={isBusy} onClick={() => restore(a)}>
                          Volver a la original
                        </button>
                      )}
                    </div>
                  )}

                  {isBusy && (
                    <span role="status" style={{ fontSize: 12, color: '#8C8285' }}>
                      {busy?.what === 'upload' ? 'Subiendo la foto…' : 'Guardando…'}
                    </span>
                  )}
                  {errors[a.slug] && <div role="alert" style={errorBox}>{errors[a.slug]}</div>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {toast && <div className="admin-toast">{toast}</div>}
    </>
  )
}
