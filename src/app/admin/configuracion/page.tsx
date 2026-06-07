'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

// All keys the CMS surfaces. The DB may contain extras (e.g. legacy)
// — we preserve them on save by passing through whatever loaded.
const SECTIONS = [
  {
    title: 'Portada (Hero)',
    description: 'Lo primero que ve quien entra al sitio. Para el banner conviene una foto horizontal (apaisada) y bien iluminada. Si no entra justa, podés arrastrarla para reencuadrarla.',
    fields: [
      { key: 'hero_subtitle', label: 'Antetítulo (eyebrow)', type: 'text' },
      { key: 'hero_title',    label: 'Título principal',     type: 'text' },
      { key: 'hero_cta',      label: 'Texto del botón',      type: 'text' },
      { key: 'hero_image_url', label: 'Foto del hero',       type: 'hero' },
    ],
  },
  {
    title: 'Tira de proceso',
    description: 'Las 3 columnas que aparecen abajo de "New in".',
    fields: [
      { key: 'process_1_title', label: 'Col 1 — Título', type: 'text' },
      { key: 'process_1_body',  label: 'Col 1 — Texto',  type: 'textarea' },
      { key: 'process_2_title', label: 'Col 2 — Título', type: 'text' },
      { key: 'process_2_body',  label: 'Col 2 — Texto',  type: 'textarea' },
      { key: 'process_3_title', label: 'Col 3 — Título', type: 'text' },
      { key: 'process_3_body',  label: 'Col 3 — Texto',  type: 'textarea' },
    ],
  },
  {
    title: 'Sobre Anush',
    description: 'La sección split con foto + texto en el home.',
    fields: [
      { key: 'about_eyebrow', label: 'Antetítulo',           type: 'text' },
      { key: 'about_title',   label: 'Título (línea 1)',     type: 'text' },
      { key: 'about_title_em', label: 'Título (línea 2 en cursiva)', type: 'text' },
      { key: 'about_body',    label: 'Texto',                type: 'textarea' },
      { key: 'about_image_url', label: 'Foto',               type: 'image' },
      { key: 'about_cta',     label: 'Texto del botón',      type: 'text' },
    ],
  },
  {
    title: 'Preguntas frecuentes',
    description: 'Las 4 preguntas que aparecen al final del home.',
    fields: [
      { key: 'faq_1_q', label: 'Pregunta 1', type: 'text' },
      { key: 'faq_1_a', label: 'Respuesta 1', type: 'textarea' },
      { key: 'faq_2_q', label: 'Pregunta 2', type: 'text' },
      { key: 'faq_2_a', label: 'Respuesta 2', type: 'textarea' },
      { key: 'faq_3_q', label: 'Pregunta 3', type: 'text' },
      { key: 'faq_3_a', label: 'Respuesta 3', type: 'textarea' },
      { key: 'faq_4_q', label: 'Pregunta 4', type: 'text' },
      { key: 'faq_4_a', label: 'Respuesta 4', type: 'textarea' },
    ],
  },
  {
    title: 'Contacto',
    description: 'Cómo te encuentran los clientes. Visible en footer y página de contacto.',
    fields: [
      { key: 'contact_whatsapp',     label: 'WhatsApp (visible)',         type: 'text', placeholder: '+598 94 605 015' },
      { key: 'contact_whatsapp_url', label: 'WhatsApp link (wa.me/...)',  type: 'text', placeholder: 'https://wa.me/59894605015' },
      { key: 'contact_instagram',    label: 'Instagram (visible)',        type: 'text', placeholder: '@dahila.crochet' },
      { key: 'contact_instagram_url', label: 'Instagram link',            type: 'text', placeholder: 'https://www.instagram.com/dahila.crochet/' },
      { key: 'contact_location',     label: 'Ubicación',                  type: 'text' },
      { key: 'brand_short_intro',    label: 'Frase corta de marca (footer)', type: 'textarea' },
    ],
  },
] as const

type FieldType = 'text' | 'textarea' | 'image' | 'hero'

