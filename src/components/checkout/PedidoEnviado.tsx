'use client'

import Link from 'next/link'
import { dahila, Icon } from '@/components/ui/Primitives'
import type { SentOrder } from './useWhatsAppCheckout'

// Botones de texto con el alto táctil (44 px) del resto del carrito.
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
 * Ahora confirma el pedido con su código y deja copiarlo (la salida cuando el
 * navegador de Instagram no abre la app), seguirlo y vaciar el carrito.
 *
 * Sin su propio "Abrir de nuevo" (NEG-3, revisión final): el botón grande ya
 * dice "Abrir WhatsApp de nuevo", y con los dos había hasta tres botones para
 * lo mismo; en el cajón del iPhone SE el aviso dejaba 16 px para las prendas.
 * En /carrito conserva .cart-fallback: en el celular se fija arriba de la
 * barra de abajo, donde está el dedo que acaba de tocar el botón. En el cajón
 * va en el flujo (`fijo={false}`), más corto y sin "Vaciar" (va abajo, en el
 * lugar del link a /carrito): dentro del panel, fixed se ubicaría contra el
 * panel y no contra la pantalla.
 */
export function PedidoEnviado({
  sentOrder, copied, onCopy, onVaciar, onClose, whatsappLabel, fijo = true,
}: {
  sentOrder: SentOrder
  copied: boolean
  onCopy: () => void
  /** Sin él (el cajón) el aviso no ofrece vaciar el carrito. */
  onVaciar?: () => void
  /** Solo esconde el aviso: el pedido sigue recordado y el botón lo reabre. */
  onClose?: () => void
  /** El número a mano, por si hay que pegar el pedido en un chat nuevo. */
  whatsappLabel?: string
  fijo?: boolean
}) {
  return (
    <div className={fijo ? 'cart-fallback' : undefined} role="status" style={{
      display: 'flex', flexDirection: 'column', gap: 2,
      background: '#fff', border: `1px solid ${dahila.borderStrong}`, borderRadius: 12,
      padding: '4px 4px 0 14px', fontFamily: dahila.fontSans, fontSize: 13, color: dahila.ink700, lineHeight: 1.45,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 4 }}>
        <p style={{ margin: 0, padding: '8px 10px 0 0' }}>
          <strong style={{ fontWeight: 500, color: dahila.ink900 }}>
            Tu pedido {sentOrder.code} quedó escrito en WhatsApp.
          </strong>
          {fijo && ' Si ya lo mandaste, Anush te responde ahí.'}
        </p>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              flexShrink: 0, background: 'transparent', border: 'none', cursor: 'pointer', color: dahila.ink500,
              width: 44, height: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Icon name="x" size={14} />
          </button>
        )}
      </div>
      {copied && (
        <span style={{ fontSize: 12, lineHeight: 1.5, paddingRight: 10 }}>
          Pegalo en un chat de WhatsApp con {whatsappLabel || 'Anush'}.
        </span>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0 16px', flexWrap: 'wrap', paddingRight: 10 }}>
        <button type="button" onClick={onCopy} style={{ ...textBtn, color: dahila.ink900 }}>
          {copied ? '✓ Pedido copiado' : 'Copiar mi pedido'}
        </button>
        <Link href={`/pedido?codigo=${encodeURIComponent(sentOrder.code)}`} style={{ ...textBtn, color: dahila.wine600 }}>
          Seguí tu pedido
        </Link>
        {onVaciar && (
          <button type="button" onClick={onVaciar} style={textBtn}>
            Vaciar el carrito
          </button>
        )}
      </div>
    </div>
  )
}
