import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendDailySummary, reportSystemError, type DailySummaryData } from '@/lib/email'

export const dynamic = 'force-dynamic'

// Protected daily-digest endpoint. `.github/workflows/daily-summary.yml` es
// el único caller real hoy y ya usa el header — builds the summary and emails
// the owner.
//
// SCHEDULING: GitHub Actions (ya configurado) u otro cron externo, pegándole con
//   GET https://<dominio>/api/cron/daily-summary
//   Header  Authorization: Bearer <CRON_SECRET>
//
// Requires CRON_SECRET in the environment; without it the endpoint stays closed.
// Auditoría 03/09/2026: antes también aceptaba el secreto por ?secret=
// (puede quedar en logs de acceso del hosting/proxy) y comparaba con === (no
// constant-time) — se saca la query string y se compara con timingSafeEqual.

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB)
}

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const header = req.headers.get('authorization') || ''
  return safeEqual(header, `Bearer ${secret}`)
}

async function buildStats(): Promise<DailySummaryData> {
  // Clave de servicio (solo servidor): desde database/seguridad-2026-09.sql,
  // get_daily_summary() ya no la puede llamar cualquiera con la clave
  // pública. Sin la variable cae al cliente anónimo: el RPC falla y se usa
  // el fallback de abajo.
  const supabase = createAdminClient() ?? (await createClient())

  // Preferred path: aggregate RPC (needs schema-daily-summary.sql). No PII.
  const { data, error } = await supabase.rpc('get_daily_summary')
  if (!error && data) {
    return data as unknown as DailySummaryData
  }

  // Fallback si el RPC falla. Ojo: con el cliente anónimo (sin la clave de
  // servicio), cart_items no es legible desde cerrar-carritos-favoritos.sql,
  // así que esta consulta vuelve vacía y el resumen saldría en cero aunque
  // haya habido carritos. El error queda en el log de la función para que un
  // "0" del fallback no se lea como "no pasó nada".
  console.error('daily-summary: get_daily_summary falló; el fallback no ve cart_items', error?.message ?? 'sin datos')
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
