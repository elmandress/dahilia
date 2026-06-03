'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { dahila } from './ui/Primitives'
import { STUDIO_INSTAGRAM, STUDIO_URL } from '@/lib/env'

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

export function Footer() {
  const pathname = usePathname()
  if (pathname.startsWith('/admin')) return null

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
              Prendas tejidas a mano, a tu medida, desde Montevideo.
            </p>
          </div>

          <FooterCol
            title="Tienda"
            items={[
              { label: 'Novedades',  href: '/tienda' },
              { label: 'Tops',       href: '/tienda?cat=tops' },
              { label: 'Accesorios', href: '/tienda?cat=accesorios' },
              { label: 'A medida',   href: '/encargo' },
            ]}
          />
          <FooterCol
            title="Info"
            items={[
              { label: 'Cómo encargar', href: '/encargo' },
              { label: 'Atelier',       href: '/atelier' },
              { label: 'Contacto',      href: '/contacto' },
            ]}
          />
          <FooterCol
            title="Contacto"
            items={[
              { label: 'hola@dahila.uy',          href: 'mailto:hola@dahila.uy' },
              { label: '@dahila.crochet',         href: 'https://www.instagram.com/dahila.crochet/' },
              { label: 'WhatsApp · 94 605 015',   href: 'https://wa.me/59894605015' },
            ]}
          />
        </div>

        {/* Copyright row */}
        <div style={{
          marginTop: 56, paddingTop: 22,
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
