import { Icon } from '@/components/ui/Primitives'

/**
 * Aviso de "pedidos por WhatsApp": aparece cuando el catálogo se sirve desde el
 * snapshot estático porque la base está caída (ver src/lib/catalog.ts).
 *
 * Dice qué se puede hacer y qué no, en ese orden (20/09/2026). Antes decía solo
 * "estamos actualizando la tienda": quien tocaba el carrito igual se llevaba un
 * error, y quien quería mirar precios no sabía si podía confiar en lo que veía.
 * El tono es de atención, no de falla: el precio, el talle y el plazo son los
 * mismos, y el pedido se toma igual.
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
        <strong style={{ fontWeight: 600 }}>Los pedidos los tomamos por WhatsApp estos días.</strong>{' '}
        Podés ver todo el catálogo, los precios y los talles como siempre. El carrito y los favoritos
        están pausados por un mantenimiento; el precio y el plazo son los mismos.
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
