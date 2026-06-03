'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

const DEFAULT_SETTINGS: Record<string, string> = {
  hero_title: '',
  hero_subtitle: '',
  hero_cta: '',
  contact_whatsapp: '',
  contact_instagram: '',
  contact_email: '',
  atelier_address: '',
  lead_time_notice: '',
}

export default function ConfiguracionAdminPage() {
  const [settings, setSettings] = useState<Record<string, string>>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadSettings = useCallback(async () => {
    setError(null)
    try {
      const supabase = createClient()
      const { data, error: err } = await supabase.from('site_settings').select('*')
      if (err) throw err

      const loaded: Record<string, string> = {}
      ;(data ?? []).forEach((item) => {
        if (item?.key) loaded[item.key as string] = String(item.value ?? '')
      })
      setSettings({ ...DEFAULT_SETTINGS, ...loaded })
    } catch (e) {
      console.error('Error cargando configuración', e)
      setError('No se pudo cargar la configuración desde la base de datos.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSettings()
  }, [loadSettings])

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)
    setError(null)

    try {
      const supabase = createClient()
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString(),
      }))

      const { error: err } = await supabase
        .from('site_settings')
        .upsert(updates, { onConflict: 'key' })

      if (err) throw err
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) {
      console.error('Error guardando configuración', e)
      setError('No se pudieron guardar los cambios. Intentá de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      <div className="admin-page-header">
        <div>
          <h2>Configuración del Sitio</h2>
          <p>Edita textos generales, banner principal e información de contacto</p>
        </div>
      </div>

      {success && (
        <div style={{
          background: '#e8f5e9', color: '#2e7d32', padding: '1rem',
          borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span>✓</span> ¡Configuración guardada correctamente!
        </div>
      )}

      {error && (
        <div role="alert" style={{
          background: 'rgba(182,49,74,0.06)',
          border: '1px solid rgba(182,49,74,0.24)',
          color: '#7a1e2f',
          padding: '12px 14px',
          borderRadius: 8,
          marginBottom: 18,
          fontSize: 13,
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Hero Banner Section */}
        <div>
          <h3 style={{ margin: '0 0 1rem 0', fontWeight: 400, fontFamily: 'var(--font-display)', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Banner de Portada (Hero)</h3>
          <div className="admin-form-grid">
            <div className="admin-field full-width">
              <label>Título Principal</label>
              <input 
                type="text" 
                value={settings.hero_title} 
                onChange={(e) => handleChange('hero_title', e.target.value)} 
                required 
              />
            </div>
            <div className="admin-field full-width">
              <label>Subtítulo</label>
              <input 
                type="text" 
                value={settings.hero_subtitle} 
                onChange={(e) => handleChange('hero_subtitle', e.target.value)} 
                required 
              />
            </div>
            <div className="admin-field">
              <label>Texto Botón CTA</label>
              <input 
                type="text" 
                value={settings.hero_cta} 
                onChange={(e) => handleChange('hero_cta', e.target.value)} 
                required 
              />
            </div>
          </div>
        </div>

        {/* Contact info Section */}
        <div>
          <h3 style={{ margin: '0 0 1rem 0', fontWeight: 400, fontFamily: 'var(--font-display)', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Información de Contacto</h3>
          <div className="admin-form-grid">
            <div className="admin-field">
              <label>WhatsApp</label>
              <input 
                type="text" 
                value={settings.contact_whatsapp} 
                onChange={(e) => handleChange('contact_whatsapp', e.target.value)} 
                required 
              />
            </div>
            <div className="admin-field">
              <label>Usuario Instagram (@)</label>
              <input 
                type="text" 
                value={settings.contact_instagram} 
                onChange={(e) => handleChange('contact_instagram', e.target.value)} 
                required 
              />
            </div>
            <div className="admin-field full-width">
              <label>Email de contacto</label>
              <input 
                type="email" 
                value={settings.contact_email} 
                onChange={(e) => handleChange('contact_email', e.target.value)} 
                required 
              />
            </div>
            <div className="admin-field full-width">
              <label>Dirección física / Ubicación</label>
              <input 
                type="text" 
                value={settings.atelier_address} 
                onChange={(e) => handleChange('atelier_address', e.target.value)} 
                required 
              />
            </div>
          </div>
        </div>

        {/* Lead times and alerts */}
        <div>
          <h3 style={{ margin: '0 0 1rem 0', fontWeight: 400, fontFamily: 'var(--font-display)', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Plazos y Avisos</h3>
          <div className="admin-field">
            <label>Aviso de Plazos de Entrega</label>
            <textarea 
              value={settings.lead_time_notice} 
              onChange={(e) => handleChange('lead_time_notice', e.target.value)} 
              required 
            />
            <span className="field-hint">Se muestra en la sección de pedidos a medida y formularios de encargo.</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
          <button 
            type="submit" 
            className="admin-btn admin-btn-primary" 
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </form>
    </div>
  )
}
