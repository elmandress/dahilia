import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { Product, Category } from '@/lib/types'
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

  const [categoriesRes, productsRes] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order', { ascending: true }),
    supabase
      .from('products')
      .select('*, category:categories(*), media:product_media(*), sizes:product_sizes(*)')
      .in('status', ['active', 'soldout'])
      .order('sort_order', { ascending: true }),
  ])

  const categories = (categoriesRes.data ?? []) as Category[]
  const products = (productsRes.data ?? []) as Product[]

  return (
    <TiendaClient
      key={`${categoryFilter}|${searchQuery}`}
      initialProducts={products}
      categories={categories}
      initialFilter={categoryFilter}
      initialSearch={searchQuery}
    />
  )
}
