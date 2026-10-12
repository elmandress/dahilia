import type { Metadata } from 'next'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCatalog } from '@/lib/catalog'
import { dahila } from '@/components/ui/tokens'
import { ORDER_STAGES, ORDER_CODE_RE, normalizeOrderCode, stageIndex } from '@/lib/order-tracking'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Seguí tu pedido',
  description: 'Ingresá el código de tu pedido para ver en qué etapa está.',
  alternates: { canonical: '/pedido' },
  robots: { index: false, follow: false },
}

/**
 * /pedido (12/10/2026): seguimiento de los pedidos de la tienda, hermano de
 * /encargo/estado. El código (PED-XXXXXX) va en el mensaje de WhatsApp del
 * pedido. Página de servidor sin JavaScript propio: un formulario GET y el
 * resultado. Muestra SOLO la etapa y las prendas (nada de tejedora, pagos ni
 * notas de regalo). Lee con la clave de servicio porque `orders` no es
 * pública; el código tiene ~1.000 millones de combinaciones.
 */
export default async function PedidoPage({ searchParams }: { searchParams: Promise<{ codigo?: string }> }) {
  const { codigo = '' } = await searchParams
  const code = codigo ? normalizeOrderCode(codigo) : ''
  const { settings } = await getCatalog()
  const wa = (settings.contact_whatsapp_url?.trim() || 'https://wa.me/59899850073').replace(/\/+$/, '')

  type Row = { tracking_code: string; created_at: string; status: string | null; stage: string | null; stage_updated_at: string | null; items: Array<{ name: string; size: string; qty: number }> | null }
  let order: Row | null = null
  let lookupError = false
  if (code && ORDER_CODE_RE.test(code)) {
    const db = createAdminClient()
    if (db) {
      const { data, error } = await db.from('orders')
        .select('tracking_code, created_at, status, stage, stage_updated_at, items')
        .eq('tracking_code', code).maybeSingle()
      if (error) lookupError = true
      order = (data as Row | null) ?? null
    } else lookupError = true
  }

  const label: React.CSSProperties = { fontFamily: dahila.fontSans, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: dahila.ink500 }
  const body: React.CSSProperties = { fontFamily: dahila.fontSans, fontSize: 14.5, fontWeight: 300, lineHeight: 1.6, color: dahila.ink700 }
  const fmt = (iso: string) => new Date(iso).toLocaleDateString('es-UY', { day: 'numeric', month: 'long', timeZone: 'America/Montevideo' })

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '48px 24px 80px' }}>
      <span style={label}>Seguimiento</span>
      <h1 style={{ fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 'clamp(28px, 5vw, 40px)', lineHeight: 1.05, color: dahila.ink900, margin: '10px 0 8px' }}>
        Seguí tu pedido
      </h1>
      <p style={{ ...body, margin: '0 0 22px' }}>
        El código está al final del mensaje de WhatsApp de tu pedido (ej. PED-K7Q2MX).
      </p>

      <form method="get" action="/pedido" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
        <label htmlFor="codigo" className="sr-only">Código de pedido</label>
        <input
          id="codigo" name="codigo" defaultValue={code} required autoComplete="off" autoCapitalize="characters"
          placeholder="PED-XXXXXX" maxLength={12}
          style={{ flex: '1 1 200px', minHeight: 48, padding: '10px 14px', borderRadius: 10, border: `1px solid ${dahila.borderStrong}`, fontFamily: dahila.fontSans, fontSize: 16, letterSpacing: '0.06em', color: dahila.ink900, background: '#fff' }}
        />
        <button type="submit" className="dh-btn" style={{ minHeight: 48, padding: '0 22px', borderRadius: 10, border: 'none', background: dahila.ink900, color: '#fff', fontFamily: dahila.fontSans, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
          Ver estado
        </button>
      </form>

      {code && !order && (
        <div role="status" style={{ background: dahila.cream100, borderRadius: 14, padding: '20px 22px' }}>
          <p style={{ ...body, margin: 0 }}>
            {lookupError
              ? 'No pudimos buscar tu pedido ahora. Probá de nuevo en un rato.'
              : <>No encontramos el pedido <strong style={{ fontWeight: 500 }}>{code}</strong>. Revisá el código, o{' '}
                <a href={`${wa}?text=${encodeURIComponent(`Hola! Quiero saber cómo va mi pedido ${code}.`)}`} target="_blank" rel="noopener noreferrer" style={{ color: dahila.wine600 }}>escribime por WhatsApp</a>.</>}
          </p>
        </div>
      )}

      {order && (order.status === 'no_concreto' ? (
        <div role="status" style={{ background: dahila.cream100, borderRadius: 14, padding: '20px 22px' }}>
          <p style={{ ...body, margin: 0 }}>
            Este pedido quedó sin concretar. Si lo querés retomar,{' '}
            <a href={`${wa}?text=${encodeURIComponent(`Hola! Quiero retomar mi pedido ${order.tracking_code}.`)}`} target="_blank" rel="noopener noreferrer" style={{ color: dahila.wine600 }}>escribime por WhatsApp</a>.
          </p>
        </div>
      ) : (
        <section aria-label={`Estado del pedido ${order.tracking_code}`}>
          <p style={{ ...body, margin: '0 0 18px' }}>
            Pedido <strong style={{ fontWeight: 500 }}>{order.tracking_code}</strong>, del {fmt(order.created_at)}
            {order.stage_updated_at ? ` · actualizado el ${fmt(order.stage_updated_at)}` : ''}.
          </p>
          <ol style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
            {ORDER_STAGES.map((s, i) => {
              const cur = stageIndex(order!.stage)
              const reached = i <= cur
              const now = i === cur
              return (
                <li key={s.key} aria-current={now ? 'step' : undefined} style={{ display: 'flex', gap: 14, paddingBottom: i < ORDER_STAGES.length - 1 ? 16 : 0 }}>
                  <span aria-hidden style={{
                    flexShrink: 0, width: 26, height: 26, borderRadius: 999, marginTop: 1,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: dahila.fontSans, fontSize: 12,
                    background: reached ? dahila.ink900 : '#fff', color: reached ? '#fff' : dahila.ink500,
                    border: `1px solid ${reached ? dahila.ink900 : dahila.borderStrong}`,
                  }}>{reached && !now ? '✓' : i + 1}</span>
                  <span>
                    <strong style={{ display: 'block', fontFamily: dahila.fontSans, fontWeight: now ? 600 : 500, fontSize: 15, color: reached ? dahila.ink900 : dahila.ink500 }}>{s.label}</strong>
                    {now && <span style={{ ...body, fontSize: 14 }}>{s.blurb}</span>}
                  </span>
                </li>
              )
            })}
          </ol>
          {Array.isArray(order.items) && order.items.length > 0 && (
            <div style={{ borderTop: `1px solid ${dahila.border}`, paddingTop: 16 }}>
              <span style={label}>Tu pedido</span>
              <ul style={{ ...body, margin: '8px 0 0', paddingLeft: 18 }}>
                {order.items.map((it, i) => <li key={i}>{it.name} · talle {it.size}{it.qty > 1 ? ` · x${it.qty}` : ''}</li>)}
              </ul>
            </div>
          )}
          <p style={{ ...body, margin: '22px 0 0', fontSize: 13.5 }}>
            ¿Alguna duda?{' '}
            <a href={`${wa}?text=${encodeURIComponent(`Hola! Tengo una consulta sobre mi pedido ${order.tracking_code}.`)}`} target="_blank" rel="noopener noreferrer" style={{ color: dahila.wine600 }}>Escribime por WhatsApp</a>
            {' '}· <Link href="/tienda" style={{ color: dahila.wine600 }}>Seguir mirando</Link>
          </p>
        </section>
      ))}
    </div>
  )
}
