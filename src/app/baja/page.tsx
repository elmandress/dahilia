import type { Metadata } from 'next'
import Link from 'next/link'
import { dahila } from '@/components/ui/tokens'

export const metadata: Metadata = {
  title: 'Darte de baja de la lista',
  robots: { index: false, follow: false },
}

/**
 * /baja (12/10/2026): el link "Darte de baja" del pie de los mails de la
 * lista. Pide confirmar con un botón (POST a /api/lista/baja) en vez de dar
 * de baja al abrir: algunos antivirus abren los links de los mails solos.
 */
export default async function BajaPage({ searchParams }: { searchParams: Promise<{ e?: string; t?: string; listo?: string; error?: string }> }) {
  const { e = '', t = '', listo, error } = await searchParams
  const box: React.CSSProperties = { maxWidth: 520, margin: '0 auto', padding: '96px 24px', textAlign: 'center' }
  const h1: React.CSSProperties = { fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 'clamp(30px, 5vw, 40px)', color: dahila.ink900, margin: '0 0 14px' }
  const p: React.CSSProperties = { fontFamily: dahila.fontSans, fontSize: 15, fontWeight: 300, lineHeight: 1.7, color: dahila.ink700, margin: '0 0 28px' }

  if (listo) {
    return (
      <div style={box}>
        <h1 style={h1}>Listo, te sacamos</h1>
        <p style={p}>No vas a recibir más mails de la lista privada. Si algún día querés volver, te anotás de nuevo desde el sitio.</p>
        <Link href="/tienda" style={{ color: dahila.wine600, fontFamily: dahila.fontSans }}>Ir a la tienda</Link>
      </div>
    )
  }
  if (error || !e || !t) {
    return (
      <div style={box}>
        <h1 style={h1}>Este link no funcionó</h1>
        <p style={p}>Puede estar incompleto. Respondé cualquier mail de la lista y te sacamos a mano.</p>
      </div>
    )
  }
  return (
    <div style={box}>
      <h1 style={h1}>¿Dejar la lista privada?</h1>
      <p style={p}>Vas a dejar de recibir los avisos de cada tanda nueva en <strong style={{ fontWeight: 500 }}>{e}</strong>.</p>
      <form method="post" action={`/api/lista/baja?e=${encodeURIComponent(e)}&t=${encodeURIComponent(t)}&desde=web`}>
        <button type="submit" className="dh-btn" style={{
          minHeight: 48, padding: '0 26px', borderRadius: 10, border: 'none', cursor: 'pointer',
          background: dahila.ink900, color: '#fff', fontFamily: dahila.fontSans, fontSize: 12,
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          Sí, darme de baja
        </button>
      </form>
    </div>
  )
}
