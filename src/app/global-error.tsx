'use client'

// Último recurso: se muestra solo si falla el layout raíz, que es lo único que
// error.tsx no cubre (docs: file-conventions/error, "Global error"). El layout
// raíz arma el catálogo del header y el carrito en cada página; si eso llegara
// a lanzar, sin este archivo se veía la pantalla genérica de Next, en inglés y
// sin ninguna salida. Reemplaza al layout entero, así que no tiene header, ni
// globals.css, ni las fuentes del sitio: todo va en línea y con fuentes del
// sistema. Mismo tono y mismas salidas que error.tsx (19/09/2026).

import { useEffect } from 'react'
import Link from 'next/link'

const WHATSAPP_HREF =
  'https://wa.me/59899850073?text=' + encodeURIComponent('Hola! El sitio no me cargó. Estaba buscando: ')

const boton: React.CSSProperties = {
  padding: '14px 24px', borderRadius: 12, minHeight: 44, boxSizing: 'border-box',
  fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif', fontSize: 12,
  letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none', cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
}

export default function GlobalError({
  error,
  retry,
  reset,
}: {
  error: Error & { digest?: string }
  retry?: () => void
  reset?: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="es-UY">
      <body style={{ margin: 0, background: '#FFFFFF', color: '#1F1A1B' }}>
        <title>Algo falló | Dahila Crochet</title>
        <main style={{ maxWidth: 560, margin: '0 auto', padding: '96px 24px 64px', textAlign: 'center' }}>
          <p style={{
            fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif', fontSize: 12,
            letterSpacing: '0.16em', textTransform: 'uppercase', color: '#6E6467', margin: 0,
          }}>
            Dahila Crochet
          </p>
          <h1 style={{
            fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 300,
            fontSize: 'clamp(34px, 6vw, 52px)', lineHeight: 1.1, margin: '14px 0 16px',
          }}>
            El sitio no cargó.
          </h1>
          <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 18, lineHeight: 1.6, color: '#4A4143', margin: '0 0 28px' }}>
            Suele ser algo de un momento. Probá de nuevo; si sigue igual, escribime por WhatsApp y te paso lo que estabas buscando.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => (retry ?? reset ?? (() => window.location.reload()))()}
              style={{ ...boton, background: '#1F1A1B', color: '#fff', border: 'none' }}
            >
              Probar de nuevo
            </button>
            <Link href="/tienda" style={{ ...boton, background: 'transparent', color: '#1F1A1B', border: '1px solid #1F1A1B' }}>
              Ir a la tienda
            </Link>
            <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer"
              style={{ ...boton, background: '#1E8449', color: '#fff', border: 'none' }}>
              Escribir por WhatsApp
            </a>
          </div>
        </main>
      </body>
    </html>
  )
}
