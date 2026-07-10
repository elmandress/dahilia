import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ContactoClient from './ContactoClient'
import { SITE_URL } from '@/lib/env'
import { OG_BASE } from '@/lib/og'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Contacto — hablás directo con quien teje',
  description: 'Escribinos por WhatsApp o Instagram: te responde Anush, la persona que va a tejer tu prenda. Consultas de talles, colores, encargos y envíos a todo Uruguay.',
  alternates: { canonical: '/contacto' },
  openGraph: {
    ...OG_BASE,
    title: 'Contacto — hablás directo con quien teje',
    description: 'Te responde Anush, la persona que va a tejer tu prenda. Consultas de talles, colores, encargos y envíos.',
    url: `${SITE_URL}/contacto`,
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
