'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import '../admin.css'

import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const formattedEmail = email.includes('@') ? email : `${email}@dahila.uy`
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formattedEmail,
        password: password,
      })

      if (authError) {
        // Fallback to test mode if Supabase credentials fail (helps local testing before DB config)
        if ((email === 'hola' || email === 'hola@dahila.uy') && password === 'hola') {
          document.cookie = "dahila_admin_test=true; path=/; max-age=86400"
          router.push('/admin')
          router.refresh()
          return
        }
        throw authError
      }

      // Successful auth
      document.cookie = "dahila_admin_test=true; path=/; max-age=86400"
      router.push('/admin')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Credenciales incorrectas (usa: hola / hola para testear)')
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-page" style={{ 
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--cream-100)', fontFamily: 'var(--font-sans)'
    }}>
      <div className="admin-login-card" style={{
        background: '#fff', padding: 48, borderRadius: 16, width: '100%', maxWidth: 400,
        boxShadow: '0 14px 30px -18px rgba(31,26,27,0.12)'
      }}>
        <div className="login-brand" style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, color: 'var(--ink-900)', fontSize: 32, margin: '0 0 8px' }}>Dahila Crochet</h1>
          <p style={{ color: 'var(--ink-500)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Panel Oculto</p>
        </div>

        {error && <div className="login-error" style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="admin-field" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="email" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-700)' }}>Usuario</label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ej: hola"
              required
              autoFocus
              style={{
                border: '1px solid var(--border-strong)', padding: '12px 14px', borderRadius: 8, fontSize: 14, outline: 'none'
              }}
            />
          </div>

          <div className="admin-field" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="password" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-700)' }}>Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ej: hola"
              required
              style={{
                border: '1px solid var(--border-strong)', padding: '12px 14px', borderRadius: 8, fontSize: 14, outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 12, background: 'var(--ink-900)', color: '#fff', padding: '14px',
              borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)',
              textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'all 0.2s'
            }}
          >
            {loading ? 'Ingresando...' : 'Ingresar al sistema'}
          </button>
        </form>
      </div>
    </div>
  )
}
