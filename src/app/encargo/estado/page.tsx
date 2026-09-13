import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getCatalog } from '@/lib/catalog'
import { EstadoClient } from './EstadoClient'

export const metadata: Metadata = {
  title: 'Estado de tu encargo',
  description: 'Seguí el estado de tu encargo a medida con tu código.',
  alternates: { canonical: '/encargo/estado' },
  robots: { index: false, follow: false },
}

export default async function EstadoPage() {
  // El número de WhatsApp sale del catálogo cacheado (mismos settings que usa
  // el layout): cero consultas nuevas a Supabase por esta página.
  const { settings } = await getCatalog()
  const whatsappUrl = settings.contact_whatsapp_url?.trim() || 'https://wa.me/59899850073'
  return (
    <Suspense fallback={null}>
      <EstadoClient whatsappUrl={whatsappUrl} />
    </Suspense>
  )
}
