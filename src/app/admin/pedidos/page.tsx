'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, isSizeLike, isUnicoLabel } from '@/lib/types'
import { channelLabel } from '@/lib/attribution'
import { parseMoneyUYU, saltoDePrecio } from '@/lib/parse-money'
import { MoneyInput } from '@/components/admin/MoneyInput'
import { ProduccionControls, type ProductionFields, type WeaverOption } from './Produccion'

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

// Por qué no se concretó (admin-pedidos-y-ajustes-2026-11.sql), con las mismas
// categorías que la planilla de research/decision-anuncios-2026-11.md para
// poder sumar las dos. Es opcional: nunca frena el cambio de estado.
type NoConcretoMotivo = 'precio' | 'envio' | 'talle' | 'pago' | 'no_contesto' | 'otro'

const MOTIVOS: Array<{ value: NoConcretoMotivo; label: string }> = [
  { value: 'precio', label: 'Precio' },
  { value: 'envio', label: 'Envío' },
  { value: 'talle', label: 'Talle o medidas' },
  { value: 'pago', label: 'Forma de pago' },
  { value: 'no_contesto', label: 'No contestó' },
  { value: 'otro', label: 'Otro' },
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
  // Seguimiento y producción (seguimiento-pedidos-2026-10.sql)
  tracking_code?: ProductionFields['tracking_code']
  stage?: ProductionFields['stage']
  weaver_id?: ProductionFields['weaver_id']
  weaver_pay_uyu?: ProductionFields['weaver_pay_uyu']
  weaver_paid?: ProductionFields['weaver_paid']
  // Venta confirmada y motivo (admin-pedidos-y-ajustes-2026-11.sql)
  purchase_value_uyu?: number | null
  no_concreto_motivo?: NoConcretoMotivo | null
}

const DAY = 86_400_000
// Un pedido sin marcar a las 48 h pide seguimiento: es el plazo que recomienda
// research/decision-anuncios-2026-11.md. El menú del admin cuenta los mismos.
const SEGUIMIENTO_MS = 48 * 3_600_000

/** Lo vendido de verdad: el monto que Anush confirmó al marcarlo, o el total del pedido. */
const montoVendido = (o: OrderRow) => Number(o.purchase_value_uyu ?? o.total_uyu) || 0

/** PostgREST responde PGRST204 (o 42703) por una columna que no existe: el SQL sin correr. */
function faltaColumna(error: { code?: string; message?: string } | null): boolean {
  return !!error && (error.code === 'PGRST204' || error.code === '42703' || /purchase_value_uyu|no_concreto_motivo/.test(error.message ?? ''))
}

/** Que el menú del admin recuente los pedidos sin respuesta (AdminChrome). */
const avisarAlMenu = () => window.dispatchEvent(new Event('admin:pendientes'))

function sinClave<T>(map: Record<string, T>, key: string): Record<string, T> {
  const next = { ...map }
  delete next[key]
  return next
}

/** El mensaje para retomar la charla. Lleva el código PED, que en WhatsApp
 *  sirve para encontrar el chat: el primer mensaje de la clienta lo trae. */
function mensajeSeguimiento(o: OrderRow): string {
  // "talle M", pero un modelo va solo entre paréntesis: "Pulseras Terra talle
  // Con caracolas" no se le manda a nadie (NEG-5).
  const variante = (size: string) => (isSizeLike(size) ? ` talle ${size}` : ` (${size})`)
  const prendas = (Array.isArray(o.items) ? o.items : [])
    .filter((it) => it?.name)
    .map((it) => `${it.name}${it.size && !isUnicoLabel(it.size) ? variante(it.size) : ''}${(it.qty ?? 1) > 1 ? ` x${it.qty}` : ''}`)
    .join(', ')
  const pedido = [o.tracking_code, prendas ? `(${prendas})` : ''].filter(Boolean).join(' ')
  return `Hola! ¿Cómo estás? Te escribo por tu pedido${pedido ? ` ${pedido}` : ''}. ¿Pudiste verlo? Si te quedó alguna duda con el envío o el pago, te ayudo 🧶`
}

interface MetaEstado { texto: string; reintentar?: boolean }

