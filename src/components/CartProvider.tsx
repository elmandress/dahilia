'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { CartItem, Product } from '@/lib/types'
import { getEffectivePrice } from '@/lib/types'

type CartItemWithProduct = CartItem & { product: Product }

interface CartContextType {
  items: CartItemWithProduct[]
  cartCount: number
  cartTotal: number
  cartId: string | null
  isLoading: boolean
  addToCart: (product: Product, size: string, qty: number) => Promise<void>
  updateQty: (itemId: string, qty: number) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemWithProduct[]>([])
  const [cartId, setCartId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Hydrate cart from localStorage / API on mount
  useEffect(() => {
    const initCart = async () => {
      try {
        let currentCartId = localStorage.getItem('dahila_cart_id')
        if (!currentCartId) {
          currentCartId = uuidv4()
          localStorage.setItem('dahila_cart_id', currentCartId)
        }
        setCartId(currentCartId)

        // Load local storage fallback first
        const localItemsStr = localStorage.getItem('dahila_cart_items')
        if (localItemsStr) {
          try {
            setItems(JSON.parse(localItemsStr))
          } catch (e) {
            console.error('Error parsing local cart items', e)
          }
        }

        // Fetch from our API (which we will build)
        const res = await fetch(`/api/cart?cartId=${currentCartId}`)
        if (res.ok) {
          const data = await res.json()
          setItems(data.items || [])
          localStorage.setItem('dahila_cart_items', JSON.stringify(data.items || []))
        }
      } catch (error) {
        console.error('Failed to load cart from server, using local fallback', error)
      } finally {
        setIsLoading(false)
      }
    }
    initCart()
  }, [])

  const addToCart = async (product: Product, size: string, qty: number) => {
    if (!cartId) return

    // Optimistic update
    const existing = items.find(i => i.product_id === product.id && i.size === size)
    let updated: CartItemWithProduct[]
    if (existing) {
      updated = items.map(i => i.id === existing.id ? { ...i, qty: i.qty + qty } : i)
    } else {
      const tempId = `temp-${Date.now()}`
      updated = [...items, {
        id: tempId,
        cart_id: cartId,
        product_id: product.id,
        size,
        qty,
        added_at: new Date().toISOString(),
        product
      }]
    }

    setItems(updated)
    localStorage.setItem('dahila_cart_items', JSON.stringify(updated))

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId, productId: product.id, size, qty }),
      })
      if (res.ok) {
        const data = await res.json()
        setItems(data.items)
        localStorage.setItem('dahila_cart_items', JSON.stringify(data.items))
      }
    } catch (err) {
      console.error('Failed to add to cart on server', err)
    }
  }

  const updateQty = async (itemId: string, qty: number) => {
    if (!cartId) return
    if (qty <= 0) return removeFromCart(itemId)

    const updated = items.map(i => i.id === itemId ? { ...i, qty } : i)
    setItems(updated)
    localStorage.setItem('dahila_cart_items', JSON.stringify(updated))

    try {
      const res = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, qty }),
      })
      if (res.ok) {
        const data = await res.json()
        setItems(data.items)
        localStorage.setItem('dahila_cart_items', JSON.stringify(data.items))
      }
    } catch (err) {
      console.error('Failed to update qty on server', err)
    }
  }

  const removeFromCart = async (itemId: string) => {
    if (!cartId) return
    const updated = items.filter(i => i.id !== itemId)
    setItems(updated)
    localStorage.setItem('dahila_cart_items', JSON.stringify(updated))

    try {
      const res = await fetch(`/api/cart?itemId=${itemId}`, { method: 'DELETE' })
      if (res.ok) {
        const data = await res.json()
        setItems(data.items)
        localStorage.setItem('dahila_cart_items', JSON.stringify(data.items))
      }
    } catch (err) {
      console.error('Failed to remove from cart on server', err)
    }
  }

  const cartCount = items.reduce((sum, item) => sum + item.qty, 0)
  
  const cartTotal = items.reduce((sum, item) => {
    return sum + (getEffectivePrice(item.product, item.size) * item.qty)
  }, 0)

  return (
    <CartContext.Provider value={{
      items, cartCount, cartTotal, cartId, isLoading, addToCart, updateQty, removeFromCart
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
