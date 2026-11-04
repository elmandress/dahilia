'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { useCart } from '@/components/CartProvider'
import { dahila, Eyebrow, Button, Icon } from '@/components/ui/Primitives'
import {
  getPrimaryPhoto, formatPrice, getEffectivePrice, getFinalPrice, BLUR_DATA_URL,
  formatListingPrice, isReadyToShip, getPrimaryPhotoAlt, isUnicoLabel, variantLabel,
} from '@/lib/types'
import type { Product, Discount } from '@/lib/types'
import { computeCouponEffect, type PublicCoupon } from '@/lib/coupons'
import { pickAddonSuggestions, addonAction } from '@/lib/addons'
import { cartItemIssue, motivoNoDisponible, plazoLinea } from '@/lib/cart-summary'
import { couponMemory } from '@/lib/coupon-memory'
import { waLink, WHATSAPP_DEFAULT, mensajeVolverATejer } from '@/lib/whatsapp'
import { useWhatsAppCheckout } from '@/components/checkout/useWhatsAppCheckout'
import { PedidoEnviado } from '@/components/checkout/PedidoEnviado'
import { PriceBlock } from '@/components/ui/PriceBlock'
import { ImagenConRespaldo } from '@/components/ui/ImagenConRespaldo'
import { SITE_URL } from '@/lib/env'
import { track } from '@/lib/analytics'

interface Props {
  whatsappUrl: string
  whatsappLabel: string
  /** Solo para el carrito vacío: las sugerencias con piezas salen del provider. */
  featuredProducts?: Product[]
  discounts?: Discount[]
}

// El botón verde de WhatsApp del resumen; después de mandar el pedido pasa a
// secundario (blanco con borde verde) mientras el contenido no cambie.
const ctaGreen: React.CSSProperties = { background: dahila.whatsapp, color: '#fff', border: 'none' }
const ctaSecondary: React.CSSProperties = { background: '#fff', color: dahila.whatsapp, border: `1px solid ${dahila.whatsapp}` }

