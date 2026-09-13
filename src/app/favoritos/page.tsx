import type { Metadata } from 'next'
import { getCatalog } from '@/lib/catalog'
import { FavoritosClient } from './FavoritosClient'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Tus favoritos',
  description: 'Las piezas de Dahila que guardaste para mirar después.',
  alternates: { canonical: '/favoritos' },
  robots: { index: false, follow: false },
}

export default async function FavoritosPage() {
  // WhatsApp y descuentos desde el catálogo cacheado (antes, una consulta
  // propia a site_settings por visita y sin descuentos para la vista rápida).
  const { settings, discounts } = await getCatalog()
  const whatsappUrl = settings.contact_whatsapp_url?.trim() || 'https://wa.me/59899850073'

  return <FavoritosClient whatsappUrl={whatsappUrl} discounts={discounts} />
}
