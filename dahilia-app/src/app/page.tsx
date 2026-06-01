import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/lib/types'
import { DAHILA_PREVIEW_PRODUCTS } from '@/lib/preview-data'
import { HomeClient } from './HomeClient'

export const revalidate = 3600

export default async function Home() {
  const supabase = await createClient()

  const { data: settingsData } = await supabase.from('site_settings').select('*')
  const settings = settingsData?.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {}) as Record<string, string>

  const { data: productsData } = await supabase
    .from('products')
    .select('*, media:product_media(*), sizes:product_sizes(*)')
    .eq('status', 'active')
    .order('sort_order', { ascending: true })
    .limit(10)
  
  // FALLBACK PREVIEW MODE: If database returns no active products, use our static preview data
  const products = (productsData && productsData.length > 0) ? (productsData as Product[]) : DAHILA_PREVIEW_PRODUCTS
  
  return <HomeClient products={products} settings={settings} />
}