/** Lo que contestó /api/admin/meta-compra, en palabras del panel. */
function estadoMeta(r: { sent?: boolean; motivo?: string } | null): MetaEstado {
  if (r?.sent) return { texto: 'Meta: compra avisada ✓' }
  if (r?.motivo === 'ya avisado') return { texto: 'Meta: ya estaba avisada' }
  if (r?.motivo === 'sin token de Meta') return { texto: 'Meta: sin token, no se manda' }
  if (r?.motivo === 'no está vendido') return { texto: 'Meta: no se mandó, el pedido ya no figura como vendido' }
  return { texto: 'Meta: no respondió', reintentar: true }
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
  const [statusError, setStatusError] = useState<string | null>(null)
  // Momento de la última carga: "los últimos 30 días" se cuentan desde ahí
  // (llamar a Date.now() durante el render lo prohíbe la regla de pureza).
  const [loadedAt, setLoadedAt] = useState(0)
  // Tejedoras a las que se les puede asignar un pedido (aprobadas o a prueba).
  const [weavers, setWeavers] = useState<WeaverOption[]>([])
  // "Vendido" elegido y todavía sin confirmar: el monto que se está escribiendo.
  const [venta, setVenta] = useState<Record<string, string>>({})
  const [guardandoVenta, setGuardandoVenta] = useState<string | null>(null)
  // Lo que contestó el aviso a Meta en esta visita, por pedido.
  const [meta, setMeta] = useState<Record<string, MetaEstado>>({})
  const [copiado, setCopiado] = useState<string | null>(null)

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
      const { data: ws } = await supabase.from('weaver_applications').select('id, name').in('status', ['approved', 'sample']).order('name')
      setWeavers((ws ?? []) as WeaverOption[])
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
  const hasTracking = orders.some((o) => o.stage !== undefined)
  const hasVenta = orders.some((o) => o.purchase_value_uyu !== undefined)
  const hasMotivo = orders.some((o) => o.no_concreto_motivo !== undefined)

  // "Sin marcar" y "No se concretó" se guardan al elegirlos; "Vendido" pide
  // antes el monto (confirmarVenta).
  const updateStatus = async (id: string, status: OrderStatus) => {
    setStatusError(null)
    const before = orders.find((o) => o.id === id)
    if (!before) return
    // El motivo de "no se concretó" no queda colgado si el pedido cambia de estado.
    const patch: Partial<OrderRow> = { status, ...(status !== 'no_concreto' && before.no_concreto_motivo ? { no_concreto_motivo: null } : {}) }
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)))
    const { data, error: err } = await createClient().from('orders').update(patch).eq('id', id).select('id')
    // Sin la policy de UPDATE, la base no da error: devuelve 0 filas.
    if (err || !data || data.length === 0) {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: before.status, no_concreto_motivo: before.no_concreto_motivo } : o)))
      setStatusError('No se pudo guardar el estado. Revisá que se haya corrido database/embudo-pedidos-2026-09.sql en Supabase.')
      return
    }
    avisarAlMenu()
  }

  const elegirEstado = (o: OrderRow, value: OrderStatus) => {
    const actual = o.status ?? 'nuevo'
    if (value === 'vendido' && actual !== 'vendido') {
      // Primero se confirma cuánto se cobró: es lo que le llega a Meta.
      setVenta((prev) => ({ ...prev, [o.id]: String(o.purchase_value_uyu ?? o.total_uyu ?? '') }))
      return
    }
    setVenta((prev) => sinClave(prev, o.id))
    if (value !== actual) updateStatus(o.id, value)
  }

  // La venta, a Meta (lib/purchase.ts), con lo que contestó a la vista. Antes
  // salía sin esperar y sin mirar la respuesta: "sin token" o un error de Meta
  // no llegaban nunca al panel.
  const avisarMeta = async (id: string) => {
    setMeta((prev) => ({ ...prev, [id]: { texto: 'Meta: avisando…' } }))
    let r: { sent?: boolean; motivo?: string } | null = null
    try {
      const res = await fetch('/api/admin/meta-compra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) r = await res.json()
    } catch { /* sin red: queda "no respondió", con Reintentar */ }
    setMeta((prev) => ({ ...prev, [id]: estadoMeta(r) }))
  }

  const confirmarVenta = async (o: OrderRow) => {
    const monto = parseMoneyUYU(venta[o.id] ?? '')
    if (monto == null) return
    // Un tipeo ("17" por "1700") quedaría para siempre en Meta: se pregunta una
    // vez. Sin el SQL el monto no se usa, así que no hay nada que preguntar.
    const salto = hasVenta ? saltoDePrecio(Number(o.total_uyu) || null, monto) : null
    if (salto && !window.confirm(`¿Seguro? El monto ${salto}. Es lo que le llega a Meta como venta.`)) return
    setStatusError(null)
    setGuardandoVenta(o.id)
    const db = createClient()
    let guardado: Partial<OrderRow> = {
      status: 'vendido',
      ...(hasVenta ? { purchase_value_uyu: monto } : {}),
      ...(o.no_concreto_motivo ? { no_concreto_motivo: null } : {}),
    }
    let res = await db.from('orders').update(guardado).eq('id', o.id).select('id')
    const sinColumna = faltaColumna(res.error)
    if (sinColumna) {
      // Sin admin-pedidos-y-ajustes-2026-11.sql se marca igual, como antes, y a
      // Meta le llega el total del pedido.
      guardado = { status: 'vendido' }
      res = await db.from('orders').update(guardado).eq('id', o.id).select('id')
    }
    setGuardandoVenta(null)
    if (res.error || !res.data || res.data.length === 0) {
      setStatusError('No se pudo guardar la venta. Probá de nuevo; si sigue, revisá que se haya corrido database/embudo-pedidos-2026-09.sql en Supabase.')
      return
    }
    if (sinColumna) setStatusError('La venta quedó marcada, pero el monto no se guardó: falta correr database/admin-pedidos-y-ajustes-2026-11.sql en Supabase.')
    setOrders((prev) => prev.map((x) => (x.id === o.id ? { ...x, ...guardado } : x)))
    setVenta((prev) => sinClave(prev, o.id))
    avisarAlMenu()
    await avisarMeta(o.id)
  }

  const guardarMotivo = async (o: OrderRow, value: string) => {
    const motivo = (value || null) as NoConcretoMotivo | null
    const previo = o.no_concreto_motivo ?? null
    setStatusError(null)
    setOrders((prev) => prev.map((x) => (x.id === o.id ? { ...x, no_concreto_motivo: motivo } : x)))
    const { data, error: err } = await createClient().from('orders').update({ no_concreto_motivo: motivo }).eq('id', o.id).select('id')
    if (err || !data || data.length === 0) {
      setOrders((prev) => prev.map((x) => (x.id === o.id ? { ...x, no_concreto_motivo: previo } : x)))
      setStatusError('No se pudo guardar el motivo. Probá de nuevo.')
    }
  }

  // Ningún mensaje sale solo: Anush lo copia y lo pega en el chat si quiere.
  const copiarSeguimiento = async (o: OrderRow) => {
    const text = mensajeSeguimiento(o)
    try {
      await navigator.clipboard.writeText(text)
      setCopiado(o.id)
    } catch {
      // Sin portapapeles (permisos, navegador viejo): el texto queda a mano.
      window.prompt('Copiá este mensaje:', text)
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
      row.monto += montoVendido(o)
    }
    return m.set(ch, row)
  }, new Map<string, { pedidos: number; vendidos: number; monto: number }>())]
    .sort((a, b) => b[1].vendidos - a[1].vendidos || b[1].pedidos - a[1].pedidos)

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>Pedidos enviados</h2>
          <p>Cada vez que alguien toca &quot;Coordinar por WhatsApp&quot; queda una foto del pedido acá, con su código (el mismo que la clienta ve en su mensaje). Marcá si se vendió, en qué etapa está (la clienta la ve en dahila.uy/pedido) y quién lo teje.</p>
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
                  <div className="stat-sub">{formatPrice(sold.reduce((s, o) => s + montoVendido(o), 0))} en total</div>
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
          {hasStatus && !hasVenta && (
            <div className="admin-card" style={{ marginBottom: 14, fontSize: 13, color: '#4A4143' }}>
              Para guardar cuánto cobraste en cada venta y por qué no se concretó un pedido, corré
              {' '}<code>database/admin-pedidos-y-ajustes-2026-11.sql</code> en el SQL Editor de Supabase.
              Mientras tanto, a Meta le llega el total del pedido, y si volvés a marcar uno como vendido
              la venta puede contarse dos veces.
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
            // "Vendido" elegido y todavía sin confirmar el monto: el selector ya
            // lo muestra, pero en la base sigue como estaba.
            const pendiente = venta[o.id]
            const shown = pendiente !== undefined ? STATUS_OPTIONS[1] : current
            const guardando = guardandoVenta === o.id
            // Sin marcar a las 48 h: se resalta, con el mensaje para retomar la charla.
            const seguir = hasStatus && current.value === 'nuevo' && pendiente === undefined
              && loadedAt - new Date(o.created_at).getTime() > SEGUIMIENTO_MS
            const metaEstado = current.value === 'vendido' ? meta[o.id] : undefined
            return (
              <article key={o.id} className="admin-card" style={seguir ? { borderColor: 'rgba(143,59,83,0.35)' } : undefined}>
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
                        value={shown.value}
                        onChange={(e) => elegirEstado(o, e.target.value as OrderStatus)}
                        disabled={guardando}
                        style={{
                          fontSize: 12, padding: '4px 8px', borderRadius: 6,
                          border: '1px solid rgba(31,26,27,0.18)', background: '#fff', color: shown.color,
                        }}
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    )}
                    <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#1F1A1B' }}>{formatPrice(o.total_uyu)}</strong>
                  </div>
                </header>

                {seguir && (
                  <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between',
                    background: '#FAF1DF', borderRadius: 10, padding: '10px 12px', marginBottom: 12, fontSize: 13, color: '#4A4143',
                  }}>
                    <span>Llegó hace más de 48 h y sigue sin marcar. Si la charla quedó en el aire, escribile.</span>
                    {/* No "Copiar mensaje de seguimiento": ese botón ya está abajo,
                        en Producción, y manda el link para seguir el pedido. */}
                    <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => copiarSeguimiento(o)}>
                      Copiar mensaje para retomar la charla
                    </button>
                    {copiado === o.id && (
                      <span role="status" style={{ flexBasis: '100%', fontSize: 12.5, color: '#2e7d32' }}>
                        Mensaje copiado: pegalo en el chat de la clienta.
                      </span>
                    )}
                  </div>
                )}

                {pendiente !== undefined && (
                  <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end',
                    background: '#FCFAF6', border: '1px solid rgba(31,26,27,0.10)', borderRadius: 10, padding: 12, marginBottom: 12,
                  }}>
                    <div className="admin-field" style={{ flex: '1 1 200px', maxWidth: 280 }}>
                      <MoneyInput
                        id={`venta-${o.id}`}
                        label="Monto de las prendas (sin envío)"
                        value={pendiente}
                        onChange={(v) => setVenta((prev) => ({ ...prev, [o.id]: v }))}
                        disabled={guardando}
                      />
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      <button
                        type="button"
                        className="admin-btn admin-btn-primary admin-btn-sm"
                        disabled={guardando || parseMoneyUYU(pendiente) == null}
                        onClick={() => confirmarVenta(o)}
                      >
                        {guardando ? 'Guardando…' : 'Confirmar venta'}
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        disabled={guardando}
                        onClick={() => setVenta((prev) => sinClave(prev, o.id))}
                      >
                        Cancelar
                      </button>
                    </div>
                    <p style={{ flexBasis: '100%', margin: 0, fontSize: 12.5, color: '#5B5356' }}>
                      {hasVenta
                        ? 'Lo que cobraste por las prendas, sin el envío. Es lo que le llega a Meta como venta, una sola vez.'
                        : 'Todavía no se guarda: falta correr database/admin-pedidos-y-ajustes-2026-11.sql, y mientras tanto a Meta le llega el total del pedido.'}
                    </p>
                  </div>
                )}

                {metaEstado && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 12, fontSize: 12.5 }}>
                    <span role="status" style={{ color: metaEstado.reintentar ? '#7a1e2f' : '#4A4143' }}>{metaEstado.texto}</span>
                    {metaEstado.reintentar && (
                      <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => avisarMeta(o.id)}>
                        Reintentar
                      </button>
                    )}
                  </div>
                )}

                {hasMotivo && current.value === 'no_concreto' && (
                  <label style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 12.5, color: '#4A4143' }}>
                    ¿Por qué no se concretó? (opcional)
                    <select
                      value={o.no_concreto_motivo ?? ''}
                      onChange={(e) => guardarMotivo(o, e.target.value)}
                      style={{ fontSize: 12, padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(31,26,27,0.18)', background: '#fff' }}
                    >
                      <option value="">Sin anotar</option>
                      {MOTIVOS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </label>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {items.map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontSize: '0.88rem' }}>
                      <span style={{ color: '#1F1A1B' }}>{it.name} <span style={{ color: '#8C8285' }}>· Talle {it.size} · x{it.qty}</span></span>
                      <span style={{ color: '#1F1A1B', flexShrink: 0 }}>{formatPrice(it.unit_price_uyu * it.qty)}</span>
                    </div>
                  ))}
                </div>

                {hasTracking && o.status !== 'no_concreto' && (
                  <ProduccionControls
                    order={o}
                    weavers={weavers}
                    onChange={(patch) => setOrders((prev) => prev.map((x) => (x.id === o.id ? { ...x, ...patch } : x)))}
                  />
                )}

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
