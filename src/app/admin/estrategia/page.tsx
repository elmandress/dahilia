'use client'

// Estrategia y crecimiento — el centro de control del negocio.
// Contenido estático en ./data.ts; datos vivos (precios aplicados, postulaciones,
// lista VIP, progreso de objetivos) leídos de Supabase al montar.

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  ULTIMA_REVISION, NORTE,
  MARKET_BANDS, MARKET_REFS,
  PRICING_RULES, PRICE_TABLE, PRICING_PHASES, contribPerHour,
  HOUR_ECONOMICS,
  WEAVER_PIPELINE, WEAVER_SYSTEM,
  CLASSES_VERDICT,
  DROP_CALENDAR, DROP_PLAYBOOK, DROP_BENCHMARKS, DROP_RULES,
  CHANNELS,
  NEXT_ACTIONS, VALUE_ACTIONS,
  RISKS, DECISIONS, DISCARDED,
  type ActionItem, type PricePriority,
} from './data'
import './estrategia.css'

const PROGRESS_KEY = 'estrategia_progress'

const SECTIONS: Array<[string, string]> = [
  ['objetivos', 'Objetivos'],
  ['mercado', 'Mercado'],
  ['precios', 'Precios'],
  ['hora', 'La hora'],
  ['tejedoras', 'Tejedoras'],
  ['clases', 'Clases'],
  ['drops', 'Drops'],
  ['canales', 'Canales'],
  ['valor', 'Valor percibido'],
  ['riesgos', 'Riesgos'],
  ['decisiones', 'Decisiones'],
  ['descartes', 'Descartado'],
]

const PRIO_LABEL: Record<PricePriority, string> = {
  urgente: 'Urgente', alta: 'Alta', media: 'Media', baja: 'Baja', hold: 'Hold',
}

const HORIZON_LABEL: Record<ActionItem['horizon'], string> = {
  ya: 'Esta semana', mes: 'Este mes', trimestre: 'Este trimestre',
}

const money = (n: number) => `$${n.toLocaleString('es-UY')}`

