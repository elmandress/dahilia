'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { parseDropDateUY, dropWhenText } from '@/lib/drop-date'

/**
 * Estado de los mails automáticos de la lista (12/10/2026): cuándo sale el
 * aviso del próximo drop (24 h antes de la fecha de Configuración), qué pasó
 * con el último envío, y un botón para mandarse una prueba.
 */
export function AvisoAutomatico() {
  const [s, setS] = useState<Record<string, string>>({})
  const [loaded, setLoaded] = useState(false)
  // Hora fijada al cargar (regla react-hooks/purity: nada de Date.now() en el render).
  const [now, setNow] = useState(0)
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('site_settings').select('key, value')
      .in('key', ['drop_enabled', 'drop_name', 'drop_date', 'drop_collection_slug', 'lista_email_estado', 'lista_email_enviado'])
      .then(({ data }) => {
        setS(Object.fromEntries(((data ?? []) as Array<{ key: string; value: string | null }>).map((r) => [r.key, r.value ?? ''])))
        setNow(Date.now())
        setLoaded(true)
      })
  }, [])

  const sendTest = async () => {
    setSending(true)
    setMsg(null)
    try {
      const res = await fetch('/api/admin/lista-prueba', { method: 'POST' })
      const body = await res.json().catch(() => ({}))
      setMsg(res.ok
        ? { ok: true, text: `Listo: te mandamos los 2 mails a ${body.to}. Fijate si llegaron a la bandeja principal (no a Spam ni Promociones).` }
        : { ok: false, text: body.error ?? 'No se pudo mandar la prueba.' })
    } catch {
      setMsg({ ok: false, text: 'No se pudo mandar la prueba (sin conexión).' })
    } finally {
      setSending(false)
    }
  }

  if (!loaded) return null
  const name = s.drop_enabled !== 'false' ? (s.drop_name ?? '').trim() : ''
  const launch = parseDropDateUY(s.drop_date)
  const sendAt = launch ? new Date(launch.getTime() - 86_400_000) : null
  const alreadySent = name && s.lista_email_enviado === `${name}|${s.drop_date}`

  let next: string
  if (!name || !launch) next = 'No hay un drop con nombre y fecha en Configuración → Próximo drop: no hay aviso programado.'
  else if (alreadySent) next = `El aviso de «${name}» ya salió.`
  else if (launch.getTime() <= now) next = `«${name}» ya salió y el aviso no se mandó (la fecha llegó antes de que se programara).`
  else next = `El aviso de «${name}» sale solo ${dropWhenText(sendAt!)}, 24 h antes del lanzamiento${s.drop_collection_slug ? `, con el link a la colección "${s.drop_collection_slug}" (tiene que estar publicada, aunque sea "solo con link")` : ', con el link a la tienda'}.`

  return (
    <div className="admin-card" style={{ marginBottom: '1.25rem' }}>
      <h3 style={{ margin: '0 0 0.4rem', fontSize: '1rem' }}>Mails automáticos</h3>
      <ul style={{ margin: '0 0 0.75rem', paddingLeft: 18, fontSize: '0.88rem', color: '#4A4143', lineHeight: 1.7 }}>
        <li><strong>Bienvenida:</strong> sale sola cada vez que alguien se anota.</li>
        <li><strong>Aviso del drop:</strong> {next}</li>
        {s.lista_email_estado && <li><strong>Último envío:</strong> {s.lista_email_estado}</li>}
      </ul>
      <p style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', color: '#8C8285' }}>
        Cada mail trae su link de baja y la opción &quot;Anular suscripción&quot; de Gmail. Las respuestas llegan a tu casilla.
        {' '}El drop se carga en <Link href="/admin/configuracion" style={{ color: '#8F3B53' }}>Configuración → Próximo drop</Link>.
      </p>
      <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={sendTest} disabled={sending}>
        {sending ? 'Mandando…' : 'Mandarme una prueba'}
      </button>
      {msg && <p role="status" style={{ margin: '0.6rem 0 0', fontSize: '0.85rem', color: msg.ok ? '#2e7d32' : '#7a1e2f' }}>{msg.text}</p>}
    </div>
  )
}
