'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/**
 * Floating WhatsApp button — visible on all public pages except /admin and /carrito.
 * Hides on scroll-down, reappears on scroll-up (doesn't compete with sticky CTAs).
 * Number/URL comes from site_settings so Anush can update it from the admin.
 * Toggle with `whatsapp_float_enabled` key.
 */
export function WhatsAppFloat() {
  const pathname = usePathname()
  const [waUrl, setWaUrl] = useState('https://wa.me/59894605015')
  const [enabled, setEnabled] = useState(false)
  const [visible, setVisible] = useState(true)
  const [lastY, setLastY] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['whatsapp_float_enabled', 'contact_whatsapp_url'])
      .then(({ data }) => {
        const s = (data ?? []).reduce<Record<string, string>>(
          (acc, r) => ({ ...acc, [r.key]: String(r.value ?? '') }), {}
        )
        if (s.contact_whatsapp_url?.trim()) setWaUrl(s.contact_whatsapp_url.trim())
        setEnabled(s.whatsapp_float_enabled === 'true')
      })
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      // Show when scrolling up or near top; hide when scrolling down past 200px
      if (y < 200 || y < lastY) {
        setVisible(true)
      } else if (y > lastY + 8) {
        setVisible(false)
      }
      setLastY(y)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [lastY])

  // Hide on admin, cart (has its own CTA), and order form
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/carrito') ||
    pathname.startsWith('/encargo')
  ) return null

  if (!enabled) return null

  const message = encodeURIComponent('Hola! Estoy en el sitio de Dahila Crochet y tengo una consulta 🧶')
  const href = `${waUrl.replace(/\/$/, '')}?text=${message}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Consultar por WhatsApp"
      style={{
        position: 'fixed',
        bottom: 28,
        right: 24,
        zIndex: 900,
        width: 52,
        height: 52,
        borderRadius: 999,
        background: '#25D366',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(37,211,102,0.38)',
        textDecoration: 'none',
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(80px) scale(0.9)',
        opacity: visible ? 1 : 0,
        transition: 'transform 260ms cubic-bezier(0.34,1.56,0.64,1), opacity 220ms ease',
        willChange: 'transform',
      }}
    >
      {/* WhatsApp SVG — inline, no external request */}
      <svg width="26" height="26" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
        <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.668 4.61 1.818 6.51L4 29l7.697-1.79A11.94 11.94 0 0016 28c6.627 0 12-5.373 12-12S22.627 3 16 3zm5.93 16.71c-.25.7-1.47 1.37-2.01 1.42-.54.05-1.05.24-3.54-.73-2.98-1.15-4.88-4.18-5.03-4.37-.15-.19-1.2-1.6-1.2-3.05 0-1.45.76-2.17 1.03-2.46.27-.29.59-.36.79-.36l.57.01c.18 0 .43-.07.67.51.25.6.85 2.06.92 2.21.07.15.12.33.02.53-.1.2-.15.32-.3.49-.15.17-.31.38-.44.51-.14.14-.29.29-.12.58.17.29.74 1.22 1.59 1.98 1.09.97 2.01 1.27 2.3 1.41.29.14.46.12.63-.07.17-.19.74-.86.94-1.15.2-.29.39-.24.66-.14.27.1 1.7.8 1.99.94.29.14.49.21.56.33.07.12.07.7-.18 1.4z"/>
      </svg>
    </a>
  )
}