// Shared upload helper used by both the simple image field and the hero banner.
async function uploadToMedia(file: File): Promise<string> {
  const supabase = createClient()
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `site/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
  const { error: upErr } = await supabase.storage
    .from('media')
    .upload(path, file, { cacheControl: '3600', upsert: false })
  if (upErr) throw upErr
  const { data: pub } = supabase.storage.from('media').getPublicUrl(path)
  return pub.publicUrl
}

/**
 * Hero banner editor — upload a (horizontal) photo, then drag it inside a
 * preview that matches the live hero's aspect ratio to set the focal point,
 * exactly like the LinkedIn / YouTube banner croppers. The position is stored
 * as "x% y%" in `hero_image_position`.
 */
function HeroBannerEditor({
  url,
  position,
  onUrl,
  onPosition,
}: {
  url: string
  position: string
  onUrl: (v: string) => void
  onPosition: (v: string) => void
}) {
  const fileInput = useRef<HTMLInputElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  const [px, py] = (() => {
    const m = position.match(/(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%/)
    return m ? [Number(m[1]), Number(m[2])] : [50, 30]
  })()

  const setFromPointer = (clientX: number, clientY: number) => {
    const el = frameRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100))
    const y = Math.max(0, Math.min(100, ((clientY - r.top) / r.height) * 100))
    onPosition(`${Math.round(x)}% ${Math.round(y)}%`)
  }

  const handleFile = async (file: File) => {
    setError(null)
    setUploading(true)
    try {
      onUrl(await uploadToMedia(file))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al subir')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Live-ratio preview. 16/7 ≈ the desktop hero band. Drag to reposition. */}
      <div
        ref={frameRef}
        onPointerDown={(e) => { if (url) { setDragging(true); (e.target as HTMLElement).setPointerCapture?.(e.pointerId); setFromPointer(e.clientX, e.clientY) } }}
        onPointerMove={(e) => { if (dragging) setFromPointer(e.clientX, e.clientY) }}
        onPointerUp={() => setDragging(false)}
        style={{
          position: 'relative', width: '100%', maxWidth: 520, aspectRatio: '16 / 7',
          borderRadius: 10, overflow: 'hidden', background: '#FAF1DF',
          border: '1px solid rgba(31,26,27,0.12)',
          cursor: url ? (dragging ? 'grabbing' : 'grab') : 'default',
          touchAction: 'none', userSelect: 'none',
        }}
      >
        {url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt=""
              draggable={false}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${px}% ${py}%`, pointerEvents: 'none' }}
            />
            {/* Focal-point marker + readability scrim like the real hero */}
            <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(255,255,255,0.5), rgba(255,255,255,0) 55%)', pointerEvents: 'none' }} />
            <div aria-hidden style={{
              position: 'absolute', left: `${px}%`, top: `${py}%`, transform: 'translate(-50%, -50%)',
              width: 26, height: 26, borderRadius: 999, border: '2px solid #fff',
              boxShadow: '0 0 0 2px rgba(31,26,27,0.4)', pointerEvents: 'none',
            }} />
          </>
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8C8285', fontSize: 13 }}>
            Subí una foto horizontal para la portada
          </div>
        )}
      </div>

      {url && (
        <p style={{ margin: 0, fontSize: 12, color: '#8C8285' }}>
          Arrastrá sobre la imagen para elegir qué parte se ve. Posición actual: {px}% {py}%.
        </p>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
        />
        <button type="button" onClick={() => fileInput.current?.click()} disabled={uploading} className="admin-btn admin-btn-secondary admin-btn-sm">
          {uploading ? 'Subiendo...' : url ? 'Cambiar foto' : 'Subir foto'}
        </button>
        {url && (
          <>
            <button type="button" onClick={() => onPosition('50% 30%')} className="admin-btn admin-btn-secondary admin-btn-sm">
              Centrar
            </button>
            <button type="button" onClick={() => { onUrl(''); onPosition('50% 30%') }} className="admin-btn admin-btn-secondary admin-btn-sm">
              Quitar
            </button>
          </>
        )}
        <input
          type="text"
          value={url}
          onChange={(e) => onUrl(e.target.value)}
          placeholder="o pegá una URL"
          style={{ flex: '1 1 200px', minWidth: 0 }}
        />
      </div>
      {error && <div role="alert" style={{ color: '#7a1e2f', fontSize: 12 }}>{error}</div>}
    </div>
  )
}

