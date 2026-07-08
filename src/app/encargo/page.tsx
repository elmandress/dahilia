import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import EncargoForm from './EncargoForm'

export const metadata: Metadata = {
  title: 'Encargos a medida',
  description: 'Pedí tu prenda de crochet a medida. Te respondo en 48hs con boceto y presupuesto.',
  alternates: { canonical: '/encargo' },
  openGraph: {
    title: 'Encargos a medida | Dahila Crochet',
    description: 'Pedí tu prenda de crochet a medida. Te respondo en 48hs con boceto y presupuesto.',
    url: '/encargo',
  },
}

export default async function EncargoPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['contact_whatsapp_url'])

  const waUrl = (data ?? []).find((r) => r.key === 'contact_whatsapp_url')?.value as string | undefined
  return <EncargoForm whatsappUrl={waUrl || 'https://wa.me/59899850073'} />
}
