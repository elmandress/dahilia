'use client'

import { useEffect, useState } from 'react'
import { dahila, Eyebrow, Button, Icon, Badge } from '@/components/ui/Primitives'
import { track } from '@/lib/analytics'

export default function GraciasClient({
  enabled, eyebrow, title, body, code, percent,
}: {
  enabled: boolean
  eyebrow: string
  title: string
  body: string
  code: string
  percent: string
}) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    track('qr_thanks_view')
  }, [])

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      track('qr_discount_copy', { code })
      setTimeout(() => setCopied(false), 2200)
    } catch {
      // Portapapeles bloqueado (permiso o navegador viejo) — el código ya
      // está bien visible en pantalla, se copia a mano.
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '64px 24px 96px', textAlign: 'center' }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%', background: dahila.cream100,
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
      }}>
        <Icon name="sparkle" size={26} color={dahila.wine600} />
      </div>

      <Eyebrow>{eyebrow}</Eyebrow>

      <h1 style={{
        fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 'clamp(32px, 6vw, 48px)',
        lineHeight: 1.08, letterSpacing: '-0.02em', color: dahila.ink900, margin: '14px 0 16px',
      }}>
        {title}
      </h1>

      <p style={{
        fontFamily: dahila.fontSans, fontSize: 15, fontWeight: 300, lineHeight: 1.7,
        color: dahila.ink700, margin: '0 auto 32px', maxWidth: 420,
      }}>
        {body}
      </p>

      {enabled ? (
        <>
          <div style={{
            position: 'relative', background: '#fff',
            border: `1.5px dashed ${dahila.borderStrong}`, borderRadius: 16,
            padding: '30px 24px 24px', marginBottom: 20,
          }}>
            <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)' }}>
              <Badge tone="pink">−{percent}% en todo el sitio</Badge>
            </div>
            <div style={{
              fontFamily: dahila.fontSans, fontWeight: 500, fontSize: 'clamp(24px, 6vw, 30px)',
              letterSpacing: '0.1em', color: dahila.ink900, margin: '10px 0 18px',
              wordBreak: 'break-word',
            }}>
              {code}
            </div>
            <Button variant="secondary" size="sm" onClick={copyCode}>
              <Icon name={copied ? 'check' : 'tag'} size={15} />
              {copied ? '¡Copiado!' : 'Copiar código'}
            </Button>
          </div>

          <p style={{
            fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 300, lineHeight: 1.6,
            color: dahila.ink500, margin: '0 0 32px',
          }}>
            Elegí tu pieza, pegá el código donde dice &ldquo;¿Tenés un cupón?&rdquo; en el carrito, y confirmá tu pedido por WhatsApp.
          </p>
        </>
      ) : (
        <p style={{
          fontFamily: dahila.fontSans, fontSize: 14, fontWeight: 300, color: dahila.ink500,
          marginBottom: 32,
        }}>
          Por ahora esta promo está en pausa — igual, gracias por elegirnos.
        </p>
      )}

      <Button variant="primary" size="lg" href="/tienda">Ver la tienda</Button>
    </div>
  )
}
