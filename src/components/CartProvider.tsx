'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { CartItem, Product, Discount } from '@/lib/types'
import { getFinalPrice, isUnicoLabel } from '@/lib/types'
import { track, gaCommerce } from '@/lib/analytics'
import { summarizeCart, type CartIssue } from '@/lib/cart-summary'
import { waLink, WHATSAPP_DEFAULT } from '@/lib/whatsapp'
import { getRestockWhatsAppUrl } from '@/lib/product-selection'

type CartItemWithProduct = CartItem & { product: Product }

/** Desde dónde se agregó (add_to_cart{source}, CRO-04): para saber qué botón vende. */
export type AddSource = 'ficha_boton' | 'barra_fija' | 'vista_rapida' | 'tarjeta' | 'look' | 'cajon_addon' | 'carrito_addon'

interface CartContextType {
  items: CartItemWithProduct[]
  /** Lo que se puede pedir (cart-summary): va al total, al globito y al mensaje. */
  buyableItems: CartItemWithProduct[]
  /** Lo que quedó en el carrito pero ya no se puede pedir, con su motivo. */
  unavailableItems: Array<{ item: CartItemWithProduct; issue: CartIssue }>
  /** Unidades pedibles (el globito del header). */
  cartCount: number
  /** Subtotal de lo pedible, con descuentos de prenda y de lote (sin cupón). */
  cartTotal: number
  discounts: Discount[]
  /** Candidatas de "Sumale un detalle": el mismo pool para el cajón y /carrito. */
  addonCandidates: Product[]
  shippingEstimate: string
  /** Umbral de envío gratis en UYU (site_settings.free_shipping_threshold). 0 = apagado. */
  freeShippingThreshold: number
  /** Aviso de lista de espera ("los pedidos nuevos empiezan en agosto"). Vacío = no mostrar. */
  queueNote: string
  /** WhatsApp del sitio (site_settings.contact_whatsapp_url), para los CTAs de
   *  componentes cliente que no reciben settings (vista rápida). */
  whatsappUrl: string
  hasMounted: boolean
  isLoading: boolean
  drawerOpen: boolean
  addError: boolean
  /** `via` llega como texto o como el evento del clic (el header pasa el evento): ahí es 'icono'. */
  openDrawer: (via?: unknown) => void
  closeDrawer: () => void
  refresh: () => Promise<void>
  /** true si la pieza quedó guardada; false si la base no respondió. */
  addToCart: (product: Product, size: string, qty: number, opts?: { openDrawer?: boolean; source?: AddSource }) => Promise<boolean>
  updateQty: (itemId: string, qty: number) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  /** Saca todo, una pieza por vez, y vuelve a leer el carrito. true si se vació. */
  clearCart: () => Promise<boolean>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// Storage key used purely as a cross-tab signal (not a source of truth).
// When tab A mutates the cart it bumps this value, tab B's `storage` listener
// fires and refetches from the server.
const SYNC_KEY = 'dahila_cart_sync'

// Resiliencia: última copia buena del carrito en localStorage. Si Supabase
// (vía /api/cart) está caído, el carrito se hidrata desde acá en modo solo
// lectura — la clienta ve sus piezas y el checkout por WhatsApp (que arma el
// mensaje en el cliente) sigue funcionando. Una caída de la base no debería
// costar una venta que ya estaba decidida.
const SNAPSHOT_KEY = 'dahila_cart_snapshot'

function saveSnapshot(items: CartItemWithProduct[]) {
  try {
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(items))
  } catch {
    // Modo privado / storage lleno: el snapshot es best-effort.
  }
}

function loadSnapshot(): CartItemWithProduct[] {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? (parsed as CartItemWithProduct[]) : []
  } catch {
    return []
  }
}

type CartResponse = { items: CartItemWithProduct[] }

/** Error de /api/cart con el status y el motivo que mandó la ruta (QA-M3). */
class CartError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function jsonOrThrow(res: Response): Promise<CartResponse> {
  if (!res.ok) {
    let detail = ''
    try { detail = (await res.json()).error || '' } catch {}
    throw new CartError(detail || `HTTP ${res.status}`, res.status)
  }
  return res.json()
}

function pingOtherTabs() {
  try {
    localStorage.setItem(SYNC_KEY, String(Date.now()))
  } catch {
    // Private mode or storage disabled — silently ignore.
  }
}

/** El aviso de error, con una salida que sirva para ESE error. */
type Toast = { msg: string; linkText: string; href: string; source: string }

