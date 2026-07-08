import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import type { PublicCoupon } from '@/lib/coupons'
import { COUPON_REASON_TEXT } from '@/lib/coupons'

const CART_COOKIE = 'dahila_cart_id'

interface CouponRpcRow {
  code: string
  label: string | null
  kind: PublicCoupon['kind']
  value: number | null
  min_subtotal_uyu: number | null
  product_ids: string[] | null
  category_ids: string[] | null
  valid: boolean
  reason: string
}

/**
 * POST /api/coupon
 *   { code }                → valida el cupón y devuelve su regla pública.
 *   { code, redeem: true }  → registra el canje (al finalizar por WhatsApp).
 *
 * La tabla de cupones no es legible por anon: todo pasa por las RPCs
 * SECURITY DEFINER de schema-cupones.sql. El descuento en pesos se calcula
 * en el cliente con computeCouponEffect sobre los precios reales del carrito.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    const code = String(body?.code || '').trim().slice(0, 40)
    if (!code) {
      return NextResponse.json({ ok: false, error: 'Ingresá un código.' }, { status: 400 })
    }

    const store = await cookies()
    const cartId = store.get(CART_COOKIE)?.value || null

    const supabase = await createClient()

    if (body?.redeem === true) {
      const { data, error } = await supabase.rpc('redeem_coupon', { p_code: code, p_cart: cartId })
      if (error) {
        // 42883 = la función no existe → falta correr schema-cupones.sql
        console.error('redeem_coupon rpc error', error)
        return NextResponse.json({ ok: false, error: 'No pudimos registrar el cupón.' }, { status: 500 })
      }
      return NextResponse.json({ ok: data === true })
    }

    const { data, error } = await supabase.rpc('get_coupon_public', { p_code: code, p_cart: cartId })
    if (error) {
      console.error('get_coupon_public rpc error', error)
      return NextResponse.json(
        { ok: false, error: 'Los cupones no están disponibles en este momento.' },
        { status: 500 }
      )
    }
    const row = (Array.isArray(data) ? data[0] : data) as CouponRpcRow | undefined
    if (!row) {
      return NextResponse.json({ ok: false, error: COUPON_REASON_TEXT.not_found }, { status: 404 })
    }
    if (!row.valid) {
      return NextResponse.json(
        { ok: false, error: COUPON_REASON_TEXT[row.reason] || COUPON_REASON_TEXT.not_found },
        { status: 409 }
      )
    }

    const coupon: PublicCoupon = {
      code: row.code,
      label: row.label,
      kind: row.kind,
      value: row.value,
      min_subtotal_uyu: row.min_subtotal_uyu,
      product_ids: row.product_ids ?? [],
      category_ids: row.category_ids ?? [],
    }
    return NextResponse.json({ ok: true, coupon })
  } catch (e) {
    console.error('POST /api/coupon', e)
    return NextResponse.json({ ok: false, error: 'Error inesperado.' }, { status: 500 })
  }
}
