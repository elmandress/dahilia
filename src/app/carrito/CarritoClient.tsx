'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/components/CartProvider'
import { dahila, Eyebrow, Button, Icon } from '@/components/ui/Primitives'
import { getPrimaryPhoto, formatPrice, getEffectivePrice, getFinalPrice, readyDateEstimate, BLUR_DATA_URL } from '@/lib/types'
import type { Product, Discount } from '@/lib/types'
import { computeCouponEffect, type PublicCoupon } from '@/lib/coupons'
import { PriceBlock } from '@/components/ui/PriceBlock'
import Image from 'next/image'
import { SITE_URL } from '@/lib/env'
import { track } from '@/lib/analytics'

// Recuerda el código ingresado entre recargas (se re-valida siempre contra el
// servidor al montar — nunca se confía en lo guardado).
const COUPON_STORAGE_KEY = 'dahila_coupon_code'

interface Props {
  whatsappUrl: string
  whatsappLabel: string
  featuredProducts?: Product[]
  discounts?: Discount[]
}

// Misma urgencia honesta que el PDP: fecha estimada concreta, no "N semanas".
function leadTimeLabel(min: number, max: number): string {
  const estimate = readyDateEstimate(min, max)
  return estimate ? `Se teje al encargar — lista ${estimate}` : ''
}

/** Build a clean, multi-line WhatsApp message from the cart contents. */
function buildWhatsAppMessage(
  items: ReturnType<typeof useCart>['items'],
  discounts: ReturnType<typeof useCart>['discounts'],
  total: number,
  giftNote?: string,
  coupon?: { code: string; discount: number; freeShipping: boolean } | null,
  /** Umbral de envío gratis alcanzado (monto en UYU); null si no aplica. */
  freeShippingOver?: number | null
): string {
  const lines: string[] = []
  lines.push('Hola Anush! Quiero coordinar este pedido:')
  lines.push('')

  items
    .filter((i) => !!i.product)
    .forEach((item, idx) => {
      const list = getEffectivePrice(item.product, item.size)
      const unit = getFinalPrice(item.product, item.size, discounts)
      const subtotal = unit * item.qty
      const slug = item.product.slug
      const discounted = unit < list
      lines.push(`${idx + 1}. ${item.product.name}`)
      lines.push(`   • Talle: ${item.size}`)
      lines.push(`   • Cantidad: ${item.qty}`)
      if (discounted) {
        lines.push(`   • Precio unitario: ${formatPrice(unit)} (antes ${formatPrice(list)})`)
      }
      lines.push(`   • Subtotal: ${formatPrice(subtotal)}`)
      lines.push(`   ${SITE_URL}/tienda/${slug}`)
      lines.push('')
    })

  if (coupon && coupon.discount > 0) {
    lines.push(`Cupón ${coupon.code}: −${formatPrice(coupon.discount)}`)
  }
  if (coupon?.freeShipping) {
    lines.push(`Cupón ${coupon.code}: envío gratis`)
  } else if (freeShippingOver) {
    lines.push(`Envío gratis (pedido arriba de ${formatPrice(freeShippingOver)})`)
  }
  lines.push(`Total: ${formatPrice(total)}`)
  if (giftNote) {
    lines.push('')
    lines.push(`🎁 Nota de regalo: "${giftNote}"`)
  }
  lines.push('')
  lines.push('¿Me confirmás stock, plazos y forma de pago? ¡Gracias!')

  return lines.join('\n')
}

