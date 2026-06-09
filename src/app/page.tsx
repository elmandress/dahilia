import { createClient } from '@/lib/supabase/server'
import type { Product, Discount, Color } from '@/lib/types'
import type { Testimonial } from '@/components/TestimonialsStrip'
import { HomeClient } from './HomeClient'

export const revalidate = 3600

export default async function Home() {
  const supabase = await createClient()

  const [settingsRes, productsRes, discountsRes, testimonialsRes] = await Promise.all([
    supabase.from('site_settings').select('*'),
    supabase
      .from('products')
      .select('*, category:categories(*), media:product_media(*), sizes:product_sizes(*), colors:product_colors(color:colors(*))')
      .eq('status', 'active')
      .order('sort_order', { ascending: true })
      .limit(12),
    supabase.from('discounts').select('*').eq('active', true),
    // Graceful — table may not exist yet
    Promise.resolve(
      supabase.from('testimonials').select('*').order('sort_order', { ascending: true })
    ).catch(() => ({ data: [] })),
  ])

  const settings = (settingsRes.data ?? []).reduce<Record<string, string>>(
    (acc, curr) => ({ ...acc, [curr.key]: curr.value }),
    {}
  )

  const products = (productsRes.data ?? []).map((p) => {
    const joined = (p.colors ?? []) as Array<{ color: Color | null }>
    return { ...p, colors: joined.map((c) => c.color).filter((c): c is Color => !!c) }
  }) as Product[]
  const discounts = (discountsRes.data ?? []) as Discount[]
  const testimonials = ((testimonialsRes as { data: Testimonial[] | null }).data ?? []) as Testimonial[]

  return <HomeClient products={products} settings={settings} discounts={discounts} testimonials={testimonials} />
}
