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
  // Pool amplio: el estado vacío muestra los primeros 4; con carrito lleno,
  // el módulo "Sumale un detalle" filtra de acá piezas chicas (≤ $800) de
  // categorías que no están todavía en el pedido.
  const featured = products.filter((p) => p.status === 'active').slice(0, 24)

  return (
    <CarritoClient
      whatsappUrl={settings.contact_whatsapp_url || 'https://wa.me/59899850073'}
      whatsappLabel={settings.contact_whatsapp || '+598 99 850 073'}
      featuredProducts={featured}
      discounts={discounts}
    />
  )
}
