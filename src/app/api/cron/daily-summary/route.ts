import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendDailySummary, reportSystemError, type DailySummaryData } from '@/lib/email'

export const dynamic = 'force-dynamic'

// Protected daily-digest endpoint. Point any scheduler at it (see below); it
// builds the summary and emails the owner.
//
// SCHEDULING (falta programar el scheduler):
//   - Netlify Scheduled Functions, or
//   - a free external cron (cron-job.org, GitHub Actions) hitting:
//       GET https://<dominio>/api/cron/daily-summary?secret=<CRON_SECRET>
//     or with header  Authorization: Bearer <CRON_SECRET>
//
// Requires CRON_SECRET in the environment; without it the endpoint stays closed.

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const header = req.headers.get('authorization')
  const q = req.nextUrl.searchParams.get('secret')
  return header === `Bearer ${secret}` || q === secret
}

async function buildStats(): Promise<DailySummaryData> {
  const supabase = await createClient()

  // Preferred path: aggregate RPC (needs schema-daily-summary.sql). No PII.
  const { data, error } = await supabase.rpc('get_daily_summary')
  if (!error && data) {
    return data as unknown as DailySummaryData
  }

  // Fallback: cart-only stats from anon-readable cart_items (encargo counts need
  // the RPC because custom_orders is admin-only).
  const { data: rows } = await supabase
    .from('cart_items')
    .select('cart_id, qty, product:products(name, base_price_uyu)')

  const carts = new Set<string>()
  let items = 0
  let value = 0
  const byProduct = new Map<string, number>()
  for (const r of (rows ?? []) as Array<{ cart_id: string; qty: number; product?: { name?: string; base_price_uyu?: number } | null }>) {
    carts.add(r.cart_id)
    items += r.qty
    value += r.qty * (r.product?.base_price_uyu ?? 0)
    if (r.product?.name) byProduct.set(r.product.name, (byProduct.get(r.product.name) ?? 0) + r.qty)
  }
  const top_products = [...byProduct.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, qty]) => ({ name, qty }))

  return { carts_distinct: carts.size, cart_items: items, cart_value_uyu: value, top_products }
}

async function run(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  try {
    const stats = await buildStats()
    const res = await sendDailySummary(stats)
    return NextResponse.json({ ok: res.sent, skipped: res.skipped, error: res.error })
  } catch (e) {
    console.error('daily-summary cron failed', e)
    await reportSystemError('cron daily-summary', e)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  return run(req)
}
export async function POST(req: NextRequest) {
  return run(req)
}
