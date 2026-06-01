'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const DEFAULT_SETTINGS = {
  hero_title: 'Tejido artesanal y a medida.',
  hero_subtitle: 'Diseñado y confeccionado a mano en Uruguay.',
  hero_cta: 'Ver Colección',
  contact_whatsapp: '+598 99 123 456',
  contact_instagram: 'dahila.crochet',
  contact_email: 'hola@dahila.uy',
  atelier_address: 'Montevideo, Uruguay',
  lead_time_notice: 'Las prendas a medida demoran entre 2 y 6 semanas según la complejidad.'
}

export default function ConfiguracionAdminPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const loadSettings = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
      
      if (error) throw error

      if (data && data.length > 0) {
        const loaded: any = {}
        data.forEach(item => {
          loaded[item.key] = item.value
        })
        setSettings({ ...DEFAULT_SETTINGS, ...loaded })
      } else {
        const local = localStorage.getItem('dahila_admin_settings')
        if (local) {
          setSettings(JSON.parse(local))
        } else {
          setSettings(DEFAULT_SETTINGS)
          localStorage.setItem('dahila_admin_settings', JSON.stringify(DEFAULT_SETTINGS))
        }
      }
    } catch (e) {
      console.warn('Supabase fetch failed, using local configuration settings fallback', e)
      const local = localStorage.getItem('dahila_admin_settings')
      if (local) {
        setSettings(JSON.parse(local))
      } else {
        setSettings(DEFAULT_SETTINGS)
        localStorage.setItem('dahila_admin_settings', JSON.stringify(DEFAULT_SETTINGS))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)

    try {
      const supabase = createClient()
      
      // UPSERT settings in Supabase site_settings table
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString()
      }))

      const { error } = await supabase
        .from('site_settings')
        .upsert(updates, { onConflict: 'key' })

      if (error) throw error
      setSuccess(true)
    } catch (e) {
      console.warn('Supabase update failed, saving locally', e)
      localStorage.setItem('dahila_admin_settings', JSON.stringify(settings))
      setSuccess(true)
    } finally {
      setSaving(false)
      setTimeout(() => setSuccess(false), 3000)
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
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <span>✓</span> ¡Configuración guardada correctamente!
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