export default function CarritoClient({ whatsappUrl, whatsappLabel, featuredProducts = [], discounts: serverDiscounts = [] }: Props) {
  const {
    items, buyableItems: buyable, unavailableItems, cartTotal: subtotal, addonCandidates,
    removeFromCart, updateQty, addToCart, clearCart, refresh, isLoading, discounts, shippingEstimate, freeShippingThreshold, queueNote,
  } = useCart()
  const [giftNote, setGiftNote] = useState('')
  const [showGiftNote, setShowGiftNote] = useState(false)
  const [showCoupon, setShowCoupon] = useState(false)
  const [couponInput, setCouponInput] = useState('')
  const [coupon, setCoupon] = useState<PublicCoupon | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [couponPending, startCouponTransition] = useTransition()
  // "Cerrar" del aviso de pedido enviado solo lo esconde: el pedido sigue
  // recordado y el botón lo reabre sin registrar otro ni volver a canjear.
  const [avisoCerrado, setAvisoCerrado] = useState<string | null>(null)

  // Al entrar: el carrito fresco (el provider vive en el layout y no lo vuelve
  // a pedir al navegar; es una consulta por visita) y la vista medida, una vez.
  const entro = useRef(false)
  useEffect(() => {
    if (entro.current) return
    entro.current = true
    void refresh()
    track('view_cart', { via: 'pagina' })
  }, [refresh])

  // Re-validar un cupón recordado de una visita anterior (silencioso).
  useEffect(() => {
    const saved = couponMemory.read()
    if (!saved) return
    fetch('/api/coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: saved }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.ok && res.coupon) setCoupon(res.coupon as PublicCoupon)
        else couponMemory.clear()
      })
      .catch(() => { /* sin red: el cupón simplemente no se restaura */ })
  }, [])

  // Solo lo que todavía se puede pedir (cart-summary, la misma cuenta que el
  // globito y el cajón): una prenda que se agotó, pasó a borrador o cambió de
  // talle después de agregarla no suma al total ni sale en el mensaje.
  // Textos que no prometen coordinar lo que no hace falta: talle en piezas
  // de talle único, fecha en piezas ya tejidas.
  const todoEnStock = buyable.length > 0 && buyable.every((i) => isReadyToShip(i.product))
  const sinTalles = buyable.every((i) => isUnicoLabel(i.size))
  // Nada para pedir, pero algo quedó en el carrito: ni "TOTAL UYU 0" ni "Te
  // faltan…", y la salida es preguntarle a Anush si se puede volver a tejer (QA-05).
  const todoNoDisponible = buyable.length === 0 && unavailableItems.length > 0
  // Efecto del cupón calculado en vivo sobre el carrito actual (si cambian
  // cantidades, el descuento se recalcula solo).
  const couponEffect = coupon ? computeCouponEffect(coupon, buyable, discounts) : null
  const couponDiscount = couponEffect && !couponEffect.blocked ? couponEffect.discount : 0
  const freeShipping = !!(couponEffect && !couponEffect.blocked && couponEffect.freeShipping)
  const total = Math.max(0, subtotal - couponDiscount)
  // Umbral de envío gratis del sitio (independiente del cupón). Se calcula
  // sobre el total final para no prometer de más si un cupón baja el monto.
  const overThreshold = freeShippingThreshold > 0 && total >= freeShippingThreshold
  const missingForFree = freeShippingThreshold > 0 ? Math.max(0, freeShippingThreshold - total) : 0
  // Envío junto al total (hipótesis 1 de la auditoría 12/09/2026: el costo
  // que aparece recién al final es la causa n.º 1 de abandono). Sale de
  // Configuración → "Envío — línea corta". Solo se muestra acá si trae montos
  // (algún número); si no, queda la frase de siempre.
  const shipping = shippingEstimate.trim()
  const shippingHasCost = /\d/.test(shipping)

  // Mismo pool y misma regla que el cajón (QA-06, CRO-11): un toque solo si no
  // hay variante que elegir, y solo piezas en stock si todo lo pedible lo está.
  const addonSuggestions = pickAddonSuggestions(addonCandidates, items, discounts, { soloEnStock: todoEnStock })
  const [addedAddonId, setAddedAddonId] = useState<string | null>(null)

  const handleAddonAdd = async (p: Product, size: string) => {
    // "✓ Sumado" y la medición solo si de verdad se guardó (CRO-22).
    const ok = await addToCart(p, size, 1, { openDrawer: false, source: 'carrito_addon' })
    if (!ok) return
    setAddedAddonId(p.id)
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
          couponMemory.write((res.coupon as PublicCoupon).code)
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
    couponMemory.clear()
  }

  // El checkout, el mismo que el del cajón (CRO-01): traba de doble toque,
  // ventana en blanco con cupón, código estable y reapertura sin duplicar.
  const { checkout, checkingOut, sentOrder, clearSent, copyOrder, copied, yaEnviadoHace } = useWhatsAppCheckout({
    buyable, discounts, subtotal, total, couponDiscount, freeShipping, overThreshold, freeShippingThreshold,
    coupon, giftNote, whatsappUrl, desde: 'carrito',
    onCouponLost: (msg) => {
      clearCoupon()
      setCouponError(msg)
    },
  })
  const vaciar = async () => {
    if (await clearCart()) clearSent()
  }
  const avisoVisible = !!sentOrder && avisoCerrado !== sentOrder.code

  const volverATejer = (() => {
    const text = mensajeVolverATejer(unavailableItems.map((u) => u.item.product.name))
    return waLink(whatsappUrl, text) ?? waLink(WHATSAPP_DEFAULT, text)!
  })()

  // "Mandar o guardar mi carrito" (CRO-13, versión sin servidor): el carrito
  // vive en una cookie del navegador donde se armó, y el de Instagram no la
  // comparte con Safari. Un texto con el link de cada prenda (con su talle) se
  // puede pasar a Safari, guardar o mandar a quien lo regala.
  const compartirCarrito = async () => {
    const text = buyable.map((i) => {
      const unico = isUnicoLabel(i.size)
      const url = `${SITE_URL}/tienda/${i.product.slug}${unico ? '' : `?talle=${encodeURIComponent(i.size)}`}`
      return unico ? `${i.product.name}: ${url}` : `${i.product.name} (${variantLabel(i.product.sizes)} ${i.size}): ${url}`
    }).join('\n')
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: 'Mi carrito de Dahila', text })
        track('cart_share', { via: 'menu' })
        return
      } catch (e) {
        // Cerró el menú sin elegir: no hace falta otra salida.
        if (e instanceof DOMException && e.name === 'AbortError') return
      }
    }
    // Sin menú de compartir: WhatsApp sin número, que deja elegir el contacto.
    const url = `https://wa.me/?text=${encodeURIComponent(`Mi carrito de Dahila:\n${text}`)}`
    const win = window.open(url, '_blank')
    if (win) win.opener = null
    else window.location.assign(url)
    track('cart_share', { via: 'whatsapp' })
  }

  if (isLoading) {
    return (
      // minHeight: el carrito se carga después de pintar (CartProvider difiere
      // el fetch) y al llegar el contenido real (o el estado vacío, con su
      // grilla de sugerencias) el footer saltaba ~2000 px a la vista: CLS 0,455
      // en Lighthouse. Con el esqueleto ocupando la pantalla, el footer arranca
      // fuera de ella y ese salto no se ve ni cuenta (auditoría 12/09/2026).
      // key distinta en cada estado (cargando / vacío / con piezas): sin
      // ella, React reutilizaba estos <div> para el estado vacío (mismo tipo,
      // misma posición) y el bloque de sugerencias contaba como un elemento
      // que "se movió" (CLS 0,200 aun con el minHeight). Con key se montan
      // nodos nuevos, y el contenido insertado no es un desplazamiento.
      <div key="cargando" role="status" aria-live="polite" style={{ maxWidth: 880, margin: '0 auto', padding: '40px 24px 80px', minHeight: '85vh' }}>
        {/* Título real mientras carga (19/09/2026): el esqueleto no tenía ningún
            encabezado y quien usa lector de pantalla llegaba a una página sin título. */}
        <h1 className="sr-only">Tu carrito</h1>
        <span className="sr-only">Cargando…</span>
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

  // Vacío también si lo único que quedó son filas sin prenda (no hay con qué dibujarlas).
  if (buyable.length === 0 && unavailableItems.length === 0) {
    return (
      <div key="vacio" style={{ maxWidth: 880, margin: '0 auto', padding: '80px 24px' }}>
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
          <Button variant="primary" href="/tienda">Ir a la tienda</Button>
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
                const price = formatListingPrice(p, serverDiscounts)
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
                      <ImagenConRespaldo
                        slug={p.slug}
                        src={photo}
                        alt={getPrimaryPhotoAlt(p)}
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
                      {price}
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
    <div key="con-piezas" style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 24px 80px' }}>
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
          const issue = cartItemIssue(item)
          const listPrice = getEffectivePrice(item.product, item.size)
          const price = getFinalPrice(item.product, item.size, discounts)
          // Plazo — solo cuando hay dato real Y no hay lista de espera activa
          // (el aviso global manda; prometer "lista en 3 semanas" con cola
          // hasta agosto sería mentir). Pieza ya tejida: "En stock".
          const plazo = issue ? null : plazoLinea(item.product, queueNote)
          return (
            <div key={item.id} className="cart-row" style={{
              display: 'flex', gap: 24, paddingBottom: 24,
              borderBottom: `1px solid ${dahila.border}`,
              alignItems: 'center'
            }}>
              <div style={{
                width: 90, height: 108, borderRadius: 8, overflow: 'hidden',
                background: dahila.cream50, position: 'relative', flexShrink: 0,
                opacity: issue ? 0.55 : 1,
              }}>
                <ImagenConRespaldo slug={item.product.slug} src={photo} alt={item.product.name} fill sizes="90px" style={{ objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontFamily: dahila.fontDisplay, fontSize: 18, color: issue ? dahila.ink500 : dahila.ink900, lineHeight: 1.2 }}>
                  {item.product.name}
                </div>
                <div style={{ fontFamily: dahila.fontSans, fontSize: 13, color: dahila.ink700 }}>
                  {/* "Modelo: Lisas" cuando las variantes no son talles (VIS-M4). */}
                  {isUnicoLabel(item.size) ? 'Talle único' : `${variantLabel(item.product.sizes)}: ${item.size}`}
                </div>
                {/* Lo que ya no se puede pedir va sin precio ni +/−, con el
                    motivo: no suma al total ni sale en el mensaje (QA-01). */}
                {!issue && (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                    <PriceBlock list={listPrice} final={price} size="md" />
                  </div>
                )}
                {issue ? (
                  <div role="status" style={{ marginTop: 2, fontFamily: dahila.fontSans, fontSize: 12, fontWeight: 500, color: '#B6314A' }}>
                    {issue === 'talle-inexistente' ? (
                      <>
                        Ese talle cambió:{' '}
                        <Link href={`/tienda/${item.product.slug}`} style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                          elegilo de nuevo
                        </Link>
                        . No se incluye en el pedido.
                      </>
                    ) : (
                      `${motivoNoDisponible(issue, item.product)}: no se incluye en el pedido. Podés quitarla.`
                    )}
                  </div>
                ) : plazo?.ready ? (
                  // Pieza ya tejida: no le aplica ni la cola ni el "se teje al
                  // encargar" (mismo criterio que la ficha).
                  <div style={{ marginTop: 2, fontFamily: dahila.fontSans, fontSize: 11, fontWeight: 500, color: dahila.wine600 }}>
                    {plazo.text}
                  </div>
                ) : plazo && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 2,
                    // ink500 y no el gris viejo, que daba 3,7:1 sobre blanco (VIS-20).
                    fontFamily: 'var(--font-sans)', fontSize: 11, color: dahila.ink500,
                  }}>
                    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M8 4.5V8l2.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    {plazo.text}
                  </div>
                )}
              </div>

              <div className="cart-row-controls" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {!issue && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 2,
                  border: `1px solid ${dahila.borderStrong}`, borderRadius: 999, padding: '0 2px'
                }}>
                  <button
                    onClick={() => updateQty(item.id, item.qty - 1)}
                    aria-label="Restar uno"
                    disabled={item.qty <= 1}
                    style={{
                      background: 'transparent', border: 'none', padding: 0,
                      cursor: item.qty <= 1 ? 'default' : 'pointer',
                      color: item.qty <= 1 ? dahila.ink300 : dahila.ink900,
                      // 44px: mínimo de touch target táctil (WCAG/Apple/Google) — antes 30px.
                      width: 44, height: 44, minWidth: 44, minHeight: 44,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  ><Icon name="minus" size={12} /></button>
                  <span style={{ fontFamily: dahila.fontSans, fontSize: 14, minWidth: 16, textAlign: 'center' }}>{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    aria-label="Sumar uno"
                    disabled={item.qty >= 20}
                    title={item.qty >= 20 ? 'Máximo 20 por pedido — escribinos por WhatsApp si necesitás más' : undefined}
                    style={{
                      background: 'transparent', border: 'none', padding: 0,
                      cursor: item.qty >= 20 ? 'default' : 'pointer',
                      color: item.qty >= 20 ? dahila.ink300 : dahila.ink900,
                      width: 44, height: 44, minWidth: 44, minHeight: 44,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  ><Icon name="plus" size={12} /></button>
                </div>
                )}

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
          Un solo toque cuando no hay variante que elegir; si la hay, lleva a
          la ficha para elegirla (addonAction, la misma regla que el cajón). */}
      {addonSuggestions.length > 0 && (
        <section aria-label="Piezas chicas para sumar" style={{ marginTop: 22 }}>
          <p style={{
            fontFamily: dahila.fontSans, fontSize: 11, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: dahila.ink500, margin: '0 0 12px',
          }}>
            Sumale un detalle · viaja en el mismo envío
          </p>
          <div className="cart-addons" style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {addonSuggestions.map((p) => {
              const photo = getPrimaryPhoto(p)
              const action = addonAction(p, discounts)
              const justAdded = addedAddonId === p.id
              return (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <Link href={`/tienda/${p.slug}`} aria-label={`Ver ${p.name}`} style={{
                    position: 'relative', width: 44, height: 54, flexShrink: 0,
                    borderRadius: 6, overflow: 'hidden', background: dahila.cream50, display: 'block',
                  }}>
                    <ImagenConRespaldo slug={p.slug} src={photo} alt={getPrimaryPhotoAlt(p)} fill sizes="44px" placeholder="blur" blurDataURL={BLUR_DATA_URL} style={{ objectFit: 'cover' }} />
                  </Link>
                  <div style={{ minWidth: 0 }}>
                    <Link href={`/tienda/${p.slug}`} style={{
                      fontFamily: dahila.fontDisplay, fontSize: 14, color: dahila.ink900,
                      textDecoration: 'none', display: 'block', lineHeight: 1.2, padding: '4px 0',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150,
                    }}>
                      {p.name}
                    </Link>
                    {action.kind === 'one-tap' ? (
                      <button
                        onClick={() => handleAddonAdd(p, action.size)}
                        disabled={justAdded}
                        aria-label={`Agregar ${p.name} al carrito por ${formatPrice(getFinalPrice(p, action.size, discounts))}`}
                        style={{
                          background: 'transparent', border: 'none', padding: '5px 0', cursor: justAdded ? 'default' : 'pointer',
                          fontFamily: dahila.fontSans, fontSize: 12,
                          color: justAdded ? '#1E8449' : dahila.wine600,
                          textDecoration: justAdded ? 'none' : 'underline', textUnderlineOffset: 3,
                        }}
                      >
                        {justAdded ? '✓ Sumado' : `+ Agregar · ${formatPrice(getFinalPrice(p, action.size, discounts))}`}
                      </button>
                    ) : (
                      <Link href={`/tienda/${p.slug}`} style={{
                        fontFamily: dahila.fontSans, fontSize: 12, color: dahila.wine600,
                        textDecoration: 'underline', textUnderlineOffset: 3, display: 'inline-block', padding: '5px 0',
                      }}>
                        {`Elegir · ${action.from ? 'desde ' : ''}${formatPrice(action.desde)}`}
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

        {todoNoDisponible ? (
          <>
            <p style={{ margin: 0, fontFamily: dahila.fontSans, fontSize: 13.5, color: dahila.ink700, lineHeight: 1.55 }}>
              {unavailableItems.length === 1
                ? 'La pieza de tu carrito ya no está disponible.'
                : 'Las piezas de tu carrito ya no están disponibles.'}{' '}
              Podés preguntarle a Anush si se puede volver a tejer.
            </p>
            <a
              href={volverATejer}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('whatsapp_click', { source: 'carrito_volver_a_tejer' })}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                ...ctaGreen, borderRadius: 12, padding: '16px 22px', minHeight: 52, textDecoration: 'none',
                fontFamily: dahila.fontSans, fontSize: 13.5, fontWeight: 500, letterSpacing: '0.04em',
                textTransform: 'uppercase', textAlign: 'center', width: '100%', boxSizing: 'border-box',
              }}
            >
              <Icon name="whatsapp-logo" weight="fill" size={20} color="#fff" />
              Preguntar si se puede volver a tejer
            </a>
            <Link href="/tienda?ya=1" style={{
              alignSelf: 'center', minHeight: 44, display: 'inline-flex', alignItems: 'center',
              fontFamily: dahila.fontSans, fontSize: 13, color: dahila.ink700, textDecoration: 'underline', textUnderlineOffset: 3,
            }}>
              Ver piezas en stock
            </Link>
          </>
        ) : (
        <>
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
            </div>
          )}
          {/* Fuera del formulario: el aviso de que el cupón dejó de valer al
              pedir llega con el formulario cerrado, y adentro no se veía. */}
          {!coupon && couponError && (
            <span role="alert" style={{ fontFamily: dahila.fontSans, fontSize: 12, color: '#7a1e2f', maxWidth: 300 }}>
              {couponError}
            </span>
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
              ✓ Envío gratis: tu pedido supera los {formatPrice(freeShippingThreshold)}
            </span>
          ) : missingForFree > 0 ? (
            <span style={{ fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink700 }}>
              Te faltan {formatPrice(missingForFree)} para el envío gratis.{' '}
              {shippingHasCost ? `Envío: ${shipping}.` : 'El envío lo coordinamos por WhatsApp según tu zona.'}
            </span>
          ) : (
            <span style={{ fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink700 }}>
              {/* El envío se coordina por WhatsApp según la zona (04/11/2026):
                  "Se suma al total" afirmaba algo que no siempre es así. */}
              {shippingHasCost
                ? `Envío: ${shipping}. Lo coordinamos por WhatsApp.`
                : 'El envío lo coordinamos por WhatsApp según tu zona.'}
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
              Es un regalo: agregar nota
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

        {/* Mismo contenido que un pedido de las últimas 24 h (otra visita o
            el cajón): que no lo mande dos veces sin querer (CRO-10). */}
        {yaEnviadoHace && (
          <p style={{ margin: 0, fontFamily: dahila.fontSans, fontSize: 12.5, color: dahila.ink700, lineHeight: 1.5 }}>
            Ya mandaste este pedido hace {yaEnviadoHace}. Si ya hablaste con Anush, no hace falta mandarlo otra vez.
          </p>
        )}

        <button
          onClick={checkout}
          disabled={checkingOut}
          aria-label={`Coordinar pedido por WhatsApp con ${whatsappLabel}`}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            ...(sentOrder ? ctaSecondary : ctaGreen),
            borderRadius: 12,
            padding: '16px 28px',
            fontFamily: dahila.fontSans,
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            cursor: checkingOut ? 'default' : 'pointer',
            opacity: checkingOut ? 0.7 : 1,
            width: '100%',
            boxShadow: sentOrder ? 'none' : '0 8px 22px -10px rgba(30,132,73,0.6)',
            transition: 'transform 160ms cubic-bezier(0.22,0.61,0.36,1), box-shadow 160ms',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)'
            if (!sentOrder) e.currentTarget.style.boxShadow = '0 12px 28px -10px rgba(30,132,73,0.7)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            if (!sentOrder) e.currentTarget.style.boxShadow = '0 8px 22px -10px rgba(30,132,73,0.6)'
          }}
        >
          <Icon name="whatsapp-logo" weight="fill" size={20} color={sentOrder ? dahila.whatsapp : '#fff'} />
          {checkingOut ? 'Abriendo WhatsApp…' : sentOrder ? 'Abrir WhatsApp de nuevo' : 'Pedir por WhatsApp'}
        </button>

        {/* Qué pasa al tocar el botón, dicho antes de tocarlo (12/09/2026):
            nada en la pantalla aclaraba que escribir por WhatsApp no obliga a
            pagar, que es la duda típica antes de hablarle a una persona. */}
        {/* (12/09/2026, auditoría) Sin "juntas": quien compra puede ser
            cualquiera, o estar comprando un regalo. ink700 en vez de ink500:
            es la frase que baja el miedo a escribir, tiene que leerse bien. */}
        <p style={{
          margin: 0, textAlign: 'center',
          fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink700, lineHeight: 1.5,
        }}>
          No pagás nada ahora: se abre WhatsApp con tu pedido ya escrito y coordinamos {sinTalles ? 'envío y pago' : 'talle, envío y pago'}.
        </p>

        {/* Después del clic: el pedido con su código, y una salida visible por
            si WhatsApp no se abrió (el navegador de Instagram a veces se queda
            en la web de wa.me, y en una compu sin WhatsApp no pasa nada). Solo
            aparece después de tocar el botón y no adivina el navegador. En el
            celular se fija arriba de la barra de abajo (.cart-fallback). */}
        {avisoVisible && sentOrder && (
          <PedidoEnviado
            sentOrder={sentOrder}
            copied={copied}
            onCopy={copyOrder}
            onVaciar={vaciar}
            onClose={() => setAvisoCerrado(sentOrder.code)}
            whatsappLabel={whatsappLabel}
            desde="carrito"
          />
        )}
        </>
        )}

        {/* Lista de espera — la expectativa de plazo se fija acá, pegada al
            botón: nadie descubre en WhatsApp que su pedido empieza en un mes.
            Solo si hay algo que espera entre lo que se pide: con todo en stock
            (o con una agotada que no entra al pedido), el aviso contradecía el
            "En stock: sale sin la espera" de cada prenda justo arriba del botón
            (drop Sunset '26, 04/11/2026). */}
        {queueNote && buyable.some((i) => !isReadyToShip(i.product)) && (
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

        {/* Qué pasa después de escribir — la duda #1 antes de un checkout por
            chat. El paso "se abre WhatsApp, no pagás nada" ya lo dice la frase
            de arriba del botón; repetido acá era la misma línea dos veces. */}
        <ol className="cart-steps" style={{
          listStyle: 'none', margin: 0, padding: 0,
          display: 'flex', flexDirection: 'column', gap: 5,
          fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink500, lineHeight: 1.5,
        }}>
          <li>1 · {todoEnStock ? 'Anush te confirma y te pasa el envío a tu zona.' : 'Anush te confirma disponibilidad y fecha estimada.'}</li>
          <li>2 · Elegís cómo pagar (transferencia o Mercado Pago) y cómo recibirlo.</li>
          <li style={{ marginTop: 4 }}>
            <Link href="/info" style={{ color: dahila.ink500 }}>¿Dudas? Mirá envíos, pagos y cuidados →</Link>
          </li>
        </ol>
        {buyable.length > 0 && (
          <button
            type="button"
            onClick={compartirCarrito}
            style={{
              alignSelf: 'flex-start', background: 'transparent', border: 'none', cursor: 'pointer',
              padding: 0, minHeight: 44, marginTop: -8, display: 'inline-flex', alignItems: 'center', gap: 6,
              fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink500,
              textDecoration: 'underline', textUnderlineOffset: 3,
            }}
          >
            <Icon name="share-network" size={14} color={dahila.ink500} />
            Mandar o guardar mi carrito
          </button>
        )}
      </aside>
      </div>{/* /cart-layout */}

      {/* Barra fija mobile: total + CTA siempre a un toque (mismo patrón que
          la pdp-sticky-bar). En desktop no existe — el resumen sticky cumple. */}
      <div className="cart-sticky-bar">
        {todoNoDisponible ? (
          <a
            href={volverATejer}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('whatsapp_click', { source: 'carrito_volver_a_tejer' })}
            style={{
              flex: 1,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              ...ctaGreen, borderRadius: 10, padding: '14px 18px', textDecoration: 'none',
              fontFamily: dahila.fontSans, fontSize: 12.5, fontWeight: 500,
              letterSpacing: '0.04em', textTransform: 'uppercase', textAlign: 'center',
            }}
          >
            <Icon name="whatsapp-logo" weight="fill" size={18} color="#fff" />
            Preguntar si se puede volver a tejer
          </a>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15, minWidth: 0 }}>
              <span style={{ fontFamily: dahila.fontSans, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: dahila.ink500 }}>
                Total
              </span>
              <span style={{ fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 20, color: dahila.ink900 }}>
                {formatPrice(total)}
              </span>
              {/* La duda que frena el botón, pegada al botón: el "no pagás nada
                  ahora" del resumen queda ~2 pantallas más abajo en el celular. */}
              <span style={{ fontFamily: dahila.fontSans, fontSize: 11, color: dahila.ink500, marginTop: 2 }}>
                sin pagar ahora
              </span>
            </div>
            <button
              onClick={checkout}
              disabled={checkingOut}
              aria-label={`Coordinar pedido por WhatsApp con ${whatsappLabel}`}
              style={{
                flex: 1, marginLeft: 16,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                ...(sentOrder ? ctaSecondary : ctaGreen),
                borderRadius: 10, padding: '14px 18px', cursor: checkingOut ? 'default' : 'pointer',
                opacity: checkingOut ? 0.7 : 1,
                fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 500,
                letterSpacing: '0.05em', textTransform: 'uppercase',
              }}
            >
              <Icon name="whatsapp-logo" weight="fill" size={18} color={sentOrder ? dahila.whatsapp : '#fff'} />
              {checkingOut ? '...' : sentOrder ? 'Abrir de nuevo' : 'Pedir por WhatsApp'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
