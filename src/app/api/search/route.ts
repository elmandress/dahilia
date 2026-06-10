import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPrimaryPhoto, getFinalPrice } from '@/lib/types'
import type { Product } from '@/lib/types'

export const revalidate = 0

// Strip diacritics + lowercase so "cardigan" matches "Cardigán" and vice versa.
// Use explicit Unicode escape range to avoid source-encoding corruption of literal chars.
function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

/**
 * Lightweight product search for the header's live suggestions. Returns a small,
 * shaped payload (no full product rows) so the dropdown stays fast.
 *
 * The catalogue is small and curated, so we fetch the active/soldout set and
 * match in JS with full accent/case normalisation. This avoids the `unaccent`
 * Postgres extension (no migration needed) and sidesteps interpolating raw user
 * input into a PostgREST filter string.
 */
export async function GET(req: NextRequest) {
  const raw = (req.nextUrl.searchParams.get('q') || '').trim()
  if (raw.length < 2) return NextResponse.json({ results: [] })
  const q = normalize(raw)

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('products')
      .select('id, slug, name, description, status, base_price_uyu, discount_percent, discount_active, media:product_media(url, is_primary, type), sizes:product_sizes(price_uyu)')
      .in('status', ['active', 'soldout'])
      .limit(200)

    if (error) throw error

    // Rank: name match beats description match; earlier position beats later.
    const scored = (data ?? [])
      .map((p) => {
        const prod = p as unknown as Product & { description?: string | null }
        const name = normalize(prod.name || '')
        const desc = normalize(prod.description || '')
        const nameIdx = name.indexOf(q)
        const descIdx = desc.indexOf(q)
        let score = -1
        if (nameIdx === 0) score = 0
        else if (nameIdx > 0) score = 1 + nameIdx / 100
        else if (descIdx >= 0) score = 100 + descIdx / 100
        return { prod, score }
      })
      .filter((x) => x.score >= 0)
      .sort((a, b) => a.score - b.score)
      .slice(0, 6)

    const results = scored.map(({ prod }) => ({
      slug: prod.slug,
      name: prod.name,
      photo: getPrimaryPhoto(prod),
      price: getFinalPrice(prod),
      soldout: prod.status === 'soldout',
    }))

    return NextResponse.json({ results })
  } catch (e) {
    console.error('GET /api/search', e)
    return NextResponse.json({ results: [] }, { status: 200 })
  }
}
