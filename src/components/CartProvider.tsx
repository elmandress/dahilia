'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import type { CartItem, Product, Discount } from '@/lib/types'
import { getFinalPrice } from '@/lib/types'

type CartItemWithProduct = CartItem & { product: Product }

interface CartContextType {
  items: CartItemWithProduct[]
  cartCount: number
  cartTotal: number
  /** Active batch/category discount rules, so every cart view prices identically. */
  discounts: Discount[]
  /** Short CMS shipping line, shown as reassurance in the drawer/cart. */
  shippingEstimate: string
  hasMounted: boolean
  isLoading: boolean
  drawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  refresh: () => Promise<void>
  addToCart: (product: Product, size: string, qty: number) => Promise<void>
  updateQty: (itemId: string, qty: number) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// Storage key used purely as a cross-tab signal (not a source of truth).
// When tab A mutates the cart it bumps this value, tab B's `storage` listener
// fires and refetches from the server.
const SYNC_KEY = 'dahila_cart_sync'

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
}: {
  children: React.ReactNode
  initialDiscounts?: Discount[]
  shippingEstimate?: string
}) {
  const [items, setItems] = useState<CartItemWithProduct[]>([])
  // Seeded from the server layout so the very first paint already prices with
  // batch/category rules — no flash of an un-discounted total.
  const [discounts] = useState<Discount[]>(initialDiscounts)
  const [isLoading, setIsLoading] = useState(true)
  // Avoid hydration mismatch: the badge depends on the cart, which is only known
  // after the client has called the API. Until then, render as if empty.
  const [hasMounted, setHasMounted] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const hasFetchedRef = useRef(false)

  const openDrawer = useCallback(() => setDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart', { credentials: 'include' })
      const data = await jsonOrThrow(res)
      setItems(data.items || [])
    } catch (e) {
      console.error('Cart fetch failed', e)
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

  const addToCart = useCallback(async (product: Product, size: string, qty: number) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId: product.id, size, qty }),
      })
      const data = await jsonOrThrow(res)
      setItems(data.items || [])
      pingOtherTabs()
      // Immediate feedback: slide the mini-cart open so the shopper sees the
      // item landed (the highest-impact add-to-cart UX pattern).
      setDrawerOpen(true)
    } catch (e) {
      console.error('addToCart failed', e)
    }
  }, [])

  const updateQty = useCallback(async (itemId: string, qty: number) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ itemId, qty }),
      })
      const data = await jsonOrThrow(res)
      setItems(data.items || [])
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

  return (
    <CartContext.Provider value={{
      items, cartCount, cartTotal, discounts, shippingEstimate, hasMounted, isLoading,
      drawerOpen, openDrawer, closeDrawer, refresh,
      addToCart, updateQty, removeFromCart,
    }}>
      {children}
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
