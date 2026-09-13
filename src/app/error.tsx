'use client'

// Límite de error del sitio. Sin este archivo, un error real de render
// mostraba la pantalla genérica de Next, sin marca y sin salida. El caso
// concreto: la ficha lanza a propósito cuando Supabase está caído y el
// producto no está en el snapshot (así Google reintenta en vez de
// desindexarla). La respuesta sigue siendo un 5xx: esto solo cambia lo que ve
// la persona. El layout raíz sigue montado, así que header, footer y carrito
// quedan a la vista.

import { useEffect } from 'react'
import Link from 'next/link'

const WHATSAPP_HREF =
  'https://wa.me/59899850073?text=' + encodeURIComponent('Hola! Una página del sitio no me cargó. Estaba buscando: ')

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  const button: React.CSSProperties = {
    padding: '14px 24px', borderRadius: 12, minHeight: 44,
    fontFamily: 'var(--font-sans)', fontSize: 12, letterSpacing: '0.06em',
    textTransform: 'uppercase', textDecoration: 'none', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '96px 24px 64px', textAlign: 'center' }}>
      <span className="eyebrow" style={{ color: 'var(--ink-500)' }}>Algo falló</span>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontWeight: 300,
        fontSize: 'clamp(34px, 6vw, 56px)', lineHeight: 1.05,
        letterSpacing: '-0.02em', color: 'var(--ink-900)', margin: '14px 0 16px',
      }}>
        Esta página no cargó.
      </h1>
      <p style={{
        fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 300,
        fontSize: 18, color: 'var(--ink-700)', marginBottom: 28,
      }}>
        Suele ser algo de un momento. Probá de nuevo; si sigue igual, escribime por WhatsApp y te paso lo que estabas buscando.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => unstable_retry()}
          style={{ ...button, background: 'var(--ink-900)', color: '#fff', border: 'none' }}
        >
          Probar de nuevo
        </button>
        <Link
          href="/tienda"
          style={{ ...button, background: 'transparent', color: 'var(--ink-900)', border: '1px solid var(--ink-900)' }}
        >
          Ir a la tienda
        </Link>
        <a
          href={WHATSAPP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...button, background: '#25D366', color: '#fff', border: 'none' }}
        >
          Escribir por WhatsApp
        </a>
      </div>
    </div>
  )
}
