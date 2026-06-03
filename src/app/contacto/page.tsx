import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ContactoClient from './ContactoClient'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Escribime por WhatsApp o Instagram. Te respondo cuanto antes.',
  alternates: { canonical: '/contacto' },
  openGraph: {
    title: 'Contacto | Dahila Crochet',
    description: 'Escribime por WhatsApp o Instagram. Te respondo cuanto antes.',
    url: '/contacto',
  },
}

export default async function ContactoPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_settings')
    .select('*')
    .in('key', [
      'contact_whatsapp', 'contact_whatsapp_url',
      'contact_instagram', 'contact_instagram_url',
      'contact_location',
    ])

  const settings = (data ?? []).reduce<Record<string, string>>(
    (acc, curr) => ({ ...acc, [curr.key]: String(curr.value ?? '') }),
    {}
  )

  return <ContactoClient settings={settings} />
}
