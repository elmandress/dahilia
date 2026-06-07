import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPrimaryPhoto, getFinalPrice } from '@/lib/types'
import type { Product } from '@/lib/types'

export const revalidate = 0

/**
 * Lightweight product search for the header's live suggestions. Returns a small,
 * shaped payload (no full product rows) so the dropdown stays fast.
 */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') || '').trim()
  if (q.length < 2) return NextResponse.json({ results: [] })

  try {
    const supabase = await createClient()
    // Match name or description, active/soldout only.
    const { data, error } = await supabase
      .from('products')
      .select('id, slug, name, status, base_price_uyu, discount_percent, discount_active, media:product_media(url, is_primary, type), sizes:product_sizes(price_uyu)')
      .in('status', ['active', 'soldout'])
      .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
      .limit(6)

    if (error) throw error

    const results = (data ?? []).map((p) => {
      const prod = p as unknown as Product
      return {
        slug: prod.slug,
        name: prod.name,
        photo: getPrimaryPhoto(prod),
        price: getFinalPrice(prod),
        soldout: prod.status === 'soldout',
      }
    })

    return NextResponse.json({ results })
  } catch (e) {
    console.error('GET /api/search', e)
    return NextResponse.json({ results: [] }, { status: 200 })
  }
}
