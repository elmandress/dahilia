import { Icon } from '@/components/ui/Primitives'

/**
 * Aviso delgado de "modo lectura": aparece cuando el catálogo se sirve desde el
 * snapshot estático porque la base está caída (ver src/lib/catalog.ts). El sitio
 * sigue navegable pero no se puede comprar en línea, así que se invita a
 * encargar por WhatsApp. No es full-screen — el catálogo se ve debajo.
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
        textAlign: 'center',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        flexWrap: 'wrap',
      }}
    >
      <span>
        Estamos actualizando la tienda — por ahora los pedidos los tomamos por WhatsApp.
      </span>
      <a
        href={waUrl}
        rel="noopener"
        style={{
          color: '#fff',
          fontWeight: 500,
          textDecoration: 'underline',
          textUnderlineOffset: '3px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          whiteSpace: 'nowrap',
        }}
      >
        <Icon name="whatsapp-logo" size={15} />
        Escribinos
      </a>
    </div>
  )
}
