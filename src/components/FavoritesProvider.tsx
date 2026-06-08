'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import type { Product } from '@/lib/types'

export interface FavoriteItem {
  id: string
  product_id: string
  added_at: string
  product: Product
}

interface FavoritesContextType {
  items: FavoriteItem[]
  /** product_ids currently saved — O(1) membership for the heart toggle. */
  ids: Set<string>
  count: number
  hasMounted: boolean
  isFavorite: (productId: string) => boolean
  toggle: (productId: string) => Promise<void>
  refresh: () => Promise<void>
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

// Cross-tab signal, same idea as the cart's sync key.
const SYNC_KEY = 'dahila_fav_sync'

function pingOtherTabs() {
  try { localStorage.setItem(SYNC_KEY, String(Date.now())) } catch {}
}

async function jsonOrThrow(res: Response): Promise<{ items: FavoriteItem[] }> {
  if (!res.ok) {
    let detail = ''
    try { detail = (await res.json()).error || '' } catch {}
    throw new Error(detail || `HTTP ${res.status}`)
  }
  return res.json()
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<FavoriteItem[]>([])
  const [ids, setIds] = useState<Set<string>>(new Set())
  const [hasMounted, setHasMounted] = useState(false)
  const hasFetchedRef = useRef(false)

  const apply = useCallback((next: FavoriteItem[]) => {
    setItems(next)
    setIds(new Set(next.map((i) => i.product_id)))
  }, [])

  const fetchFavorites = useCallback(async () => {
    try {
      const res = await fetch('/api/favorites', { credentials: 'include' })
      const data = await jsonOrThrow(res)
      apply(data.items || [])
    } catch (e) {
      console.error('Favorites fetch failed', e)
    } finally {
      setHasMounted(true)
    }
  }, [apply])

  // Defer the initial load to idle — the heart renders neutral until then.
  useEffect(() => {
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true
    const run = () => { void fetchFavorites() }
    const ric = (window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
    }).requestIdleCallback
    if (typeof ric === 'function') {
      const id = ric(run, { timeout: 2000 })
      return () => {
        const cic = (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback
        if (typeof cic === 'function') cic(id)
      }
    }
    const id = setTimeout(run, 400)
    return () => clearTimeout(id)
  }, [fetchFavorites])

  // Cross-tab sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => { if (e.key === SYNC_KEY) void fetchFavorites() }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [fetchFavorites])

  const isFavorite = useCallback((productId: string) => ids.has(productId), [ids])

  const toggle = useCallback(async (productId: string) => {
    const wasFav = ids.has(productId)
    // Optimistic: flip the heart instantly so it feels native; reconcile with
    // the server response (or roll back on failure).
    setIds((prev) => {
      const next = new Set(prev)
      if (wasFav) next.delete(productId); else next.add(productId)
      return next
    })
    try {
      const res = wasFav
        ? await fetch(`/api/favorites?productId=${encodeURIComponent(productId)}`, { method: 'DELETE', credentials: 'include' })
        : await fetch('/api/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ productId }),
          })
      const data = await jsonOrThrow(res)
      apply(data.items || [])
      pingOtherTabs()
    } catch (e) {
      console.error('toggle favorite failed', e)
      // Roll back the optimistic flip.
      setIds((prev) => {
        const next = new Set(prev)
        if (wasFav) next.add(productId); else next.delete(productId)
        return next
      })
    }
  }, [ids, apply])

  const refresh = useCallback(async () => { await fetchFavorites() }, [fetchFavorites])

  return (
    <FavoritesContext.Provider value={{
      items, ids, count: ids.size, hasMounted, isFavorite, toggle, refresh,
    }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export const useFavorites = () => {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
