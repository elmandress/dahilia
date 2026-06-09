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
    title: 'Barra de promoción (arriba de todo)',
    description: 'La franja superior del sitio. Usala para anuncios cortos: "Envío gratis esta semana", "Nueva colección", etc. Podés ponerle un link y cambiarle los colores.',
    fields: [
      { key: 'promo_bar_enabled', label: '¿Mostrar la barra?', type: 'toggle' },
      { key: 'promo_bar_text',    label: 'Texto', type: 'text', placeholder: 'Hecho a mano en Uruguay · Envío a todo el país · A medida' },
      { key: 'promo_bar_link',    label: 'Link (opcional)', type: 'text', placeholder: '/ofertas' },
      { key: 'promo_bar_bg',      label: 'Color de fondo', type: 'color' },
      { key: 'promo_bar_fg',      label: 'Color del texto', type: 'color' },
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
    title: 'Banner del home (promoción / destacado)',
    description: 'Una sección con foto, texto y botón que aparece en la página principal. Prendela cuando quieras destacar algo (una colección, una promo, un anuncio). Si la apagás, no se muestra.',
    fields: [
      { key: 'home_banner_enabled',   label: '¿Mostrar el banner?', type: 'toggle' },
      { key: 'home_banner_eyebrow',   label: 'Antetítulo (opcional)', type: 'text', placeholder: 'Nueva colección' },
      { key: 'home_banner_title',     label: 'Título', type: 'text', placeholder: 'Invierno 2026' },
      { key: 'home_banner_body',      label: 'Texto', type: 'textarea' },
      { key: 'home_banner_cta_label', label: 'Texto del botón', type: 'text', placeholder: 'Ver la colección' },
      { key: 'home_banner_cta_link',  label: 'Link del botón', type: 'text', placeholder: '/tienda' },
      { key: 'home_banner_image_url', label: 'Foto', type: 'image' },
    ],
  },
  {
    title: 'Sobre nosotros',
    description: 'La sección del home (foto + texto) y la página "Sobre nosotros". Todo es editable.',
    fields: [
      { key: 'about_eyebrow', label: 'Antetítulo',           type: 'text' },
      { key: 'about_title',   label: 'Título',               type: 'text' },
      { key: 'about_title_em', label: 'Título — 2ª línea en cursiva (solo home)', type: 'text' },
      { key: 'about_body',    label: 'Texto principal',      type: 'textarea' },
      { key: 'about_body_2',  label: 'Texto adicional (opcional, solo página)', type: 'textarea' },
      { key: 'about_quote',   label: 'Frase destacada (opcional, solo página)', type: 'textarea' },
      { key: 'about_image_url', label: 'Foto',               type: 'image' },
      { key: 'about_cta',     label: 'Texto del botón (home)', type: 'text' },
    ],
  },
  {
    title: 'Sobre nosotros — Valores',
    description: 'Los 3 bloques de valores en la página "Sobre nosotros".',
    fields: [
      { key: 'about_value_1_title', label: 'Valor 1 — Título', type: 'text' },
      { key: 'about_value_1_body',  label: 'Valor 1 — Texto',  type: 'textarea' },
      { key: 'about_value_2_title', label: 'Valor 2 — Título', type: 'text' },
      { key: 'about_value_2_body',  label: 'Valor 2 — Texto',  type: 'textarea' },
      { key: 'about_value_3_title', label: 'Valor 3 — Título', type: 'text' },
      { key: 'about_value_3_body',  label: 'Valor 3 — Texto',  type: 'textarea' },
    ],
  },
  {
    title: 'La artesana',
    description: 'Aparece en cada ficha de producto: foto pequeña, nombre y una descripción breve de quién hace las prendas. Si el texto está vacío, la sección no se muestra.',
    fields: [
      { key: 'maker_name',      label: 'Nombre',      type: 'text',     placeholder: 'Anush' },
      { key: 'maker_bio',       label: 'Descripción', type: 'textarea', placeholder: 'Tejo a crochet desde 2015, siempre a mano y con materiales naturales.' },
      { key: 'maker_photo_url', label: 'Foto (redonda, 40×40)',  type: 'image' },
    ],
  },
  {
    title: 'Opciones de pago',
    description: 'Activá el mensaje de cuotas que aparece debajo del botón "Agregar al carrito". Al hacer clic, el cliente abre WhatsApp con el mensaje pre-llenado.',
    fields: [
      { key: 'installments_enabled', label: '¿Mostrar el mensaje de cuotas?', type: 'toggle' },
      { key: 'installments_label',   label: 'Texto del link', type: 'text', placeholder: '¿Querés pagar en 2 cuotas? Hablemos por WhatsApp →' },
    ],
  },
  {
    title: 'Página "Sobre nosotros" — fotos',
    description: 'Las 3 fotos en formato retrato (3:4) que aparecen al pie de la página Atelier.',
    fields: [
      { key: 'atelier_photo_1', label: 'Foto 1', type: 'image' },
      { key: 'atelier_photo_2', label: 'Foto 2', type: 'image' },
      { key: 'atelier_photo_3', label: 'Foto 3', type: 'image' },
    ],
  },
  {
    title: 'Esta semana en el taller',
    description: 'Un bloque en el home donde Anush puede contar qué está tejiendo. Humaniza la marca sin necesitar Instagram. Si está apagado o el texto vacío, no se muestra.',
    fields: [
      { key: 'atelier_note_enabled',   label: '¿Mostrar esta sección?', type: 'toggle' },
      { key: 'atelier_note_text',      label: 'Texto (en voz de Anush, estilo conversacional)', type: 'textarea', placeholder: 'Esta semana estoy terminando dos cardigans de lana merino para pedidos de julio. Si querés uno igual, escribime.' },
      { key: 'atelier_note_cta_label', label: 'Texto del botón (opcional)', type: 'text', placeholder: 'Pedir a medida' },
      { key: 'atelier_note_cta_link',  label: 'Link del botón (opcional)', type: 'text', placeholder: '/encargo' },
    ],
  },
  {
    title: 'Ficha de producto — pasos del proceso',
    description: 'Un mini-stepper de 3 pasos que aparece en prendas "solo a medida" para explicar cómo funciona encargar. Reducís el miedo a pedir. Si está apagado, no se muestra.',
    fields: [
      { key: 'pdp_process_enabled', label: '¿Mostrar el proceso en fichas a medida?', type: 'toggle' },
      { key: 'pdp_process_step_1_label', label: 'Paso 1 — Título', type: 'text', placeholder: 'Escribís' },
      { key: 'pdp_process_step_1_body',  label: 'Paso 1 — Texto',  type: 'textarea', placeholder: 'Contame qué prenda querés, tu medida y colores favoritos.' },
      { key: 'pdp_process_step_2_label', label: 'Paso 2 — Título', type: 'text', placeholder: 'Elegimos juntas' },
      { key: 'pdp_process_step_2_body',  label: 'Paso 2 — Texto',  type: 'textarea', placeholder: 'Te muestro las lanas disponibles y confirmamos todos los detalles.' },
      { key: 'pdp_process_step_3_label', label: 'Paso 3 — Título', type: 'text', placeholder: 'Te lo tejo' },
      { key: 'pdp_process_step_3_body',  label: 'Paso 3 — Texto',  type: 'textarea', placeholder: 'Trabajo en tu prenda y te aviso cuando está lista para enviar.' },
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
  {
    title: 'Botón de WhatsApp flotante',
    description: 'Un círculo verde fijo en la esquina de todas las páginas. Al tocarlo, abre WhatsApp con un mensaje genérico. Ideal para capturar consultas espontáneas. Usá el número que configuraste en Contacto.',
    fields: [
      { key: 'whatsapp_float_enabled', label: '¿Mostrar el botón flotante?', type: 'toggle' },
    ],
  },
  {
    title: 'Cupos de encargos semanales',
    description: 'Mostrá en la página de encargo cuántos lugares quedan. Actualización manual: subí "Tomados" cada vez que confirmás un pedido. Al empezar la semana, reseteá ambos desde acá. Si está apagado o el total es 0, no se muestra nada.',
    fields: [
      { key: 'encargos_cupos_enabled', label: '¿Mostrar cupos disponibles?', type: 'toggle' },
      { key: 'encargos_cupos_total',   label: 'Total de lugares por semana', type: 'text', placeholder: '4' },
      { key: 'encargos_cupos_taken',   label: 'Lugares ya tomados esta semana', type: 'text', placeholder: '0' },
      { key: 'encargos_cupos_label',   label: 'Texto personalizado (opcional)', type: 'text', placeholder: 'Quedan 2 lugares para esta semana' },
    ],
  },
  {
    title: 'Información (envíos, cambios, cuidados)',
    description: 'Se muestra en la página "Información" (link en el footer) y donde corresponda.',
    fields: [
      { key: 'size_guide_note',  label: 'Nota de la tabla de talles', type: 'textarea' },
      { key: 'shipping_estimate', label: 'Envío — línea corta (se muestra en producto y carrito)', type: 'text', placeholder: 'Montevideo $200 · Interior por agencia' },
      { key: 'pdp_trust_1', label: 'Garantía 1 (en cada producto)', type: 'text', placeholder: 'Envío a todo Uruguay' },
      { key: 'pdp_trust_2', label: 'Garantía 2 (en cada producto)', type: 'text', placeholder: 'Hecho a mano' },
      { key: 'pdp_trust_3', label: 'Garantía 3 (en cada producto)', type: 'text', placeholder: 'Coordinás por WhatsApp' },
      { key: 'info_shipping',    label: 'Envíos',          type: 'textarea' },
      { key: 'info_returns',     label: 'Cambios y devoluciones', type: 'textarea' },
      { key: 'info_care',        label: 'Cuidados de las prendas', type: 'textarea' },
      { key: 'info_custom',      label: 'Cómo encargar a medida', type: 'textarea' },
      { key: 'info_payment',     label: 'Formas de pago', type: 'textarea' },
    ],
  },
] as const

type FieldType = 'text' | 'textarea' | 'image' | 'hero' | 'toggle' | 'color'

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
                    {fieldType === 'toggle' && (
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
                        <input
                          id={field.key}
                          type="checkbox"
                          checked={value !== 'false'}
                          onChange={(e) => update(field.key, e.target.checked ? 'true' : 'false')}
                          style={{ width: 18, height: 18 }}
                        />
                        {value !== 'false' ? 'Sí, mostrar' : 'No mostrar'}
                      </label>
                    )}
                    {fieldType === 'color' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input
                          type="color"
                          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : '#1F1A1B'}
                          onChange={(e) => update(field.key, e.target.value)}
                          style={{ width: 44, height: 36, padding: 0, border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer' }}
                          aria-label={field.label}
                        />
                        <input
                          id={field.key}
                          type="text"
                          value={value}
                          placeholder="#1F1A1B"
                          onChange={(e) => update(field.key, e.target.value)}
                          style={{ flex: '1 1 140px', minWidth: 0 }}
                        />
                      </div>
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