export default function CarritoClient({ whatsappUrl, whatsappLabel, featuredProducts = [], discounts: serverDiscounts = [] }: Props) {
  const { items, removeFromCart, updateQty, addToCart, isLoading, discounts, shippingEstimate, freeShippingThreshold, queueNote } = useCart()
  const router = useRouter()
  const [giftNote, setGiftNote] = useState('')
  const [showGiftNote, setShowGiftNote] = useState(false)
  const [showCoupon, setShowCoupon] = useState(false)
  const [couponInput, setCouponInput] = useState('')
  const [coupon, setCoupon] = useState<PublicCoupon | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [couponPending, startCouponTransition] = useTransition()

  // Re-validar un cupón recordado de una visita anterior (silencioso).
  useEffect(() => {
    const saved = sessionStorage.getItem(COUPON_STORAGE_KEY)
    if (!saved) return
    fetch('/api/coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: saved }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.ok && res.coupon) setCoupon(res.coupon as PublicCoupon)
        else sessionStorage.removeItem(COUPON_STORAGE_KEY)
      })
      .catch(() => { /* sin red: el cupón simplemente no se restaura */ })
  }, [])

  const subtotal = items.reduce(
    (acc, item) => acc + (getFinalPrice(item.product, item.size, discounts) * item.qty),
    0
  )
  // Efecto del cupón calculado en vivo sobre el carrito actual (si cambian
  // cantidades, el descuento se recalcula solo).
  const couponEffect = coupon ? computeCouponEffect(coupon, items, discounts) : null
  const couponDiscount = couponEffect && !couponEffect.blocked ? couponEffect.discount : 0
  const freeShipping = !!(couponEffect && !couponEffect.blocked && couponEffect.freeShipping)
  const total = Math.max(0, subtotal - couponDiscount)
  // Umbral de envío gratis del sitio (independiente del cupón). Se calcula
  // sobre el total final para no prometer de más si un cupón baja el monto.
  const overThreshold = freeShippingThreshold > 0 && total >= freeShippingThreshold
  const missingForFree = freeShippingThreshold > 0 ? Math.max(0, freeShippingThreshold - total) : 0

  // "Sumale un detalle": cross-sell silencioso de piezas chicas (Baymard: los
  // add-ons del carrito deben ser complementos baratos, nunca otra prenda que
  // compita con la que ya está). Prioriza categorías que NO están en el carrito.
  const ADDON_MAX_UYU = 800
  const cartProductIds = new Set(items.map((i) => i.product_id))
  const cartCategoryIds = new Set(items.map((i) => i.product?.category_id).filter(Boolean))
  const addonSuggestions = featuredProducts
    .filter((p) =>
      !cartProductIds.has(p.id) &&
      !p.is_custom_only &&
      (p.base_price_uyu ?? 0) > 0 &&
      getFinalPrice(p, undefined, discounts) <= ADDON_MAX_UYU
    )
    .sort((a, b) =>
      Number(cartCategoryIds.has(a.category_id ?? '')) - Number(cartCategoryIds.has(b.category_id ?? '')) ||
      getFinalPrice(a, undefined, discounts) - getFinalPrice(b, undefined, discounts)
    )
    .slice(0, 3)
  const [addedAddonId, setAddedAddonId] = useState<string | null>(null)

  const handleAddonAdd = async (p: Product) => {
    const avail = (p.sizes ?? []).filter((s) => s.available)
    const size = avail.length > 0 ? avail[0].size : 'Único'
    setAddedAddonId(p.id)
    await addToCart(p, size, 1, { openDrawer: false })
    track('cart_addon_add', { product: p.slug })
    setTimeout(() => setAddedAddonId(null), 2000)
  }

  const applyCoupon = () => {
    const code = couponInput.trim()
    if (!code) return
    setCouponError(null)
    startCouponTransition(async () => {
      try {
        const r = await fetch('/api/coupon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        })
        const res = await r.json()
        if (res.ok && res.coupon) {
          setCoupon(res.coupon as PublicCoupon)
          setCouponInput('')
          setShowCoupon(false)
          sessionStorage.setItem(COUPON_STORAGE_KEY, (res.coupon as PublicCoupon).code)
          track('coupon_applied', { code: (res.coupon as PublicCoupon).code })
        } else {
          setCouponError(res.error || 'No pudimos validar el cupón.')
        }
      } catch {
        setCouponError('No pudimos validar el cupón. Revisá tu conexión.')
      }
    })
  }

  const clearCoupon = () => {
    setCoupon(null)
    setCouponError(null)
    sessionStorage.removeItem(COUPON_STORAGE_KEY)
  }

  const handleCheckout = async () => {
    if (typeof window === 'undefined') return
    // Registrar el canje ANTES de abrir WhatsApp. Si justo se agotó, avisamos
    // y NO abrimos el chat con un total que ya no es válido.
    if (coupon && (couponDiscount > 0 || freeShipping)) {
      try {
        const r = await fetch('/api/coupon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: coupon.code, redeem: true }),
        })
        const res = await r.json()
        if (!res.ok) {
          clearCoupon()
          setCouponError('Ese cupón se agotó justo ahora. El total quedó actualizado — volvé a tocar el botón.')
          return
        }
      } catch {
        /* sin red para registrar: no bloqueamos la venta */
      }
    }
    const message = buildWhatsAppMessage(
      items, discounts, total, giftNote.trim(),
      coupon ? { code: coupon.code, discount: couponDiscount, freeShipping } : null,
      overThreshold ? freeShippingThreshold : null
    )
    // wa.me supports `?text=` query param. encodeURIComponent handles the rest.
    // Strip any trailing slash from the base URL so we can append cleanly.
    const base = whatsappUrl.replace(/\/+$/, '')
    const url = `${base}?text=${encodeURIComponent(message)}`
    track('order_sent', { items: items.length, total })
    // Con cupón hay un fetch (await) antes de llegar acá, y iOS Safari suele
    // bloquear window.open fuera del gesto original — si lo bloquea, navegamos
    // en la misma pestaña: wa.me abre la app igual y la venta no se pierde.
    const win = window.open(url, '_blank', 'noopener,noreferrer')
    if (!win) window.location.assign(url)
  }

  if (isLoading) {
    return (
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div className="sk-shimmer" style={{ width: 60, height: 11, borderRadius: 4 }} />
        <div className="sk-shimmer" style={{ width: 200, height: 44, borderRadius: 6, marginTop: 12, marginBottom: 40 }} />
        {[1, 2].map((i) => (
          <div key={i} style={{ display: 'flex', gap: 24, paddingBottom: 24, marginBottom: 24, borderBottom: `1px solid ${dahila.border}` }}>
            <div className="sk-shimmer" style={{ width: 100, height: 120, borderRadius: 8 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="sk-shimmer" style={{ width: '60%', height: 18, borderRadius: 4 }} />
              <div className="sk-shimmer" style={{ width: '30%', height: 12, borderRadius: 4 }} />
              <div className="sk-shimmer" style={{ width: '40%', height: 14, borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: featuredProducts.length > 0 ? 56 : 0 }}>
          <div style={{ marginBottom: 20, color: dahila.ink300 }}>
            <Icon name="shopping-bag" size={44} />
          </div>
          <Eyebrow>Tu carrito</Eyebrow>
          <h1 style={{
            fontFamily: dahila.fontDisplay, fontWeight: 300,
            fontSize: 'clamp(28px, 4vw, 40px)', lineHeight: 1.1, letterSpacing: '-0.02em',
            color: dahila.ink900, margin: '14px 0 12px',
          }}>Está vacío.</h1>
          <p style={{ fontFamily: dahila.fontSans, fontWeight: 300, fontSize: 15, color: dahila.ink700, marginBottom: 28 }}>
            Todavía no agregaste nada. Mirá lo que hay disponible.
          </p>
          <Button variant="primary" onClick={() => router.push('/tienda')}>Ir a la tienda</Button>
        </div>

        {featuredProducts.length > 0 && (
          <div style={{ marginTop: 64 }}>
            <p style={{
              fontFamily: dahila.fontSans, fontSize: 11, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: dahila.ink500, textAlign: 'center', marginBottom: 28,
            }}>Algunas piezas que te pueden gustar</p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 20,
            }}>
              {featuredProducts.slice(0, 4).map((p) => {
                const photo = getPrimaryPhoto(p)
                const price = getFinalPrice(p, undefined, serverDiscounts)
                return (
                  <Link
                    key={p.id}
                    href={`/tienda/${p.slug}`}
                    style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}
                  >
                    <div style={{
                      position: 'relative', aspectRatio: '3/4',
                      borderRadius: 10, overflow: 'hidden', background: dahila.cream50,
                    }}>
                      <Image
                        src={photo}
                        alt={p.name}
                        fill
                        quality={82}
                        sizes="(max-width: 600px) 50vw, 220px"
                        placeholder="blur"
                        blurDataURL={BLUR_DATA_URL}
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 14, color: dahila.ink900, lineHeight: 1.3 }}>
                      {p.name}
                    </div>
                    <div style={{ fontFamily: dahila.fontSans, fontSize: 13, color: dahila.ink700 }}>
                      {formatPrice(price)}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 24px 80px' }}>
      <Eyebrow>Tu pedido</Eyebrow>
      <h1 style={{
        fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 'clamp(32px, 5vw, 48px)',
        lineHeight: 1.05, letterSpacing: '-0.02em', color: dahila.ink900, margin: '12px 0 40px',
      }}>Tu carrito</h1>

      {/* Dos columnas en desktop (≥900px): piezas a la izquierda, resumen
          sticky a la derecha — el total y el botón quedan siempre a la vista
          (patrón COS/Mejuri). En mobile vuelve a una columna y la barra fija
          de abajo cumple ese rol. */}
      <div className="cart-layout">
      <div className="cart-main">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {items.filter((i) => !!i.product).map((item) => {
          const photo = getPrimaryPhoto(item.product)
          const listPrice = getEffectivePrice(item.product, item.size)
          const price = getFinalPrice(item.product, item.size, discounts)
          return (
            <div key={item.id} className="cart-row" style={{
              display: 'flex', gap: 24, paddingBottom: 24,
              borderBottom: `1px solid ${dahila.border}`,
              alignItems: 'center'
            }}>
              <div style={{
                width: 90, height: 108, borderRadius: 8, overflow: 'hidden',
                background: dahila.cream50, position: 'relative', flexShrink: 0
              }}>
                <Image src={photo} alt={item.product.name} fill sizes="90px" style={{ objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontFamily: dahila.fontDisplay, fontSize: 18, color: dahila.ink900, lineHeight: 1.2 }}>
                  {item.product.name}
                </div>
                <div style={{ fontFamily: dahila.fontSans, fontSize: 13, color: dahila.ink700 }}>
                  Talle: {item.size}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                  <PriceBlock list={listPrice} final={price} size="md" />
                </div>
                {/* Lead time — solo cuando hay dato real Y no hay lista de espera
                    activa (el aviso global manda; prometer "lista en 3 semanas"
                    con cola hasta agosto sería mentir). */}
                {!queueNote && leadTimeLabel(item.product.lead_time_weeks_min, item.product.lead_time_weeks_max) && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 2,
                    fontFamily: 'var(--font-sans)', fontSize: 11, color: '#8C8285',
                  }}>
                    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M8 4.5V8l2.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    {leadTimeLabel(item.product.lead_time_weeks_min, item.product.lead_time_weeks_max)}
                  </div>
                )}
              </div>

              <div className="cart-row-controls" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  border: `1px solid ${dahila.borderStrong}`, borderRadius: 999, padding: '6px 12px'
                }}>
                  <button
                    onClick={() => updateQty(item.id, item.qty - 1)}
                    aria-label="Restar uno"
                    disabled={item.qty <= 1}
                    style={{
                      background: 'transparent', border: 'none', padding: 0,
                      cursor: item.qty <= 1 ? 'default' : 'pointer',
                      color: item.qty <= 1 ? dahila.ink300 : dahila.ink900,
                      width: 30, height: 30, minWidth: 30, minHeight: 30,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  ><Icon name="minus" size={12} /></button>
                  <span style={{ fontFamily: dahila.fontSans, fontSize: 14, minWidth: 14, textAlign: 'center' }}>{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    aria-label="Sumar uno"
                    disabled={item.qty >= 20}
                    style={{
                      background: 'transparent', border: 'none', padding: 0,
                      cursor: item.qty >= 20 ? 'default' : 'pointer',
                      color: item.qty >= 20 ? dahila.ink300 : dahila.ink900,
                      width: 30, height: 30, minWidth: 30, minHeight: 30,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  ><Icon name="plus" size={12} /></button>
                </div>

                <button onClick={() => removeFromCart(item.id)} style={{
                  background: 'transparent', border: 'none', cursor: 'pointer', color: dahila.ink500, padding: 8,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }} aria-label="Eliminar">
                  <Icon name="x" size={18} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* "Sumale un detalle" — cross-sell calmo: piezas chicas que viajan en el
          mismo envío. Sin caja ni fondo: una continuación silenciosa de la
          lista, con el mismo lenguaje visual que las filas del carrito.
          Un solo toque cuando la pieza es de talle único; si tiene talles,
          lleva a la ficha para elegirlo. */}
      {addonSuggestions.length > 0 && (
        <section aria-label="Piezas chicas para sumar" style={{ marginTop: 22 }}>
          <p style={{
            fontFamily: dahila.fontSans, fontSize: 10, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: dahila.ink500, margin: '0 0 12px',
          }}>
            Sumale un detalle · viaja en el mismo envío
          </p>
          <div className="cart-addons" style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {addonSuggestions.map((p) => {
              const photo = getPrimaryPhoto(p)
              const price = getFinalPrice(p, undefined, discounts)
              const availableSizes = (p.sizes ?? []).filter((s) => s.available)
              const oneTap = availableSizes.length <= 1
              const justAdded = addedAddonId === p.id
              return (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <Link href={`/tienda/${p.slug}`} aria-label={`Ver ${p.name}`} style={{
                    position: 'relative', width: 44, height: 54, flexShrink: 0,
                    borderRadius: 6, overflow: 'hidden', background: dahila.cream50, display: 'block',
                  }}>
                    <Image src={photo} alt={p.name} fill sizes="44px" placeholder="blur" blurDataURL={BLUR_DATA_URL} style={{ objectFit: 'cover' }} />
                  </Link>
                  <div style={{ minWidth: 0 }}>
                    <Link href={`/tienda/${p.slug}`} style={{
                      fontFamily: dahila.fontDisplay, fontSize: 14, color: dahila.ink900,
                      textDecoration: 'none', display: 'block', lineHeight: 1.2,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150,
                    }}>
                      {p.name}
                    </Link>
                    {oneTap ? (
                      <button
                        onClick={() => handleAddonAdd(p)}
                        disabled={justAdded}
                        aria-label={`Agregar ${p.name} al carrito por ${formatPrice(price)}`}
                        style={{
                          background: 'transparent', border: 'none', padding: '2px 0', cursor: justAdded ? 'default' : 'pointer',
                          fontFamily: dahila.fontSans, fontSize: 12,
                          color: justAdded ? '#1E8449' : dahila.wine600,
                          textDecoration: justAdded ? 'none' : 'underline', textUnderlineOffset: 3,
                        }}
                      >
                        {justAdded ? '✓ Sumado' : `+ Agregar · ${formatPrice(price)}`}
                      </button>
                    ) : (
                      <Link href={`/tienda/${p.slug}`} style={{
                        fontFamily: dahila.fontSans, fontSize: 12, color: dahila.wine600,
                        textDecoration: 'underline', textUnderlineOffset: 3, display: 'inline-block', padding: '2px 0',
                      }}>
                        {`Elegir talle · ${formatPrice(price)}`}
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Reassurance strip */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 18,
        marginTop: 28, paddingTop: 20, borderTop: `1px solid ${dahila.border}`,
        justifyContent: 'center',
      }}>
        {[
          ['truck', shippingEstimate.trim() || 'Envío a todo Uruguay'],
          ['hand-heart', 'Hecho a mano'],
          ['chat-circle', 'Atención personal por WhatsApp'],
        ].map(([icon, txt]) => (
          <span key={txt} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink500,
          }}>
            <Icon name={icon} size={15} color={dahila.ink500} /> {txt}
          </span>
        ))}
      </div>

      </div>{/* /cart-main */}

      <aside
        className="cart-subtotal cart-summary"
        aria-label="Resumen del pedido"
        style={{
          display: 'flex', flexDirection: 'column', gap: 14,
          background: dahila.cream50, border: `1px solid ${dahila.border}`,
          borderRadius: 14, padding: '22px 22px 24px',
        }}
      >
        <h2 style={{
          fontFamily: dahila.fontSans, fontSize: 11, fontWeight: 400,
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: dahila.ink500, margin: 0,
        }}>Resumen</h2>

        {/* Cupón — disclosure discreto, mismo lenguaje que la nota de regalo */}
        <div className="cart-coupon" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
          {coupon ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
              fontFamily: dahila.fontSans, fontSize: 13,
            }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: couponEffect?.blocked ? 'rgba(182,49,74,0.07)' : 'rgba(30,132,73,0.08)',
                color: couponEffect?.blocked ? '#7a1e2f' : '#1E8449',
                borderRadius: 999, padding: '6px 12px', fontWeight: 500,
              }}>
                <Icon name="tag" size={14} />
                Cupón {coupon.code}
                {!couponEffect?.blocked && couponDiscount > 0 && ` · −${formatPrice(couponDiscount)}`}
                {!couponEffect?.blocked && freeShipping && ' · envío gratis'}
              </span>
              <button type="button" onClick={clearCoupon} style={{
                background: 'transparent', border: 'none', cursor: 'pointer', padding: 4,
                fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink500, textDecoration: 'underline',
              }}>
                Quitar
              </button>
              {couponEffect?.blocked && (
                <span role="alert" style={{ width: '100%', fontSize: 12, color: '#7a1e2f' }}>
                  {couponEffect.blocked}
                </span>
              )}
            </div>
          ) : !showCoupon ? (
            <button
              type="button"
              onClick={() => setShowCoupon(true)}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
                fontFamily: dahila.fontSans, fontSize: 13, color: dahila.ink500,
                display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'underline',
              }}
            >
              <Icon name="tag" size={14} color={dahila.ink500} />
              ¿Tenés un cupón?
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => { if (e.key === 'Enter') applyCoupon() }}
                  placeholder="TU-CUPON"
                  aria-label="Código de cupón"
                  autoFocus
                  style={{
                    fontFamily: dahila.fontSans, fontSize: 13, letterSpacing: '0.08em',
                    color: dahila.ink900, background: '#fff',
                    border: `1px solid ${dahila.borderStrong}`, borderRadius: 8,
                    padding: '10px 12px', width: 150, textTransform: 'uppercase',
                  }}
                />
                <Button variant="secondary" size="sm" onClick={applyCoupon} disabled={couponPending}>
                  {couponPending ? '...' : 'Aplicar'}
                </Button>
                <button type="button" onClick={() => { setShowCoupon(false); setCouponError(null) }} aria-label="Cerrar cupón" style={{
                  background: 'transparent', border: 'none', cursor: 'pointer', color: dahila.ink500, padding: 4,
                }}>
                  <Icon name="x" size={16} />
                </button>
              </div>
              {couponError && (
                <span role="alert" style={{ fontFamily: dahila.fontSans, fontSize: 12, color: '#7a1e2f', maxWidth: 300 }}>
                  {couponError}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="cart-totals" style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
          {couponDiscount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontFamily: dahila.fontSans, fontSize: 13, color: dahila.ink700 }}>
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
          )}
          {couponDiscount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontFamily: dahila.fontSans, fontSize: 13, color: '#1E8449' }}>
              <span>Cupón {coupon?.code}</span>
              <span>−{formatPrice(couponDiscount)}</span>
            </div>
          )}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            borderTop: `1px solid ${dahila.border}`, paddingTop: 10, marginTop: couponDiscount > 0 ? 4 : 0,
          }}>
            <span style={{
              fontFamily: dahila.fontSans, fontSize: 14, color: dahila.ink700,
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              Total
            </span>
            <span style={{ fontFamily: dahila.fontDisplay, fontSize: 24, color: dahila.ink900 }}>
              {formatPrice(total)}
            </span>
          </div>
          {freeShipping ? (
            <span style={{ fontFamily: dahila.fontSans, fontSize: 12, color: '#1E8449' }}>
              Tu cupón incluye envío gratis
            </span>
          ) : overThreshold ? (
            <span style={{ fontFamily: dahila.fontSans, fontSize: 12, color: '#1E8449' }}>
              ✓ Envío gratis — tu pedido supera los {formatPrice(freeShippingThreshold)}
            </span>
          ) : missingForFree > 0 ? (
            <span style={{ fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink500 }}>
              Te faltan {formatPrice(missingForFree)} para el envío gratis — el costo exacto te lo paso por WhatsApp
            </span>
          ) : (
            <span style={{ fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink500 }}>
              El envío no está incluido — te paso el costo exacto por WhatsApp según tu zona
            </span>
          )}
        </div>

        {/* Gift note toggle — opens a small textarea; content goes into WA message */}
        <div style={{ width: '100%' }}>
          {!showGiftNote ? (
            <button
              type="button"
              onClick={() => setShowGiftNote(true)}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
                fontFamily: dahila.fontSans, fontSize: 13, color: dahila.ink500,
                display: 'inline-flex', alignItems: 'center', gap: 6,
                textDecoration: 'underline',
              }}
            >
              <Icon name="gift" size={14} color={dahila.ink500} />
              Es un regalo — agregar nota
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontFamily: dahila.fontSans, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: dahila.ink500 }}>
                Nota de regalo
              </label>
              <textarea
                rows={2}
                maxLength={200}
                value={giftNote}
                onChange={(e) => setGiftNote(e.target.value)}
                placeholder='Ej: "Con cariño para vos 🧶"'
                style={{
                  fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 300, color: dahila.ink900,
                  background: '#fff', border: `1px solid ${dahila.borderStrong}`,
                  borderRadius: 8, padding: '10px 12px', resize: 'none',
                  width: '100%', boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => { setShowGiftNote(false); setGiftNote('') }}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
                  fontFamily: dahila.fontSans, fontSize: 11, color: dahila.ink500, alignSelf: 'flex-start',
                  textDecoration: 'underline',
                }}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleCheckout}
          aria-label={`Coordinar pedido por WhatsApp con ${whatsappLabel}`}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            background: '#25D366',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '16px 28px',
            fontFamily: dahila.fontSans,
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            width: '100%',
            boxShadow: '0 8px 22px -10px rgba(37,211,102,0.6)',
            transition: 'transform 160ms cubic-bezier(0.22,0.61,0.36,1), box-shadow 160ms',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 12px 28px -10px rgba(37,211,102,0.7)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 8px 22px -10px rgba(37,211,102,0.6)'
          }}
        >
          <Icon name="whatsapp-logo" weight="fill" size={20} color="#fff" />
          Coordinar por WhatsApp
        </button>

        {/* Lista de espera — la expectativa de plazo se fija acá, pegada al
            botón: nadie descubre en WhatsApp que su pedido empieza en un mes. */}
        {queueNote && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            background: '#fff', border: `1px solid ${dahila.border}`,
            borderRadius: 10, padding: '10px 14px',
            fontFamily: dahila.fontSans, fontSize: 12.5, color: dahila.ink700, lineHeight: 1.5,
          }}>
            <span style={{ flexShrink: 0, marginTop: 1 }}>
              <Icon name="arrow-clockwise" size={15} color={dahila.ink500} />
            </span>
            <span>{queueNote}</span>
          </div>
        )}

        {/* Qué pasa al tocar el botón — la duda #1 antes de un checkout por chat */}
        <ol className="cart-steps" style={{
          listStyle: 'none', margin: 0, padding: 0,
          display: 'flex', flexDirection: 'column', gap: 5,
          fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink500, lineHeight: 1.5,
        }}>
          <li>1 · Se abre WhatsApp con tu pedido ya armado — no pagás nada todavía.</li>
          <li>2 · Anush te confirma disponibilidad y fecha estimada.</li>
          <li>3 · Elegís cómo pagar (transferencia o Mercado Pago) y cómo recibirlo.</li>
          <li style={{ marginTop: 4 }}>
            <Link href="/info" style={{ color: dahila.ink500 }}>¿Dudas? Mirá envíos, cambios y cuidados →</Link>
          </li>
        </ol>
      </aside>
      </div>{/* /cart-layout */}

      {/* Barra fija mobile: total + CTA siempre a un toque (mismo patrón que
          la pdp-sticky-bar). En desktop no existe — el resumen sticky cumple. */}
      <div className="cart-sticky-bar">
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15, minWidth: 0 }}>
          <span style={{ fontFamily: dahila.fontSans, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: dahila.ink500 }}>
            Total
          </span>
          <span style={{ fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 20, color: dahila.ink900 }}>
            {formatPrice(total)}
          </span>
        </div>
        <button
          onClick={handleCheckout}
          aria-label={`Coordinar pedido por WhatsApp con ${whatsappLabel}`}
          style={{
            flex: 1, marginLeft: 16,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: '#25D366', color: '#fff', border: 'none',
            borderRadius: 10, padding: '14px 18px', cursor: 'pointer',
            fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 500,
            letterSpacing: '0.05em', textTransform: 'uppercase',
          }}
        >
          <Icon name="whatsapp-logo" weight="fill" size={18} color="#fff" />
          Coordinar
        </button>
      </div>
    </div>
  )
}
