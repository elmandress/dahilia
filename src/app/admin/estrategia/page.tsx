'use client'

// Estrategia y crecimiento — la guía semanal del negocio.
// Pensada para Anush: pestañas cortas, lenguaje simple, mobile primero.
// El contenido vive en ./data.ts; lo vivo (precios, postulaciones, lista VIP,
// checklist) se lee de Supabase al montar.

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  ULTIMA_REVISION, NORTE,
  MARKET_BANDS, MARKET_REFS,
  PRICING_WHY, PRICING_RULES, HOUR_REFS, PRICE_TABLE, PRICING_PHASES, contribPerHour,
  VALUE_ACTIONS,
  WEAVER_MODELS, WEAVER_PIPELINE, WEAVER_SYSTEM,
  CLASSES_INTRO, CLASSES_START, CLASSES_PRICING, CLASSES_LEVELS, CLASSES_SELLING, CLASSES_SESSION, CLASSES_SCALE, CLASSES_COMMUNITY, CLASSES_FLYWHEEL, CLASSES_FUNNEL,
  DROP_CALENDAR, DROP_STAGES, DROP_BENCHMARKS, DROP_SITE_TOOLS,
  LOYALTY_INTRO, LOYALTY_BENCHMARKS, LOYALTY_LADDER, REFERRAL_RULES, COUPON_RECIPES, COUPON_PRINCIPLES,
  CHANNELS,
  IG_WHY_WORKING, IG_VIRAL_CHECKLIST, IG_WEEKLY,
  MERCHANT_WHY, MERCHANT_STEPS,
  NEXT_ACTIONS,
  RISKS,
  type TodoAction, type ActionItem, type PricePriority,
} from './data'
import Calculadora from './Calculadora'
import './estrategia.css'

const PROGRESS_KEY = 'estrategia_progress'

type TabId = 'resumen' | 'precios' | 'calculadora' | 'tejedoras' | 'clases' | 'clientas' | 'drops' | 'canales' | 'riesgos'

const TABS: Array<[TabId, string]> = [
  ['resumen', 'Resumen'],
  ['precios', 'Precios'],
  ['calculadora', 'Calculadora'],
  ['tejedoras', 'Tejedoras'],
  ['clases', 'Clases'],
  ['clientas', 'Clientas'],
  ['drops', 'Drops'],
  ['canales', 'Canales'],
  ['riesgos', 'Riesgos'],
]

const PRIO_LABEL: Record<PricePriority, string> = {
  urgente: 'Urgente', alta: 'Alta', media: 'Media', baja: 'Baja', hold: 'No tocar',
}

const money = (n: number) => `$${n.toLocaleString('es-UY')}`

