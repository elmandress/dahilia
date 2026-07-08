'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { WeaverApplication } from '@/lib/types'

type Status = WeaverApplication['status']

const STATUS_LABEL: Record<Status, string> = {
  new: 'Nueva',
  contacted: 'En charla',
  sample: 'Muestra pagada',
  approved: 'Aprobada',
  rejected: 'Descartada',
}

// Reuse the encargo badge palette: map each weaver status to an existing
// admin-badge class so the colors stay consistent without new CSS.
const STATUS_BADGE: Record<Status, string> = {
  new: 'new',
  contacted: 'replied',
  sample: 'in_progress',
  approved: 'done',
  rejected: 'cancelled',
}

const TABS: Array<{ key: Status | 'all'; label: string }> = [
  { key: 'all', label: 'Todas' },
  { key: 'new', label: 'Nuevas' },
  { key: 'contacted', label: 'En charla' },
  { key: 'sample', label: 'Muestra' },
  { key: 'approved', label: 'Aprobadas' },
  { key: 'rejected', label: 'Descartadas' },
]

function waLink(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (!digits) return ''
  if (phone.trim().startsWith('+') || digits.length >= 11) return `https://wa.me/${digits}`
  return `https://wa.me/598${digits.replace(/^0+/, '')}`
}

export default function AdminTejedorasPage() {
  const [apps, setApps] = useState<WeaverApplication[]>([])
  const [tab, setTab] = useState<Status | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [tableMissing, setTableMissing] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('weaver_applications')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      // 42P01 = undefined_table → migration not run yet.
      if (error.code === '42P01' || /weaver_applications/.test(error.message || '')) {
        setTableMissing(true)
      }
      setApps([])
    } else {
      setApps((data ?? []) as WeaverApplication[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  const updateStatus = async (id: string, status: Status) => {
    const supabase = createClient()
    const prev = apps
    setApps((a) => a.map((x) => (x.id === id ? { ...x, status } : x)))
    const { error } = await supabase.from('weaver_applications').update({ status }).eq('id', id)
    if (error) {
      setApps(prev)
      showToast('No se pudo guardar el estado. Probá de nuevo.')
    }
  }

  const saveNotes = async (id: string) => {
    const supabase = createClient()
    const notes = notesDraft[id] ?? ''
    const { error } = await supabase.from('weaver_applications').update({ admin_notes: notes || null }).eq('id', id)
    if (error) {
      showToast('No se pudieron guardar las notas.')
    } else {
      setApps((a) => a.map((x) => (x.id === id ? { ...x, admin_notes: notes || null } : x)))
      showToast('Notas guardadas.')
    }
  }

  const remove = async (id: string) => {
    if (!confirm('¿Eliminar esta postulación definitivamente?')) return
    const supabase = createClient()
    const { error } = await supabase.from('weaver_applications').delete().eq('id', id)
    if (error) {
      showToast('No se pudo eliminar.')
    } else {
      setApps((a) => a.filter((x) => x.id !== id))
    }
  }

  const filtered = tab === 'all' ? apps : apps.filter((a) => a.status === tab)
  const count = (k: Status) => apps.filter((a) => a.status === k).length

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
          <h2>Tejedoras</h2>
          <p>Postulaciones de la página pública /tejedoras</p>
        </div>
        <a href="/tejedoras" target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn-secondary admin-btn-sm">
          Ver página pública
        </a>
      </div>

      {toast && (
        <div role="status" style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 100,
          background: '#1F1A1B', color: '#fff', borderRadius: 10,
          padding: '12px 18px', fontSize: '0.85rem', boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        }}>{toast}</div>
      )}

      {tableMissing ? (
        <div className="admin-card">
          <h3 style={{ marginTop: 0, fontSize: '1rem' }}>Falta un paso de configuración</h3>
          <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.6 }}>
            La tabla de postulaciones todavía no existe en la base de datos. Ejecutá el archivo{' '}
            <code>database/schema-tejedoras.sql</code> en el SQL Editor de Supabase (1 minuto) y recargá esta página.
            Mientras tanto la página pública muestra un error amable a quien intente postularse.
          </p>
        </div>
      ) : (
        <>
          {/* Tabs con contadores, mismo patrón que encargos */}
          <div className="admin-filters" style={{ marginBottom: '1.25rem' }}>
            {TABS.map((t) => (
              <button
                key={t.key}
                className={`admin-btn admin-btn-sm ${tab === t.key ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
                {t.key !== 'all' && count(t.key as Status) > 0 ? ` · ${count(t.key as Status)}` : ''}
                {t.key === 'all' && apps.length > 0 ? ` · ${apps.length}` : ''}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="admin-empty">
              <p>
                {apps.length === 0
                  ? 'Todavía no hay postulaciones. Compartí /tejedoras en Instagram para empezar a recibir.'
                  : 'No hay postulaciones en este estado.'}
              </p>
            </div>
          ) : (
            filtered.map((a) => (
              <div key={a.id} className="admin-card" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <strong style={{ fontSize: '1rem' }}>{a.name}</strong>
                    <span style={{ color: '#888', fontSize: '0.85rem', marginLeft: 8 }}>
                      {a.location || 'Uruguay'} · {new Date(a.created_at).toLocaleDateString('es-UY')}
                    </span>
                  </div>
                  <span className={`admin-badge ${STATUS_BADGE[a.status]}`}>{STATUS_LABEL[a.status]}</span>
                </div>

                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '0.6rem 1.25rem', margin: '0.9rem 0', fontSize: '0.88rem', color: '#444',
                }}>
                  <div><span style={{ color: '#999' }}>Experiencia:</span> {a.experience ? `${a.experience} años` : '—'}</div>
                  <div><span style={{ color: '#999' }}>Sabe tejer:</span> {a.skills || '—'}</div>
                  <div><span style={{ color: '#999' }}>Disponibilidad:</span> {a.availability ? `${a.availability}/sem` : '—'}</div>
                  <div><span style={{ color: '#999' }}>Materiales propios:</span> {a.has_materials ? 'Sí' : 'No'}</div>
                  {a.email && <div><span style={{ color: '#999' }}>Mail:</span> {a.email}</div>}
                  {a.whatsapp && <div><span style={{ color: '#999' }}>WhatsApp:</span> {a.whatsapp}</div>}
                </div>

                {a.portfolio && (
                  <p style={{ fontSize: '0.88rem', margin: '0 0 0.6rem' }}>
                    <span style={{ color: '#999' }}>Trabajos:</span>{' '}
                    {/^https?:\/\//.test(a.portfolio) ? (
                      <a href={a.portfolio} target="_blank" rel="noopener noreferrer" style={{ color: '#8F3B53' }}>
                        {a.portfolio}
                      </a>
                    ) : (
                      a.portfolio
                    )}
                  </p>
                )}
                {a.message && (
                  <p style={{
                    fontSize: '0.88rem', color: '#555', background: '#FAF7F0',
                    borderRadius: 8, padding: '10px 12px', margin: '0 0 0.75rem', whiteSpace: 'pre-wrap',
                  }}>{a.message}</p>
                )}

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <select
                    value={a.status}
                    onChange={(e) => updateStatus(a.id, e.target.value as Status)}
                    aria-label={`Estado de ${a.name}`}
                    style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: '0.85rem' }}
                  >
                    {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
                      <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                    ))}
                  </select>
                  {a.whatsapp && (
                    <a
                      href={waLink(a.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                    >
                      WhatsApp
                    </a>
                  )}
                  <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => remove(a.id)}>
                    Eliminar
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <textarea
                    rows={2}
                    placeholder="Notas internas (resultado de la muestra, tarifa acordada…)"
                    value={notesDraft[a.id] ?? a.admin_notes ?? ''}
                    onChange={(e) => setNotesDraft((d) => ({ ...d, [a.id]: e.target.value }))}
                    style={{
                      flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd',
                      fontSize: '0.85rem', fontFamily: 'inherit', resize: 'vertical',
                    }}
                  />
                  <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => saveNotes(a.id)}>
                    Guardar
                  </button>
                </div>
              </div>
            ))
          )}

          <div className="admin-card" style={{ marginTop: '1.5rem', background: '#FAF7F0' }}>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem' }}>Recordatorio del proceso</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#666', lineHeight: 1.7 }}>
              Postulación → charla por WhatsApp → <strong>muestra pagada</strong> contra ficha técnica →
              alta como aprendiz con piezas simples. La guía completa (pago por pieza, control de calidad, tiers)
              está en <Link href="/admin/estrategia" style={{ color: '#8F3B53' }}>Estrategia</Link>.
            </p>
          </div>
        </>
      )}
    </>
  )
}
