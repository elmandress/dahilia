'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useTransition } from 'react'
import { dahila } from './ui/Primitives'
import { STUDIO_INSTAGRAM, STUDIO_URL } from '@/lib/env'
import { subscribeToVipList } from '@/lib/subscribe'
import { track } from '@/lib/analytics'

interface NavItem { label: string; href: string }

function FooterCol({ title, items }: { title: string; items: NavItem[] }) {
  return (
    <div>
      <div style={{
        fontFamily: dahila.fontSans, fontSize: 10, letterSpacing: '0.22em',
        textTransform: 'uppercase', color: dahila.ink500, marginBottom: 14,
      }}>{title}</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
        {items.map((it) => {
          const external = it.href.startsWith('http') || it.href.startsWith('mailto:')
          return (
            <li key={it.label} style={{ fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 300, color: dahila.ink700 }}>
              {external ? (
                <a
                  href={it.href}
                  target={it.href.startsWith('http') ? '_blank' : undefined}
                  rel={it.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  {it.label}
                </a>
              ) : (
                <Link href={it.href} style={{ color: 'inherit', textDecoration: 'none' }}>{it.label}</Link>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// Lista VIP — captura de email para drops/lanzamientos. La promesa es honesta:
// acceso anticipado a cada colección, nada de spam.
function VipSignup() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const res = await subscribeToVipList(email, 'footer')
      if (res.ok) {
        if (!res.already) track('vip_subscribe', { source: 'footer' })
        setDone(res.already ? 'Ya estabas en la lista — te avisamos primero.' : '¡Lista! Vas a ver cada colección antes que nadie.')
      } else {
        setError(res.error || 'No pudimos anotarte. Probá de nuevo.')
      }
    })
  }

  return (
    <div style={{
      marginTop: 52, paddingTop: 32, borderTop: `1px solid ${dahila.border}`,
      display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-end', justifyContent: 'space-between',
    }}>
      <div style={{ maxWidth: 420 }}>
        <div style={{
          fontFamily: dahila.fontSans, fontSize: 10, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: dahila.ink500, marginBottom: 8,
        }}>Lista VIP</div>
        <p style={{ fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 300, lineHeight: 1.6, color: dahila.ink700, margin: 0 }}>
          Cada colección sale en cantidades chicas — es tejido a mano.
          Anotate y comprá 24 horas antes que el resto.
        </p>
      </div>
      {done ? (
        <p role="status" style={{ fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 400, color: dahila.wine600, margin: 0 }}>
          {done}
        </p>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="email"
              required
              placeholder="tu@correo.uy"
              aria-label="Tu email para la lista VIP"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                fontFamily: dahila.fontSans, fontSize: 14, fontWeight: 300, color: dahila.ink900,
                background: 'transparent', border: 'none',
                borderBottom: `1px solid ${dahila.borderStrong}`,
                padding: '10px 0 8px', minWidth: 220,
              }}
            />
            <button
              type="submit"
              disabled={isPending}
              style={{
                fontFamily: dahila.fontSans, fontSize: 11, fontWeight: 500,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                background: dahila.ink900, color: '#fff', border: 'none',
                borderRadius: 8, padding: '12px 18px', cursor: isPending ? 'wait' : 'pointer',
                opacity: isPending ? 0.7 : 1,
              }}
            >
              {isPending ? 'Anotando…' : 'Quiero acceso anticipado'}
            </button>
          </div>
          {error && (
            <span role="alert" style={{ fontFamily: dahila.fontSans, fontSize: 12, color: '#B6314A' }}>
              {error}
            </span>
          )}
        </form>
      )}
    </div>
  )
}

export function Footer({
  tagline = 'Prendas tejidas a mano, a tu medida, desde Montevideo.',
  showOfertas = true,
  showColecciones = true,
}: { tagline?: string; showOfertas?: boolean; showColecciones?: boolean }) {
  const pathname = usePathname()

  if (pathname.startsWith('/admin')) return null

  // Misma regla estacional que el header: los links a páginas sin contenido
  // real no se muestran (nadie debería aterrizar en un "pronto…").
  const tiendaLinks = [
    { label: 'Novedades',    href: '/tienda' },
    ...(showOfertas ? [{ label: 'Ofertas', href: '/ofertas' }] : []),
    ...(showColecciones ? [{ label: 'Colecciones', href: '/colecciones' }] : []),
    { label: 'A medida',     href: '/encargo' },
  ]

  return (
    <footer style={{
      background: '#fff',
      borderTop: `1px solid ${dahila.border}`,
      padding: '64px 24px 28px',
      marginTop: 96,
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="footer-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1.6fr 1fr 1fr 1fr',
          gap: 48, alignItems: 'start',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Image src="/isotype-color.png" alt="" width={36} height={36} style={{ objectFit: 'contain' }} />
              <span style={{ fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 24, letterSpacing: '0.18em', color: dahila.ink900 }}>DAHILA</span>
            </div>
            <p style={{ fontFamily: dahila.fontSerif, fontStyle: 'italic', fontWeight: 300, fontSize: 16, lineHeight: 1.55, color: dahila.ink700, maxWidth: 320, margin: 0 }}>
              {tagline}
            </p>
          </div>

          <FooterCol
            title="Tienda"
            items={tiendaLinks}
          />
          <FooterCol
            title="Info"
            items={[
              { label: 'Envíos y cambios',  href: '/info' },
              { label: 'Sobre nosotros',    href: '/atelier' },
              { label: 'Contacto',          href: '/contacto' },
              { label: 'Estado de encargo', href: '/encargo/estado' },
              { label: 'Tejé con Dahila',   href: '/tejedoras' },
              { label: 'Términos y cond.',  href: '/terminos' },
            ]}
          />
          <FooterCol
            title="Contacto"
            items={[
              { label: '@dahila.crochet',         href: 'https://www.instagram.com/dahila.crochet/' },
              { label: 'WhatsApp · 99 850 073',   href: 'https://wa.me/59899850073' },
            ]}
          />
        </div>

        <VipSignup />

        {/* Copyright row */}
        <div style={{
          marginTop: 40, paddingTop: 22,
          borderTop: `1px solid ${dahila.border}`,
          display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          fontFamily: dahila.fontSans, fontSize: 11, fontWeight: 400, color: dahila.ink500,
          letterSpacing: '0.06em',
        }}>
          <span>© {new Date().getFullYear()} Dahila Crochet — hecho a mano en Uruguay</span>
          <span>Montevideo · Uruguay</span>
        </div>

        {/* "Desarrollado por" row — centred, secondary credit */}
        <div style={{
          marginTop: 18,
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
          fontFamily: dahila.fontSans, fontSize: 11, fontWeight: 300,
          color: dahila.ink500, letterSpacing: '0.06em',
        }}>
          <span>Desarrollado por</span>
          <a
            href={STUDIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="SIAR — sitio web"
            style={{
              color: dahila.ink700,
              fontWeight: 500,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              borderBottom: `1px solid ${dahila.borderStrong}`,
              paddingBottom: 1,
            }}
          >
            SIAR
          </a>
          <span aria-hidden="true" style={{ color: dahila.ink300 }}>·</span>
          <a
            href={STUDIO_INSTAGRAM}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="SIAR en Instagram"
            style={{ color: dahila.ink500, textDecoration: 'none' }}
          >
            @siar.uy
          </a>
        </div>
      </div>

    </footer>
  )
}
