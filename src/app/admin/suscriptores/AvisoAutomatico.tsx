'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { DROP_COPY_DEFAULTS, type DropCopy } from '@/lib/lista-copy'

/**
 * Mails automáticos de la lista (12/10/2026; rehecho el 27/10/2026).
 *
 * Todo lo que muestra lo calcula el servidor (GET /api/admin/lista-prueba) con
 * la misma función que usa el envío real: si acá dice que sale bien, sale
 * bien. Antes el panel interpretaba la fecha por su cuenta y, con
 * "2026/10/28 " cargado, decía que no había drop el día antes del drop.
 *
 * Bloques: estado del aviso · verificación sin enviar · texto editable ·
 * prueba a una casilla · interruptor del envío automático.
 */

type Copy = DropCopy

interface Check {
  ok: boolean
  error?: string
  plan: {
    name: string
    rawDate: string
    launchText: string | null
    launchAt: string | null
    hasTime: boolean
    sendAtText: string | null
    sendAt: string | null
    url: string
    slug: string
    collection: { name: string; published: boolean; unlisted: boolean } | null
    alreadySent: boolean
    auto: boolean
    copy: Copy
    status: string
    cronSeen: string | null
    problems: string[]
  }
  recipients: number
  built: number
  invalid: string[]
  sample: { subject: string; text: string }
}

const DEFAULT_TEST_TO = 'floralcrochet12@gmail.com'

const muted = { fontSize: '0.8rem', color: '#8C8285', lineHeight: 1.5 } as const
const okColor = '#2e7d32'
const badColor = '#7a1e2f'

function ago(iso: string, now: number): string {
  const min = Math.round((now - new Date(iso).getTime()) / 60_000)
  if (min < 2) return 'recién'
  if (min < 90) return `hace ${min} minutos`
  const h = Math.round(min / 60)
  if (h < 36) return `hace ${h} horas`
  return `hace ${Math.round(h / 24)} días`
}

