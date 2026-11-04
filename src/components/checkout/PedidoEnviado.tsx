'use client'

import Link from 'next/link'
import { dahila, Icon } from '@/components/ui/Primitives'
import { track } from '@/lib/analytics'
import type { SentOrder } from './useWhatsAppCheckout'

// Mismo alto táctil (44 px) que el resto de los botones del carrito.
const btn: React.CSSProperties = {
  flex: '1 1 140px', minHeight: 44, borderRadius: 10, padding: '0 14px',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 500, textDecoration: 'none', cursor: 'pointer',
}
const textBtn: React.CSSProperties = {
  minHeight: 44, display: 'inline-flex', alignItems: 'center', padding: 0,
  background: 'transparent', border: 'none', cursor: 'pointer',
  fontFamily: dahila.fontSans, fontSize: 12.5, color: dahila.ink700,
  textDecoration: 'underline', textUnderlineOffset: 3,
}

/**
 * Lo que pasa después de tocar "Pedir por WhatsApp" (CRO-10, 04/11/2026).
 * Antes solo aparecía "¿No se abrió WhatsApp?" y el carrito quedaba igual, con
 * el botón grande invitando a mandarlo otra vez (otro código, otra fila).
 * Ahora confirma el pedido con su código, deja reabrirlo o copiarlo (la salida
 * cuando el navegador de Instagram no abre la app), seguirlo y vaciar el
 * carrito. En /carrito conserva .cart-fallback: en el celular se fija arriba de
 * la barra de abajo, donde está el dedo que acaba de tocar el botón. En el
 * cajón va en el flujo (`fijo={false}`): dentro del panel, fixed se ubicaría
 * contra el panel y no contra la pantalla.
 */
export function PedidoEnviado({
  sentOrder, copied, onCopy, onVaciar, onClose, whatsappLabel, desde, fijo = true,
}: {
  sentOrder: SentOrder
  copied: boolean
  onCopy: () => void
  onVaciar: () => void
  /** Solo esconde el aviso: el pedido sigue recordado y el botón lo reabre. */
  onClose?: () => void
  /** El número a mano, por si hay que pegar el pedido en un chat nuevo. */
  whatsappLabel?: string
  desde: 'carrito' | 'cajon'
  fijo?: boolean
}) {
  return (
    <div className={fijo ? 'cart-fallback' : undefined} role="status" style={{
      display: 'flex', flexDirection: 'column', gap: 8,
      background: '#fff', border: `1px solid ${dahila.borderStrong}`, borderRadius: 12,
      padding: '10px 12px 6px 14px', fontFamily: dahila.fontSans, fontSize: 13, color: dahila.ink700, lineHeight: 1.45,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 4 }}>
          <strong style={{ fontWeight: 500, color: dahila.ink900 }}>
            Tu pedido {sentOrder.code} quedó escrito en WhatsApp
          </strong>
          <span>Si ya lo mandaste, Anush te responde ahí.</span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              flexShrink: 0, background: 'transparent', border: 'none', cursor: 'pointer', color: dahila.ink500,
              width: 44, height: 44, marginRight: -8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Icon name="x" size={14} />
          </button>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <a
          href={sentOrder.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('order_reopen', { via: 'link', desde })}
          style={{ ...btn, background: dahila.whatsapp, color: '#fff', border: 'none' }}
        >
          Abrir de nuevo
        </a>
        <button
          type="button"
          onClick={onCopy}
          style={{ ...btn, background: '#fff', color: dahila.ink900, border: `1px solid ${dahila.borderStrong}` }}
        >
          {copied ? '✓ Pedido copiado' : 'Copiar mi pedido'}
        </button>
      </div>
      {copied && (
        <span style={{ fontSize: 12, lineHeight: 1.5 }}>
          Pegalo en un chat de WhatsApp con {whatsappLabel || 'Anush'}.
        </span>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <Link href={`/pedido?codigo=${encodeURIComponent(sentOrder.code)}`} style={{ ...textBtn, color: dahila.wine600 }}>
          Seguí tu pedido
        </Link>
        <button type="button" onClick={onVaciar} style={textBtn}>
          Vaciar el carrito
        </button>
      </div>
    </div>
  )
}
