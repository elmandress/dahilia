'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Subscriber } from '@/lib/types'

const SOURCE_LABEL: Record<Subscriber['source'], string> = {
  footer: 'Footer',
  encargo: 'Encargo',
  drop: 'Drop',
  manual: 'Manual',
}

export default function AdminSuscriptoresPage() {
  const [subs, setSubs] = useState<Subscriber[]>([])
  // Timestamp fijado al cargar, para derivar "últimos 30 días" sin llamar
  // Date.now() durante el render (regla react-hooks/purity).
  const [loadedAt, setLoadedAt] = useState(0)
  const [loading, setLoading] = useState(true)
  const [tableMissing, setTableMissing] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      if (error.code === '42P01' || /subscribers/.test(error.message || '')) setTableMissing(true)
      setSubs([])
    } else {
      setSubs((data ?? []) as Subscriber[])
    }
    setLoadedAt(Date.now())
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

  const active = subs.filter((s) => !s.unsubscribed_at)

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(active.map((s) => s.email).join(', '))
      showToast(`${active.length} emails copiados al portapapeles.`)
    } catch {
      showToast('No se pudo copiar. Probá de nuevo.')
    }
  }

  const downloadCsv = () => {
    const rows = [['email', 'origen', 'fecha'], ...active.map((s) => [
      s.email, SOURCE_LABEL[s.source] ?? s.source, new Date(s.created_at).toLocaleDateString('es-UY'),
    ])]
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    // BOM para que Excel abra el CSV con acentos correctos.
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lista-vip-dahila-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const remove = async (id: string) => {
    if (!confirm('¿Eliminar este email de la lista?')) return
    const supabase = createClient()
    const { error } = await supabase.from('subscribers').delete().eq('id', id)
    if (error) {
      showToast('No se pudo eliminar.')
    } else {
      setSubs((s) => s.filter((x) => x.id !== id))
    }
  }

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
          <h2>Lista VIP</h2>
          <p>Emails para avisar de drops y lanzamientos (captados en el footer)</p>
        </div>
        {active.length > 0 && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={copyAll}>
              Copiar emails
            </button>
            <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={downloadCsv}>
              Descargar CSV
            </button>
          </div>
        )}
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
          <p style={{ color: '#4A4143', fontSize: '0.9rem', lineHeight: 1.6 }}>
            La tabla de suscriptores todavía no existe. Ejecutá <code>database/schema-suscriptores.sql</code>{' '}
            en el SQL Editor de Supabase (1 minuto) y recargá. El formulario del footer empieza a funcionar solo.
          </p>
        </div>
      ) : subs.length === 0 ? (
        <div className="admin-empty">
          <p>
            Todavía no hay suscriptoras. La lista crece sola desde el footer de la tienda —
            empujala mencionando el “acceso anticipado” en Instagram antes de cada drop.
          </p>
        </div>
      ) : (
        <>
          <div className="admin-stats-grid" style={{ marginBottom: '1.25rem' }}>
            <div className="admin-stat-card">
              <div className="stat-label">Suscriptoras activas</div>
              <div className="stat-value">{active.length}</div>
              <div className="stat-sub">El activo de los drops</div>
            </div>
            <div className="admin-stat-card">
              <div className="stat-label">Últimos 30 días</div>
              <div className="stat-value">
                {active.filter((s) => loadedAt - new Date(s.created_at).getTime() < 30 * 86400000).length}
              </div>
              <div className="stat-sub">Nuevas altas</div>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Origen</th>
                    <th>Fecha</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {subs.map((s) => (
                    <tr key={s.id} style={s.unsubscribed_at ? { opacity: 0.5 } : undefined}>
                      <td>{s.email}{s.unsubscribed_at ? ' (baja)' : ''}</td>
                      <td>{SOURCE_LABEL[s.source] ?? s.source}</td>
                      <td style={{ fontSize: '0.85rem', color: '#8C8285' }}>
                        {new Date(s.created_at).toLocaleDateString('es-UY')}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => remove(s.id)}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="admin-card" style={{ marginTop: '1.5rem', background: '#FCFAF6' }}>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem' }}>Cómo usar la lista</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#4A4143', lineHeight: 1.7 }}>
              Antes de cada drop: descargá el CSV, armá el mail de “acceso anticipado” y mandalo 24 h antes
              de publicar en Instagram. El playbook completo (calendario, semanas de expectativa, WhatsApp)
              está en <Link href="/admin/estrategia" style={{ color: '#8F3B53' }}>Estrategia</Link>.
            </p>
          </div>
        </>
      )}
    </>
  )
}