export function CartProvider({
  children,
  initialDiscounts = [],
  shippingEstimate = '',
  freeShippingThreshold = 0,
  queueNote = '',
  whatsappUrl = WHATSAPP_DEFAULT,
  addonCandidates = [],
}: {
  children: React.ReactNode
  initialDiscounts?: Discount[]
  shippingEstimate?: string
  freeShippingThreshold?: number
  queueNote?: string
  whatsappUrl?: string
  addonCandidates?: Product[]
}) {
  const router = useRouter()
  const [items, setItems] = useState<CartItemWithProduct[]>([])
  // Seeded from the server layout so the very first paint already prices with
  // batch/category rules — no flash of an un-discounted total.
  const [discounts] = useState<Discount[]>(initialDiscounts)
  const [isLoading, setIsLoading] = useState(true)
  const [hasMounted, setHasMounted] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  // El aviso de error. Antes era un booleano con el texto fijo de "agregar":
  // updateQty y removeFromCart fallaban en silencio. Desde 04/11/2026 lleva
  // además el link que corresponde: una pieza que se acaba de agotar no es
  // "el carrito no funciona" (QA-M3).
  const [toast, setToast] = useState<Toast | null>(null)
  const addError = toast !== null
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // 6 s y no 3,5: el aviso ofrece pedir por WhatsApp, y hay que darle tiempo
  // a leerlo y tocarlo.
  const showToast = useCallback((t: Toast) => {
    setToast(t)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 6000)
  }, [])
  // Salida genérica: si el carrito no puede guardar (base caída por cuota,
  // 20/09/2026, o sin red), el pedido se toma por WhatsApp igual.
  const showError = useCallback((msg: string) => {
    const text = 'Hola! Quiero hacer un pedido. El carrito de la web no me está funcionando 🧶'
    showToast({
      msg,
      linkText: 'Pedir por WhatsApp',
      href: waLink(whatsappUrl, text) ?? waLink(WHATSAPP_DEFAULT, text)!,
      source: 'carrito_error',
    })
  }, [showToast, whatsappUrl])
  const hasFetchedRef = useRef(false)

  // Orden de las respuestas (QA-04, propuesta corregida). Cada escritura
  // devuelve el carrito entero releído, y en Netlify dos pedidos simultáneos
  // caen en instancias distintas: una respuesta puede llegar después de otra
  // más nueva. Por eso:
  //  - mutationEpoch sube cuando SALE cada escritura: un GET que salió antes y
  //    vuelve después no pisa una prenda recién agregada (volver de Instagram
  //    y tocar Agregar enseguida, con una función fría);
  //  - inflight cuenta las escrituras en vuelo: si vuelve una con otras todavía
  //    en camino, no se aplica (puede no traer los cambios de las otras); se
  //    aplica la última, y si se descartó algo, un GET final deja la pantalla
  //    igual a la base. Nada de un contador global que tire respuestas buenas.
  const mutationEpoch = useRef(0)
  const inflight = useRef(0)
  const needsSync = useRef(false)

  const applyItems = useCallback((next: CartItemWithProduct[]) => {
    setItems(next)
    saveSnapshot(next)
  }, [])

  const fetchCart = useCallback(async () => {
    const epoch = mutationEpoch.current
    try {
      const res = await fetch('/api/cart', { credentials: 'include' })
      const data = await jsonOrThrow(res)
      if (epoch !== mutationEpoch.current || inflight.current > 0) {
        needsSync.current = true
        return
      }
      applyItems(data.items || [])
    } catch (e) {
      console.error('Cart fetch failed', e)
      // Base caída: servir la última copia buena para que el pedido no se
      // pierda (el checkout por WhatsApp no necesita la base para nada). Pero
      // no encima de una escritura más nueva.
      if (epoch === mutationEpoch.current && inflight.current === 0) {
        const snapshot = loadSnapshot()
        if (snapshot.length > 0) setItems(snapshot)
      }
    } finally {
      setIsLoading(false)
      setHasMounted(true)
    }
  }, [applyItems])

  /** Una escritura al carrito, con las guardas de orden de arriba. */
  const mutate = useCallback(async (send: () => Promise<Response>): Promise<CartResponse> => {
    mutationEpoch.current += 1
    inflight.current += 1
    let data: CartResponse | null = null
    try {
      data = await jsonOrThrow(await send())
      return data
    } finally {
      inflight.current -= 1
      if (data) {
        pingOtherTabs()
        if (inflight.current > 0) needsSync.current = true
        else applyItems(data.items || [])
      }
      if (inflight.current === 0 && needsSync.current) {
        needsSync.current = false
        void fetchCart()
      }
    }
  }, [applyItems, fetchCart])

  // Lo pedible, en una sola cuenta para el globito, el cajón, /carrito y el
  // mensaje (QA-01). Antes acá solo se descartaban los ítems sin producto: una
  // prenda agotada o con el talle borrado sumaba al globito y al total del
  // cajón, que prometía envío gratis mientras /carrito decía que faltaba.
  const summary = useMemo(() => summarizeCart(items, discounts), [items, discounts])
  const cartCount = summary.count
  const cartTotal = summary.subtotal

  const openDrawer = useCallback((via?: unknown) => {
    setDrawerOpen(true)
    track('view_cart', { via: typeof via === 'string' ? via : 'icono', items: cartCount })
  }, [cartCount])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  // Initial load — deferred to idle so the first paint of the home page
  // doesn't compete with a request the visitor probably won't use yet.
  useEffect(() => {
    if (hasFetchedRef.current) return

    // La marca se pone al correr, no al programar: en desarrollo (StrictMode)
    // el efecto se monta dos veces, el cleanup cancela el primer pedido y el
    // segundo montaje no lo volvía a programar: /carrito quedaba en "Cargando…".
    const run = () => {
      if (hasFetchedRef.current) return
      hasFetchedRef.current = true
      void fetchCart()
    }
    const ric = (window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
      cancelIdleCallback?: (id: number) => void
    }).requestIdleCallback
    if (typeof ric === 'function') {
      const id = ric(run, { timeout: 2000 })
      return () => {
        const cic = (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback
        if (typeof cic === 'function') cic(id)
      }
    } else {
      const id = setTimeout(run, 400)
      return () => clearTimeout(id)
    }
  }, [fetchCart])

  // Cross-tab sync: when another tab mutates the cart, refetch here too.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === SYNC_KEY) void fetchCart()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [fetchCart])

  // Refetch when the tab regains focus — covers checkout abandons and
  // moves we missed while the tab was backgrounded.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && hasFetchedRef.current) void fetchCart()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [fetchCart])

  // /carrito lo pide al montar: una consulta por visita. Cuenta como la carga
  // inicial, así la diferida de arriba no repite el mismo GET.
  const refresh = useCallback(async () => {
    hasFetchedRef.current = true
    await fetchCart()
  }, [fetchCart])

  const doAdd = useCallback(async (product: Product, size: string, qty: number, opts?: { openDrawer?: boolean; source?: AddSource }) => {
    try {
      const data = await mutate(() => fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId: product.id, size, qty }),
      }))
      // Un toque háptico mínimo al agregar (Android; iOS lo ignora). Se
      // respeta "reducir movimiento" (12/10/2026).
      try {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) navigator.vibrate(10)
      } catch { /* sin vibración disponible */ }
      // GA4: add_to_cart con precio y producto (informes de e-commerce). El
      // precio con los descuentos de lote, igual que el carrito; source dice
      // qué botón lo agregó (CRO-04).
      track('add_to_cart', { product: product.slug, size, qty, ...(opts?.source ? { source: opts.source } : {}) }, {
        params: gaCommerce([{
          item_id: product.slug, item_name: product.name, price: getFinalPrice(product, size, discounts),
          quantity: qty, item_variant: size, item_category: product.category?.slug,
        }]),
      })
      // En /carrito el ítem aparece en la lista ahí mismo — abrir el drawer
      // encima sería redundante; el caller lo apaga con { openDrawer: false }.
      if (opts?.openDrawer !== false) {
        setDrawerOpen(true)
        track('view_cart', { via: 'agregar', items: summarizeCart(data.items || [], discounts).count })
      }
      return true
    } catch (e) {
      console.error('addToCart failed', e)
      // Un 409 es la verdad (se agotó entre que abrió la ficha y tocó
      // Agregar): decirlo y ofrecer la salida que sirve, no "intentá de nuevo".
      // Sin talle que elegir, que se agote "el talle" es que se agotó la pieza.
      if (e instanceof CartError && e.status === 409) {
        if (/talle/i.test(e.message) && !isUnicoLabel(size)) {
          const text = `Hola! Quería "${product.name}" en ${size} pero en la web figura agotado. ¿Lo tenés en otro talle? 🧶`
          showToast({
            msg: 'Ese talle se acaba de agotar.',
            linkText: 'Preguntar por otro talle',
            href: waLink(whatsappUrl, text) ?? waLink(WHATSAPP_DEFAULT, text)!,
            source: 'carrito_talle_agotado',
          })
        } else {
          showToast({
            msg: 'Esta pieza se acaba de agotar.',
            linkText: 'Avisame si vuelve',
            href: getRestockWhatsAppUrl(product, whatsappUrl),
            source: 'carrito_agotada',
          })
          // Que la ficha deje de ofrecerla (si la página ya se regeneró).
          router.refresh()
        }
      } else {
        showError('No se pudo agregar al carrito. Intentá de nuevo.')
      }
      return false
    }
  }, [mutate, discounts, showToast, showError, whatsappUrl, router])

  // Un segundo toque mientras el primero guarda no suma otra unidad de una
  // pieza única (CRO-21): un pedido igual en curso devuelve la MISMA promesa.
  // Cubre ficha, barra fija, vista rápida, look, cajón y carrito.
  const addsInFlight = useRef(new Map<string, Promise<boolean>>())
  const addToCart = useCallback((product: Product, size: string, qty: number, opts?: { openDrawer?: boolean; source?: AddSource }) => {
    const pending = addsInFlight.current
    const key = `${product.id}|${size}`
    const prev = pending.get(key)
    if (prev) return prev
    const run = doAdd(product, size, qty, opts).finally(() => pending.delete(key))
    pending.set(key, run)
    return run
  }, [doAdd])

  const updateQty = useCallback(async (itemId: string, qty: number) => {
    if (qty < 0) return
    try {
      await mutate(() => fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ itemId, qty }),
      }))
    } catch (e) {
      console.error('updateQty failed', e)
      showError('No se pudo actualizar la cantidad. Revisá tu conexión.')
    }
  }, [mutate, showError])

  const deleteItem = useCallback((itemId: string) => mutate(() => fetch(`/api/cart?itemId=${encodeURIComponent(itemId)}`, {
    method: 'DELETE',
    credentials: 'include',
  })), [mutate])

  const removeFromCart = useCallback(async (itemId: string) => {
    try {
      await deleteItem(itemId)
    } catch (e) {
      console.error('removeFromCart failed', e)
      showError('No se pudo eliminar la pieza. Revisá tu conexión.')
    }
  }, [deleteItem, showError])

  // "Vaciar el carrito" después de mandar el pedido: una pieza por vez (la
  // ruta borra de a un ítem) y al final se relee, para quedar igual que la base.
  const clearCart = useCallback(async () => {
    let ok = true
    for (const item of items) {
      try {
        await deleteItem(item.id)
      } catch (e) {
        console.error('clearCart failed', e)
        ok = false
      }
    }
    await fetchCart()
    if (!ok) showError('No se pudo vaciar el carrito. Revisá tu conexión.')
    return ok
  }, [items, deleteItem, fetchCart, showError])

  const value = useMemo(() => ({
    items, buyableItems: summary.buyable, unavailableItems: summary.unavailable, cartCount, cartTotal,
    discounts, addonCandidates, shippingEstimate, freeShippingThreshold, queueNote, whatsappUrl, hasMounted, isLoading,
    drawerOpen, addError, openDrawer, closeDrawer, refresh,
    addToCart, updateQty, removeFromCart, clearCart,
  }), [
    items, summary, cartCount, cartTotal,
    discounts, addonCandidates, shippingEstimate, freeShippingThreshold, queueNote, whatsappUrl, hasMounted, isLoading,
    drawerOpen, addError, openDrawer, closeDrawer, refresh,
    addToCart, updateQty, removeFromCart, clearCart,
  ])

  return (
    <CartContext.Provider value={value}>
      {children}
      {/* Error toast when add-to-cart fails (network error or product unavailable) */}
      <div
        role="alert"
        aria-live="assertive"
        style={{
          position: 'fixed', left: '50%', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 22px)',
          transform: `translateX(-50%) translateY(${addError ? '0' : '14px'})`,
          zIndex: 131,
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#7a1e2f', color: '#fff',
          padding: '11px 16px', borderRadius: 999,
          fontFamily: 'var(--font-sans), sans-serif', fontSize: 13,
          boxShadow: '0 12px 30px -12px rgba(31,26,27,0.5)',
          opacity: addError ? 1 : 0,
          // Con el aviso a la vista el link tiene que poder tocarse; cuando no
          // hay error, el globo no debe interceptar ningún toque.
          pointerEvents: addError ? 'auto' : 'none',
          transition: 'opacity 200ms ease, transform 200ms ease',
          maxWidth: 'min(92vw, 460px)',
          flexWrap: 'wrap', justifyContent: 'center', textAlign: 'center',
          lineHeight: 1.45,
        }}
      >
        <span>{toast?.msg ?? ''}</span>
        {/* Salida real, no un callejón: la que corresponde a cada error. */}
        {toast && (
          <a
            href={toast.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('whatsapp_click', { source: toast.source })}
            style={{ color: '#fff', textDecoration: 'underline', textUnderlineOffset: 3, fontWeight: 500, padding: '2px 0' }}
          >
            {toast.linkText}
          </a>
        )}
      </div>
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
