import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/lib/types'
import { HomeClient } from './HomeClient'

export const revalidate = 3600

export default async function Home() {
  const supabase = await createClient()

  const [settingsRes, productsRes] = await Promise.all([
    supabase.from('site_settings').select('*'),
    supabase
      .from('products')
      .select('*, category:categories(*), media:product_media(*), sizes:product_sizes(*)')
      .eq('status', 'active')
      .order('sort_order', { ascending: true })
      .limit(12),
  ])

  const settings = (settingsRes.data ?? []).reduce<Record<string, string>>(
    (acc, curr) => ({ ...acc, [curr.key]: curr.value }),
    {}
  )

  const products = (productsRes.data ?? []) as Product[]

  return <HomeClient products={products} settings={settings} />
}
