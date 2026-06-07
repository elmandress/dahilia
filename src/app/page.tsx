import { createClient } from '@/lib/supabase/server'
import type { Product, Discount } from '@/lib/types'
import { HomeClient } from './HomeClient'

export const revalidate = 3600

export default async function Home() {
  const supabase = await createClient()

  const [settingsRes, productsRes, discountsRes] = await Promise.all([
    supabase.from('site_settings').select('*'),
    supabase
      .from('products')
      .select('*, category:categories(*), media:product_media(*), sizes:product_sizes(*)')
      .eq('status', 'active')
      .order('sort_order', { ascending: true })
      .limit(12),
    supabase.from('discounts').select('*').eq('active', true),
  ])

  const settings = (settingsRes.data ?? []).reduce<Record<string, string>>(
    (acc, curr) => ({ ...acc, [curr.key]: curr.value }),
    {}
  )

  const products = (productsRes.data ?? []) as Product[]
  const discounts = (discountsRes.data ?? []) as Discount[]

  return <HomeClient products={products} settings={settings} discounts={discounts} />
}
