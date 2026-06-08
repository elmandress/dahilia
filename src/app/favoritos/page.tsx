import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { FavoritosClient } from './FavoritosClient'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Tus favoritos',
  description: 'Las piezas de Dahila que guardaste para mirar después.',
  alternates: { canonical: '/favoritos' },
  robots: { index: false, follow: false },
}

export default async function FavoritosPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_settings')
    .select('key, value')
    .eq('key', 'contact_whatsapp_url')

  const whatsappUrl =
    ((data ?? []).find((r) => r.key === 'contact_whatsapp_url')?.value as string | undefined) ||
    'https://wa.me/59894605015'

  return <FavoritosClient whatsappUrl={whatsappUrl} />
}
