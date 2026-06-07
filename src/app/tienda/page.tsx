import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { Product, Category, Color, Discount } from '@/lib/types'
import { TiendaClient } from './TiendaClient'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Tienda',
  description: 'Colección actual de prendas tejidas a crochet — tops, cardigans, accesorios y sets.',
  alternates: { canonical: '/tienda' },
  openGraph: {
    title: 'Tienda | Dahila Crochet',
    description: 'Colección actual de prendas tejidas a crochet — tops, cardigans, accesorios y sets.',
    url: '/tienda',
  },
}

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const categoryFilter = typeof params.cat === 'string' ? params.cat : ''
  const searchQuery = typeof params.q === 'string' ? params.q : ''

  const [categoriesRes, productsRes, colorsRes, discountsRes] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order', { ascending: true }),
    supabase
      .from('products')
      .select('*, category:categories(*), media:product_media(*), sizes:product_sizes(*), colors:product_colors(color:colors(*))')
      .in('status', ['active', 'soldout'])
      .order('sort_order', { ascending: true }),
    supabase.from('colors').select('*').order('sort_order', { ascending: true }),
    supabase.from('discounts').select('*').eq('active', true),
  ])

  const categories = (categoriesRes.data ?? []) as Category[]
  const colors = (colorsRes.data ?? []) as Color[]
  const discounts = (discountsRes.data ?? []) as Discount[]

  // Flatten the joined product_colors → Color[] for each product.
  const products = (productsRes.data ?? []).map((p) => {
    const joined = (p.colors ?? []) as Array<{ color: Color | null }>
    return {
      ...p,
      colors: joined.map((c) => c.color).filter((c): c is Color => !!c),
    }
  }) as Product[]

  return (
    <TiendaClient
      key={`${categoryFilter}|${searchQuery}`}
      initialProducts={products}
      categories={categories}
      colors={colors}
      discounts={discounts}
      initialFilter={categoryFilter}
      initialSearch={searchQuery}
    />
  )
}
