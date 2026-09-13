'use client'

// Carritos y embudo (12/09/2026). Antes esta página listaba TODOS los carritos
// desde el lanzamiento como "activos", sin separar los viejos ni los que ya
// habían terminado en un pedido. Así, "muchos carritos y pocos pedidos" era en
// parte un problema de medición. Ahora:
//   - se elige el período (30 días, 90 días o todo);
//   - si los pedidos guardan su carrito (database/embudo-pedidos-2026-09.sql),
//     se sabe qué carritos terminaron en un pedido por WhatsApp;
//   - por producto: en cuántos carritos está, cuántos favoritos y pedidos
//     tiene, el talle más elegido y si hoy se entrega en stock o a pedido.
// Todo se calcula acá con lo que el admin ya puede leer; nada nuevo en la base.

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CartItem, Product, Discount } from '@/lib/types'
import { getPrimaryPhoto, getFinalPrice, formatPrice, isReadyToShip } from '@/lib/types'

type Row = CartItem & { product?: Product }

interface OrderLite {
  id: string
  created_at: string
  items: Array<{ slug?: string; name?: string; size?: string; qty?: number }> | null
  cart_id?: string | null
  status?: string | null
}

interface FavProduct {
  id: string
  slug: string
  name: string
  status: string
  is_custom_only: boolean
  lead_time_weeks_min: number
}

interface FavLite {
  product_id: string
  added_at: string
  product: FavProduct | null
}

interface CartGroup {
  cartId: string
  items: Row[]
  total: number
  firstActivity: string
  lastActivity: string
}

interface ProductStat {
  slug: string
  name: string
  photo: string | null
  ready: boolean | null
  carts: Set<string>
  favs: number
  orders: number
  sold: number
  sizes: Map<string, number>
}

type PeriodId = '30' | '90' | 'all'
const PERIODS: Array<{ id: PeriodId; label: string; days: number | null }> = [
  { id: '30', label: '30 días', days: 30 },
  { id: '90', label: '90 días', days: 90 },
  { id: 'all', label: 'Todo', days: null },
]
const DAY = 86_400_000

const pct = (part: number, whole: number) => (whole > 0 ? `${Math.round((part / whole) * 100)}%` : '—')

/** Una lectura corta por producto. Son hipótesis para revisar, no veredictos. */
function reading(s: ProductStat): string {
  const carts = s.carts.size
  if (carts >= 3 && s.orders === 0) {
    return s.ready
      ? 'Mucho interés y ningún pedido: revisá precio, fotos y talles.'
      : 'Mucho interés y ningún pedido: el plazo puede estar frenando. Tejé una en el talle más elegido para tenerla en stock.'
  }
  if (carts >= 3 && s.orders / carts >= 0.3) return 'Convierte bien: destacala en el inicio y en Instagram.'
  if (s.favs >= 3 && carts === 0) return 'La guardan en favoritos pero no la agregan: ¿precio o talles?'
  return ''
}

