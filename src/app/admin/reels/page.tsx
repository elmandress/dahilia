'use client'

// Reels de Instagram en la tienda (21/10/2026): Anush pega el link del reel y
// elige la prenda que aparece. Sale en la home ("Mirala puesta") y en la ficha
// de esa prenda ("Mirala en movimiento"), con el camino a la ficha debajo del
// video. Se guarda en site_settings (clave `reels`): no hace falta SQL.

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { notifySiteWideChange } from '@/lib/seo-notify'
import { parseReels, reelEmbedUrl, REELS_MAX, REELS_SETTING_KEY, type Reel } from '@/lib/reels'

type ProductOption = { slug: string; name: string; status: string }

const inputStyle: React.CSSProperties = { padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(31,26,27,0.18)', fontSize: 13, background: '#fff' }
const labelStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#4A4143' }

export default function ReelsPage() {
  const [reels, setReels] = useState<Reel[]>([])
  const [saved, setSaved] = useState('[]')
  const [products, setProducts] = useState<ProductOption[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)
  const [url, setUrl] = useState('')
  const [product, setProduct] = useState('')
  const [caption, setCaption] = useState('')

  const load = useCallback(async () => {
    const supabase = createClient()
    const [settingRes, prodRes] = await Promise.all([
      supabase.from('site_settings').select('value').eq('key', REELS_SETTING_KEY).maybeSingle(),
      supabase.from('products').select('slug, name, status').order('name'),
    ])
    if (settingRes.error || prodRes.error) setError('No se pudo leer la base. Probá recargar la página.')
    const list = parseReels((settingRes.data as { value: string } | null)?.value)
    setReels(list)
    setSaved(JSON.stringify(list))
    setProducts((prodRes.data ?? []) as ProductOption[])
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const dirty = JSON.stringify(reels) !== saved
  const urlOk = url.trim() === '' || reelEmbedUrl(url) != null
  const nameOf = (slug: string) => products.find((p) => p.slug === slug)?.name ?? slug
  const isActive = (slug: string) => products.find((p) => p.slug === slug)?.status === 'active'

  const add = () => {
    setError(null)
    if (!reelEmbedUrl(url)) { setError('Ese link no parece de un reel. Copialo desde Instagram: ⋯ → Copiar enlace.'); return }
    if (!product) { setError('Elegí la prenda que aparece en el reel.'); return }
    if (reels.length >= REELS_MAX) { setError(`Hasta ${REELS_MAX} reels: sacá uno viejo para sumar este.`); return }
    // El nuevo va primero: el último reel casi siempre es la pieza más nueva.
    setReels([{ url: url.trim(), product, ...(caption.trim() ? { caption: caption.trim() } : {}) }, ...reels])
    setUrl(''); setProduct(''); setCaption('')
  }

  const move = (i: number, d: -1 | 1) => {
    const j = i + d
    if (j < 0 || j >= reels.length) return
    const next = [...reels];
    [next[i], next[j]] = [next[j], next[i]]
    setReels(next)
  }

  const save = async () => {
    setSaving(true); setError(null); setOk(false)
    const supabase = createClient()
    const { error: err } = await supabase
      .from('site_settings')
      .upsert({ key: REELS_SETTING_KEY, value: JSON.stringify(reels), updated_at: new Date().toISOString() }, { onConflict: 'key' })
    setSaving(false)
    if (err) { setError(`No se guardó: ${err.message}`); return }
    // La home y las fichas leen esto del catálogo cacheado: sin el aviso,
    // tardaría hasta una hora en verse.
    notifySiteWideChange()
    setSaved(JSON.stringify(reels))
    setOk(true)
    setTimeout(() => setOk(false), 3000)
  }

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /></div>

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h2>Reels</h2>
          <p>Los reels salen en el inicio (&quot;Mirala puesta&quot;) y en la ficha de su prenda (&quot;Mirala en movimiento&quot;). Se ven adentro del sitio, con el botón a la prenda debajo: la clienta no se va a Instagram.</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={save} disabled={saving || !dirty}>
          {saving ? 'Guardando…' : dirty ? 'Guardar cambios' : 'Guardado'}
        </button>
      </div>

      {error && (
        <div role="alert" style={{ background: 'rgba(182,49,74,0.08)', border: '1px solid rgba(182,49,74,0.24)', color: '#7a1e2f', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          {error}
        </div>
      )}
      {ok && (
        <div role="status" style={{ background: '#e8f5e9', color: '#2e7d32', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          Guardado. En un minuto se ve en la tienda.
        </div>
      )}

      <div className="admin-card" style={{ marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 500 }}>Sumar un reel</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          <label style={labelStyle}>
            Link del reel *
            <input type="url" inputMode="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.instagram.com/reel/…" style={{ ...inputStyle, borderColor: urlOk ? 'rgba(31,26,27,0.18)' : '#B6314A' }} />
            <span style={{ fontSize: 12, color: urlOk ? '#8C8285' : '#7a1e2f' }}>
              {urlOk ? 'En Instagram: ⋯ del reel → Copiar enlace.' : 'Ese link no es de un reel ni de una publicación.'}
            </span>
          </label>
          <label style={labelStyle}>
            Prenda que aparece *
            <select value={product} onChange={(e) => setProduct(e.target.value)} style={inputStyle}>
              <option value="">— Elegir —</option>
              {products.filter((p) => p.status === 'active').map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
            </select>
            <span style={{ fontSize: 12, color: '#8C8285' }}>La tarjeta usa la foto principal de esta prenda.</span>
          </label>
          <label style={labelStyle}>
            Frase (opcional)
            <input type="text" maxLength={90} value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Ej: Así cae el cardigan puesto" style={inputStyle} />
            <span style={{ fontSize: 12, color: '#8C8285' }}>Va sobre la foto, abajo. Corta.</span>
          </label>
        </div>
        <button className="admin-btn admin-btn-secondary" style={{ marginTop: 16 }} onClick={add}>
          + Agregar a la lista
        </button>
      </div>

      {reels.length === 0 ? (
        <div className="admin-card admin-empty">
          <p>Todavía no hay reels. Con el primero aparece la sección en el inicio.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reels.map((r, i) => (
            <div key={`${r.url}-${i}`} className="admin-card" style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 260px', minWidth: 0 }}>
                <div style={{ fontSize: 14, color: '#1F1A1B', fontWeight: 500 }}>
                  {nameOf(r.product)}
                  {!isActive(r.product) && (
                    <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 400, color: '#7a1e2f' }}>· la prenda no está activa: este reel no se muestra</span>
                  )}
                </div>
                {r.caption && <div style={{ fontSize: 13, color: '#4A4143', marginTop: 2 }}>&ldquo;{r.caption}&rdquo;</div>}
                <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#8F3B53', wordBreak: 'break-all' }}>{r.url}</a>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Subir">↑</button>
                <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => move(i, 1)} disabled={i === reels.length - 1} aria-label="Bajar">↓</button>
                <button className="admin-btn admin-btn-secondary admin-btn-sm" style={{ color: '#c0392b' }} onClick={() => setReels(reels.filter((_, k) => k !== i))}>
                  Quitar
                </button>
              </div>
            </div>
          ))}
          {dirty && <p style={{ fontSize: 13, color: '#8F3B53', margin: '4px 0 0' }}>Hay cambios sin guardar: tocá &quot;Guardar cambios&quot; arriba.</p>}
        </div>
      )}
    </>
  )
}
