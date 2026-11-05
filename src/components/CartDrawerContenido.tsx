'use client'

import { useState, useMemo, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ImagenConRespaldo } from '@/components/ui/ImagenConRespaldo'
import { useCart } from './CartProvider'
import { dahila, Icon } from './ui/Primitives'
import { PriceBlock } from './ui/PriceBlock'
import type { Product } from '@/lib/types'
import {
  getPrimaryPhoto, getEffectivePrice, getFinalPrice, formatPrice, BLUR_DATA_URL,
  getPrimaryPhotoAlt, isUnicoLabel, isReadyToShip, variantLabel,
} from '@/lib/types'
import { pickAddonSuggestions, addonAction } from '@/lib/addons'
import { cartItemIssue, motivoNoDisponible, plazoLinea } from '@/lib/cart-summary'
import { salidaSinPedido } from '@/lib/carrito-salida'
import { couponMemory } from '@/lib/coupon-memory'
import { useWhatsAppCheckout } from '@/components/checkout/useWhatsAppCheckout'
import { PedidoEnviado } from '@/components/checkout/PedidoEnviado'
import { track } from '@/lib/analytics'

const noSubscribe = () => () => {}

/**
 * Lo de adentro del cajón del carrito: las piezas, "Sumale un detalle" y el
 * pie con el pedido. El panel, el título y el cerrar viven en CartDrawer (en
 * el layout); esto baja aparte, recién cuando hace falta (cart-drawer-carga).
 *
 * Desde 04/11/2026 (CRO-01) se puede pedir desde acá: Agregar → Pedir por
 * WhatsApp, con el mismo mensaje y el mismo registro que /carrito. Cuenta solo
 * lo que se puede pedir (QA-01): lo agotado queda en gris y sin precio.
 */