export default function CarritosAdminPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [orders, setOrders] = useState<OrderLite[]>([])
  const [favs, setFavs] = useState<FavLite[]>([])
  const [discounts, setDiscounts] = useState<Discount[]>([])
  // orders.cart_id existe (embudo-pedidos-2026-09.sql): se puede cruzar carrito ↔ pedido.
  const [ordersLinked, setOrdersLinked] = useState(false)
  const [ordersReadable, setOrdersReadable] = useState(true)
  const [period, setPeriod] = useState<PeriodId>('30')
  // Momento de la última carga: los períodos se cuentan desde ahí (llamar a
  // Date.now() durante el render lo prohíbe la regla de pureza de React).
  const [loadedAt, setLoadedAt] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const supabase = createClient()
      const [cartRes, discountRes, favRes, fullOrders] = await Promise.all([
        supabase
          .from('cart_items')
          .select('*, product:products(*, media:product_media(*), sizes:product_sizes(*))')
          .order('added_at', { ascending: false }),
        supabase.from('discounts').select('*').eq('active', true),
        supabase.from('favorites').select('product_id, added_at, product:products(id, slug, name, status, is_custom_only, lead_time_weeks_min)'),
        supabase.from('orders').select('id, created_at, items, cart_id, status').order('created_at', { ascending: false }).limit(1000),
      ])
      if (cartRes.error) throw cartRes.error
      setRows((cartRes.data ?? []) as Row[])
      setDiscounts((discountRes.data ?? []) as Discount[])
      setFavs(favRes.error ? [] : ((favRes.data ?? []) as unknown as FavLite[]))

      // Pedidos con cart_id/status si la migración corrió; si no, lo básico.
      let orderRows: OrderLite[] = []
      let linked = false
      let readable = true
      if (!fullOrders.error) {
        orderRows = (fullOrders.data ?? []) as unknown as OrderLite[]
        linked = true
      } else if (fullOrders.error.code === '42703' || fullOrders.error.code === 'PGRST204' || /cart_id|status|column/i.test(fullOrders.error.message || '')) {
        const basic = await supabase.from('orders').select('id, created_at, items').order('created_at', { ascending: false }).limit(1000)
        if (basic.error) readable = false
        else orderRows = (basic.data ?? []) as unknown as OrderLite[]
      } else {
        readable = false
      }
      setOrders(orderRows)
      setOrdersLinked(linked)
      setOrdersReadable(readable)
      setLoadedAt(Date.now())
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

  const view = useMemo(() => {
    const days = PERIODS.find((p) => p.id === period)?.days ?? null
    const since = days ? loadedAt - days * DAY : 0
    const inPeriod = (iso: string) => new Date(iso).getTime() >= since

    // Carritos agrupados (uno por navegador: la cookie dahila_cart_id).
    const byCart = new Map<string, Row[]>()
    for (const r of rows) {
      if (!byCart.has(r.cart_id)) byCart.set(r.cart_id, [])
      byCart.get(r.cart_id)!.push(r)
    }
    const groups: CartGroup[] = [...byCart.entries()].map(([cartId, items]) => {
      const times = items.map((it) => it.added_at).sort()
      return {
        cartId,
        items,
        total: items.reduce((s, it) => s + (it.product ? getFinalPrice(it.product, it.size, discounts) * it.qty : 0), 0),
        firstActivity: times[0],
        lastActivity: times[times.length - 1],
      }
    }).sort((a, b) => (a.lastActivity < b.lastActivity ? 1 : -1))

    const orderedCarts = new Set(orders.map((o) => o.cart_id).filter((c): c is string => !!c))
    const newCarts = groups.filter((g) => inPeriod(g.firstActivity))
    const activeCarts = groups.filter((g) => inPeriod(g.lastActivity))
    const periodOrders = orders.filter((o) => inPeriod(o.created_at))
    const newCartsOrdered = newCarts.filter((g) => orderedCarts.has(g.cartId)).length
    const sold = periodOrders.filter((o) => o.status === 'vendido').length

    // ¿Frena el plazo? Carritos con alguna pieza lista para entregar vs solo a pedido.
    const hasReady = (g: CartGroup) => g.items.some((it) => it.product && isReadyToShip(it.product))
    const withReady = newCarts.filter(hasReady)
    const onlyToOrder = newCarts.filter((g) => !hasReady(g))

    // Interés por producto (clave: slug, que es lo que guardan los pedidos).
    const stats = new Map<string, ProductStat>()
    const ensure = (slug: string, name: string, photo: string | null, ready: boolean | null) => {
      let s = stats.get(slug)
      if (!s) {
        s = { slug, name, photo, ready, carts: new Set(), favs: 0, orders: 0, sold: 0, sizes: new Map() }
        stats.set(slug, s)
      }
      if (!s.photo && photo) s.photo = photo
      if (s.ready === null && ready !== null) s.ready = ready
      return s
    }
    for (const r of rows) {
      if (!r.product || !inPeriod(r.added_at)) continue
      const s = ensure(r.product.slug, r.product.name, getPrimaryPhoto(r.product), isReadyToShip(r.product))
      s.carts.add(r.cart_id)
      s.sizes.set(r.size, (s.sizes.get(r.size) ?? 0) + r.qty)
    }
    for (const f of favs) {
      if (!f.product || !inPeriod(f.added_at)) continue
      const p = f.product
      ensure(p.slug, p.name, null, p.status === 'active' && !p.is_custom_only && p.lead_time_weeks_min === 0).favs++
    }
    for (const o of periodOrders) {
      const seen = new Set<string>()
      for (const it of Array.isArray(o.items) ? o.items : []) {
        if (!it?.slug || seen.has(it.slug)) continue
        seen.add(it.slug)
        const s = ensure(it.slug, it.name || it.slug, null, null)
        s.orders++
        if (o.status === 'vendido') s.sold++
      }
    }
    const products = [...stats.values()]
      .sort((a, b) => b.carts.size - a.carts.size || b.favs - a.favs || b.orders - a.orders)
      .slice(0, 15)

    return { activeCarts, newCarts, newCartsOrdered, periodOrders, sold, withReady, onlyToOrder, orderedCarts, products }
  }, [rows, orders, favs, discounts, period, loadedAt])

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /></div>

  const { activeCarts, newCarts, newCartsOrdered, periodOrders, sold, withReady, onlyToOrder, orderedCarts, products } = view
  const ordersPer100 = newCarts.length > 0 && ordersReadable ? Math.round((periodOrders.length / newCarts.length) * 100) : null
  const convertedIn = (list: CartGroup[]) => list.filter((g) => orderedCarts.has(g.cartId)).length

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>Carritos</h2>
          <p>Qué agregan las clientas al carrito, cuánto termina en un pedido por WhatsApp y qué piezas despiertan más interés.</p>
        </div>
        <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => load()}>Actualizar</button>
      </div>

      {error && (
        <div role="alert" style={{
          background: 'rgba(182,49,74,0.06)', border: '1px solid rgba(182,49,74,0.24)',
          color: '#7a1e2f', padding: '12px 14px', borderRadius: 8, marginBottom: 18, fontSize: 13,
        }}>{error}</div>
      )}

      <div role="group" aria-label="Período" style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {PERIODS.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={period === p.id}
            className={`admin-btn admin-btn-sm ${period === p.id ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
            onClick={() => setPeriod(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="admin-stats-grid" style={{ marginBottom: 14 }}>
        <div className="admin-stat-card">
          <div className="stat-label">Carritos nuevos</div>
          <div className="stat-value">{newCarts.length}</div>
          <div className="stat-sub">armados en el período (uno por navegador)</div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-label">Pedidos por WhatsApp</div>
          <div className="stat-value">{ordersReadable ? periodOrders.length : '—'}</div>
          <div className="stat-sub">tocaron &quot;Coordinar por WhatsApp&quot;</div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-label">Pedidos cada 100 carritos</div>
          <div className="stat-value">{ordersPer100 ?? '—'}</div>
          <div className="stat-sub">
            {ordersLinked
              ? `${newCartsOrdered} de ${newCarts.length} carritos terminaron en pedido`
              : 'aproximado hasta correr el SQL del embudo'}
          </div>
        </div>
        {ordersLinked && (
          <div className="admin-stat-card">
            <div className="stat-label">Vendidos</div>
            <div className="stat-value">{sold}</div>
            <div className="stat-sub">marcados en Pedidos</div>
          </div>
        )}
      </div>

      <div className="admin-card" style={{ marginBottom: 14, fontSize: 13, lineHeight: 1.6, color: '#4A4143' }}>
        <strong>Cómo leer estos números.</strong> En cualquier tienda online, unos 7 de cada 10 carritos se abandonan
        (promedio de 50 estudios, Baymard). Además, acá un carrito es un navegador: la misma clienta que entra desde
        Instagram y después desde el celular cuenta como dos, y muchas escriben directo por WhatsApp o Instagram sin pasar
        por el carrito. Lo que más dice no es el total sino la tendencia de mes a mes y qué piezas juntan carritos sin pedidos.
        {!ordersLinked && ordersReadable && (
          <> Para saber exactamente qué carritos terminaron en pedido, y poder marcar las ventas en Pedidos, corré
          {' '}<code>database/embudo-pedidos-2026-09.sql</code> en Supabase.</>
        )}
      </div>

      {newCarts.length > 0 && (
        <div className="admin-card" style={{ marginBottom: 14, fontSize: 13, lineHeight: 1.6, color: '#4A4143' }}>
          <strong>¿Frena el plazo?</strong>{' '}
          {withReady.length} {withReady.length === 1 ? 'carrito tiene' : 'carritos tienen'} alguna pieza lista para entregar
          {ordersLinked && ` (${pct(convertedIn(withReady), withReady.length)} terminó en pedido)`}
          {' · '}{onlyToOrder.length} {onlyToOrder.length === 1 ? 'tiene' : 'tienen'} solo piezas a pedido
          {ordersLinked && ` (${pct(convertedIn(onlyToOrder), onlyToOrder.length)} terminó en pedido)`}.
          {!ordersLinked && ' Con el SQL del embudo corrido, acá se ve si las piezas en stock convierten más.'}
        </div>
      )}

      {products.length > 0 && (
        <div className="admin-card" style={{ marginBottom: 18 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 500 }}>Las piezas que más interés despiertan</h3>
          <p style={{ margin: '0 0 12px', fontSize: 12.5, color: '#8C8285' }}>
            Carritos y favoritos del período. La lectura es una pista para revisar, no una conclusión.
          </p>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Pieza</th>
                  <th>Carritos</th>
                  <th>Favoritos</th>
                  <th>Pedidos</th>
                  <th className="col-hide-mobile">Talle más elegido</th>
                  <th className="col-hide-mobile">Hoy</th>
                  <th>Lectura</th>
                </tr>
              </thead>
              <tbody>
                {products.map((s) => {
                  const topSize = [...s.sizes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
                  return (
                    <tr key={s.slug}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {s.photo && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={s.photo} alt="" style={{ width: 34, height: 42, objectFit: 'cover', borderRadius: 5, background: '#FAF1DF', flexShrink: 0 }} />
                          )}
                          <span>{s.name}</span>
                        </div>
                      </td>
                      <td>{s.carts.size}</td>
                      <td>{s.favs}</td>
                      <td>{ordersReadable ? `${s.orders}${ordersLinked && s.sold ? ` (${s.sold} vendidos)` : ''}` : '—'}</td>
                      <td className="col-hide-mobile">{topSize ?? '—'}</td>
                      <td className="col-hide-mobile">{s.ready === null ? '—' : s.ready ? 'En stock' : 'A pedido'}</td>
                      <td style={{ fontSize: 12.5, color: '#4A4143', minWidth: 180 }}>{reading(s)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <h3 style={{ margin: '0 0 10px', fontSize: '1rem', fontWeight: 500 }}>
        Carritos con actividad en el período ({activeCarts.length})
      </h3>
      {activeCarts.length === 0 ? (
        <div className="admin-card admin-empty"><p>No hay carritos con actividad en este período.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {activeCarts.map((g) => (
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
                  {orderedCarts.has(g.cartId) && (
                    <span style={{ fontSize: '0.75rem', color: '#1E8449', marginLeft: 8, fontWeight: 500 }}>✓ Terminó en pedido</span>
                  )}
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
