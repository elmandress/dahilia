'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { Product } from '@/lib/types'
import { Icon } from './ui/Primitives'

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
  // Brief confirmation when a piece is saved (added, not removed).
  const [toast, setToast] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
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

  // Refetch when the tab regains focus — mirrors CartProvider behaviour.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && hasFetchedRef.current) void fetchFavorites()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [fetchFavorites])

  const isFavorite = useCallback((productId: string) => ids.has(productId), [ids])

  const showToast = useCallback(() => {
    setToast(true)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(false), 2600)
  }, [])

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current) }, [])

  const toggle = useCallback(async (productId: string) => {
    const wasFav = ids.has(productId)
    // Optimistic: flip the heart instantly so it feels native; reconcile with
    // the server response (or roll back on failure).
    setIds((prev) => {
      const next = new Set(prev)
      if (wasFav) next.delete(productId); else next.add(productId)
      return next
    })
    if (!wasFav) showToast()
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
  }, [ids, apply, showToast])

  const refresh = useCallback(async () => { await fetchFavorites() }, [fetchFavorites])

  const value = useMemo(() => ({
    items, ids, count: ids.size, hasMounted, isFavorite, toggle, refresh,
  }), [items, ids, hasMounted, isFavorite, toggle, refresh])

  return (
    <FavoritesContext.Provider value={value}>
      {children}
      <FavoriteToast show={toast} />
    </FavoritesContext.Provider>
  )
}

/**
 * Small, non-blocking confirmation that a piece was saved. Bottom-centre so it
 * sits in the thumb zone on mobile and never covers the corner heart. Polite
 * live region so screen readers announce it without stealing focus.
 */
function FavoriteToast({ show }: { show: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed', left: '50%', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 22px)',
        transform: `translateX(-50%) translateY(${show ? '0' : '14px'})`,
        zIndex: 130,
        display: 'inline-flex', alignItems: 'center', gap: 10,
        background: '#1F1A1B', color: '#fff',
        padding: '11px 16px', borderRadius: 999,
        fontFamily: 'var(--font-sans), sans-serif', fontSize: 13,
        boxShadow: '0 12px 30px -12px rgba(31,26,27,0.5)',
        opacity: show ? 1 : 0,
        pointerEvents: show ? 'auto' : 'none',
        transition: 'opacity 200ms cubic-bezier(0.22,0.61,0.36,1), transform 200ms cubic-bezier(0.22,0.61,0.36,1)',
      }}
    >
      <Icon name="heart" weight="fill" size={16} color="#B6314A" />
      Guardado en favoritos
      <a href="/favoritos" style={{ color: '#fff', textDecoration: 'underline', textUnderlineOffset: 2 }}>Ver</a>
    </div>
  )
}

export const useFavorites = () => {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
