import { Icon } from '@/components/ui/Primitives'

/**
 * Aviso de "pedidos por WhatsApp": aparece cuando el catálogo se sirve desde el
 * snapshot estático porque la base está caída (ver src/lib/catalog.ts).
 *
 * Dice qué está pausado y qué sigue igual (21/09/2026). Dos cosas que el texto
 * NO puede hacer: dar a entender que se dejó de poder comprar (el catálogo y
 * los precios se ven igual), ni que los pedidos por WhatsApp son una medida de
 * emergencia — siempre se coordinaron así. Lo único que cambia es el carrito.
 */
export function CatalogReadOnlyBanner({
  waUrl = 'https://wa.me/59899850073',
}: {
  waUrl?: string
}) {
  return (
    <div
      role="status"
      style={{
        background: 'var(--wine-600, #8F3B53)',
        color: '#fff',
        fontSize: 'var(--fs-sm, 13px)',
        lineHeight: 1.5,
        textAlign: 'center',
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      <span style={{ maxWidth: 640 }}>
        <strong style={{ fontWeight: 600 }}>El carrito está en mantenimiento unos días.</strong>{' '}
        Podés ver todo el catálogo, los precios y los talles como siempre, y tu pedido lo coordinamos
        por WhatsApp, igual que siempre.
      </span>
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: '#fff',
          fontWeight: 500,
          textDecoration: 'underline',
          textUnderlineOffset: '3px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          whiteSpace: 'nowrap',
          padding: '4px 0',
        }}
      >
        <Icon name="whatsapp-logo" size={15} />
        Escribinos y coordinamos
      </a>
    </div>
  )
}