function ImageUploader({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    setError(null)
    setUploading(true)
    try {
      onChange(await uploadToMedia(file))
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al subir'
      setError(msg)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {value && (
        <div style={{
          position: 'relative', width: '100%', maxWidth: 320, aspectRatio: '4/5',
          borderRadius: 8, overflow: 'hidden', background: '#FAF1DF',
        }}>
          {/* SVG/external URLs work via plain <img> here — admin preview only */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleFile(f)
            e.target.value = ''
          }}
        />
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
          className="admin-btn admin-btn-secondary admin-btn-sm"
        >
          {uploading ? 'Subiendo...' : value ? 'Cambiar foto' : 'Subir foto'}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="admin-btn admin-btn-secondary admin-btn-sm"
          >
            Quitar
          </button>
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="o pegá una URL"
          style={{ flex: '1 1 200px', minWidth: 0 }}
        />
      </div>
      {error && (
        <div role="alert" style={{ color: '#7a1e2f', fontSize: 12 }}>{error}</div>
      )}
    </div>
  )
}

export default function ConfiguracionAdminPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadSettings = useCallback(async () => {
    setError(null)
    try {
      const supabase = createClient()
      const { data, error: err } = await supabase.from('site_settings').select('*')
      if (err) throw err

      const loaded: Record<string, string> = {}
      ;(data ?? []).forEach((item) => {
        if (item?.key) loaded[item.key as string] = String(item.value ?? '')
      })
      setSettings(loaded)
    } catch (e) {
      console.error('Error cargando configuración', e)
      setError('No se pudo cargar la configuración. Ejecutá database/schema-extra.sql en Supabase si todavía no lo hiciste.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSettings()
  }, [loadSettings])

  const update = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)
    setError(null)

    try {
      const supabase = createClient()
      const updates = Object.entries(settings)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([key, value]) => ({
          key,
          value: value ?? '',
          updated_at: new Date().toISOString(),
        }))

      const { error: err } = await supabase
        .from('site_settings')
        .upsert(updates, { onConflict: 'key' })

      if (err) throw err
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) {
      console.error('Error guardando configuración', e)
      const msg = e instanceof Error ? e.message : 'No se pudieron guardar los cambios.'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 880 }}>
      <div className="admin-page-header">
        <div>
          <h2>Configuración del sitio</h2>
          <p>Editá textos, fotos e información de contacto. Los cambios se ven en vivo en el sitio.</p>
        </div>
      </div>

      {success && (
        <div style={{
          background: '#e8f5e9', color: '#2e7d32', padding: '12px 14px',
          borderRadius: 8, marginBottom: 18, fontSize: 13,
          display: 'flex', alignItems: 'center', gap: 8, position: 'sticky', top: 14, zIndex: 5,
        }}>
          <span aria-hidden>✓</span> Guardado.
        </div>
      )}

      {error && (
        <div role="alert" style={{
          background: 'rgba(182,49,74,0.06)',
          border: '1px solid rgba(182,49,74,0.24)',
          color: '#7a1e2f',
          padding: '12px 14px',
          borderRadius: 8,
          marginBottom: 18,
          fontSize: 13,
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {SECTIONS.map((section) => (
          <section key={section.title} className="admin-card">
            <div style={{ marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #eee' }}>
              <h3 style={{ margin: 0, fontWeight: 400, fontSize: '1.1rem', fontFamily: 'var(--font-display)' }}>
                {section.title}
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#8C8285' }}>{section.description}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {section.fields.map((field) => {
                const value = settings[field.key] ?? ''
                const fieldType: FieldType = field.type
                return (
                  <div key={field.key} className="admin-field">
                    <label htmlFor={field.key} style={{ display: 'block', marginBottom: 6 }}>
                      {field.label}
                    </label>
                    {fieldType === 'text' && (
                      <input
                        id={field.key}
                        type="text"
                        value={value}
                        placeholder={'placeholder' in field ? field.placeholder : ''}
                        onChange={(e) => update(field.key, e.target.value)}
                      />
                    )}
                    {fieldType === 'textarea' && (
                      <textarea
                        id={field.key}
                        value={value}
                        rows={3}
                        onChange={(e) => update(field.key, e.target.value)}
                      />
                    )}
                    {fieldType === 'image' && (
                      <ImageUploader value={value} onChange={(v) => update(field.key, v)} />
                    )}
                    {fieldType === 'hero' && (
                      <HeroBannerEditor
                        url={value}
                        position={settings.hero_image_position ?? '50% 30%'}
                        onUrl={(v) => update(field.key, v)}
                        onPosition={(v) => update('hero_image_position', v)}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        ))}

        <div
          style={{
            position: 'sticky',
            bottom: 0,
            background: '#fff',
            padding: '14px 0',
            borderTop: '1px solid #eee',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
          }}
        >
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={saving}
            style={{ minWidth: 200 }}
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
