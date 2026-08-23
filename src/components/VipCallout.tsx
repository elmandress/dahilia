'use client'

import { useEffect, useState, useTransition } from 'react'
import { usePathname } from 'next/navigation'
import { dahila, Icon } from './ui/Primitives'
import { subscribeToVipList } from '@/lib/subscribe'
import { track } from '@/lib/analytics'

/**
 * Invitación discreta a la lista VIP, hermana de WeaverCallout.
 *
 * Por qué existe: en todo el tiempo que lleva el sitio, el formulario del
 * footer captó UNA sola suscripción, mientras que una casilla puesta en medio
 * del formulario de encargo —o sea, en un momento de intención real— captó el
 * doble. El footer no se lee; el momento sí importa. Y hay 42 carritos
 * abandonados: gente que mostró interés y se fue sin dejar forma de avisarle
 * cuando abra la próxima tanda.
 *
 * Formato: el mismo que ya funciona para tejedoras (4 postulaciones) — tarjeta
 * no bloqueante, no modal, con X clara y silencio de 30 días al cerrarla.
 *
 * DOS REGLAS PARA NO INVADIR:
 *  1. Nunca junto con la de tejedoras. Si esa todavía puede aparecer, esta se
 *     calla: dos tarjetas flotantes a la vez es ruido, no captación.
 *  2. Nunca en el carrito ni en encargo. Ahí la persona ya está convirtiendo;
 *     interrumpir un checkout para pedir un email es cambiar una venta por un
 *     email.
 *
 * El email se toma acá mismo: mandarla a otra página a suscribirse pierde a la
 * mayoría en el salto.
 */
const STORAGE_KEY = 'dahila_vip_cta'
const WEAVER_KEY = 'dahila_weaver_cta'
const SNOOZE_DAYS = 30
const DELAY_MS = 14_000

function snoozedFor(key: string): boolean {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return false
    const ts = parseInt(raw, 10)
    if (isNaN(ts)) return true
    return Date.now() - ts < SNOOZE_DAYS * 86_400_000
  } catch {
    // Sin localStorage (modo incógnito, storage bloqueado) no hay forma de
    // recordar que la cerró — mejor no mostrarla que mostrarla en cada visita.
    return true
  }
}

export function VipCallout() {
  const pathname = usePathname()
  const [show, setShow] = useState(false)
  const [email, setEmail] = useState('')
  const [done, setDone] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const snooze = () => {
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())) } catch { /* modo incógnito */ }
  }

  useEffect(() => {
    // Ya suscripta o ya la cerró → no volver a molestar.
    if (snoozedFor(STORAGE_KEY)) return
    // La de tejedoras tiene prioridad: si todavía puede salir, esta espera a
    // otra visita.
    if (!snoozedFor(WEAVER_KEY)) return
    const timer = setTimeout(() => setShow(true), DELAY_MS)
    return () => clearTimeout(timer)
  }, [])

  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/carrito') ||
    pathname.startsWith('/encargo') ||
    pathname.startsWith('/tejedoras')
  ) return null

  if (!show) return null

  const dismiss = () => { snooze(); setShow(false) }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const value = email.trim()
    if (!value) return
    startTransition(async () => {
      const res = await subscribeToVipList(value, 'drop')
      if (res.ok) {
        if (!res.already) track('vip_subscribe', { source: 'callout' })
        setDone(res.already ? 'Ya estabas anotada — te avisamos igual.' : '¡Listo! Te escribimos antes del próximo drop.')
        snooze()
        setTimeout(() => setShow(false), 3200)
      } else {
        setError(res.error ?? 'No pudimos anotarte ahora.')
      }
    })
  }

  return (
    <aside
      aria-label="Anotate a la lista para ver los drops antes"
      className="weaver-callout"
      style={{
        position: 'fixed', left: 16, bottom: 16, zIndex: 45,
        maxWidth: 300,
        background: '#fff',
        border: `1px solid ${dahila.border}`,
        borderRadius: 14,
        boxShadow: dahila.shadowMd,
        padding: '16px 18px',
      }}
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Cerrar invitación"
        style={{
          position: 'absolute', top: 6, right: 6,
          width: 32, height: 32,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: dahila.ink500, borderRadius: 8,
        }}
      >
        <Icon name="x" size={14} />
      </button>

      <div style={{
        fontFamily: dahila.fontSans, fontSize: 10, letterSpacing: '0.2em',
        textTransform: 'uppercase', color: dahila.wine600, marginBottom: 6,
      }}>
        Acceso anticipado
      </div>

      {done ? (
        <p role="status" style={{
          fontFamily: dahila.fontSans, fontSize: 13, lineHeight: 1.5,
          color: dahila.ink900, margin: 0, paddingRight: 16,
        }}>
          {done}
        </p>
      ) : (
        <>
          <p style={{
            fontFamily: dahila.fontSerif, fontStyle: 'italic', fontWeight: 300,
            fontSize: 15, lineHeight: 1.5, color: dahila.ink900, margin: '0 0 12px',
            paddingRight: 16,
          }}>
            Cada colección sale en cantidades chicas. Enterate 24 horas antes.
          </p>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label htmlFor="vip-callout-email" className="sr-only">Tu email</label>
            <input
              id="vip-callout-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
              style={{
                fontFamily: dahila.fontSans, fontSize: 14,
                border: `1px solid ${dahila.borderStrong}`, borderRadius: 8,
                padding: '10px 12px', minHeight: 44, width: '100%',
                background: '#fff', color: dahila.ink900,
              }}
            />
            {error && (
              <span role="alert" style={{ fontFamily: dahila.fontSans, fontSize: 12, color: '#7a1e2f' }}>
                {error}
              </span>
            )}
            <button
              type="submit"
              disabled={pending}
              style={{
                fontFamily: dahila.fontSans, fontSize: 11, fontWeight: 500,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                background: dahila.ink900, color: '#fff', border: 'none',
                borderRadius: 8, padding: '11px 16px',
                cursor: pending ? 'default' : 'pointer',
                opacity: pending ? 0.7 : 1, minHeight: 44,
              }}
            >
              {pending ? 'Anotando…' : 'Quiero verlo antes'}
            </button>
          </form>
        </>
      )}
    </aside>
  )
}
