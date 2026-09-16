'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/types'
import { channelLabel } from '@/lib/attribution'

interface OrderItem {
  name: string
  slug: string
  size: string
  qty: number
  unit_price_uyu: number
}

// Cómo terminó el pedido (database/embudo-pedidos-2026-09.sql). Sin marcar
// esto, "pedidos enviados" no dice cuántos se vendieron de verdad.
type OrderStatus = 'nuevo' | 'vendido' | 'no_concreto'

const STATUS_OPTIONS: Array<{ value: OrderStatus; label: string; color: string }> = [
  { value: 'nuevo', label: 'Sin marcar', color: '#5B5356' },
  { value: 'vendido', label: 'Vendido', color: '#1E8449' },
  { value: 'no_concreto', label: 'No se concretó', color: '#B6314A' },
]

interface OrderRow {
  id: string
  created_at: string
  items: OrderItem[]
  subtotal_uyu: number
  discount_uyu: number
  total_uyu: number
  coupon_code: string | null
  free_shipping: boolean
  gift_note: string | null
  utm_source: string | null
  referrer_host: string | null
  status?: OrderStatus | null
}

const DAY = 86_400_000

export default function PedidosAdminPage() {
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Migración no corrida (tabla no existe) o falta insertarse en `admins`
  // (RLS bloquea la lectura): dos estados distintos, dos avisos distintos.
  const [needsMigration, setNeedsMigration] = useState(false)
  // RLS de `orders` filtra por is_admin(): si el usuario no está en la tabla
  // `admins`, el SELECT devuelve 200 con una lista VACÍA — sin error. La
  // página decía "todavía no se envió ningún pedido" mientras la base podía
  // tener decenas. El propio schema-orders.sql avisa de esta trampa.
  const [notAdmin, setNotAdmin] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)
  // Momento de la última carga: "los últimos 30 días" se cuentan desde ahí
  // (llamar a Date.now() durante el render lo prohíbe la regla de pureza).
  const [loadedAt, setLoadedAt] = useState(0)

  const load = useCallback(async () => {
    setError(null)
    setNeedsMigration(false)
    setNotAdmin(false)
    try {
      const supabase = createClient()
      const { data, error: err } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(300)
      if (err) {
        // PGRST205 es lo que Supabase/PostgREST devuelve en la práctica cuando
        // la tabla no existe (42P01 es el código de Postgres crudo, casi nunca
        // lo que llega acá) — mismo criterio defensivo que ya usan
        // tejedoras/suscriptores/cupones: código O contenido del mensaje.
        if (err.code === '42P01' || err.code === 'PGRST205' || /orders/.test(err.message || '')) {
          setNeedsMigration(true)
          return
        }
        throw err
      }
      const rows = (data ?? []) as OrderRow[]
      setOrders(rows)
      setLoadedAt(Date.now())
      // Lista vacía: ¿no hay pedidos, o RLS los está escondiendo? La función
      // is_admin() lo responde sin escribir nada. Si no existe (migración
      // vieja), el rpc falla y se deja la pantalla como estaba.
      if (rows.length === 0) {
        const { data: isAdmin, error: rpcErr } = await supabase.rpc('is_admin')
        if (!rpcErr && isAdmin === false) setNotAdmin(true)
      }
    } catch (e) {
      console.error('Error cargando pedidos', e)
      setError('No se pudieron cargar los pedidos. Si sos admin y la tabla existe, puede faltar tu usuario en `admins` (ver database/schema-orders.sql).')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  // `select('*')` trae la columna si la migración corrió: con una sola fila
  // alcanza para saberlo.
  const hasStatus = orders.some((o) => o.status !== undefined)

  const updateStatus = async (id: string, status: OrderStatus) => {
    setStatusError(null)
    const previous = orders.find((o) => o.id === id)?.status ?? 'nuevo'
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
    const { data, error: err } = await createClient().from('orders').update({ status }).eq('id', id).select('id')
    // Sin la policy de UPDATE, la base no da error: devuelve 0 filas.
    if (err || !data || data.length === 0) {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: previous } : o)))
      setStatusError('No se pudo guardar el estado. Revisá que se haya corrido database/embudo-pedidos-2026-09.sql en Supabase.')
    }
  }

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /></div>

  const since = loadedAt - 30 * DAY
  const recent = orders.filter((o) => new Date(o.created_at).getTime() >= since)
  const sold = recent.filter((o) => o.status === 'vendido')
  const lost = recent.filter((o) => o.status === 'no_concreto')
  const unmarked = recent.length - sold.length - lost.length
  const closeRate = sold.length + lost.length > 0 ? Math.round((sold.length / (sold.length + lost.length)) * 100) : null
  // Qué canal trae pedidos y cuál vende (datos de la base, no de analytics:
  // no los pierden los ad-blockers). Ordenado por lo vendido.
  const byChannel = [...recent.reduce((m, o) => {
    const ch = channelLabel({ utm_source: o.utm_source, referrer_host: o.referrer_host })
    const row = m.get(ch) ?? { pedidos: 0, vendidos: 0, monto: 0 }
    row.pedidos += 1
    if (o.status === 'vendido') {
      row.vendidos += 1
      row.monto += Number(o.total_uyu) || 0
    }
    return m.set(ch, row)
  }, new Map<string, { pedidos: number; vendidos: number; monto: number }>())]
    .sort((a, b) => b[1].vendidos - a[1].vendidos || b[1].pedidos - a[1].pedidos)

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>Pedidos enviados</h2>
          <p>Cada vez que alguien toca &quot;Coordinar por WhatsApp&quot; queda una foto del pedido acá. Después de hablar con la clienta, marcá si se vendió: así se sabe cuánto de lo que llega por el sitio termina en venta.</p>
        </div>
        <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => load()}>Actualizar</button>
      </div>

      {needsMigration && (
        <div className="admin-card admin-empty">
          <p>Todavía no corriste <code>database/schema-orders.sql</code> en el SQL Editor de Supabase — sin eso, los pedidos no se guardan.</p>
        </div>
      )}

      {error && (
        <div role="alert" style={{
          background: 'rgba(182,49,74,0.06)', border: '1px solid rgba(182,49,74,0.24)',
          color: '#7a1e2f', padding: '12px 14px', borderRadius: 8, marginBottom: 18, fontSize: 13,
        }}>{error}</div>
      )}

      {statusError && (
        <div role="alert" style={{
          background: 'rgba(182,49,74,0.06)', border: '1px solid rgba(182,49,74,0.24)',
          color: '#7a1e2f', padding: '12px 14px', borderRadius: 8, marginBottom: 18, fontSize: 13,
        }}>{statusError}</div>
      )}

      {notAdmin && !needsMigration && (
        <div role="alert" style={{
          background: 'rgba(182,49,74,0.06)', border: '1px solid rgba(182,49,74,0.24)',
          color: '#7a1e2f', padding: '12px 14px', borderRadius: 8, marginBottom: 18, fontSize: 13,
        }}>
          <strong>Ojo: esta lista puede estar incompleta.</strong> Tu usuario todavía no figura en la
          tabla <code>admins</code> de Supabase, y la base solo muestra los pedidos a quien esté ahí.
          Puede haber pedidos guardados que no estás viendo. El paso para arreglarlo está comentado
          arriba de todo en <code>database/schema-orders.sql</code>.
        </div>
      )}

      {orders.length > 0 && (
        <>
          <div className="admin-stats-grid" style={{ marginBottom: 14 }}>
            <div className="admin-stat-card">
              <div className="stat-label">Pedidos · 30 días</div>
              <div className="stat-value">{recent.length}</div>
              <div className="stat-sub">tocaron &quot;Coordinar por WhatsApp&quot;</div>
            </div>
            {hasStatus && (
              <>
                <div className="admin-stat-card">
                  <div className="stat-label">Vendidos</div>
                  <div className="stat-value">{sold.length}</div>
                  <div className="stat-sub">{formatPrice(sold.reduce((s, o) => s + (Number(o.total_uyu) || 0), 0))} en total</div>
                </div>
                <div className="admin-stat-card">
                  <div className="stat-label">Cierre</div>
                  <div className="stat-value">{closeRate === null ? '—' : `${closeRate}%`}</div>
                  <div className="stat-sub">{lost.length} no se concretaron · {unmarked} sin marcar</div>
                </div>
              </>
            )}
          </div>
          {!hasStatus && (
            <div className="admin-card" style={{ marginBottom: 14, fontSize: 13, color: '#4A4143' }}>
              Para marcar qué pedidos se vendieron (y ver el porcentaje de cierre), corré
              {' '}<code>database/embudo-pedidos-2026-09.sql</code> en el SQL Editor de Supabase.
            </div>
          )}
          {byChannel.length > 0 && (
            <div className="admin-card" style={{ marginBottom: 14 }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 500 }}>De dónde vienen · 30 días</h3>
              <p style={{ margin: '0 0 12px', fontSize: 12.5, color: '#8C8285' }}>
                El canal es la última vez que la persona llegó desde afuera (Instagram, TikTok, Google o un link con UTM)
                en el mes antes del pedido. &quot;Directo&quot; es quien entró escribiendo la dirección o desde una app que
                no avisa de dónde viene. Los pedidos de antes de septiembre 2026 solo guardaban la visita del pedido,
                así que tienen más &quot;Directo&quot; del real.
              </p>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Canal</th>
                      <th>Pedidos</th>
                      {hasStatus && <th>Vendidos</th>}
                      {hasStatus && <th>Monto vendido</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {byChannel.map(([channel, r]) => (
                      <tr key={channel}>
                        <td>{channel}</td>
                        <td>{r.pedidos}</td>
                        {hasStatus && <td>{r.vendidos}</td>}
                        {hasStatus && <td>{formatPrice(r.monto)}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {!needsMigration && !error && !notAdmin && orders.length === 0 ? (
        <div className="admin-card admin-empty"><p>Todavía no se envió ningún pedido por acá.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {orders.map((o) => {
            // `items` es jsonb: una fila vieja o rota sin items tiraba abajo
            // toda la página con un TypeError en vez de mostrar el resto.
            const items = Array.isArray(o.items) ? o.items : []
            const unitCount = items.reduce((s, it) => s + (it?.qty ?? 0), 0)
            const current = STATUS_OPTIONS.find((s) => s.value === (o.status ?? 'nuevo')) ?? STATUS_OPTIONS[0]
            return (
              <article key={o.id} className="admin-card">
                <header style={{
                  display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between',
                  alignItems: 'baseline', paddingBottom: 10, borderBottom: '1px solid rgba(31,26,27,0.10)', marginBottom: 12,
                }}>
                  <div>
                    <strong style={{ fontSize: '0.95rem' }}>
                      {unitCount} {unitCount === 1 ? 'prenda' : 'prendas'}
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: '#8C8285', marginLeft: 8 }}>
                      {new Date(o.created_at).toLocaleString('es-UY', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#5B5356', marginLeft: 8 }}>
                      · {channelLabel({ utm_source: o.utm_source, referrer_host: o.referrer_host })}
                    </span>
                    {o.coupon_code && (
                      <span style={{ fontSize: '0.78rem', color: '#8F3B53', marginLeft: 8 }}>Cupón {o.coupon_code}</span>
                    )}
                    {o.free_shipping && (
                      <span style={{ fontSize: '0.78rem', color: '#1E8449', marginLeft: 8 }}>Envío gratis</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {hasStatus && (
                      <select
                        aria-label="Cómo terminó este pedido"
                        value={current.value}
                        onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)}
                        style={{
                          fontSize: 12, padding: '4px 8px', borderRadius: 6,
                          border: '1px solid rgba(31,26,27,0.18)', background: '#fff', color: current.color,
                        }}
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    )}
                    <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#1F1A1B' }}>{formatPrice(o.total_uyu)}</strong>
                  </div>
                </header>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {items.map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontSize: '0.88rem' }}>
                      <span style={{ color: '#1F1A1B' }}>{it.name} <span style={{ color: '#8C8285' }}>· Talle {it.size} · x{it.qty}</span></span>
                      <span style={{ color: '#1F1A1B', flexShrink: 0 }}>{formatPrice(it.unit_price_uyu * it.qty)}</span>
                    </div>
                  ))}
                </div>

                {o.gift_note && (
                  <p style={{ marginTop: 10, fontSize: '0.85rem', color: '#4A4143', fontStyle: 'italic' }}>
                    🎁 &quot;{o.gift_note}&quot;
                  </p>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