export function AvisoAutomatico() {
  const [check, setCheck] = useState<Check | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [now, setNow] = useState(0)
  const [copy, setCopy] = useState<Copy | null>(null)
  const [savingCopy, setSavingCopy] = useState(false)
  const [copyMsg, setCopyMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [testTo, setTestTo] = useState(DEFAULT_TEST_TO)
  const [sending, setSending] = useState(false)
  const [testMsg, setTestMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [togglingAuto, setTogglingAuto] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/lista-prueba', { cache: 'no-store' })
      const body = (await res.json().catch(() => ({}))) as Check
      if (!res.ok) throw new Error(body.error ?? `Error ${res.status}`)
      setCheck(body)
      setCopy((c) => c ?? body.plan.copy)
      setLoadError(null)
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'No se pudo revisar el envío.')
    }
    setNow(Date.now())
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const saveSettings = async (pairs: Record<string, string>) => {
    const supabase = createClient()
    const at = new Date().toISOString()
    const { error } = await supabase
      .from('site_settings')
      .upsert(Object.entries(pairs).map(([key, value]) => ({ key, value, updated_at: at })), { onConflict: 'key' })
    if (error) throw new Error(error.message)
  }

  const saveCopy = async (next: Copy) => {
    setSavingCopy(true)
    setCopyMsg(null)
    try {
      if (!next.lista_drop_asunto.trim() || !next.lista_drop_titulo.trim() || !next.lista_drop_texto.trim()) {
        throw new Error('El asunto, el título y el texto no pueden quedar vacíos.')
      }
      await saveSettings(next)
      setCopy(next)
      setCopyMsg({ ok: true, text: 'Texto guardado. Mandate una prueba para verlo como le llega a una clienta.' })
      await load()
    } catch (e) {
      setCopyMsg({ ok: false, text: e instanceof Error ? e.message : 'No se pudo guardar.' })
    } finally {
      setSavingCopy(false)
    }
  }

  const sendTest = async () => {
    setSending(true)
    setTestMsg(null)
    try {
      const res = await fetch('/api/admin/lista-prueba', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testTo }),
      })
      const body = await res.json().catch(() => ({}))
      setTestMsg(res.ok
        ? { ok: true, text: `Listo: mandamos los 2 mails (bienvenida y aviso del drop) a ${body.to}. Fijate si llegaron a la bandeja principal y no a Spam o Promociones.${body.fallback ? ' Ojo: el remitente configurado en Netlify (EMAIL_FROM) usa un dominio que Resend no tiene verificado, así que salieron desde hola@dahila.uy. Anda igual, pero conviene corregir EMAIL_FROM a "Dahila Crochet <hola@dahila.uy>".' : ''}` }
        : { ok: false, text: body.error ?? 'No se pudo mandar la prueba.' })
    } catch {
      setTestMsg({ ok: false, text: 'No se pudo mandar la prueba (sin conexión).' })
    } finally {
      setSending(false)
    }
  }

  const toggleAuto = async () => {
    if (!check) return
    const turningOn = !check.plan.auto
    if (turningOn) {
      const p = check.plan
      const due = p.sendAt && new Date(p.sendAt).getTime() <= Date.now() && !p.alreadySent
      const warn = due
        ? `Ya es la hora del aviso: va a salir en la próxima hora a ${check.recipients} persona(s) con el texto guardado.\n\n¿Lo activo?`
        : `El aviso va a salir solo ${p.sendAtText ?? 'cuando cargues la fecha'} a las personas de la lista, con el texto guardado.\n\n¿Lo activo?`
      if (!window.confirm(warn)) return
    }
    setTogglingAuto(true)
    try {
      await saveSettings({ lista_envio_auto: turningOn ? 'true' : 'false' })
      await load()
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'No se pudo cambiar.')
    } finally {
      setTogglingAuto(false)
    }
  }

  if (loadError && !check) {
    return (
      <div className="admin-card" style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ margin: '0 0 0.4rem', fontSize: '1rem' }}>Mails automáticos</h3>
        <p role="alert" style={{ margin: 0, color: badColor, fontSize: '0.88rem' }}>No se pudo revisar el envío: {loadError}</p>
        <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" style={{ marginTop: 10 }} onClick={load}>Reintentar</button>
      </div>
    )
  }
  if (!check || !copy) return null

  const p = check.plan
  const launchPassed = p.launchAt ? new Date(p.launchAt).getTime() <= now : false
  const due = p.sendAt ? new Date(p.sendAt).getTime() <= now : false

  // Una oración sobre qué va a pasar con el aviso.
  let next: string
  if (!p.name) next = 'No hay un drop cargado en Configuración → Próximo drop: no hay aviso programado.'
  else if (!p.launchText) next = `«${p.name}» está cargado, pero falta una fecha que se entienda.`
  else if (p.alreadySent) next = `El aviso de «${p.name}» ya salió.`
  else if (launchPassed) next = `«${p.name}» ya se lanzó (${p.launchText}) y el aviso no se mandó.`
  else if (!p.auto) next = `El aviso de «${p.name}» está en PAUSA: no sale hasta que actives el envío automático (abajo).`
  else if (p.problems.length) next = `El aviso de «${p.name}» está esperando que se resuelva lo marcado abajo.`
  else if (due) next = `El aviso de «${p.name}» sale en la próxima hora.`
  else next = `El aviso de «${p.name}» sale solo ${p.sendAtText}, 24 h antes del lanzamiento.`

  const checks: Array<{ ok: boolean; text: string }> = [
    p.name
      ? { ok: true, text: `Drop: «${p.name}».` }
      : { ok: false, text: 'Falta el nombre del drop.' },
    p.launchText
      ? { ok: p.hasTime, text: `Lanzamiento: ${p.launchText}${p.hasTime ? '' : ` (no tiene hora: se toma la medianoche. Elegí la hora en Configuración → Próximo drop)`}.` }
      : { ok: false, text: p.rawDate ? `La fecha "${p.rawDate}" no se entiende. Elegí de nuevo el día y la hora en Configuración → Próximo drop.` : 'Falta la fecha del lanzamiento.' },
    p.slug
      ? p.collection
        ? { ok: p.collection.published, text: p.collection.published
          ? `Link del mail: la colección «${p.collection.name}» (${p.collection.unlisted ? 'solo con link, acceso VIP' : 'publicada'}).`
          : `La colección «${p.collection.name}» todavía está cerrada: el link daría error. Pasala a "Solo con link (acceso VIP)" antes del aviso.` }
        : { ok: false, text: `No existe ninguna colección con el slug "${p.slug}".` }
      : { ok: true, text: 'Link del mail: la tienda (no hay colección asignada al drop).' },
    {
      ok: check.recipients > 0 && check.built === check.recipients - check.invalid.length,
      text: `Saldría a ${check.recipients} persona(s) de la lista: ${check.built} mail(s) armados sin error${check.invalid.length ? `; ${check.invalid.length} dirección(es) mal escrita(s) que se van a saltear: ${check.invalid.join(', ')}` : ''}. (Ensayo: no se mandó nada.)`,
    },
    ...p.problems
      .filter((t) => /Netlify/.test(t))
      .map((text) => ({ ok: false, text })),
    p.cronSeen
      ? { ok: now - new Date(p.cronSeen).getTime() < 3 * 3_600_000, text: `El reloj automático (Netlify, cada hora en punto) pasó por última vez ${ago(p.cronSeen, now)}.` }
      : { ok: false, text: 'Todavía no hay registro del reloj automático. Pasa cada hora en punto: si después de eso sigue así, revisá en Netlify → Logs → Functions la función reloj-lista-privada.' },
  ]

  const field = { width: '100%', boxSizing: 'border-box' } as const

  return (
    <div className="admin-card" style={{ marginBottom: '1.25rem' }}>
      <h3 style={{ margin: '0 0 0.4rem', fontSize: '1rem' }}>Mails automáticos</h3>
      <ul style={{ margin: '0 0 0.75rem', paddingLeft: 18, fontSize: '0.88rem', color: '#4A4143', lineHeight: 1.7 }}>
        <li><strong>Bienvenida:</strong> sale sola cada vez que alguien se anota.</li>
        <li><strong>Aviso del drop:</strong> {next}</li>
        {p.status && <li><strong>Último estado:</strong> {p.status}</li>}
      </ul>

      {/* Verificación (ensayo sin mandar) */}
      <h4 style={{ margin: '1.25rem 0 0.4rem', fontSize: '0.92rem' }}>¿Va a salir bien?</h4>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: '0.85rem', lineHeight: 1.6 }}>
        {checks.map((c, i) => (
          <li key={i} style={{ display: 'flex', gap: 8, marginBottom: 4, color: c.ok ? '#4A4143' : badColor }}>
            <span aria-hidden="true" style={{ color: c.ok ? okColor : badColor, fontWeight: 600 }}>{c.ok ? '✓' : '!'}</span>
            <span><span className="sr-only">{c.ok ? 'Bien: ' : 'Revisar: '}</span>{c.text}</span>
          </li>
        ))}
      </ul>
      <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" style={{ marginTop: 8 }} onClick={load}>
        Volver a revisar
      </button>

      {/* Envío automático */}
      <div style={{ marginTop: '1.25rem', padding: '0.9rem 1rem', borderRadius: 10, background: p.auto ? '#EEF6EE' : '#FBF1E8', border: `1px solid ${p.auto ? '#CFE3CF' : '#EED9C4'}` }}>
        <div style={{ fontSize: '0.88rem', marginBottom: 8 }}>
          <strong>Envío automático: {p.auto ? 'activado' : 'en pausa'}.</strong>{' '}
          {p.auto
            ? 'El aviso sale solo 24 h antes del lanzamiento, con el texto de abajo. A la hora del lanzamiento, la colección pasa sola de "Solo con link" a "Publicada" y aparece en la tienda.'
            : 'No sale nada a las clientas hasta que lo actives. Primero revisá el texto y mandate una prueba.'}
        </div>
        <button type="button" className={`admin-btn admin-btn-sm ${p.auto ? 'admin-btn-secondary' : 'admin-btn-primary'}`} onClick={toggleAuto} disabled={togglingAuto}>
          {togglingAuto ? 'Guardando…' : p.auto ? 'Pausar el envío' : 'Activar el envío automático'}
        </button>
      </div>

      {/* Texto del aviso */}
      <h4 style={{ margin: '1.5rem 0 0.4rem', fontSize: '0.92rem' }}>Texto del mail del drop</h4>
      <p style={{ ...muted, margin: '0 0 0.75rem' }}>
        Se reemplazan solos: <code>{'{nombre}'}</code> (nombre del drop), <code>{'{cuando}'}</code> (&quot;el miércoles 28 de octubre a las 10:00&quot;) y <code>{'{adelanto}'}</code> (el texto de expectativa de Configuración). Una línea en blanco separa párrafos. El link Una línea en blanco separa párrafos. El botón &quot;Ver la tanda&quot; y el link de baja se agregan solos.quot;Ver la colecciónUna línea en blanco separa párrafos. El botón &quot;Ver la tanda&quot; y el link de baja se agregan solos.quot;, la firma de Anush y la baja se agregan solos. Para no caer en Spam: escribilo como un mail a una amiga, sin palabras de promoción (gratis, oferta, limitado, urgente, últimas), sin MAYÚSCULAS ni signos de más.
      </p>
      <div className="admin-field">
        <label htmlFor="lista-asunto">Asunto</label>
        <input id="lista-asunto" type="text" style={field} value={copy.lista_drop_asunto} maxLength={150}
          onChange={(e) => setCopy({ ...copy, lista_drop_asunto: e.target.value })} />
      </div>
      <div className="admin-field">
        <label htmlFor="lista-titulo">Primera línea (el saludo)</label>
        <input id="lista-titulo" type="text" style={field} value={copy.lista_drop_titulo} maxLength={150}
          onChange={(e) => setCopy({ ...copy, lista_drop_titulo: e.target.value })} />
      </div>
      <div className="admin-field">
        <label htmlFor="lista-texto">Texto</label>
        <textarea id="lista-texto" rows={7} style={field} value={copy.lista_drop_texto} maxLength={3000}
          onChange={(e) => setCopy({ ...copy, lista_drop_texto: e.target.value })} />
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" className="admin-btn admin-btn-primary admin-btn-sm" disabled={savingCopy} onClick={() => saveCopy(copy)}>
          {savingCopy ? 'Guardando…' : 'Guardar texto'}
        </button>
        <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" disabled={savingCopy}
          onClick={() => {
            if (window.confirm('¿Volver al texto original? Se pierde lo que escribiste.')) {
              saveCopy({ ...DROP_COPY_DEFAULTS })
            }
          }}>
          Volver al texto original
        </button>
      </div>
      {copyMsg && <p role="status" style={{ margin: '0.6rem 0 0', fontSize: '0.85rem', color: copyMsg.ok ? okColor : badColor }}>{copyMsg.text}</p>}

      <details style={{ marginTop: '0.9rem' }}>
        <summary style={{ cursor: 'pointer', fontSize: '0.85rem', color: '#8F3B53' }}>Ver cómo queda (texto guardado)</summary>
        <div style={{ marginTop: 8, padding: '0.75rem 1rem', background: '#FCFAF6', borderRadius: 8, fontSize: '0.85rem', whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>
          <strong>Asunto:</strong> {check.sample.subject}{'\n\n'}{check.sample.text}
        </div>
      </details>

      {/* Prueba */}
      <h4 style={{ margin: '1.5rem 0 0.4rem', fontSize: '0.92rem' }}>Mandar una prueba</h4>
      <p style={{ ...muted, margin: '0 0 0.6rem' }}>Manda la bienvenida y el aviso del drop, con el texto guardado, solo a esta casilla. A las clientas no les llega nada.</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <label htmlFor="lista-prueba-to" className="sr-only">Mail para la prueba</label>
        <input id="lista-prueba-to" type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)}
          style={{ flex: '1 1 220px', minWidth: 0 }} autoComplete="email" />
        <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={sendTest} disabled={sending || !testTo.trim()}>
          {sending ? 'Mandando…' : 'Mandar prueba'}
        </button>
      </div>
      {testMsg && <p role="status" style={{ margin: '0.6rem 0 0', fontSize: '0.85rem', color: testMsg.ok ? okColor : badColor }}>{testMsg.text}</p>}

      <p style={{ ...muted, margin: '1.25rem 0 0' }}>
        Cada mail trae su link de baja y la opción &quot;Anular suscripción&quot; de Gmail. Las respuestas llegan a tu casilla.
        {' '}El nombre, la fecha y la colección del drop se cargan en <Link href="/admin/configuracion" style={{ color: '#8F3B53' }}>Configuración → Próximo drop</Link>.
      </p>
    </div>
  )
}
