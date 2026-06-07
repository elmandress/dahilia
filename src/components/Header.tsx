'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useCart } from './CartProvider'
import { dahila, Icon } from './ui/Primitives'

const NAV_ITEMS = [
  { id: '/tienda',   label: 'Tienda', mega: true },
  { id: '/ofertas',  label: 'Ofertas', accent: true },
  { id: '/encargo',  label: 'A medida' },
  { id: '/atelier',  label: 'Sobre Anush' },
  { id: '/contacto', label: 'Contacto' },
]

// Categories shown in the Tienda mega-menu. Static on purpose: the catalogue
// uses these stable slugs (seeded in schema.sql) and keeping them out of a
// per-render DB call keeps every page fast. Update here if categories change.
const MEGA_CATEGORIES = [
  { slug: 'tops',       label: 'Tops' },
  { slug: 'cardigans',  label: 'Cardigans' },
  { slug: 'accesorios', label: 'Accesorios' },
  { slug: 'sets',       label: 'Sets' },
]

export function Header() {
  const [open, setOpen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const [megaOpen, setMegaOpen] = useState(false)
  const { cartCount, hasMounted } = useCart()
  const showBadge = hasMounted && cartCount > 0
  const pathname = usePathname()
  const router = useRouter()

  // Admin uses its own layout/chrome — never render the public header there.
  if (pathname.startsWith('/admin')) return null

  const iconBtn: React.CSSProperties = {
    background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  }

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchVal.trim()) {
      router.push(`/tienda?q=${encodeURIComponent(searchVal.trim())}`)
      setShowSearch(false)
      setSearchVal('')
    }
  }

  return (
    <>
      {/* Announcement / benefits bar */}
      <div className="announce-bar" role="note" style={{
        background: dahila.ink900, color: '#fff',
        textAlign: 'center', padding: '8px 16px',
        fontFamily: dahila.fontSans, fontSize: 11.5, fontWeight: 400,
        letterSpacing: '0.08em', textTransform: 'uppercase',
      }}>
        Hecho a mano en Uruguay · Envío a todo el país · A medida
      </div>

      <header className="site-header" style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.94)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: `1px solid ${dahila.border}`,
      }}>
        <div className="site-header-inner" style={{
          maxWidth: 1280, margin: '0 auto',
          padding: '14px 24px',
          display: 'flex', alignItems: 'center', gap: 20,
        }}>
          {/* Left: hamburger (mobile) + brand */}
          <button
            onClick={() => setOpen(!open)}
            className="nav-mobile"
            aria-label="Menú"
            aria-expanded={open}
            aria-controls="mobile-menu"
            style={{ ...iconBtn, width: 26, height: 26, color: dahila.ink900 }}
          >
            <Icon name={open ? 'x' : 'list'} size={22}/>
          </button>

          <Link href="/" className="brand-link" style={{
            display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none',
            marginRight: 8,
          }}>
            <Image src="/isotype-color.png" alt="" width={34} height={34} fetchPriority="high" style={{ objectFit: 'contain' }} className="brand-mark" />
            <span className="brand-wordmark" style={{
              fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 22,
              color: dahila.ink900, letterSpacing: '0.18em',
            }}>DAHILA</span>
          </Link>

          {/* Center-left: horizontal nav (desktop) */}
          <nav className="nav-desktop" aria-label="Principal" style={{ display: 'flex', gap: 26, flex: 1 }}>
            {NAV_ITEMS.map((it) => {
              const base = it.id.split('?')[0]
              const on = !it.id.includes('?') && pathname === base
              const accentColor = it.accent ? '#B6314A' : (on ? dahila.ink900 : dahila.ink700)
              const linkStyle: React.CSSProperties = {
                textDecoration: 'none',
                fontFamily: dahila.fontSans, fontSize: 12, fontWeight: it.accent ? 500 : 400,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                color: accentColor,
                paddingBottom: 2,
                borderBottom: on ? `1px solid ${accentColor}` : '1px solid transparent',
                transition: `color 140ms ${dahila.ease}`,
              }

              if (it.mega) {
                return (
                  <div
                    key={it.id}
                    onMouseEnter={() => setMegaOpen(true)}
                    onMouseLeave={() => setMegaOpen(false)}
                    style={{ display: 'inline-flex', alignItems: 'center' }}
                  >
                    <Link
                      href={it.id}
                      style={linkStyle}
                      aria-haspopup="true"
                      aria-expanded={megaOpen}
                      onFocus={() => setMegaOpen(true)}
                    >
                      {it.label}
                    </Link>
                  </div>
                )
              }
              return (
                <Link key={it.id} href={it.id} style={linkStyle}>{it.label}</Link>
              )
            })}
          </nav>

          {/* Right: search (inline expand) + cart */}
          <div className="header-actions" style={{
            display: 'flex', gap: 16, alignItems: 'center', color: dahila.ink900,
            marginLeft: 'auto',
          }}>
            {showSearch ? (
              <form onSubmit={submitSearch} className="header-search" style={{
                display: 'flex', alignItems: 'center', gap: 8,
                borderBottom: `1px solid ${dahila.borderStrong}`,
              }}>
                <Icon name="magnifying-glass" size={16} color={dahila.ink500} />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  autoFocus
                  style={{
                    background: 'transparent', border: 'none', outline: 'none',
                    fontFamily: dahila.fontSans, fontSize: 14, color: dahila.ink900,
                    width: 160,
                  }}
                />
                <button type="button" onClick={() => { setShowSearch(false); setSearchVal('') }} style={{ ...iconBtn, padding: 2 }} aria-label="Cerrar búsqueda">
                  <Icon name="x" size={16}/>
                </button>
              </form>
            ) : (
              <button onClick={() => setShowSearch(true)} style={{ ...iconBtn, width: 26, height: 26 }} aria-label="Buscar">
                <Icon name="magnifying-glass" size={20}/>
              </button>
            )}

            <button
              onClick={() => router.push('/carrito')}
              style={{ ...iconBtn, position: 'relative', width: 26, height: 26 }}
              aria-label={`Carrito${showBadge ? ` (${cartCount})` : ''}`}
            >
              <Icon name="shopping-bag" size={20}/>
              {showBadge && (
                <span aria-hidden="true" style={{
                  position: 'absolute', top: -5, right: -7,
                  minWidth: 17, height: 17, borderRadius: 999,
                  background: '#B6314A', color: '#fff',
                  fontFamily: dahila.fontSans, fontSize: 10, fontWeight: 500,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 5px', lineHeight: 1,
                  boxShadow: '0 0 0 2px #fff',
                }}>{cartCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* Mega-menu (desktop) — drops from the Tienda item, full width */}
        <div
          className="mega-menu"
          onMouseEnter={() => setMegaOpen(true)}
          onMouseLeave={() => setMegaOpen(false)}
          aria-hidden={!megaOpen}
          style={{
            position: 'absolute', left: 0, right: 0, top: '100%',
            background: '#fff',
            borderTop: `1px solid ${dahila.border}`,
            borderBottom: `1px solid ${dahila.border}`,
            boxShadow: megaOpen ? dahila.shadowMd : 'none',
            overflow: 'hidden',
            maxHeight: megaOpen ? 360 : 0,
            opacity: megaOpen ? 1 : 0,
            transition: `max-height 220ms ${dahila.ease}, opacity 180ms ${dahila.ease}`,
            pointerEvents: megaOpen ? 'auto' : 'none',
          }}
        >
          <div style={{
            maxWidth: 1280, margin: '0 auto', padding: '28px 24px',
            display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: 32, alignItems: 'start',
          }}>
            {/* Categories */}
            <div>
              <div style={{ fontFamily: dahila.fontSans, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: dahila.ink500, marginBottom: 14 }}>
                Categorías
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <li>
                  <Link href="/tienda" onClick={() => setMegaOpen(false)} style={{ textDecoration: 'none', fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 17, color: dahila.ink900 }}>
                    Toda la colección
                  </Link>
                </li>
                {MEGA_CATEGORIES.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/tienda?cat=${c.slug}`} onClick={() => setMegaOpen(false)} style={{ textDecoration: 'none', fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 17, color: dahila.ink700 }}>
                      {c.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick links */}
            <div>
              <div style={{ fontFamily: dahila.fontSans, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: dahila.ink500, marginBottom: 14 }}>
                Descubrir
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <li><Link href="/ofertas" onClick={() => setMegaOpen(false)} style={{ textDecoration: 'none', fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 17, color: '#B6314A' }}>Ofertas</Link></li>
                <li><Link href="/encargo" onClick={() => setMegaOpen(false)} style={{ textDecoration: 'none', fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 17, color: dahila.ink700 }}>Encargo a medida</Link></li>
                <li><Link href="/atelier" onClick={() => setMegaOpen(false)} style={{ textDecoration: 'none', fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 17, color: dahila.ink700 }}>Sobre Anush</Link></li>
              </ul>
            </div>

            {/* Featured promo tile */}
            <Link
              href="/ofertas"
              onClick={() => setMegaOpen(false)}
              style={{
                position: 'relative', display: 'block',
                borderRadius: 12, overflow: 'hidden',
                background: dahila.cream100, minHeight: 150, textDecoration: 'none',
              }}
            >
              <div style={{ position: 'relative', width: '100%', height: 150 }}>
                <Image src="/photos/top-lace-parque.png" alt="" fill quality={82} sizes="420px" style={{ objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(31,26,27,0.55), rgba(31,26,27,0))' }} />
                <div style={{ position: 'absolute', left: 16, bottom: 14, color: '#fff' }}>
                  <div style={{ fontFamily: dahila.fontSans, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.9 }}>Temporada</div>
                  <div style={{ fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 22 }}>Ver ofertas →</div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Mobile menu drawer */}
        <div
          id="mobile-menu"
          aria-hidden={!open}
          style={{
            overflow: 'hidden',
            maxHeight: open ? 420 : 0,
            opacity: open ? 1 : 0,
            transition: `max-height 260ms ${dahila.ease}, opacity 200ms ${dahila.ease}`,
            background: '#fff',
            borderTop: open ? `1px solid ${dahila.border}` : '1px solid transparent',
          }}
        >
          <div style={{ padding: '8px 24px 16px', display: 'flex', flexDirection: 'column' }}>
            {NAV_ITEMS.map((it) => (
              <Link key={it.id} href={it.id} onClick={() => setOpen(false)} style={{
                textDecoration: 'none',
                fontFamily: dahila.fontSans, fontSize: 15, fontWeight: it.accent ? 500 : 300,
                color: it.accent ? '#B6314A' : dahila.ink900, textAlign: 'left', padding: '13px 0',
                letterSpacing: '0.04em',
                borderBottom: `1px solid ${dahila.border}`,
              }}>{it.label}</Link>
            ))}
          </div>
        </div>
      </header>
    </>
  )
}