export function CartDrawerContenido() {
  const {
    items, buyableItems: buyable, unavailableItems, cartTotal, discounts, addonCandidates,
    shippingEstimate, freeShippingThreshold, queueNote, whatsappUrl,
    closeDrawer, updateQty, removeFromCart, addToCart, clearCart,
  } = useCart()
  const router = useRouter()

  const visibleItems = useMemo(() => items.filter((i) => !!i.product), [items])

  // "Sumale un detalle": el mismo pool que /carrito (addonCandidates, que salen
  // del catálogo cacheado del layout: el cajón no hace consultas propias,
  // auditoría 03/09/2026) y la misma regla. Si todo lo que se pide ya está
  // tejido, solo piezas en stock: un encargo de 2–3 semanas haría esperar un
  // pedido que sale ya (CRO-11).
  const soloEnStock = buyable.length > 0 && buyable.every((i) => isReadyToShip(i.product))
  const [addedId, setAddedId] = useState<string | null>(null)
  const addonSuggestions = useMemo(
    () => pickAddonSuggestions(addonCandidates, items, discounts, { soloEnStock }),
    [addonCandidates, items, discounts, soloEnStock]
  )

  const handleAddonAdd = async (p: Product, size: string) => {
    const ok = await addToCart(p, size, 1, { openDrawer: false, source: 'cajon_addon' })
    if (!ok) return
    setAddedId(p.id)
    track('cart_addon_add', { product: p.slug })
    setTimeout(() => setAddedId(null), 2000)
  }

  // Pedir desde el cajón (CRO-01 corregido). Va directo solo si no hay nada que
  // resolver en /carrito: un cupón recordado (el canje se valida allá) o el
  // aviso de cola con alguna pieza a pedido (la expectativa de plazo se fija
  // allá, pegada al botón). Si no, queda "Ver carrito y pedir".
  const cuponRecordado = useSyncExternalStore(noSubscribe, couponMemory.read, () => null)
  const colaConEncargo = !!queueNote && buyable.some((i) => !isReadyToShip(i.product))
  const pedirDesdeCajon = buyable.length > 0 && !cuponRecordado && !colaConEncargo
  const todoNoDisponible = buyable.length === 0 && unavailableItems.length > 0
  const overThreshold = freeShippingThreshold > 0 && cartTotal >= freeShippingThreshold
  const { checkout, checkingOut, sentOrder, recienEnviado, clearSent, copyOrder, copied, yaEnviadoHace } = useWhatsAppCheckout({
    buyable, discounts, subtotal: cartTotal, total: cartTotal, couponDiscount: 0, freeShipping: false,
    overThreshold, freeShippingThreshold, coupon: null, giftNote: '', whatsappUrl, desde: 'cajon',
  })
  // "Cerrar" del aviso solo lo esconde: el botón sigue reabriendo el pedido.
  const [avisoCerrado, setAvisoCerrado] = useState<string | null>(null)
  const avisoVisible = !!recienEnviado && avisoCerrado !== recienEnviado.code
  const vaciar = async () => {
    if (await clearCart()) clearSent()
  }
  // Sin nada para pedir, la salida depende del motivo (NEG-2).
  const salida = todoNoDisponible ? salidaSinPedido(unavailableItems, whatsappUrl) : null

  return (
    <>
      {/* Body */}
      {visibleItems.length === 0 ? (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 14, padding: 24, textAlign: 'center',
        }}>
          <span style={{ color: dahila.ink300 }}><Icon name="shopping-bag" size={40} /></span>
          <p style={{ fontFamily: dahila.fontSans, fontSize: 14, color: dahila.ink700, margin: 0 }}>
            Tu carrito está vacío.
          </p>
          <button
            onClick={() => { closeDrawer(); router.push('/tienda') }}
            style={{
              marginTop: 4, background: dahila.ink900, color: '#fff', border: 'none',
              borderRadius: 10, padding: '12px 22px', cursor: 'pointer',
              fontFamily: dahila.fontSans, fontSize: 12, letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Ver la tienda
          </button>
        </div>
      ) : (
        <>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px' }}>
            {visibleItems.map((item) => {
              const photo = getPrimaryPhoto(item.product)
              const issue = cartItemIssue(item)
              // "Modelo: Lisas" cuando las variantes no son talles (VIS-M4).
              const talle = isUnicoLabel(item.size) ? 'Talle único' : `${variantLabel(item.product.sizes)}: ${item.size}`
              if (issue) {
                // No se puede pedir: en gris, sin precio ni +/−, y solo
                // "Quitar". Si lo que cambió es el talle y la prenda sigue a
                // la venta, la salida es elegirlo de nuevo en la ficha.
                return (
                  <div key={item.id} style={{
                    display: 'flex', gap: 14, padding: '16px 0',
                    borderBottom: `1px solid ${dahila.border}`,
                  }}>
                    <div style={{
                      position: 'relative', width: 64, height: 78, flexShrink: 0,
                      borderRadius: 8, overflow: 'hidden', background: dahila.cream50, opacity: 0.55,
                    }}>
                      <ImagenConRespaldo slug={item.product.slug} src={photo} alt={item.product.name} fill sizes="64px" placeholder="blur" blurDataURL={BLUR_DATA_URL} style={{ objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ fontFamily: dahila.fontDisplay, fontSize: 15, color: dahila.ink500, lineHeight: 1.2 }}>
                        {item.product.name}
                      </div>
                      <div style={{ fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink500 }}>{talle}</div>
                      {issue === 'talle-inexistente' ? (
                        <Link
                          href={`/tienda/${item.product.slug}`}
                          onClick={closeDrawer}
                          style={{ fontFamily: dahila.fontSans, fontSize: 12, color: dahila.wine600, textDecoration: 'underline', textUnderlineOffset: 3, padding: '2px 0' }}
                        >
                          Ese {variantLabel(item.product.sizes) === 'Modelo' ? 'modelo' : 'talle'} cambió: elegilo de nuevo
                        </Link>
                      ) : (
                        // El mismo motivo que /carrito (NEG-2): "Se agotó",
                        // "Ahora se teje solo a medida", "Todavía no está a la venta".
                        <div style={{ fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink700 }}>
                          {motivoNoDisponible(issue, item.product)}: no se incluye en el pedido
                        </div>
                      )}
                      <button onClick={() => removeFromCart(item.id)} aria-label={`Quitar ${item.product.name}`} style={{
                        background: 'transparent', border: 'none', cursor: 'pointer', alignSelf: 'flex-start',
                        fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink500,
                        textDecoration: 'underline', padding: 0, minHeight: 44,
                      }}>Quitar</button>
                    </div>
                  </div>
                )
              }
              const list = getEffectivePrice(item.product, item.size)
              const price = getFinalPrice(item.product, item.size, discounts)
              const plazo = plazoLinea(item.product, queueNote)
              return (
                <div key={item.id} style={{
                  display: 'flex', gap: 14, padding: '16px 0',
                  borderBottom: `1px solid ${dahila.border}`,
                }}>
                  <button
                    onClick={() => { closeDrawer(); router.push(`/tienda/${item.product.slug}`) }}
                    aria-label={`Ver ${item.product.name}`}
                    style={{
                      position: 'relative', width: 64, height: 78, flexShrink: 0,
                      borderRadius: 8, overflow: 'hidden', background: dahila.cream50,
                      border: 'none', padding: 0, cursor: 'pointer',
                    }}
                  >
                    <ImagenConRespaldo slug={item.product.slug} src={photo} alt={item.product.name} fill sizes="64px" placeholder="blur" blurDataURL={BLUR_DATA_URL} style={{ objectFit: 'cover' }} />
                  </button>

                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ fontFamily: dahila.fontDisplay, fontSize: 15, color: dahila.ink900, lineHeight: 1.2 }}>
                      {item.product.name}
                    </div>
                    <div style={{ fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink500 }}>{talle}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <PriceBlock list={list} final={price} size="sm" />
                    </div>
                    {plazo && (
                      <div style={{ fontFamily: dahila.fontSans, fontSize: 11, fontWeight: plazo.ready ? 500 : 400, color: plazo.ready ? dahila.wine600 : dahila.ink500 }}>
                        {plazo.text}
                      </div>
                    )}

                    {/* Qty + remove */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 2, border: `1px solid ${dahila.borderStrong}`, borderRadius: 999, padding: '0 2px' }}>
                        <button
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          aria-label="Restar uno"
                          disabled={item.qty <= 1}
                          style={{ ...qtyBtn, cursor: item.qty <= 1 ? 'default' : 'pointer', color: item.qty <= 1 ? dahila.ink300 : dahila.ink900 }}
                        ><Icon name="minus" size={12} /></button>
                        <span style={{ fontFamily: dahila.fontSans, fontSize: 13, minWidth: 16, textAlign: 'center' }}>{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          aria-label="Sumar uno"
                          disabled={item.qty >= 20}
                          title={item.qty >= 20 ? 'Máximo 20 por pedido — escribinos por WhatsApp si necesitás más' : undefined}
                          style={{ ...qtyBtn, cursor: item.qty >= 20 ? 'default' : 'pointer', color: item.qty >= 20 ? dahila.ink300 : dahila.ink900 }}
                        ><Icon name="plus" size={12} /></button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} aria-label={`Quitar ${item.product.name}`} style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink500,
                        textDecoration: 'underline', padding: 0,
                      }}>Quitar</button>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* "Sumale un detalle" — mismo cross-sell de /carrito, ahora
                también en el momento de mayor intención de compra. Vive
                dentro del scroll, nunca empuja el botón de WhatsApp. Un solo
                toque solo si no hay nada que elegir; si la pieza tiene
                variantes, lleva a la ficha (QA-06). Sin nada para pedir no
                hay envío con el que viajar (NEG-2). */}
            {addonSuggestions.length > 0 && !todoNoDisponible && (
              <section aria-label="Sumale un detalle" style={{ padding: '16px 0 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <span aria-hidden="true" style={{
                  fontFamily: dahila.fontSans, fontSize: 11, letterSpacing: '0.22em',
                  textTransform: 'uppercase', color: dahila.ink500,
                }}>
                  Sumale un detalle
                </span>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {addonSuggestions.map((p) => {
                    const photo = getPrimaryPhoto(p)
                    const action = addonAction(p, discounts)
                    const justAdded = addedId === p.id
                    return (
                      <li key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Link
                          href={`/tienda/${p.slug}`}
                          onClick={closeDrawer}
                          aria-label={`Ver ${p.name}`}
                          style={{
                            position: 'relative', width: 44, height: 54, flexShrink: 0,
                            borderRadius: 8, overflow: 'hidden', background: dahila.cream50, display: 'block',
                          }}
                        >
                          <ImagenConRespaldo slug={p.slug} src={photo} alt={getPrimaryPhotoAlt(p)} fill sizes="44px" placeholder="blur" blurDataURL={BLUR_DATA_URL} style={{ objectFit: 'cover' }} />
                        </Link>
                        <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Link
                            href={`/tienda/${p.slug}`}
                            onClick={closeDrawer}
                            style={{
                              fontFamily: dahila.fontDisplay, fontSize: 13.5, color: dahila.ink900, lineHeight: 1.25, padding: '4px 0',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'none',
                            }}
                          >{p.name}</Link>
                          {action.kind === 'one-tap' ? (
                            <button
                              onClick={() => handleAddonAdd(p, action.size)}
                              disabled={justAdded}
                              aria-label={`Agregar ${p.name} al carrito por ${formatPrice(getFinalPrice(p, action.size, discounts))}`}
                              style={{
                                background: 'transparent', border: 'none', padding: '5px 0',
                                cursor: justAdded ? 'default' : 'pointer', alignSelf: 'flex-start',
                                fontFamily: dahila.fontSans, fontSize: 12,
                                color: justAdded ? '#1E8449' : dahila.wine600,
                                textDecoration: justAdded ? 'none' : 'underline', textUnderlineOffset: 3,
                              }}
                            >
                              {justAdded ? '✓ Sumado' : `+ Agregar · ${formatPrice(getFinalPrice(p, action.size, discounts))}`}
                            </button>
                          ) : (
                            // Un <a> no entra en la regla táctil de 44 px de
                            // globals.css (solo botones): medía 28 px (RSAM-6).
                            <Link
                              href={`/tienda/${p.slug}`}
                              onClick={closeDrawer}
                              style={{
                                alignSelf: 'flex-start', minHeight: 44, display: 'inline-flex', alignItems: 'center',
                                fontFamily: dahila.fontSans, fontSize: 12, color: dahila.wine600,
                                textDecoration: 'underline', textUnderlineOffset: 3,
                              }}
                            >
                              {`Elegir · ${action.from ? 'desde ' : ''}${formatPrice(action.desde)}`}
                            </Link>
                          )}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )}
          </div>

          {/* Footer / checkout */}
          <div style={{
            padding: '16px 20px calc(env(safe-area-inset-bottom, 0px) + 16px)',
            borderTop: `1px solid ${dahila.border}`,
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            {salida ? (
              // Nada que pedir: ni "Subtotal UYU 0" ni "Te faltan…" (QA-05).
              // La salida va según el motivo (NEG-2): elegir el talle de nuevo,
              // pedirla a medida, la lista privada o preguntar si se puede
              // volver a tejer.
              <>
                <p style={{ fontFamily: dahila.fontSans, fontSize: 12.5, color: dahila.ink700, margin: 0, lineHeight: 1.5 }}>
                  {salida.texto}
                </p>
                {salida.externo ? (
                  <a
                    href={salida.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track('whatsapp_click', { source: 'cajon_volver_a_tejer' })}
                    style={{ ...ctaBtn, background: dahila.whatsapp, color: '#fff', textDecoration: 'none' }}
                  >
                    <Icon name="whatsapp-logo" weight="fill" size={18} color="#fff" />
                    {salida.label}
                  </a>
                ) : (
                  <Link href={salida.href} onClick={closeDrawer} style={{ ...ctaBtn, background: dahila.ink900, color: '#fff', textDecoration: 'none' }}>
                    {salida.label}
                  </Link>
                )}
                <Link href="/tienda?ya=1" onClick={closeDrawer} style={secondaryLink}>
                  Ver piezas en stock
                </Link>
              </>
            ) : (
              <>
                {/* "Subtotal" y no "Total": el cupón vive en /carrito, y con
                    cupón los dos números serían distintos. */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: dahila.fontSans, fontSize: 13, color: dahila.ink700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Subtotal</span>
                  <span style={{ fontFamily: dahila.fontDisplay, fontSize: 22, color: dahila.ink900 }}>{formatPrice(cartTotal)}</span>
                </div>
                {shippingEstimate.trim() && (
                  <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink700, margin: 0 }}>
                    <Icon name="truck" size={14} color={dahila.ink500} /> {shippingEstimate}
                  </p>
                )}
                {/* Umbral de envío gratis — un renglón honesto, sin barras ni
                    apuro. Sobre lo pedible: lo agotado no acerca el envío
                    gratis. Con un cupón recordado no se afirma nada (COR-01):
                    /carrito calcula el umbral sobre el total con el cupón, y el
                    cajón prometía un envío gratis que allá faltaba. */}
                {freeShippingThreshold > 0 && (
                  cuponRecordado ? (
                    <p style={{ fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink500, margin: 0 }}>
                      Con tu cupón, el total y el envío se calculan en el carrito.
                    </p>
                  ) : overThreshold ? (
                    <p style={{ fontFamily: dahila.fontSans, fontSize: 12, color: '#1E8449', margin: 0 }}>
                      ✓ Envío gratis — tu pedido supera los {formatPrice(freeShippingThreshold)}
                    </p>
                  ) : (
                    <p style={{ fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink500, margin: 0 }}>
                      Te faltan {formatPrice(freeShippingThreshold - cartTotal)} para el envío gratis
                    </p>
                  )
                )}
                {pedirDesdeCajon ? (
                  <>
                    {avisoVisible && recienEnviado && (
                      <PedidoEnviado
                        sentOrder={recienEnviado}
                        copied={copied}
                        onCopy={copyOrder}
                        onClose={() => setAvisoCerrado(recienEnviado.code)}
                        fijo={false}
                      />
                    )}
                    {/* El sitio sabe que el pedido se armó, no si se mandó (NEG-6). */}
                    {yaEnviadoHace && (
                      <p style={{ fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink700, margin: 0, lineHeight: 1.5 }}>
                        Ya armaste este pedido hace {yaEnviadoHace}. Si no llegaste a mandárselo a Anush, tocá el botón.
                      </p>
                    )}
                    {/* Sin el aria-label "Coordinar pedido por WhatsApp…" del
                        botón de /carrito a propósito: las pruebas lo buscan
                        con :visible, y el cajón cerrado cuenta como visible.
                        Ocupado = aria-disabled y no disabled (RSAM-4): un
                        botón enfocado que pasa a disabled manda el foco al
                        body, fuera del cajón. La traba del doble toque está en
                        useWhatsAppCheckout. */}
                    <button
                      type="button"
                      onClick={checkout}
                      aria-disabled={checkingOut || undefined}
                      aria-busy={checkingOut}
                      style={{
                        ...ctaBtn,
                        ...(sentOrder
                          ? { background: '#fff', color: dahila.whatsapp, border: `1px solid ${dahila.whatsapp}` }
                          : { background: dahila.whatsapp, color: '#fff', border: 'none' }),
                        cursor: checkingOut ? 'default' : 'pointer',
                        opacity: checkingOut ? 0.7 : 1,
                      }}
                    >
                      <Icon name="whatsapp-logo" weight="fill" size={18} color={sentOrder ? dahila.whatsapp : '#fff'} />
                      {checkingOut ? 'Abriendo WhatsApp…' : sentOrder ? 'Abrir WhatsApp de nuevo' : 'Pedir por WhatsApp'}
                    </button>
                    {!sentOrder && (
                      <p style={{ fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink700, margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
                        No pagás nada ahora: se abre WhatsApp con tu pedido escrito.
                      </p>
                    )}
                    {/* Con el aviso a la vista, vaciar va acá abajo en lugar
                        del link a /carrito: así el pie no crece y las prendas
                        siguen a la vista en un celular chico (NEG-3). */}
                    {avisoVisible ? (
                      <button type="button" onClick={vaciar} style={{ ...secondaryLink, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}>
                        Vaciar el carrito
                      </button>
                    ) : (
                      <Link href="/carrito" onClick={closeDrawer} style={secondaryLink}>
                        Ver carrito (cupón o nota de regalo)
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <p style={{ fontFamily: dahila.fontSans, fontSize: 11, color: dahila.ink500, margin: 0 }}>
                      Coordinás envío y pago con Anush por WhatsApp.
                    </p>
                    <button
                      onClick={() => { closeDrawer(); router.push('/carrito') }}
                      style={{
                        background: dahila.ink900, color: '#fff', border: 'none',
                        borderRadius: 12, padding: '15px', cursor: 'pointer',
                        fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 500,
                        letterSpacing: '0.06em', textTransform: 'uppercase',
                      }}
                    >
                      Ver carrito y pedir
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </>
      )}
    </>
  )
}

// 44px: mínimo de touch target táctil (WCAG/Apple/Google) — antes 30px,
// demasiado chico para tocar con precisión en el drawer del carrito.
const qtyBtn: React.CSSProperties = {
  background: 'transparent', border: 'none', cursor: 'pointer', color: dahila.ink900,
  padding: 0, width: 44, height: 44, minWidth: 44, minHeight: 44,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
}

// El botón verde de WhatsApp, del mismo alto (52 px) que el CTA de la ficha.
const ctaBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
  width: '100%', minHeight: 52, borderRadius: 12, padding: '0 18px',
  fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 500,
  letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'center',
}

const secondaryLink: React.CSSProperties = {
  alignSelf: 'center', minHeight: 44, display: 'inline-flex', alignItems: 'center',
  fontFamily: dahila.fontSans, fontSize: 12.5, color: dahila.ink700,
  textDecoration: 'underline', textUnderlineOffset: 3,
}
