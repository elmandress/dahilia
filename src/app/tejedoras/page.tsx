import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import TejedorasClient from './TejedorasClient'
import { OG_BASE } from '@/lib/og'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Tejé con Dahila — red de tejedoras',
  description:
    'Sumate a la red de tejedoras de Dahila Crochet. Trabajá desde casa, a tu ritmo, con pago por pieza aprobada y materiales incluidos. Postulate hoy.',
  alternates: { canonical: '/tejedoras' },
  openGraph: {
    ...OG_BASE,
    title: 'Tejé con Dahila — trabajá desde casa',
    description:
      'Trabajá desde casa, a tu ritmo, con pago por pieza aprobada y materiales incluidos.',
    url: '/tejedoras',
  },
}

export default async function TejedorasPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'contact_whatsapp_url')
    .maybeSingle()

  const waUrl = (data?.value as string | undefined) || 'https://wa.me/59899850073'
  return <TejedorasClient whatsappUrl={waUrl} />
}
