import type { Metadata } from 'next'
import { getCatalog } from '@/lib/catalog'
import CarritoClient from './CarritoClient'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Tu carrito',
  description: 'Revisá tu selección y coordiná el pedido por WhatsApp.',
  alternates: { canonical: '/carrito' },
  robots: { index: false, follow: false },
}

export default async function CarritoPage() {
  // Del catálogo, no de una consulta propia: ese ya saca las prendas de un drop
  // que no se lanzó (antes salían en el carrito vacío y se podían agregar) y
  // tiene el respaldo del snapshot si la base se cae (auditoría 04/11/2026).
  const { settings, products, discounts } = await getCatalog()
  // Solo para el carrito vacío (las primeras 4). "Sumale un detalle" ya no sale
  // de acá: usa el mismo pool que el cajón (addonCandidates del layout, vía el
  // CartProvider). Antes eran las primeras 24 activas y el cajón y /carrito
  // sugerían piezas distintas (QA-06).
  const featured = products.filter((p) => p.status === 'active').slice(0, 4)

  return (
    <CarritoClient
      whatsappUrl={settings.contact_whatsapp_url || 'https://wa.me/59899850073'}
      whatsappLabel={settings.contact_whatsapp || '+598 99 850 073'}
      featuredProducts={featured}
      discounts={discounts}
    />
  )
}
