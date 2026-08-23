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
}

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
        .limit(100)
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

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /></div>

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>Pedidos enviados</h2>
          <p>Cada vez que alguien toca &quot;Coordinar por WhatsApp&quot; queda una foto del pedido acá — coordinás igual que siempre por WhatsApp, esto es solo para el historial.</p>
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

      {!needsMigration && !error && !notAdmin && orders.length === 0 ? (
        <div className="admin-card admin-empty"><p>Todavía no se envió ningún pedido por acá.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {orders.map((o) => {
            // `items` es jsonb: una fila vieja o rota sin items tiraba abajo
            // toda la página con un TypeError en vez de mostrar el resto.
            const items = Array.isArray(o.items) ? o.items : []
            const unitCount = items.reduce((s, it) => s + (it?.qty ?? 0), 0)
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
                  <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#1F1A1B' }}>{formatPrice(o.total_uyu)}</strong>
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
