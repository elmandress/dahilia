'use client'

import { useState, useTransition } from 'react'
import { dahila } from './ui/Primitives'
import { subscribeToVipList } from '@/lib/subscribe'
import { track } from '@/lib/analytics'
import { safeAction } from '@/lib/safe-action'

/** Marca de "ya está en la lista": el popup no vuelve a aparecer. */
export const VIP_STORAGE_KEY = 'dahila_vip_cta'

export function markVipSeen() {
  try { localStorage.setItem(VIP_STORAGE_KEY, String(Date.now())) } catch { /* modo incógnito */ }
}

/**
 * Formulario de la lista privada (12/10/2026), uno solo para el popup, la
 * página /vip y la home. El origen viaja a la base para saber qué entrada
 * funciona (ver lib/subscribe.ts).
 */
export function VipForm({ source, tone = 'light', cta = 'Quiero entrar', onDone, idSuffix }: {
  source: 'popup' | 'vip' | 'home' | 'drop' | 'footer' | 'gracias'
  tone?: 'light' | 'dark'
  cta?: string
  onDone?: () => void
  idSuffix: string
}) {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const dark = tone === 'dark'
  const inputId = `vip-email-${idSuffix}`

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const value = email.trim()
    if (!value) return
    startTransition(async () => {
      const res = await safeAction(() => subscribeToVipList(value, source))
      if (!res) { setError('No pudimos anotarte: revisá tu conexión y probá de nuevo.'); return }
      if (res.ok) {
        if (!res.already) track('vip_subscribe', { source }, { name: 'sign_up', params: { method: 'lista_vip' } })
        setDone(res.already ? 'Ya estabas en la lista. Te avisamos igual.' : 'Adentro. La próxima tanda la ves antes que nadie.')
        markVipSeen()
        onDone?.()
      } else {
        setError(res.error ?? 'No pudimos anotarte ahora.')
      }
    })
  }

  if (done) {
    return (
      <p role="status" style={{ fontFamily: dahila.fontSans, fontSize: 14, lineHeight: 1.5, margin: 0, color: dark ? '#F5EDE6' : dahila.ink900 }}>
        <span aria-hidden style={{ marginRight: 6 }}>✓</span>{done}
      </p>
    )
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      <label htmlFor={inputId} className="sr-only">Tu email</label>
      <input
        id={inputId}
        type="email"
        required
        maxLength={120}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com"
        autoComplete="email"
        style={{
          flex: '1 1 200px', minWidth: 0, minHeight: 46,
          fontFamily: dahila.fontSans, fontSize: 16,
          border: `1px solid ${dark ? 'rgba(245,237,230,0.35)' : dahila.borderStrong}`, borderRadius: 10,
          padding: '10px 12px',
          background: dark ? 'rgba(255,255,255,0.06)' : '#fff', color: dark ? '#F5EDE6' : dahila.ink900,
        }}
      />
      <button
        type="submit"
        className="dh-btn"
        disabled={pending}
        style={{
          flex: '0 0 auto', minHeight: 46, padding: '0 20px', borderRadius: 10, border: 'none',
          fontFamily: dahila.fontSans, fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
          background: dark ? '#F5EDE6' : dahila.ink900, color: dark ? dahila.ink900 : '#fff',
          cursor: pending ? 'wait' : 'pointer', opacity: pending ? 0.7 : 1,
        }}
      >
        {pending ? 'Anotando…' : cta}
      </button>
      {error && (
        <span role="alert" style={{ flexBasis: '100%', fontFamily: dahila.fontSans, fontSize: 12.5, color: dark ? '#F3B6C2' : '#7a1e2f' }}>
          {error}
        </span>
      )}
    </form>
  )
}
