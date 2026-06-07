import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { Product, Discount } from '@/lib/types'
import { getFinalPrice, getEffectivePrice } from '@/lib/types'
import { OfertasClient } from './OfertasClient'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Ofertas',
  description: 'Prendas de crochet con descuento. Hecho a mano en Uruguay.',
  alternates: { canonical: '/ofertas' },
  openGraph: {
    title: 'Ofertas | Dahila Crochet',
    description: 'Prendas de crochet con descuento. Hecho a mano en Uruguay.',
    url: '/ofertas',
  },
}

export default async function OfertasPage() {
  const supabase = await createClient()

  const [productsRes, discountsRes] = await Promise.all([
    supabase
      .from('products')
      .select('*, category:categories(*), media:product_media(*), sizes:product_sizes(*)')
      .eq('status', 'active')
      .order('sort_order', { ascending: true }),
    supabase.from('discounts').select('*').eq('active', true),
  ])

  const allProducts = (productsRes.data ?? []) as Product[]
  const discounts = (discountsRes.data ?? []) as Discount[]

  // Keep only products whose final price is below their list price.
  const products = allProducts.filter(
    (p) => getFinalPrice(p, undefined, discounts) < getEffectivePrice(p)
  )

  return <OfertasClient products={products} discounts={discounts} />
}