// Posición porcentual en escala logarítmica para el gráfico de bandas.
const LOG_MIN = Math.log(300)
const LOG_MAX = Math.log(15000)
const logPos = (v: number) => ((Math.log(v) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * 100

function SectionHead({ kicker, title, desc }: { kicker: string; title: string; desc?: string }) {
  return (
    <div className="est-section-head">
      <span className="est-kicker">{kicker}</span>
      <h3>{title}</h3>
      {desc && <p>{desc}</p>}
    </div>
  )
}

export default function EstrategiaPage() {
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
    // count = null cuando la tabla aún no existe (migración pendiente)
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
      showToast('No se pudo guardar el progreso. Probá de nuevo.')
    }
  }

  // Estado vivo de la migración de precios: un producto está "aplicado" si su
  // precio en la base coincide con la columna HOY aprobada.
  const priceRows = PRICE_TABLE.filter((r) => r.today != null)
  const appliedCount = priceRows.filter((r) => livePrices[r.slug] != null && livePrices[r.slug] === r.today).length
  const pricesApplied = priceRows.length > 0 && appliedCount === priceRows.length

  // Próximo drop según el mes actual (Montevideo).
  const currentMonth = new Date().getMonth() + 1
  const nextDrop = DROP_CALENDAR.find((d) => d.month >= currentMonth) ?? DROP_CALENDAR[0]

  const renderChecklist = (items: ActionItem[]) => (
    <div className="est-checklist">
      {items.map((a) => (
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
          <span className={`est-badge ${a.horizon === 'ya' ? 'prio-urgente' : a.horizon === 'mes' ? 'prio-alta' : 'prio-media'}`}>
            {HORIZON_LABEL[a.horizon]}
          </span>
        </label>
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
      </div>
    )
  }

  const doneActions = NEXT_ACTIONS.filter((a) => checked[a.id]).length

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h2>Estrategia y crecimiento</h2>
          <p>El plan completo del negocio, con datos en vivo · última revisión: {ULTIMA_REVISION}</p>
        </div>
      </div>

      {toast && (
        <div role="status" style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 100,
          background: '#1F1A1B', color: '#fff', borderRadius: 10,
          padding: '12px 18px', fontSize: '0.85rem', boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        }}>{toast}</div>
      )}

      {/* Norte */}
      <div className="est-north">
        <span className="est-kicker">El norte</span>
        <blockquote>{NORTE}</blockquote>
        <div className="est-north-meta">
          Cada decisión de precio, producto o canal se mide contra esta frase.
        </div>
      </div>

      {/* Nav de secciones */}
      <nav className="est-nav" aria-label="Secciones de la estrategia">
        {SECTIONS.map(([id, label]) => (
          <a key={id} href={`#${id}`}>{label}</a>
        ))}
      </nav>

      {/* Resumen vivo */}
      <div className="est-stats" style={{ marginBottom: '3rem' }}>
        <div className="est-stat">
          <div className={`value ${pricesApplied ? '' : 'wine'}`}>{appliedCount}/{priceRows.length}</div>
          <div className="label">aumentos de precio aplicados</div>
          <div className="sub">{pricesApplied ? 'Tabla HOY completa en producción ✓' : 'Correr database/precios-2026-07.sql'}</div>
          <div className="est-progress-track"><div className="est-progress-fill" style={{ width: `${(appliedCount / Math.max(1, priceRows.length)) * 100}%` }} /></div>
        </div>
        <div className="est-stat">
          <div className="value">{weaverCount ?? '—'}</div>
          <div className="label">postulaciones de tejedoras</div>
          <div className="sub">
            {weaverCount == null
              ? 'Activar con schema-tejedoras.sql'
              : <Link href="/admin/tejedoras" style={{ color: '#8F3B53' }}>Gestionar →</Link>}
          </div>
        </div>
        <div className="est-stat">
          <div className="value">{vipCount ?? '—'}</div>
          <div className="label">suscriptoras en la lista VIP</div>
          <div className="sub">
            {vipCount == null
              ? 'Activar con schema-suscriptores.sql'
              : <Link href="/admin/suscriptores" style={{ color: '#8F3B53' }}>Ver lista →</Link>}
          </div>
        </div>
        <div className="est-stat">
          <div className="value">{doneActions}/{NEXT_ACTIONS.length}</div>
          <div className="label">objetivos completados</div>
          <div className="sub">Se marcan acá abajo y quedan guardados</div>
        </div>
      </div>

      {/* 1. Objetivos */}
      <section id="objetivos" className="est-section" aria-label="Objetivos">
        <SectionHead
          kicker="Qué hacer ahora"
          title="Objetivos accionables"
          desc="Ordenados por retorno sobre esfuerzo. Marcá lo que ya esté hecho — el progreso queda guardado para la próxima visita."
        />
        {renderChecklist(NEXT_ACTIONS)}
      </section>

      {/* 2. Mercado */}
      <section id="mercado" className="est-section" aria-label="Mercado">
        <SectionHead
          kicker="Posicionamiento"
          title="Dónde juega Dahila en el mercado uruguayo"
          desc="El mercado UY de crochet es opaco: casi nadie publica precios. Publicarlos con claridad ya es una ventaja. Las bandas reales (UYU, escala logarítmica):"
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
          <p style={{ marginTop: 14, fontSize: '0.82rem', color: '#777' }}>
            La posición correcta: <strong>un escalón sobre el emprendimiento informal</strong> (lo justifica la
            presentación, el sitio y el seguimiento), <strong>debajo del retail a máquina</strong>. Ahí Dahila es
            “handmade a precio de casi-máquina” — imbatible en relación calidad-precio.
          </p>
        </div>
        <div className="est-grid wide">
          {MARKET_REFS.map((r) => (
            <div key={r.name} className="est-card">
              <div className="est-card-top">
                <h4>{r.url ? <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>{r.name} ↗</a> : r.name}</h4>
                <span className="est-badge prio-hold">{r.price}</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#999', marginBottom: 6 }}>{r.what}</p>
              <p>{r.lesson}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Precios */}
      <section id="precios" className="est-section" aria-label="Precios">
        <SectionHead
          kicker="Filosofía de precios"
          title="La tabla aprobada y sus reglas"
          desc="Aprobada en julio 2026. El criterio que ordena la tabla es la contribución por hora ($/h = precio − materiales ÷ horas), no el promedio del mercado."
        />
        <div className="est-grid" style={{ marginBottom: '1.25rem' }}>
          {PRICING_RULES.map((r) => (
            <div key={r.title} className="est-card cream">
              <h4>{r.title}</h4>
              <p>{r.body}</p>
            </div>
          ))}
        </div>

        <div className="admin-card" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: '0.9rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Tabla completa (32 productos)</h4>
            <span className={`est-badge ${pricesApplied ? 'ok' : 'pend'}`}>
              {pricesApplied ? '✓ Precios HOY aplicados en producción' : `${appliedCount}/${priceRows.length} aplicados — falta correr la migración`}
            </span>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table est-price-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Antes</th>
                  <th>HOY</th>
                  <th>12 meses</th>
                  <th>$/h HOY</th>
                  <th>Prioridad</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {PRICE_TABLE.map((r) => {
                  const live = livePrices[r.slug]
                  const applied = r.today != null && live != null && live === r.today
                  const perHour = contribPerHour(r, r.today ?? r.before)
                  return (
                    <tr key={r.slug}>
                      <td className="name-cell">
                        {r.name}
                        {r.note && <small>{r.note}</small>}
                      </td>
                      <td>{money(r.before)}</td>
                      <td>{r.today != null ? <span className="up">{money(r.today)}</span> : <span style={{ color: '#999' }}>HOLD</span>}</td>
                      <td>{r.target != null ? money(r.target) : '—'}</td>
                      <td>{perHour != null ? money(perHour) : '—'}</td>
                      <td><span className={`est-badge prio-${r.priority}`}>{PRIO_LABEL[r.priority]}</span></td>
                      <td>
                        {r.today == null
                          ? <span className="est-badge prio-hold">No tocar</span>
                          : applied
                            ? <span className="est-badge ok">✓ Aplicado</span>
                            : <span className="est-badge pend">Pendiente</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#999', marginTop: 10, marginBottom: 0 }}>
            Materiales estimados — ajustar con costos reales. “Estado” se chequea en vivo contra la base:
            cuando corras la migración, esta columna se pone verde sola.
          </p>
        </div>

        <SectionHead kicker="Cómo sigue" title="Fases de los próximos 12 meses" />
        <div className="est-timeline">
          {PRICING_PHASES.map((p) => (
            <div key={p.title} className="est-timeline-item">
              <div className="when">{p.when}</div>
              <div className="title">{p.title}</div>
              <p className="body">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. La economía de la hora */}
      <section id="hora" className="est-section" aria-label="La economía de la hora">
        <SectionHead
          kicker="El hallazgo que ordena todo"
          title={HOUR_ECONOMICS.headline}
        />
        <div className="est-stats" style={{ marginBottom: '1rem' }}>
          {HOUR_ECONOMICS.stats.map((s) => (
            <div key={s.label} className="est-stat">
              <div className="value wine">{s.value}</div>
              <div className="label">{s.label}</div>
              <div className="sub">{s.sub}</div>
            </div>
          ))}
        </div>
        {HOUR_ECONOMICS.implications.map((t) => (
          <div key={t.slice(0, 24)} className="est-callout" style={{ marginBottom: 10 }}>{t}</div>
        ))}
      </section>

      {/* 5. Tejedoras */}
      <section id="tejedoras" className="est-section" aria-label="Red de tejedoras">
        <SectionHead
          kicker="Escalar sin perder lo artesanal"
          title="Red de tejedoras — modelo Manos del Uruguay"
          desc="Manos del Uruguay lo prueba desde 1968: la marca diseña, controla y vende; las artesanas producen, cobran por pieza terminada y firman su trabajo. Este es el mismo sistema a escala Dahila."
        />
        <div style={{ marginBottom: '1.25rem', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span className="est-badge ok">✓ Página pública lista: /tejedoras</span>
          <span className="est-badge ok">✓ Bandeja en el panel: Tejedoras</span>
          <span className="est-badge ok">✓ Aviso por email en cada postulación</span>
          {weaverCount != null && weaverCount > 0 && (
            <Link href="/admin/tejedoras" className="est-badge pend" style={{ textDecoration: 'none' }}>
              {weaverCount} postulación{weaverCount === 1 ? '' : 'es'} para revisar →
            </Link>
          )}
        </div>
        <div className="est-pipeline" style={{ marginBottom: '1.25rem' }}>
          {WEAVER_PIPELINE.map((s, i) => (
            <div key={s.step} className="est-pipeline-step">
              <span className="num">{i + 1}</span>
              <div className="step">{s.step}</div>
              <div className="detail">{s.detail}</div>
            </div>
          ))}
        </div>
        <div className="est-grid wide">
          {WEAVER_SYSTEM.map((c) => (
            <div key={c.title} className="est-card">
              <h4>{c.title}</h4>
              <p>{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Clases */}
      <section id="clases" className="est-section" aria-label="Clases">
        <SectionHead
          kicker="¿Dar clases?"
          title={`Veredicto: ${CLASSES_VERDICT.decision}`}
          desc="No es un negocio secundario: es el mejor uso de la hora de la dueña Y la fábrica de futuras tejedoras."
        />
        <div className="est-grid wide" style={{ marginBottom: '1.25rem' }}>
          {CLASSES_VERDICT.reasons.map((r, i) => (
            <div key={r.slice(0, 24)} className="est-card cream">
              <h4>Razón {i + 1}</h4>
              <p>{r}</p>
            </div>
          ))}
        </div>
        <div className="admin-card" style={{ marginBottom: '1.25rem' }}>
          <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem' }}>Reclutar vs. formar vs. ambas</h4>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Camino</th><th>A favor</th><th>En contra</th></tr>
              </thead>
              <tbody>
                {CLASSES_VERDICT.comparison.map((c) => (
                  <tr key={c.option} style={c.option.startsWith('Ambas') ? { background: '#FAF7F0' } : undefined}>
                    <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{c.option}</td>
                    <td style={{ fontSize: '0.85rem' }}>{c.pros}</td>
                    <td style={{ fontSize: '0.85rem' }}>{c.cons}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="est-callout">
          <strong>{CLASSES_VERDICT.format.title}.</strong> {CLASSES_VERDICT.format.body}
        </div>
      </section>

      {/* 7. Drops */}
      <section id="drops" className="est-section" aria-label="Drops">
        <SectionHead
          kicker="Lanzamientos limitados"
          title="Drops — el motor de facturación por temporada"
          desc="La feature de colecciones del panel es la herramienta; esta es la estrategia. El handmade es escaso de verdad: acá la urgencia nunca es inventada."
        />
        <div className="est-drops" style={{ marginBottom: '1.25rem' }}>
          {DROP_CALENDAR.map((d) => (
            <div key={d.name} className={`est-drop ${d.name === nextDrop.name ? 'next' : ''}`}>
              <div className="month">{d.monthLabel}{d.name === nextDrop.name ? ' · PRÓXIMO' : ''}</div>
              <div className="name">{d.name}</div>
              <div className="hook">{d.hook}</div>
            </div>
          ))}
        </div>
        <div className="est-timeline" style={{ marginBottom: '1.25rem' }}>
          {DROP_PLAYBOOK.map((p) => (
            <div key={p.phase} className="est-timeline-item">
              <div className="when">{p.phase}</div>
              <p className="body">{p.actions}</p>
            </div>
          ))}
        </div>
        <div className="est-stats" style={{ marginBottom: '1.25rem' }}>
          {DROP_BENCHMARKS.map((b) => (
            <div key={b.label} className="est-stat">
              <div className="value wine">{b.value}</div>
              <div className="label">{b.label}</div>
              <div className="sub">{b.sub}</div>
            </div>
          ))}
        </div>
        <div className="est-grid wide">
          {DROP_RULES.map((r, i) => (
            <div key={r.slice(0, 24)} className="est-card">
              <h4>Regla {i + 1}</h4>
              <p>{r}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Canales */}
      <section id="canales" className="est-section" aria-label="Canales">
        <SectionHead
          kicker="Marketing"
          title="Canales, en orden de importancia"
          desc="Regla de oro: no sumar canales nuevos hasta que la ficha convierta (precio claro + descripción + prueba social)."
        />
        <div className="est-grid wide">
          {CHANNELS.map((c) => (
            <div key={c.channel} className="est-card">
              <div className="est-card-top">
                <h4>{c.channel}</h4>
                <span className="est-badge prio-hold">{c.role}</span>
              </div>
              <p>{c.action}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 9. Valor percibido */}
      <section id="valor" className="est-section" aria-label="Valor percibido">
        <SectionHead
          kicker="Subir valor sin subir costo"
          title="Checklist de valor percibido"
          desc="Lo más rentable del plan: sube lo que la clienta está dispuesta a pagar casi sin tocar el costo. El aumento de precios siempre llega acompañado de esto."
        />
        {renderChecklist(VALUE_ACTIONS)}
      </section>

      {/* 10. Riesgos */}
      <section id="riesgos" className="est-section" aria-label="Riesgos">
        <SectionHead
          kicker="Qué puede salir mal"
          title="Riesgos y mitigaciones"
        />
        <div className="est-grid wide">
          {RISKS.map((r) => (
            <div key={r.title} className="est-card">
              <div className="est-card-top">
                <h4>{r.title}</h4>
                <span className={`est-badge riesgo-${r.severity}`}>{r.severity.toUpperCase()}</span>
              </div>
              <p style={{ marginBottom: 8 }}>{r.detail}</p>
              <p style={{ fontSize: '0.8rem' }}><strong style={{ color: '#1E8449' }}>Mitigación:</strong> {r.mitigation}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 11. Decisiones */}
      <section id="decisiones" className="est-section" aria-label="Decisiones tomadas">
        <SectionHead
          kicker="Memoria del negocio"
          title="Decisiones tomadas"
          desc="Para no re-discutir lo ya decidido — y para recordar el porqué cuando pase el tiempo."
        />
        <div className="est-timeline">
          {DECISIONS.map((d) => (
            <div key={d.title} className="est-timeline-item">
              <div className="when">{d.date}</div>
              <div className="title">{d.title}</div>
              <p className="body">{d.why}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 12. Descartado */}
      <section id="descartes" className="est-section" aria-label="Ideas descartadas">
        <SectionHead
          kicker="Lo que decidimos NO hacer"
          title="Ideas descartadas (por ahora)"
          desc="Un proyecto limpio también se define por lo que deja afuera. Cada descarte tiene su condición de revisión."
        />
        <div className="est-grid wide">
          {DISCARDED.map((d) => (
            <div key={d.title} className="est-card">
              <h4>{d.title}</h4>
              <p>{d.why}</p>
              {d.revisit && (
                <p style={{ marginTop: 8, fontSize: '0.76rem', color: '#8F3B53' }}>
                  Revisar: {d.revisit}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
