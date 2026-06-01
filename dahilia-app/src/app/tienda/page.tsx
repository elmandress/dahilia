import { createClient } from '@/lib/supabase/server'
import type { Product, Category } from '@/lib/types'
import { DAHILA_PREVIEW_PRODUCTS } from '@/lib/preview-data'
import { TiendaClient } from './TiendaClient'

export const revalidate = 3600

export default async function TiendaPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const categoryFilter = params.cat as string
  const searchQuery = params.q as string || ''

  // Fetch categories
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
  
  const categories = (categoriesData || []) as Category[]

  // Fetch products
  let query = supabase
    .from('products')
    .select('*, category:categories(*), media:product_media(*), sizes:product_sizes(*)')
    .in('status', ['active', 'soldout'])
    .order('sort_order', { ascending: true })

  const { data: productsData } = await query
  
  // FALLBACK PREVIEW MODE
  let products = (productsData && productsData.length > 0) ? (productsData as Product[]) : DAHILA_PREVIEW_PRODUCTS

  // Pre-defined static categories if DB is empty
  const displayCats = categories.length > 0 ? categories : [
    { id: 'tops', slug: 'tops', name: 'Tops' } as Category,
    { id: 'accesorios', slug: 'accesorios', name: 'Accesorios' } as Category,
    { id: 'cardigans', slug: 'cardigans', name: 'Cardigans' } as Category,
    { id: 'sets', slug: 'sets', name: 'Sets' } as Category,
  ]

  return (
    <TiendaClient 
      initialProducts={products} 
      categories={displayCats} 
      initialFilter={categoryFilter} 
      initialSearch={searchQuery}
    />
  )
}
