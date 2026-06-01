import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata, ResolvingMetadata } from 'next'
import type { Product } from '@/lib/types'
import { getPrimaryPhoto } from '@/lib/types'
import { ProductDetailsClient } from './ProductDetailsClient'
import Link from 'next/link'
import { DAHILA_PREVIEW_PRODUCTS } from '@/lib/preview-data'

export const revalidate = 3600

// Generate dynamic OpenGraph metadata for each product
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('products')
    .select('*, media:product_media(*)')
    .eq('slug', slug)
    .single()
    
  let product = data as Product
  if (!product) {
    product = DAHILA_PREVIEW_PRODUCTS.find(p => p.slug === slug) as Product
  }
  
  if (!product) return { title: 'Producto no encontrado' }
  const photo = getPrimaryPhoto(product)
  
  return {
    title: product.name,
    description: product.description || `Comprar ${product.name} a medida en Dahila Crochet.`,
    openGraph: {
      title: `${product.name} | Dahila Crochet`,
      description: product.description || `Prenda de crochet hecha a mano en Uruguay.`,
      images: [photo]
    }
  }
}

export default async function ProductPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('products')
    .select(`
      *, 
      category:categories(*), 
      media:product_media(*), 
      sizes:product_sizes(*), 
      colors:product_colors(*, color:colors(*))
    `)
    .eq('slug', slug)
    .single()
    
  let product = data as Product
  if (!product) {
    product = DAHILA_PREVIEW_PRODUCTS.find(p => p.slug === slug) as Product
  }
  
  if (!product) {
    notFound()
  }
  
  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      {/* Breadcrumbs */}
      <nav className="breadcrumbs hide-mobile">
        <Link href="/">Inicio</Link>
        <span className="breadcrumbs__sep">/</span>
        <Link href="/tienda">Tienda</Link>
        {product.category && (
          <>
            <span className="breadcrumbs__sep">/</span>
            <Link href={`/tienda?cat=${product.category.slug}`}>{product.category.name}</Link>
          </>
        )}
        <span className="breadcrumbs__sep">/</span>
        <span style={{ color: 'var(--fg)' }}>{product.name}</span>
      </nav>

      {/* Structured Data for Google SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.description || '',
            image: getPrimaryPhoto(product),
            offers: {
              '@type': 'Offer',
              price: product.base_price_uyu || 0,
              priceCurrency: 'UYU',
              availability: product.status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            }
          })
        }}
      />

      <ProductDetailsClient product={product} />
    </div>
  )
}
