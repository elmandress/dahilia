import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import CarritoClient from './CarritoClient'
import type { Product, Color, Discount } from '@/lib/types'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Tu carrito',
  description: 'Revisá tu selección y coordiná el pedido por WhatsApp.',
  alternates: { canonical: '/carrito' },
  robots: { index: false, follow: false },
}

export default async function CarritoPage() {
  const supabase = await createClient()
  const [settingsRes, featuredRes, discountsRes] = await Promise.all([
    supabase.from('site_settings').select('key, value').in('key', ['contact_whatsapp_url', 'contact_whatsapp']),
    supabase
      .from('products')
      .select('*, category:categories(*), media:product_media(*), sizes:product_sizes(*), colors:product_colors(color:colors(*))')
      .eq('status', 'active')
      .order('sort_order', { ascending: true })
      .limit(4),
    supabase.from('discounts').select('*').eq('active', true),
  ])

  const settings = (settingsRes.data ?? []).reduce<Record<string, string>>(
    (acc, curr) => ({ ...acc, [curr.key]: String(curr.value ?? '') }),
    {}
  )
  const discounts = (discountsRes.data ?? []) as Discount[]
  const featured = (featuredRes.data ?? []).map((p) => {
    const joined = (p.colors ?? []) as Array<{ color: Color | null }>
    return { ...p, colors: joined.map((c) => c.color).filter((c): c is Color => !!c) }
  }) as Product[]

  return (
    <CarritoClient
      whatsappUrl={settings.contact_whatsapp_url || 'https://wa.me/59894605015'}
      whatsappLabel={settings.contact_whatsapp || '+598 94 605 015'}
      featuredProducts={featured}
      discounts={discounts}
    />
  )
}
