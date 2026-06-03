'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useCart } from './CartProvider'
import { dahila, Icon } from './ui/Primitives'

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

  const items = [
    { id: '/tienda',  label: 'Tienda' },
    { id: '/encargo', label: 'Encargos' },
    { id: '/atelier', label: 'Atelier' },
    { id: '/contacto', label: 'Contacto' },
  ]

  const iconBtn = {
    background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0,
    display: 'inline-flex', alignItems: 'center',
  }

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      borderBottom: `1px solid ${dahila.border}`,
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        padding: '14px 24px',
        display: showSearch ? 'flex' : 'grid',
        gridTemplateColumns: showSearch ? undefined : '1fr auto 1fr',
        alignItems: 'center', gap: 24,
      }}>
        {showSearch ? (
          <form onSubmit={(e) => {
            e.preventDefault()
            if (searchVal.trim()) {
              router.push(`/tienda?q=${encodeURIComponent(searchVal.trim())}`)
              setShowSearch(false)
              setSearchVal('')
            }
          }} style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%' }}>
            <Icon name="magnifying-glass" size={18} color={dahila.ink500} />
            <input
              type="text"
              placeholder="Buscar prendas por nombre o descripción..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              autoFocus
              style={{
                background: 'transparent', border: 'none',
                outline: 'none', fontFamily: dahila.fontSans, fontSize: 14,
                width: '100%', color: dahila.ink900
              }}
            />
            <button type="button" onClick={() => setShowSearch(false)} style={{ ...iconBtn, padding: 4 }} aria-label="Cerrar búsqueda">
              <Icon name="x" size={18}/>
            </button>
          </form>
        ) : (
          <>
            {/* Left: nav (desktop) / hamburger (mobile) */}
            <nav className="nav-desktop" style={{ display: 'flex', gap: 28 }}>
              {items.map((it) => {
                const on = pathname === it.id || (pathname.startsWith('/tienda') && it.id === '/tienda')
                return (
                  <Link key={it.id} href={it.id} style={{
                    background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'none',
                    fontFamily: dahila.fontSans, fontSize: 12, fontWeight: 400,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    color: on ? dahila.ink900 : dahila.ink700, padding: 0,
                  }}>{it.label}</Link>
                )
              })}
            </nav>
            <button
              onClick={() => setOpen(!open)}
              className="nav-mobile"
              aria-label="Menú"
              aria-expanded={open}
              aria-controls="mobile-menu"
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer', color: dahila.ink900,
                padding: 0, width: 24, height: 24, alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Icon name={open ? 'x' : 'list'} size={22}/>
            </button>

            {/* Center: brand */}
            <Link href="/" style={{
              display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none',
              background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
              justifySelf: 'center',
            }}>
              <Image src="/isotype-color.png" alt="" width={40} height={40} priority style={{ objectFit: 'contain' }} />
              <span style={{
                fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 22,
                color: dahila.ink900, letterSpacing: '0.18em',
              }}>DAHILA</span>
            </Link>

            {/* Right: icons */}
            <div style={{ display: 'flex', gap: 18, alignItems: 'center', color: dahila.ink900, justifySelf: 'end' }}>
              <button onClick={() => setShowSearch(true)} style={{ ...iconBtn, width: 22, height: 22, justifyContent: 'center' }} aria-label="Buscar"><Icon name="magnifying-glass" size={20}/></button>
              <button style={{ ...iconBtn, width: 22, height: 22, justifyContent: 'center' }} aria-label="Lista de deseos"><Icon name="heart" size={20}/></button>
              <button onClick={() => router.push('/carrito')} style={{ ...iconBtn, position: 'relative', width: 22, height: 22, justifyContent: 'center' }} aria-label={`Carrito${showBadge ? ` (${cartCount})` : ''}`}>
                <Icon name="shopping-bag" size={20}/>
                {showBadge && (
                  <span aria-hidden="true" style={{
                    position: 'absolute', top: -5, right: -7,
                    minWidth: 17, height: 17, borderRadius: 999,
                    background: '#B6314A', color: '#fff',
                    fontFamily: dahila.fontSans, fontSize: 10, fontWeight: 500,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 5px',
                    lineHeight: 1,
                    boxShadow: '0 0 0 2px #fff',
                  }}>{cartCount}</span>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Mobile menu drawer — animated height + opacity to avoid CLS */}
      <div
        id="mobile-menu"
        aria-hidden={!open}
        style={{
          overflow: 'hidden',
          maxHeight: open ? 320 : 0,
          opacity: open ? 1 : 0,
          transition: `max-height 260ms ${dahila.ease}, opacity 200ms ${dahila.ease}`,
          background: '#fff',
          borderTop: open ? `1px solid ${dahila.border}` : '1px solid transparent',
        }}
      >
        <div style={{ padding: '8px 24px 14px', display: 'flex', flexDirection: 'column' }}>
          {items.map((it) => (
            <Link key={it.id} href={it.id} onClick={() => setOpen(false)} style={{
              background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'none',
              fontFamily: dahila.fontSans, fontSize: 14, fontWeight: 300,
              color: dahila.ink900, textAlign: 'left', padding: '12px 0',
              letterSpacing: '0.04em',
              borderBottom: `1px solid ${dahila.border}`,
            }}>{it.label}</Link>
          ))}
        </div>
      </div>

    </header>
  )
}