// Posición porcentual en escala logarítmica para el gráfico de bandas.
const LOG_MIN = Math.log(300)
const LOG_MAX = Math.log(15000)
const logPos = (v: number) => ((Math.log(v) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * 100

function SectionHead({ kicker, title, desc }: { kicker?: string; title: string; desc?: string }) {
  return (
    <div className="est-section-head">
      {kicker && <span className="est-kicker">{kicker}</span>}
      <h3>{title}</h3>
      {desc && <p>{desc}</p>}
    </div>
  )
}

export default function EstrategiaPage() {
  const [tab, setTab] = useState<TabId>('resumen')
  const [livePrices, setLivePrices] = useState<Record<string, number | null>>({})
  const [weaverCount, setWeaverCount] = useState<number | null>(null)
  const [vipCount, setVipCount] = useState<number | null>(null)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  const load = useCallback(async () => {
    const supabase = createClient()
    const [productsRes, weaversRes, vipRes, progressRes] = await Promise.all([
      supabase.from('products').select('slug, base_price_uyu'),
      supabase.from('weaver_applications').select('id', { count: 'exact', head: true }),
      supabase.from('subscribers').select('id', { count: 'exact', head: true }),
      supabase.from('site_settings').select('value').eq('key', PROGRESS_KEY).maybeSingle(),
    ])

    const prices: Record<string, number | null> = {}
    for (const p of (productsRes.data ?? []) as Array<{ slug: string; base_price_uyu: number | null }>) {
      prices[p.slug] = p.base_price_uyu
    }
    setLivePrices(prices)
    setWeaverCount(weaversRes.error ? null : (weaversRes.count ?? 0))
    setVipCount(vipRes.error ? null : (vipRes.count ?? 0))

    try {
      const parsed = progressRes.data?.value ? JSON.parse(String(progressRes.data.value)) : {}
      if (parsed && typeof parsed === 'object') setChecked(parsed as Record<string, boolean>)
    } catch { /* valor corrupto → arrancar de cero */ }

    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const toggle = async (id: string) => {
    const next = { ...checked, [id]: !checked[id] }
    setChecked(next)
    const supabase = createClient()
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: PROGRESS_KEY, value: JSON.stringify(next) }, { onConflict: 'key' })
    if (error) {
      setChecked(checked)
      showToast('No se pudo guardar. Probá de nuevo.')
    }
  }

  // Estado vivo de los precios: "aplicado" si el precio en la tienda coincide
  // con el aprobado.
  const priceRows = PRICE_TABLE.filter((r) => r.today != null)
  const appliedCount = priceRows.filter((r) => livePrices[r.slug] != null && livePrices[r.slug] === r.today).length
  const pricesApplied = priceRows.length > 0 && appliedCount === priceRows.length

  const currentMonth = new Date().getMonth() + 1
  const nextDrop = DROP_CALENDAR.find((d) => d.month >= currentMonth) ?? DROP_CALENDAR[0]

  const doneCount = NEXT_ACTIONS.filter((a) => checked[a.id]).length

  const renderCheckItem = (a: ActionItem) => (
    <label key={a.id} className={`est-check ${checked[a.id] ? 'done' : ''}`}>
      <input
        type="checkbox"
        checked={!!checked[a.id]}
        onChange={() => toggle(a.id)}
        aria-label={a.label}
      />
      <span className="txt">
        <span className="t">{a.label}</span>
        <span className="d" style={{ display: 'block' }}>{a.detail}</span>
      </span>
    </label>
  )

  const renderTodoGroup = (title: string, items: TodoAction[]) =>
    items.length > 0 && (
      <div style={{ marginBottom: '1.1rem' }}>
        <div className="est-group-label">{title}</div>
        <div className="est-checklist">{items.map(renderCheckItem)}</div>
      </div>
    )

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
      </div>
    )
  }

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h2>Estrategia y crecimiento</h2>
          <p>La guía del negocio · actualizada en {ULTIMA_REVISION}</p>
        </div>
      </div>

      {toast && (
        <div role="status" style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 100,
          background: '#1F1A1B', color: '#fff', borderRadius: 10,
          padding: '12px 18px', fontSize: '0.85rem', boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        }}>{toast}</div>
      )}

      {/* Pestañas */}
      <nav className="est-tabs" aria-label="Secciones de la estrategia">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={tab === id ? 'active' : ''}
            aria-current={tab === id ? 'true' : undefined}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* ══ RESUMEN ══ */}
      {tab === 'resumen' && (
        <section aria-label="Resumen">
          <div className="est-north">
            <span className="est-kicker">El norte</span>
            <blockquote>{NORTE}</blockquote>
            <div className="est-north-meta">Cada decisión de precio, producto o canal se mide contra esta frase.</div>
          </div>

          <div className="est-stats" style={{ marginBottom: '2rem' }}>
            <div className="est-stat">
              <div className="value">{pricesApplied ? '✓' : `${appliedCount}/${priceRows.length}`}</div>
              <div className="label">{pricesApplied ? 'Precios nuevos aplicados' : 'aumentos aplicados'}</div>
              <div className="sub">{pricesApplied ? 'Todo el catálogo al precio aprobado' : 'Detalle en la pestaña Precios'}</div>
            </div>
            <div className="est-stat">
              <div className="value">{weaverCount ?? '—'}</div>
              <div className="label">postulaciones de tejedoras</div>
              <div className="sub"><Link href="/admin/tejedoras" style={{ color: '#8F3B53' }}>Ver bandeja →</Link></div>
            </div>
            <div className="est-stat">
              <div className="value">{vipCount ?? '—'}</div>
              <div className="label">anotadas en la lista VIP</div>
              <div className="sub"><Link href="/admin/suscriptores" style={{ color: '#8F3B53' }}>Ver lista →</Link></div>
            </div>
          </div>

          <div className="est-callout" style={{ marginBottom: '2rem' }}>
            <strong>Próximo drop: {nextDrop.name} ({nextDrop.monthLabel}).</strong>{' '}
            {nextDrop.hook}. El paso a paso completo está en la pestaña Drops.
          </div>

          <SectionHead
            title="Para hacer"
            desc={`Lo importante, en orden. Marcá lo que termines — queda guardado. (${doneCount}/${NEXT_ACTIONS.length} hechas)`}
          />
          {renderTodoGroup('Ahora', NEXT_ACTIONS.filter((a) => a.horizon === 'ya'))}
          {renderTodoGroup('Este mes', NEXT_ACTIONS.filter((a) => a.horizon === 'mes'))}
          {renderTodoGroup('Próximos meses', NEXT_ACTIONS.filter((a) => a.horizon === 'trimestre'))}
        </section>
      )}

      {/* ══ PRECIOS ══ */}
      {tab === 'precios' && (
        <section aria-label="Precios">
          <SectionHead
            kicker="Por qué suben unos antes que otros"
            title="La regla del valor por hora"
          />
          <div className="est-callout" style={{ marginBottom: '1.25rem' }}>{PRICING_WHY}</div>

          <div className="est-stats" style={{ marginBottom: '2rem' }}>
            {HOUR_REFS.map((s) => (
              <div key={s.label} className="est-stat">
                <div className="value wine">{s.value}</div>
                <div className="label">{s.label}</div>
                <div className="sub">{s.sub}</div>
              </div>
            ))}
          </div>

          <SectionHead title="Las 5 reglas de tus precios" />
          <div className="est-grid" style={{ marginBottom: '2rem' }}>
            {PRICING_RULES.map((r) => (
              <div key={r.title} className="est-card cream">
                <h4>{r.title}</h4>
                <p>{r.body}</p>
              </div>
            ))}
          </div>

          <SectionHead
            title="Dónde está Dahila en el mercado"
            desc="Precios reales relevados en Uruguay (la barra granate sos vos):"
          />
          <div className="est-card" style={{ marginBottom: '1rem' }}>
            <div className="est-bands">
              {MARKET_BANDS.map((b) => {
                const left = logPos(b.min)
                const width = Math.max(logPos(b.max) - left, 6)
                return (
                  <div key={b.name} className={`est-band ${b.self ? 'self' : ''}`}>
                    <div className="name">
                      {b.name}
                      <small>{b.detail}</small>
                    </div>
                    <div className="track">
                      <div className="range" style={{ left: `${left}%`, width: `${width}%` }}>
                        {money(b.min)}–{money(b.max)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="est-grid" style={{ marginBottom: '2rem' }}>
            {MARKET_REFS.map((r) => (
              <div key={r.name} className="est-card">
                <div className="est-card-top">
                  <h4>{r.name}</h4>
                  <span className="est-badge prio-hold">{r.price}</span>
                </div>
                <p>{r.lesson}</p>
              </div>
            ))}
          </div>

          <SectionHead
            title="La tabla, producto por producto"
            desc={'"$/h" es lo que te queda por hora de trabajo (precio menos materiales, dividido las horas). "Meta 12m" es el precio a alcanzar en un año, de a pasos.'}
          />
          <div style={{ marginBottom: '0.75rem' }}>
            <span className={`est-badge ${pricesApplied ? 'ok' : 'pend'}`}>
              {pricesApplied
                ? '✓ Los precios aprobados están aplicados en la tienda'
                : `${appliedCount}/${priceRows.length} aplicados en la tienda`}
            </span>
          </div>

          {/* Escritorio: tabla */}
          <div className="admin-card est-only-desktop" style={{ marginBottom: '1rem' }}>
            <div className="admin-table-wrap">
              <table className="admin-table est-price-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Horas</th>
                    <th>Antes</th>
                    <th>Ahora</th>
                    <th>Meta 12m</th>
                    <th>$/h ahora</th>
                    <th>$/h meta</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {PRICE_TABLE.map((r) => {
                    const live = livePrices[r.slug]
                    const applied = r.today != null && live != null && live === r.today
                    const phNow = contribPerHour(r, r.today ?? r.before)
                    const phTarget = contribPerHour(r, r.target)
                    return (
                      <tr key={r.slug}>
                        <td className="name-cell">
                          <span className={`est-dot prio-${r.priority}`} title={`Prioridad: ${PRIO_LABEL[r.priority]}`} />
                          {r.name}
                          {r.note && <small>{r.note}</small>}
                        </td>
                        <td>{r.hours != null ? `${r.hours} h` : '—'}</td>
                        <td style={{ color: '#8C8285' }}>{money(r.before)}</td>
                        <td>{r.today != null ? <span className="up">{money(r.today)}</span> : money(r.before)}</td>
                        <td>{r.target != null ? money(r.target) : '—'}</td>
                        <td>{phNow != null ? money(phNow) : '—'}</td>
                        <td>{phTarget != null ? <span className="up">{money(phTarget)}</span> : '—'}</td>
                        <td>
                          {r.today == null
                            ? <span className="est-badge prio-hold">No tocar</span>
                            : applied
                              ? <span className="est-badge ok">✓</span>
                              : <span className="est-badge pend">Pendiente</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Móvil: tarjetas */}
          <div className="est-price-cards est-only-mobile" style={{ marginBottom: '1rem' }}>
            {PRICE_TABLE.map((r) => {
              const live = livePrices[r.slug]
              const applied = r.today != null && live != null && live === r.today
              const phNow = contribPerHour(r, r.today ?? r.before)
              const phTarget = contribPerHour(r, r.target)
              return (
                <div key={r.slug} className="est-price-card">
                  <div className="row1">
                    <span className="pname">
                      <span className={`est-dot prio-${r.priority}`} />
                      {r.name}
                    </span>
                    {r.today == null
                      ? <span className="est-badge prio-hold">No tocar</span>
                      : applied
                        ? <span className="est-badge ok">✓</span>
                        : <span className="est-badge pend">Pendiente</span>}
                  </div>
                  <div className="row2">
                    <span className="was">{money(r.before)}</span>
                    <span className="arrow" aria-hidden="true">→</span>
                    <span className="now">{r.today != null ? money(r.today) : money(r.before)}</span>
                    {r.target != null && <span className="target">meta {money(r.target)}</span>}
                  </div>
                  <div className="row3">
                    {r.hours != null && <span>{r.hours} h de trabajo</span>}
                    {phNow != null && <span>{money(phNow)}/h ahora</span>}
                    {phTarget != null && <span>{money(phTarget)}/h en la meta</span>}
                  </div>
                  {r.note && <div className="pnote">{r.note}</div>}
                </div>
              )
            })}
          </div>
          <p style={{ fontSize: '0.78rem', color: '#8C8285', margin: '0 0 2rem' }}>
            Materiales y horas son estimados — ajustalos con tus números reales cuando puedas.
            El punto de color indica la prioridad con la que se decidió cada aumento.
          </p>

          <SectionHead title="El plan de los próximos 12 meses" />
          <div className="est-timeline" style={{ marginBottom: '2rem' }}>
            {PRICING_PHASES.map((p) => (
              <div key={p.title} className={`est-timeline-item ${p.done ? 'done' : ''}`}>
                <div className="when">{p.when}</div>
                <div className="title">{p.title}</div>
                <p className="body">{p.body}</p>
              </div>
            ))}
          </div>

          <SectionHead
            title="Las mejoras que acompañan los precios"
            desc="La regla dice: ningún aumento sin una mejora visible. Estas son — casi todas cuestan monedas. Marcá las que ya tengas andando."
          />
          <div className="est-checklist">{VALUE_ACTIONS.map(renderCheckItem)}</div>
        </section>
      )}

      {/* ══ CALCULADORA ══ */}
      {tab === 'calculadora' && (
        <section aria-label="Calculadora de precios">
          <SectionHead
            kicker="Herramienta"
            title="Calculadora de precios"
            desc="Para decidir el precio de una pieza nueva o revisar una existente. Cargá los datos y te recomienda un precio con la cuenta clara — nada de números mágicos."
          />
          <Calculadora livePrices={livePrices} />
        </section>
      )}

      {/* ══ TEJEDORAS ══ */}
      {tab === 'tejedoras' && (
        <section aria-label="Tejedoras">
          <SectionHead
            kicker="Crecer sin perder lo artesanal"
            title="La red de tejedoras"
            desc="Estudiamos cómo lo hacen los mejores del mundo y armamos un sistema para Dahila con lo mejor de cada uno."
          />
          <div style={{ marginBottom: '1.5rem', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="est-badge ok">✓ Página pública andando: /tejedoras</span>
            <span className="est-badge ok">✓ Aviso al mail con cada postulación</span>
            {weaverCount != null && weaverCount > 0 && (
              <Link href="/admin/tejedoras" className="est-badge pend" style={{ textDecoration: 'none' }}>
                {weaverCount} postulación{weaverCount === 1 ? '' : 'es'} para revisar →
              </Link>
            )}
          </div>

          <SectionHead title="Cuatro modelos reales, cuatro lecciones" />
          <div className="est-grid wide" style={{ marginBottom: '2rem' }}>
            {WEAVER_MODELS.map((m) => (
              <div key={m.name} className="est-card">
                <div className="est-card-top">
                  <h4>{m.name}</h4>
                  <span className="est-badge prio-hold">{m.where}</span>
                </div>
                <p style={{ marginBottom: 8 }}>{m.how}</p>
                <p style={{ fontSize: '0.8rem', color: '#8F3B53', fontWeight: 500 }}>{m.takeaway}</p>
              </div>
            ))}
          </div>

          <SectionHead title="El camino de una tejedora en Dahila" />
          <div className="est-pipeline" style={{ marginBottom: '2rem' }}>
            {WEAVER_PIPELINE.map((s, i) => (
              <div key={s.step} className="est-pipeline-step">
                <span className="num">{i + 1}</span>
                <div className="step">{s.step}</div>
                <div className="detail">{s.detail}</div>
              </div>
            ))}
          </div>

          <SectionHead title="Las reglas del sistema" />
          <div className="est-grid wide">
            {WEAVER_SYSTEM.map((c) => (
              <div key={c.title} className="est-card">
                <h4>{c.title}</h4>
                <p>{c.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══ CLASES ══ */}
      {tab === 'clases' && (
        <section aria-label="Clases">
          <SectionHead
            kicker="El mejor negocio de tu tiempo"
            title="Clases de crochet"
          />
          <div className="est-callout" style={{ marginBottom: '2rem' }}>{CLASSES_INTRO}</div>

          <SectionHead title="Cómo arrancar, en 4 pasos" />
          <div className="est-pipeline" style={{ marginBottom: '2rem' }}>
            {CLASSES_START.map((s, i) => (
              <div key={s.step} className="est-pipeline-step">
                <span className="num">{i + 1}</span>
                <div className="step">{s.step}</div>
                <div className="detail">{s.detail}</div>
              </div>
            ))}
          </div>

          <SectionHead title={CLASSES_PRICING.title} />
          <div className="est-card" style={{ marginBottom: '2rem' }}>
            <ul style={{ margin: '0 0 10px', paddingLeft: 18, fontSize: '0.85rem', color: '#5c5556', lineHeight: 1.7 }}>
              {CLASSES_PRICING.refs.map((r) => <li key={r.slice(0, 20)}>{r}</li>)}
            </ul>
            <p style={{ fontWeight: 500, color: '#1F1A1B' }}>{CLASSES_PRICING.suggestion}</p>
          </div>

          <SectionHead
            title="Los tres niveles"
            desc="Cada nivel termina con algo puesto o usado — la gente vuelve cuando termina cosas, no cuando aprende puntos sueltos."
          />
          <div className="est-grid wide" style={{ marginBottom: '2rem' }}>
            {CLASSES_LEVELS.map((l) => (
              <div key={l.level} className="est-card cream">
                <h4>{l.level}</h4>
                <p>{l.detail}</p>
              </div>
            ))}
          </div>

          <SectionHead title="Cómo se vende cada ciclo" />
          <div className="est-grid wide" style={{ marginBottom: '2rem' }}>
            {CLASSES_SELLING.map((s, i) => (
              <div key={s.slice(0, 20)} className="est-card">
                <h4>Paso {i + 1}</h4>
                <p>{s}</p>
              </div>
            ))}
          </div>

          <SectionHead
            title="El guion de un encuentro de 2 horas"
            desc="Para que enseñar no sea improvisar: el mismo esqueleto en todos los encuentros, cambia solo la técnica del proyecto."
          />
          <div className="est-timeline" style={{ marginBottom: '2rem' }}>
            {CLASSES_SESSION.map((s) => (
              <div key={s.time} className="est-timeline-item">
                <div className="when">{s.time}</div>
                <p className="body">{s.what}</p>
              </div>
            ))}
          </div>

          <SectionHead title="Cómo escala (sin quemarte)" />
          <div className="est-grid wide" style={{ marginBottom: '2rem' }}>
            {CLASSES_SCALE.map((c) => (
              <div key={c.title} className="est-card cream">
                <h4>{c.title}</h4>
                <p>{c.body}</p>
              </div>
            ))}
          </div>

          <SectionHead title="Las clases también son comunidad" />
          <div className="est-grid wide" style={{ marginBottom: '2rem' }}>
            {CLASSES_COMMUNITY.map((c) => (
              <div key={c.slice(0, 20)} className="est-card">
                <p>{c}</p>
              </div>
            ))}
          </div>

          <SectionHead
            title="De dónde salen las alumnas (el embudo)"
            desc="Cada canal que ya existe alimenta las clases sin trabajo extra."
          />
          <div className="est-pipeline" style={{ marginBottom: '2rem' }}>
            {CLASSES_FUNNEL.map((s, i) => (
              <div key={s.step} className="est-pipeline-step">
                <span className="num">{i + 1}</span>
                <div className="step">{s.step}</div>
                <div className="detail">{s.detail}</div>
              </div>
            ))}
          </div>

          <div className="est-callout"><strong>El círculo virtuoso.</strong> {CLASSES_FLYWHEEL}</div>
        </section>
      )}

      {/* ══ CLIENTAS ══ */}
      {tab === 'clientas' && (
        <section aria-label="Clientas">
          <SectionHead
            kicker="Recompra, referidos y fidelización"
            title="Que cada clienta valga por tres"
          />
          <div className="est-callout" style={{ marginBottom: '2rem' }}>{LOYALTY_INTRO}</div>

          <SectionHead title="Los números reales (para decidir sin humo)" />
          <div className="est-stats" style={{ marginBottom: '2rem' }}>
            {LOYALTY_BENCHMARKS.map((b) => (
              <div key={b.label} className="est-stat">
                <div className="value wine">{b.value}</div>
                <div className="label">{b.label}</div>
                <div className="sub">{b.sub}</div>
              </div>
            ))}
          </div>

          <SectionHead
            title="La escalera de la clienta"
            desc="Qué pasa después de cada compra. Cinco pasos, todos por WhatsApp, ninguno automático — por ahora así está bien."
          />
          <div className="est-pipeline" style={{ marginBottom: '2rem' }}>
            {LOYALTY_LADDER.map((s, i) => (
              <div key={s.step} className="est-pipeline-step">
                <span className="num">{i + 1}</span>
                <div className="step">{s.step}</div>
                <div className="detail">{s.detail}</div>
              </div>
            ))}
          </div>

          <SectionHead title="Las reglas del programa AMIGA (y los cumpleaños)" />
          <div className="est-grid wide" style={{ marginBottom: '2rem' }}>
            {REFERRAL_RULES.map((r) => (
              <div key={r.title} className="est-card">
                <h4>{r.title}</h4>
                <p>{r.body}</p>
              </div>
            ))}
          </div>

          <SectionHead
            title="El recetario de cupones"
            desc="Cada campaña con su receta exacta. Todos se crean en el módulo Cupones — nada nuevo que aprender."
          />
          <div className="est-grid wide" style={{ marginBottom: '1rem' }}>
            {COUPON_RECIPES.map((r) => (
              <div key={r.name} className="est-card cream">
                <div className="est-card-top">
                  <h4 style={{ letterSpacing: '0.04em' }}>{r.name}</h4>
                </div>
                <p style={{ marginBottom: 8, fontSize: '0.8rem', color: '#8F3B53', fontWeight: 500 }}>{r.when}</p>
                <p>{r.how}</p>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: '2rem' }}>
            <Link href="/admin/cupones" className="admin-btn admin-btn-secondary admin-btn-sm">
              Ir a crear cupones →
            </Link>
          </div>

          <SectionHead title="Las 4 reglas de oro de los descuentos" />
          <div className="est-grid wide">
            {COUPON_PRINCIPLES.map((r) => (
              <div key={r.title} className="est-card">
                <h4>{r.title}</h4>
                <p>{r.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══ DROPS ══ */}
      {tab === 'drops' && (
        <section aria-label="Drops">
          <SectionHead
            kicker="Colecciones limitadas"
            title="Drops: lanzar poco, lanzar fuerte"
            desc="Tu producto es escaso de verdad — cada lanzamiento se trabaja como un evento. Calendario del año:"
          />
          <div className="est-drops" style={{ marginBottom: '2rem' }}>
            {DROP_CALENDAR.map((d) => (
              <div key={d.name} className={`est-drop ${d.name === nextDrop.name ? 'next' : ''}`}>
                <div className="month">{d.monthLabel}{d.name === nextDrop.name ? ' · PRÓXIMO' : ''}</div>
                <div className="name">{d.name}</div>
                <div className="hook">{d.hook}</div>
              </div>
            ))}
          </div>

          <SectionHead title="El paso a paso de cada drop" />
          <div className="est-stages" style={{ marginBottom: '2rem' }}>
            {DROP_STAGES.map((s, i) => (
              <div key={s.stage} className="est-stage">
                <div className="est-stage-head">
                  <span className="num">{i + 1}</span>
                  <div>
                    <div className="stage">{s.stage}</div>
                    <div className="when">{s.when}</div>
                  </div>
                </div>
                <ul>
                  {s.items.map((it) => <li key={it.slice(0, 24)}>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>

          <SectionHead
            title="La maquinaria del sitio, paso a paso"
            desc="El sitio ya tiene todo listo para cada drop: countdown en el home, captura VIP y los estados de colección. Así se usa:"
          />
          <div className="est-pipeline" style={{ marginBottom: '2rem' }}>
            {DROP_SITE_TOOLS.map((s, i) => (
              <div key={s.step} className="est-pipeline-step">
                <span className="num">{i + 1}</span>
                <div className="step">{s.step}</div>
                <div className="detail">{s.detail}</div>
              </div>
            ))}
          </div>

          <SectionHead title="Los números reales (para planificar sin humo)" />
          <div className="est-stats">
            {DROP_BENCHMARKS.map((b) => (
              <div key={b.label} className="est-stat">
                <div className="value wine">{b.value}</div>
                <div className="label">{b.label}</div>
                <div className="sub">{b.sub}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══ CANALES ══ */}
      {tab === 'canales' && (
        <section aria-label="Canales">
          <SectionHead
            kicker="Dónde poner la energía"
            title="Los canales, en orden"
            desc="Regla de oro: no sumar un canal nuevo hasta que el anterior funcione. Instagram trae la gente; WhatsApp cierra la venta; el resto multiplica."
          />
          <div className="est-channels">
            {CHANNELS.map((c) => (
              <div key={c.channel} className="est-channel">
                <span className="rank" aria-hidden="true">{c.rank}</span>
                <div className="body">
                  <div className="head">
                    <h4>{c.channel}</h4>
                    <span className="est-badge prio-hold">{c.role}</span>
                  </div>
                  <p className="why">{c.why}</p>
                  <p className="action"><strong>Hacé esto:</strong> {c.action}</p>
                </div>
              </div>
            ))}
          </div>

          <SectionHead
            kicker="Instagram está explotando — que no se escape"
            title="Por qué están funcionando tus reels"
            desc="Reels de 19–20.000 vistas con 2.900 seguidores no son suerte: son señales del algoritmo respondiendo a tu contenido. Esto es lo que está pasando y cómo aprovecharlo."
          />
          <div className="est-grid wide" style={{ marginBottom: '2rem' }}>
            {IG_WHY_WORKING.map((c) => (
              <div key={c.title} className="est-card">
                <h4>{c.title}</h4>
                <p>{c.body}</p>
              </div>
            ))}
          </div>

          <SectionHead
            title="El checklist del reel que despega"
            desc="Las primeras 24 horas de un reel viral valen más que la semana entera. Cuando uno pase de 5.000 vistas, esto — en orden:"
          />
          <div className="est-pipeline" style={{ marginBottom: '2rem' }}>
            {IG_VIRAL_CHECKLIST.map((s, i) => (
              <div key={s.slice(0, 24)} className="est-pipeline-step">
                <span className="num">{i + 1}</span>
                <div className="detail">{s}</div>
              </div>
            ))}
          </div>

          <SectionHead
            title="La rutina de medición (15 minutos por semana)"
            desc="Con lo gratis alcanza y sobra. Lo importante no es la herramienta: es mirar los mismos números todas las semanas."
          />
          <div className="est-grid wide" style={{ marginBottom: '2rem' }}>
            {IG_WEEKLY.map((s) => (
              <div key={s.slice(0, 24)} className="est-card">
                <p>{s}</p>
              </div>
            ))}
          </div>

          <SectionHead
            kicker="Del canal Google, cuando llegue el momento"
            title="Google Merchant Center"
            desc={MERCHANT_WHY}
          />
          <div className="est-pipeline">
            {MERCHANT_STEPS.map((s, i) => (
              <div key={s.step} className="est-pipeline-step">
                <span className="num">{i + 1}</span>
                <div className="step">{s.step}</div>
                <div className="detail">{s.detail}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══ RIESGOS ══ */}
      {tab === 'riesgos' && (
        <section aria-label="Riesgos">
          <SectionHead
            kicker="Qué puede salir mal"
            title="Riesgos y cómo los cubrimos"
          />
          <div className="est-grid wide">
            {RISKS.map((r) => (
              <div key={r.title} className="est-card">
                <div className="est-card-top">
                  <h4>{r.title}</h4>
                  <span className={`est-badge riesgo-${r.severity}`}>{r.severity === 'alta' ? 'ALTO' : 'MEDIO'}</span>
                </div>
                <p style={{ marginBottom: 8 }}>{r.detail}</p>
                <p style={{ fontSize: '0.8rem' }}><strong style={{ color: '#1E8449' }}>La cobertura:</strong> {r.mitigation}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
