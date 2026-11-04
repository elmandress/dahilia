'use client'

import { useMemo, useRef, useState, useSyncExternalStore } from 'react'
import type { CartItem, Discount, Product } from '@/lib/types'
import { getFinalPrice } from '@/lib/types'
import { buildWhatsAppMessage, cartSignature, orderItemsPayload } from '@/lib/whatsapp-checkout'
import { waLink, WHATSAPP_DEFAULT } from '@/lib/whatsapp'
import { makeOrderCode, ORDER_CODE_RE } from '@/lib/order-tracking'
import { getAttribution } from '@/lib/attribution'
import { track, gaCommerce } from '@/lib/analytics'
import { SITE_URL } from '@/lib/env'

type Buyable = Pick<CartItem, 'size' | 'qty'> & { product: Product }

/** El pedido que se acaba de mandar a WhatsApp (para reabrirlo sin registrar otro). */
export interface SentOrder {
  url: string
  message: string
  /** Firma del contenido (cartSignature): si cambia, es otro pedido. */
  sig: string
  code: string
  at: number
}

// El mismo contenido da el mismo código durante 24 h (CRO-10): si la clienta
// vuelve a pedir lo mismo (otra visita, el cajón y después /carrito), el
// pedido sale con el mismo PED y /api/orders lo reconoce como ya registrado
// (23505) en vez de crear otra fila. Por navegador: no hay choque entre clientas.
const SENT_KEY = 'dahila_pedidos_enviados'
const SENT_TTL_MS = 24 * 60 * 60 * 1000
const SENT_MAX = 10

type SentMap = Record<string, { code: string; at: number }>

