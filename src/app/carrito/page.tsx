import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import CarritoClient from './CarritoClient'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Tu carrito',
  description: 'Revisá tu selección y coordiná el pedido por WhatsApp.',
  alternates: { canonical: '/carrito' },
  robots: { index: false, follow: false },
}

export default async function CarritoPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['contact_whatsapp_url', 'contact_whatsapp'])

  const settings = (data ?? []).reduce<Record<string, string>>(
    (acc, curr) => ({ ...acc, [curr.key]: String(curr.value ?? '') }),
    {}
  )

  return (
    <CarritoClient
      whatsappUrl={settings.contact_whatsapp_url || 'https://wa.me/59894605015'}
      whatsappLabel={settings.contact_whatsapp || '+598 94 605 015'}
    />
  )
}
