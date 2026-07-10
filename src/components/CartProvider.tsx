'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { CartItem, Product, Discount } from '@/lib/types'
import { getFinalPrice } from '@/lib/types'
import { track } from '@/lib/analytics'

type CartItemWithProduct = CartItem & { product: Product }

interface CartContextType {
  items: CartItemWithProduct[]
  cartCount: number
  cartTotal: number
  discounts: Discount[]
  shippingEstimate: string
  /** Umbral de envío gratis en UYU (site_settings.free_shipping_threshold). 0 = apagado. */
  freeShippingThreshold: number
  /** Aviso de lista de espera ("los pedidos nuevos empiezan en agosto"). Vacío = no mostrar. */
  queueNote: string
  hasMounted: boolean
  isLoading: boolean
  drawerOpen: boolean
  addError: boolean
  openDrawer: () => void
  closeDrawer: () => void
  refresh: () => Promise<void>
  addToCart: (product: Product, size: string, qty: number, opts?: { openDrawer?: boolean }) => Promise<void>
  updateQty: (itemId: string, qty: number) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
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

async function jsonOrThrow(res: Response): Promise<{ items: CartItemWithProduct[] }> {
  if (!res.ok) {
    let detail = ''
    try { detail = (await res.json()).error || '' } catch {}
    throw new Error(detail || `HTTP ${res.status}`)
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

export function CartProvider({
  children,
  initialDiscounts = [],
  shippingEstimate = '',
  freeShippingThreshold = 0,
  queueNote = '',
}: {
  children: React.ReactNode
  initialDiscounts?: Discount[]
  shippingEstimate?: string
  freeShippingThreshold?: number
  queueNote?: string
}) {
  const [items, setItems] = useState<CartItemWithProduct[]>([])
  // Seeded from the server layout so the very first paint already prices with
  // batch/category rules — no flash of an un-discounted total.
  const [discounts] = useState<Discount[]>(initialDiscounts)
  const [isLoading, setIsLoading] = useState(true)
  const [hasMounted, setHasMounted] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [addError, setAddError] = useState(false)
  const hasFetchedRef = useRef(false)

  const openDrawer = useCallback(() => setDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart', { credentials: 'include' })
      const data = await jsonOrThrow(res)
      setItems(data.items || [])
      saveSnapshot(data.items || [])
    } catch (e) {
      console.error('Cart fetch failed', e)
      // Base caída: servir la última copia buena para que el pedido no se
      // pierda (el checkout por WhatsApp no necesita la base para nada).
      const snapshot = loadSnapshot()
      if (snapshot.length > 0) setItems(snapshot)
    } finally {
      setIsLoading(false)
      setHasMounted(true)
    }
  }, [])

  // Initial load — deferred to idle so the first paint of the home page
  // doesn't compete with a request the visitor probably won't use yet.
  useEffect(() => {
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true

    const run = () => { void fetchCart() }
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

  const refresh = useCallback(async () => {
    await fetchCart()
  }, [fetchCart])

  const addToCart = useCallback(async (product: Product, size: string, qty: number, opts?: { openDrawer?: boolean }) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId: product.id, size, qty }),
      })
      const data = await jsonOrThrow(res)
      setItems(data.items || [])
      saveSnapshot(data.items || [])
      pingOtherTabs()
      // En /carrito el ítem aparece en la lista ahí mismo — abrir el drawer
      // encima sería redundante; el caller lo apaga con { openDrawer: false }.
      if (opts?.openDrawer !== false) setDrawerOpen(true)
      track('add_to_cart', { product: product.slug, size, qty })
    } catch (e) {
      console.error('addToCart failed', e)
      // Surface the error so the user knows the add failed.
      setAddError(true)
      setTimeout(() => setAddError(false), 3500)
    }
  }, [])

  const updateQty = useCallback(async (itemId: string, qty: number) => {
    if (qty < 0) return
    try {
      const res = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ itemId, qty }),
      })
      const data = await jsonOrThrow(res)
      setItems(data.items || [])
      saveSnapshot(data.items || [])
      pingOtherTabs()
    } catch (e) {
      console.error('updateQty failed', e)
    }
  }, [])

  const removeFromCart = useCallback(async (itemId: string) => {
    try {
      const res = await fetch(`/api/cart?itemId=${encodeURIComponent(itemId)}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await jsonOrThrow(res)
      setItems(data.items || [])
      saveSnapshot(data.items || [])
      pingOtherTabs()
    } catch (e) {
      console.error('removeFromCart failed', e)
    }
  }, [])

  const cartCount = items.reduce((sum, item) => sum + item.qty, 0)
  // Cart total applies BOTH the per-product discount and any active batch/
  // category rule (best wins, via getFinalPrice) so the total the shopper sees
  // matches the price shown across the store, card, and PDP.
  const cartTotal = items.reduce((sum, item) => {
    if (!item.product) return sum
    return sum + (getFinalPrice(item.product, item.size, discounts) * item.qty)
  }, 0)

  const value = useMemo(() => ({
    items, cartCount, cartTotal, discounts, shippingEstimate, freeShippingThreshold, queueNote, hasMounted, isLoading,
    drawerOpen, addError, openDrawer, closeDrawer, refresh,
    addToCart, updateQty, removeFromCart,
  }), [
    items, cartCount, cartTotal, discounts, shippingEstimate, freeShippingThreshold, queueNote, hasMounted, isLoading,
    drawerOpen, addError, openDrawer, closeDrawer, refresh,
    addToCart, updateQty, removeFromCart,
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
          pointerEvents: 'none',
          transition: 'opacity 200ms ease, transform 200ms ease',
          whiteSpace: 'nowrap',
        }}
      >
        No se pudo agregar al carrito. Intentá de nuevo.
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