function readSent(now: number): SentMap {
  try {
    const raw = localStorage.getItem(SENT_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : null
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    const out: SentMap = {}
    for (const [sig, value] of Object.entries(parsed as Record<string, unknown>)) {
      const e = value as { code?: unknown; at?: unknown } | null
      if (typeof e?.code !== 'string' || !ORDER_CODE_RE.test(e.code) || typeof e.at !== 'number') continue
      if (now - e.at > SENT_TTL_MS) continue
      out[sig] = { code: e.code, at: e.at }
    }
    return out
  } catch {
    return {}
  }
}

function rememberSent(sig: string, code: string, now: number) {
  const map = readSent(now)
  map[sig] = { code, at: now }
  const kept = Object.entries(map).sort((a, b) => b[1].at - a[1].at).slice(0, SENT_MAX)
  try {
    localStorage.setItem(SENT_KEY, JSON.stringify(Object.fromEntries(kept)))
  } catch { /* storage bloqueado: el código no se recuerda, el pedido sale igual */ }
}

/** Cuándo se mandó por última vez este mismo contenido (o null). Solo lee. */
function sentAt(sig: string): number | null {
  try {
    const raw = localStorage.getItem(SENT_KEY)
    const entry = raw ? (JSON.parse(raw) as Record<string, { at?: unknown } | undefined>)[sig] : undefined
    return typeof entry?.at === 'number' ? entry.at : null
  } catch {
    return null
  }
}

/** "un momento", "5 minutos", "2 horas"; null pasadas las 24 h. */
function haceCuanto(at: number): string | null {
  const min = Math.floor((Date.now() - at) / 60_000)
  if (min < 0 || min >= 24 * 60) return null
  if (min < 1) return 'un momento'
  if (min < 60) return min === 1 ? '1 minuto' : `${min} minutos`
  const h = Math.floor(min / 60)
  return h === 1 ? '1 hora' : `${h} horas`
}

const noSubscribe = () => () => {}

/**
 * Abre WhatsApp. Sin 'noopener' en las opciones: con él, window.open devuelve
 * null SIEMPRE (así lo define el estándar HTML), el código lo tomaba por
 * "bloqueado" y además llevaba ESTA pestaña a wa.me: dos pestañas de WhatsApp
 * y el carrito perdido (verificado con Playwright, 13/09/2026). El opener se
 * corta a mano. Si el navegador sí lo bloquea, se navega en esta pestaña:
 * wa.me abre la app igual y la venta no se pierde.
 */
function abrirWhatsApp(url: string, pending: Window | null) {
  if (pending) {
    pending.opener = null
    pending.location.href = url
    return
  }
  const win = window.open(url, '_blank')
  if (win) win.opener = null
  else window.location.assign(url)
}

export interface WhatsAppCheckoutInput {
  /** Solo lo pedible (summarizeCart). */
  buyable: Buyable[]
  discounts: Discount[]
  subtotal: number
  total: number
  couponDiscount: number
  freeShipping: boolean
  overThreshold: boolean
  freeShippingThreshold: number
  coupon: { code: string } | null
  giftNote: string
  whatsappUrl: string
  /** Desde dónde se pidió: order_sent{desde} separa el cajón de /carrito (CRO-01). */
  desde: 'carrito' | 'cajon'
  /** El canje del cupón dio "no": quien llama lo saca y muestra el aviso. */
  onCouponLost?: (msg: string) => void
}

/**
 * El checkout por WhatsApp, uno solo para /carrito y el cajón (CRO-01): la
 * traba del doble toque, la ventana en blanco cuando hay cupón, el registro en
 * /api/orders, el código de pedido estable y la reapertura sin duplicar.
 */
export function useWhatsAppCheckout({
  buyable, discounts, subtotal, total, couponDiscount, freeShipping, overThreshold, freeShippingThreshold,
  coupon, giftNote, whatsappUrl, desde, onCouponLost,
}: WhatsAppCheckoutInput) {
  // Guarda contra doble-submit: un doble tap antes de que responda el canje
  // del cupón podía disparar dos redenciones en carrera y dos filas en el log
  // de /api/orders para el mismo pedido. El estado no alcanza como traba: los
  // dos toques de un doble tap ocurren antes del re-render y leen
  // `checkingOut` todavía en false (2 filas en `orders`, 19/09/2026). El ref
  // cambia en el acto.
  const lock = useRef(false)
  const [checkingOut, setCheckingOut] = useState(false)
  const [last, setLast] = useState<SentOrder | null>(null)
  const [copied, setCopied] = useState(false)

  const note = giftNote.trim()
  const couponCode = coupon?.code ?? null
  const sig = useMemo(() => cartSignature(buyable, couponCode, note), [buyable, couponCode, note])
  // El pedido de esta visita sigue vigente mientras el contenido no cambie.
  const sentOrder = last && last.sig === sig ? last : null

  // ¿Este mismo contenido ya salió antes (otra visita, o desde el cajón)? Se
  // lee en el cliente: en el servidor y al hidratar el carrito está vacío.
  const enviadoAt = useSyncExternalStore(noSubscribe, () => sentAt(sig), () => null)
  // Solo un texto ("hace 2 horas"): se recalcula en cada render a propósito.
  const yaEnviadoHace = !sentOrder && buyable.length > 0 && enviadoAt != null ? haceCuanto(enviadoAt) : null

  const soltar = () => {
    // La traba se suelta un momento después, no al terminar: sin cupón el
    // checkout corre entero de una, y soltarla enseguida dejaba pasar el
    // segundo toque de un doble tap. Mientras tanto el botón dice "Abriendo
    // WhatsApp…".
    window.setTimeout(() => {
      lock.current = false
      setCheckingOut(false)
    }, 1200)
  }

  const checkout = async () => {
    if (typeof window === 'undefined') return
    if (buyable.length === 0) return
    if (lock.current) return
    lock.current = true
    setCheckingOut(true)

    // a) Mismo contenido que el pedido que ya salió: se reabre el mismo link.
    // Ni otro canje del cupón (QA-11: se gastaba y el reintento lo borraba)
    // ni otra fila en /api/orders.
    if (sentOrder) {
      abrirWhatsApp(sentOrder.url, null)
      track('order_reopen', { via: 'boton', desde })
      soltar()
      return
    }

    const redeem = !!coupon && (couponDiscount > 0 || freeShipping)
    // Con cupón hay que esperar el canje (abajo) antes de mandar el pedido, y
    // Safari en el iPhone (y el navegador de Instagram, que usa su mismo motor)
    // bloquea window.open si pasa cerca de 1 s desde el toque (Don't Panic
    // Labs, jul. 2025). Por eso la pestaña se abre ya, en blanco, dentro del
    // toque, y recibe la dirección de WhatsApp cuando el canje contesta.
    const pending = redeem ? window.open('', '_blank') : null
    // c) Registrar el canje ANTES de abrir WhatsApp. Si justo dejó de valer,
    // avisamos y NO abrimos el chat con un total que ya no es válido.
    if (redeem && coupon) {
      try {
        const r = await fetch('/api/coupon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: coupon.code, redeem: true }),
        })
        const res = await r.json()
        if (!res.ok) {
          pending?.close()
          onCouponLost?.('Ese cupón ya no se puede usar en este pedido. El total quedó actualizado: volvé a tocar el botón.')
          lock.current = false
          setCheckingOut(false)
          return
        }
      } catch {
        /* sin red para registrar: no bloqueamos la venta */
      }
    }

    // b) El mismo contenido reusa su código durante 24 h.
    const now = Date.now()
    const code = readSent(now)[sig]?.code ?? makeOrderCode()
    rememberSent(sig, code, now)

    // d) Mensaje y link.
    const message = buildWhatsAppMessage(buyable, discounts, total, {
      siteUrl: SITE_URL,
      giftNote: note,
      coupon: coupon ? { code: coupon.code, discount: couponDiscount, freeShipping } : null,
      freeShippingOver: overThreshold ? freeShippingThreshold : null,
      trackingCode: code,
    })
    const url = waLink(whatsappUrl, message) ?? waLink(WHATSAPP_DEFAULT, message)!

    // e) Registro del pedido — sin esperar la respuesta: no debe demorar ni
    // bloquear la apertura de WhatsApp. Si falla (red, migración no corrida),
    // la venta sigue su curso igual. keepalive: más abajo puede haber un
    // window.location.assign (el camino de iOS Safari, donde window.open queda
    // bloqueado). Sin keepalive el navegador ABORTA este fetch al navegar y el
    // pedido nunca llega a `orders`. El body son unos pocos KB, muy por debajo
    // del tope de 64 KB.
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        items: orderItemsPayload(buyable, discounts),
        subtotal_uyu: subtotal,
        discount_uyu: couponDiscount,
        total_uyu: total,
        tracking_code: code,
        coupon_code: coupon?.code ?? null,
        free_shipping: freeShipping || overThreshold,
        gift_note: note || null,
        attribution: getAttribution(),
      }),
    }).catch(() => {})

    // f) GA4: begin_checkout con productos y total. Es el "pedido" del sitio:
    // el pago se arregla después por WhatsApp. `desde` separa cajón y /carrito.
    const gaItems = buyable.map((i) => ({
      item_id: i.product.slug, item_name: i.product.name, item_variant: i.size,
      quantity: i.qty, price: getFinalPrice(i.product, i.size, discounts),
    }))
    track('order_sent', { items: buyable.length, total, desde }, { name: 'begin_checkout', params: gaCommerce(gaItems, total) })

    // g) El pedido queda a mano para reabrirlo o copiarlo.
    setLast({ url, message, sig, code, at: now })
    setCopied(false)
    abrirWhatsApp(url, pending)

    // h) ¿Se abrió WhatsApp? Si a los 1,5 s la página sigue a la vista, la app
    // no tomó el link (pasa en el navegador de Instagram): se mide para saber
    // cuántas veces la clienta depende del "Abrir de nuevo".
    window.setTimeout(() => {
      if (document.visibilityState === 'visible') {
        track('checkout_fallback_shown', { ig_browser: /Instagram/i.test(navigator.userAgent), desde })
      }
    }, 1500)
    soltar()
  }

  /** Olvida el pedido mandado (después de vaciar el carrito). */
  const clearSent = () => {
    setLast(null)
    setCopied(false)
  }

  // Copia el mismo texto que se mandó a WhatsApp, para pegarlo a mano si la
  // app no se abrió. Los navegadores in-app a veces niegan el portapapeles:
  // ahí se usa el método viejo (textarea + execCommand), como en ShareButton.
  const copyOrder = async () => {
    if (!sentOrder) return
    try {
      await navigator.clipboard.writeText(sentOrder.message)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = sentOrder.message
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      try { document.execCommand('copy') } catch { /* sin portapapeles: no hay más que hacer */ }
      document.body.removeChild(ta)
    }
    setCopied(true)
    track('order_copy', { items: buyable.length, desde })
  }

  return { checkout, checkingOut, sentOrder, clearSent, copyOrder, copied, yaEnviadoHace }
}
