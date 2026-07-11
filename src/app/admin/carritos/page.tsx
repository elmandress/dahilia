'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CartItem, Product, Discount } from '@/lib/types'
import { getPrimaryPhoto, getFinalPrice, formatPrice } from '@/lib/types'

type Row = CartItem & { product?: Product }

interface CartGroup {
  cartId: string
  items: Row[]
  total: number
  lastActivity: string
}

export default function CarritosAdminPage() {
  const [groups, setGroups] = useState<CartGroup[]>([])
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const supabase = createClient()
      const [cartRes, discountRes] = await Promise.all([
        supabase
          .from('cart_items')
          .select('*, product:products(*, media:product_media(*), sizes:product_sizes(*))')
          .order('added_at', { ascending: false }),
        supabase.from('discounts').select('*').eq('active', true),
      ])
      if (cartRes.error) throw cartRes.error

      const activeDiscounts = (discountRes.data ?? []) as Discount[]
      setDiscounts(activeDiscounts)

      const rows = (cartRes.data ?? []) as Row[]
      const byCart = new Map<string, Row[]>()
      for (const r of rows) {
        if (!byCart.has(r.cart_id)) byCart.set(r.cart_id, [])
        byCart.get(r.cart_id)!.push(r)
      }
      const grouped: CartGroup[] = [...byCart.entries()].map(([cartId, items]) => {
        const total = items.reduce(
          (s, it) => s + (it.product ? getFinalPrice(it.product, it.size, activeDiscounts) * it.qty : 0),
          0
        )
        const lastActivity = items.map((it) => it.added_at).sort().reverse()[0]
        return { cartId, items, total, lastActivity }
      })
      grouped.sort((a, b) => (a.lastActivity < b.lastActivity ? 1 : -1))
      setGroups(grouped)
    } catch (e) {
      console.error('Error cargando carritos', e)
      setError('No se pudieron cargar los carritos.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /></div>

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>Carritos activos</h2>
          <p>Lo que las clientas dejaron en sus carritos. Útil para ver qué piezas tienen interés.</p>
        </div>
        <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => load()}>Actualizar</button>
      </div>

      {error && (
        <div role="alert" style={{
          background: 'rgba(182,49,74,0.06)', border: '1px solid rgba(182,49,74,0.24)',
          color: '#7a1e2f', padding: '12px 14px', borderRadius: 8, marginBottom: 18, fontSize: 13,
        }}>{error}</div>
      )}

      {groups.length === 0 ? (
        <div className="admin-card admin-empty"><p>No hay carritos con productos por ahora.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {groups.map((g) => (
            <article key={g.cartId} className="admin-card">
              <header style={{
                display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between',
                alignItems: 'baseline', paddingBottom: 10, borderBottom: '1px solid rgba(31,26,27,0.10)', marginBottom: 12,
              }}>
                <div>
                  <strong style={{ fontSize: '0.95rem' }}>
                    {g.items.reduce((s, it) => s + it.qty, 0)} {g.items.reduce((s, it) => s + it.qty, 0) === 1 ? 'prenda' : 'prendas'}
                  </strong>
                  <span style={{ fontSize: '0.78rem', color: '#8C8285', marginLeft: 8 }}>
                    Última actividad: {new Date(g.lastActivity).toLocaleString('es-UY', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#1F1A1B' }}>{formatPrice(g.total)}</strong>
              </header>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {g.items.map((it) => it.product ? (
                  <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getPrimaryPhoto(it.product)}
                      alt=""
                      style={{ width: 44, height: 54, objectFit: 'cover', borderRadius: 6, background: '#FAF1DF', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.9rem', color: '#1F1A1B' }}>{it.product.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#8C8285' }}>Talle {it.size} · x{it.qty}</div>
                    </div>
                    <div style={{ fontSize: '0.88rem', color: '#1F1A1B' }}>
                      {formatPrice(getFinalPrice(it.product, it.size, discounts) * it.qty)}
                    </div>
                  </div>
                ) : (
                  <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: 0.5 }}>
                    <div style={{ width: 44, height: 54, borderRadius: 6, background: '#FAF1DF', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', color: '#B6314A' }}>Producto eliminado</div>
                      <div style={{ fontSize: '0.8rem', color: '#8C8285' }}>Talle {it.size} · x{it.qty}</div>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
