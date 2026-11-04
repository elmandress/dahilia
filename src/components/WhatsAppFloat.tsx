'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { track } from '@/lib/analytics'
import { waLink } from '@/lib/whatsapp'
import { dahila } from './ui/tokens'

/**
 * Floating WhatsApp button — visible on all public pages except /admin and /carrito.
 * Hides on scroll-down, reappears on scroll-up (doesn't compete with sticky CTAs).
 * `enabled`/`waUrl` come from the root layout's server-side settings fetch
 * (avoids a second client-side round-trip to Supabase on every page load).
 */
export function WhatsAppFloat({ enabled, waUrl }: { enabled: boolean; waUrl: string }) {
  const pathname = usePathname()
  const [visible, setVisible] = useState(true)
  // ¿Bajó más de 0,8 pantallas? En la tienda y las colecciones la burbuja
  // aparece recién ahí (VIS-08, 04/11/2026): al cargar tapaba el corazón de la
  // primera tarjeta de la derecha en /colecciones/sunset-26, donde aterriza el
  // anuncio.
  const [lejos, setLejos] = useState(false)
  const lastYRef = useRef(0)

  // Use a ref for lastY so the scroll handler is stable (registered once, not
  // re-added on every scroll tick as it was when lastY lived in state).
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setLejos(y > window.innerHeight * 0.8)
      if (y < 200 || y < lastYRef.current) {
        setVisible(true)
      } else if (y > lastYRef.current + 8) {
        setVisible(false)
      }
      lastYRef.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Hide on admin, cart (has its own CTA), order form, /ig (ya tiene su
  // propio link grande de WhatsApp inline — la burbuja flotante sería un
  // segundo camino redundante en una página pensada para tener solo uno) y
  // /regalo (tiene su botón verde, y la burbuja tapaba el borde de los montos).
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/carrito') ||
    pathname.startsWith('/encargo') ||
    pathname.startsWith('/regalo') ||
    pathname === '/ig'
  ) return null

  if (!enabled) return null

  // Solo links de WhatsApp (QA-15): waLink normaliza 'wa.me/…' sin https y
  // 'api.whatsapp.com/send?phone=…', y devuelve null para cualquier otra cosa
  // que se haya pegado en Configuración (sin redirecciones abiertas).
  const safeWa = waLink(waUrl) !== null
  if (!safeWa) return null

  const href = waLink(waUrl, 'Hola! Estoy en el sitio de Dahila Crochet y tengo una consulta 🧶')!

  const demorada = pathname.startsWith('/tienda') || pathname.startsWith('/colecciones/')
  const mostrar = visible && (!demorada || lejos)

  // Dentro de un <aside> con nombre: queda como región propia y no suelto
  // fuera de todo landmark (axe "region", 19/09/2026). El link es fijo, así que
  // el contenedor no ocupa lugar ni cambia nada a la vista.
  return (
    <aside aria-label="Consulta por WhatsApp">
    <a
      // La clase existe para la regla de globals.css que la esconde en la
      // ficha del celular: ahí el WhatsApp va dentro de la barra fija.
      className="whatsapp-float"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Consultar por WhatsApp"
      // Escondida no se puede tocar ni enfocar (VIS-M1): con solo opacidad 0
      // seguía ahí, y en la ficha del celular se robaba el toque del borde
      // derecho de "Agregar al carrito" (se abría WhatsApp y no se agregaba).
      aria-hidden={!mostrar}
      tabIndex={mostrar ? undefined : -1}
      onClick={(e) => {
        // En la ficha, el mensaje ya dice qué prenda está mirando (y en qué
        // talle, si eligió uno): quien escribe no tiene que explicar "cuál" y
        // Anush no tiene que preguntarlo. Se arma al tocar, antes de que el
        // navegador siga el link.
        const product = document.querySelector('.producto-detail h1')?.textContent?.trim()
        if (product) {
          // Solo el grupo de talles: el corazón de favoritos también usa
          // aria-pressed. Ninguno marcado = nadie eligió talle, y no se manda.
          const sizes = document.querySelector('.pdp-sizes')
          const size = sizes?.querySelector('button[aria-pressed="true"]')?.textContent?.trim()
          const rotulo = sizes?.getAttribute('data-rotulo') || 'talle'
          const text = `Hola! Estoy mirando ${product}${size ? ` (${rotulo} ${size})` : ''} en la web: ${window.location.origin}${window.location.pathname}\nTengo una consulta 🧶`
          e.currentTarget.href = waLink(waUrl, text) ?? href
        }
        track('whatsapp_click', { source: product ? 'float_ficha' : 'float' })
      }}
      style={{
        position: 'fixed',
        bottom: 28,
        right: 24,
        // Mismo escalón que los otros botones flotantes de esquina
        // (BackToTop/WeaverCallout=40-45) — no arriba de drawers/modales
        // (90-200) ni de la barra sticky del PDP en mobile (45).
        zIndex: 40,
        width: 52,
        height: 52,
        borderRadius: 999,
        background: '#1E8449',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(30,132,73,0.38)',
        textDecoration: 'none',
        transform: mostrar ? 'translateY(0) scale(1)' : 'translateY(80px) scale(0.9)',
        opacity: mostrar ? 1 : 0,
        pointerEvents: mostrar ? 'auto' : 'none',
        visibility: mostrar ? 'visible' : 'hidden',
        // La curva del sitio, sin el rebote de antes (VIS-19). visibility
        // espera a que termine el fundido al esconderse y cambia al instante
        // al aparecer.
        transition: `transform 260ms ${dahila.ease}, opacity 220ms ease, visibility 0s linear ${mostrar ? '0s' : '220ms'}`,
        willChange: 'transform',
      }}
    >
      {/* WhatsApp SVG — inline, no external request */}
      <svg width="26" height="26" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
        <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.668 4.61 1.818 6.51L4 29l7.697-1.79A11.94 11.94 0 0016 28c6.627 0 12-5.373 12-12S22.627 3 16 3zm5.93 16.71c-.25.7-1.47 1.37-2.01 1.42-.54.05-1.05.24-3.54-.73-2.98-1.15-4.88-4.18-5.03-4.37-.15-.19-1.2-1.6-1.2-3.05 0-1.45.76-2.17 1.03-2.46.27-.29.59-.36.79-.36l.57.01c.18 0 .43-.07.67.51.25.6.85 2.06.92 2.21.07.15.12.33.02.53-.1.2-.15.32-.3.49-.15.17-.31.38-.44.51-.14.14-.29.29-.12.58.17.29.74 1.22 1.59 1.98 1.09.97 2.01 1.27 2.3 1.41.29.14.46.12.63-.07.17-.19.74-.86.94-1.15.2-.29.39-.24.66-.14.27.1 1.7.8 1.99.94.29.14.49.21.56.33.07.12.07.7-.18 1.4z"/>
      </svg>
    </a>
    </aside>
  )
}
