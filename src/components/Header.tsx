'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useCart } from './CartProvider'
import { dahila, Icon } from './ui/Primitives'

const NAV_ITEMS = [
  { id: '/tienda',   label: 'Tienda' },
  { id: '/tienda?cat=tops', label: 'Tops' },
  { id: '/tienda?cat=accesorios', label: 'Accesorios' },
  { id: '/encargo',  label: 'A medida' },
  { id: '/atelier',  label: 'Sobre Anush' },
  { id: '/contacto', label: 'Contacto' },
]

export function Header() {
  const [open, setOpen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchVal, setSearchVal] = useState('')
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
              // Highlight the plain route match. Category sub-links (with a
              // query string) never show as "active" — usePathname ignores the
              // query — which avoids double-highlighting with "Tienda".
              const on = !it.id.includes('?') && pathname === base
              return (
                <Link key={it.id} href={it.id} style={{
                  textDecoration: 'none',
                  fontFamily: dahila.fontSans, fontSize: 12, fontWeight: 400,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  color: on ? dahila.ink900 : dahila.ink700,
                  paddingBottom: 2,
                  borderBottom: on ? `1px solid ${dahila.ink900}` : '1px solid transparent',
                  transition: `color 140ms ${dahila.ease}`,
                }}>{it.label}</Link>
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
                fontFamily: dahila.fontSans, fontSize: 15, fontWeight: 300,
                color: dahila.ink900, textAlign: 'left', padding: '13px 0',
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
