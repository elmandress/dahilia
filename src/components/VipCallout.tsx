'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { dahila, Icon } from './ui/Primitives'
import { VipForm, VIP_STORAGE_KEY, markVipSeen } from './VipForm'

/**
 * Invitación a la lista privada — el ÚNICO popup del sitio (12/10/2026).
 *
 * Hasta hoy esperaba a que se cerrara la invitación a tejedoras: en la primera
 * visita salía la de tejedoras y esta recién en otra visita. Por eso la lista
 * tenía 6 personas. La de tejedoras dejó de ser popup (vive en /tejedoras).
 *
 * Tono: privado y con algo de misterio ("lo próximo ya se está tejiendo"), sin
 * inventar escasez: lo que se promete es lo que pasa — cada tanda es chica y
 * la lista la ve 24 horas antes. Si hay un drop cargado en Configuración, se
 * nombra.
 *
 * Formato NN/g: tarjeta no bloqueante, X clara, 30 días de silencio al
 * cerrarla o al anotarse en cualquier lado. Timing: 12 s (Wisepops: el
 * disparo por tiempo a los 11–15 s es el que mejor convierte).
 * Nunca en carrito, encargo, admin, /vip (ya es el formulario) ni /ig.
 */
const SNOOZE_DAYS = 30
const DELAY_MS = 12_000

function snoozed(): boolean {
  try {
    const raw = localStorage.getItem(VIP_STORAGE_KEY)
    if (!raw) return false
    const ts = parseInt(raw, 10)
    if (isNaN(ts)) return true
    return Date.now() - ts < SNOOZE_DAYS * 86_400_000
  } catch {
    // Sin localStorage no se puede recordar que la cerró: mejor no mostrarla.
    return true
  }
}

export function VipCallout({ dropName = '' }: { dropName?: string }) {
  const pathname = usePathname()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (snoozed()) return
    const timer = setTimeout(() => setShow(true), DELAY_MS)
    return () => clearTimeout(timer)
  }, [])

  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/carrito') ||
    pathname.startsWith('/encargo') ||
    pathname.startsWith('/vip') ||
    pathname === '/ig'
  ) return null

  if (!show) return null

  const dismiss = () => { markVipSeen(); setShow(false) }

  return (
    <aside
      aria-label="Lista privada de Dahila"
      className="weaver-callout vip-callout"
      style={{
        position: 'fixed', left: 16, bottom: 16, zIndex: 45,
        maxWidth: 320,
        background: dahila.ink900, color: '#F5EDE6',
        borderRadius: 16,
        boxShadow: '0 18px 40px -18px rgba(31,26,27,0.55)',
        padding: '18px 18px 16px',
      }}
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Cerrar invitación"
        style={{
          position: 'absolute', top: 6, right: 6, width: 36, height: 36,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(245,237,230,0.7)', borderRadius: 8,
        }}
      >
        <Icon name="x" size={14} />
      </button>

      <div style={{ fontFamily: dahila.fontSans, fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#E9B8C4', marginBottom: 8 }}>
        Lista privada
      </div>
      <p style={{ fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 22, lineHeight: 1.15, margin: '0 0 8px', paddingRight: 18, color: '#F5EDE6' }}>
        {dropName ? <>«{dropName}» ya se está tejiendo.</> : 'Lo próximo ya se está tejiendo.'}
      </p>
      <p style={{ fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 300, lineHeight: 1.55, margin: '0 0 14px', color: 'rgba(245,237,230,0.82)' }}>
        Son pocas piezas por tanda. La lista las ve 24 horas antes que nadie y elige primero.
      </p>
      <VipForm source="popup" tone="dark" idSuffix="popup" onDone={() => setTimeout(() => setShow(false), 3200)} />
      <Link href="/vip" onClick={markVipSeen} style={{ display: 'inline-block', marginTop: 10, fontFamily: dahila.fontSans, fontSize: 11.5, color: 'rgba(245,237,230,0.7)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
        ¿Qué es la lista?
      </Link>
    </aside>
  )
}
