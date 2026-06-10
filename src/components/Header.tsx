'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useCart } from './CartProvider'
import { useFavorites } from './FavoritesProvider'
import { useScrollLock } from '@/lib/scroll-lock'
import { dahila, Icon } from './ui/Primitives'
import { formatPrice } from '@/lib/types'

interface Suggestion { slug: string; name: string; photo: string; price: number; soldout: boolean }

const NAV_ITEMS = [
  { id: '/tienda',      label: 'Tienda', mega: true },
  { id: '/colecciones', label: 'Colecciones' },
  { id: '/ofertas',     label: 'Ofertas', accent: true },
  { id: '/encargo',     label: 'A medida' },
  { id: '/atelier',     label: 'Sobre nosotros' },
  { id: '/contacto',    label: 'Contacto' },
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

export interface PromoBar {
  enabled: boolean
  text: string
  link: string
  bg: string
  fg: string
}

export function Header({ promo }: { promo?: PromoBar }) {
  const [open, setOpen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [searching, setSearching] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  // Small close delay so moving the mouse from the "Tienda" trigger down into
  // the panel (crossing the gap below the header) doesn't snap it shut.
  const megaTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cancelMegaClose = useCallback(() => {
    if (megaTimer.current) { clearTimeout(megaTimer.current); megaTimer.current = null }
  }, [])
  const openMega = useCallback(() => { cancelMegaClose(); setMegaOpen(true) }, [cancelMegaClose])
  const scheduleMegaClose = useCallback(() => {
    cancelMegaClose()
    megaTimer.current = setTimeout(() => setMegaOpen(false), 180)
  }, [cancelMegaClose])

  const { cartCount, hasMounted, openDrawer } = useCart()
  const { count: favCount, hasMounted: favMounted } = useFavorites()
  const showBadge = hasMounted && cartCount > 0
  const showFavBadge = favMounted && favCount > 0
  const pathname = usePathname()
  const router = useRouter()

  // Live search suggestions — debounced fetch while the search box is open.
  useEffect(() => {
    const q = searchVal.trim()
    if (!showSearch || q.length < 2) {
      // Clear stale results when the query is too short (syncing UI to input —
      // an acceptable use of setState in an effect).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions([])
      return
    }
    let cancelled = false
    const t = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
        const data = await res.json()
        if (!cancelled) setSuggestions(data.results || [])
      } catch {
        if (!cancelled) setSuggestions([])
      } finally {
        if (!cancelled) setSearching(false)
      }
    }, 220)
    return () => { cancelled = true; clearTimeout(t) }
  }, [searchVal, showSearch])

  // Mobile menu: lock body scroll while open, close on route change + Esc.
  useScrollLock(open)
  useEffect(() => {
    // Closing transient overlays when the route changes — syncing UI to
    // navigation, a legitimate setState-in-effect.
    /* eslint-disable react-hooks/set-state-in-effect */
    setOpen(false)
    setShowSearch(false)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [pathname])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Admin uses its own layout/chrome — never render the public header there.
  if (pathname.startsWith('/admin')) return null

  const iconBtn: React.CSSProperties = {
    background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  }

  const submitSearch = (e?: React.SyntheticEvent) => {
    e?.preventDefault()
    if (searchVal.trim()) {
      router.push(`/tienda?q=${encodeURIComponent(searchVal.trim())}`)
      setShowSearch(false)
      setSearchVal('')
    }
  }

  // Promo bar is CMS-driven; fall back to the brand benefits line. Hidden only
  // when the owner explicitly turns it off or clears the text.
  const promoText = (promo?.text ?? '').trim() || 'Hecho a mano en Uruguay · Envío a todo el país · A medida'
  const promoEnabled = promo?.enabled !== false && promoText.length > 0
  const promoBg = (promo?.bg ?? '').trim() || dahila.ink900
  const promoFg = (promo?.fg ?? '').trim() || '#fff'
  const promoLink = (promo?.link ?? '').trim()

  return (
    <>
      {/* Announcement / promo bar — text/link/colours editable from the admin. */}
      {promoEnabled && (
        <div className="announce-bar" role="note" style={{
          background: promoBg, color: promoFg,
          textAlign: 'center', padding: '8px 16px',
          fontFamily: dahila.fontSans, fontSize: 11.5, fontWeight: 400,
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          {promoLink ? (
            <Link href={promoLink} style={{ color: promoFg, textDecoration: 'none' }}>{promoText}</Link>
          ) : promoText}
        </div>
      )}

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
          {/* Left: hamburger (mobile only). Visibility is controlled by the
              .nav-mobile CSS class — we deliberately do NOT set `display` inline
              here, because an inline display would override the class's
              `display:none` and leak the hamburger onto desktop. */}
          <button
            onClick={() => setOpen(!open)}
            className="nav-mobile"
            aria-label="Menú"
            aria-expanded={open}
            aria-controls="mobile-menu"
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
              width: 26, height: 26, alignItems: 'center', justifyContent: 'center',
              color: dahila.ink900,
            }}
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
                    onMouseEnter={openMega}
                    onMouseLeave={scheduleMegaClose}
                    style={{ display: 'inline-flex', alignItems: 'center' }}
                  >
                    <Link
                      href={it.id}
                      style={linkStyle}
                      aria-haspopup="true"
                      aria-expanded={megaOpen}
                      onFocus={openMega}
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
              <div style={{ position: 'relative' }}>
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
                    aria-label="Buscar prendas"
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

                {/* Live suggestions */}
                {searchVal.trim().length >= 2 && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                    width: 320, maxWidth: '85vw',
                    background: '#fff', borderRadius: 12,
                    border: `1px solid ${dahila.border}`, boxShadow: dahila.shadowMd,
                    overflow: 'hidden', zIndex: 60,
                  }}>
                    {searching && suggestions.length === 0 ? (
                      <div style={{ padding: '16px', fontFamily: dahila.fontSans, fontSize: 13, color: dahila.ink500 }}>Buscando…</div>
                    ) : suggestions.length === 0 ? (
                      <div style={{ padding: '16px', fontFamily: dahila.fontSans, fontSize: 13, color: dahila.ink500 }}>Sin resultados.</div>
                    ) : (
                      <>
                        {suggestions.map((sug) => (
                          <Link
                            key={sug.slug}
                            href={`/tienda/${sug.slug}`}
                            onClick={() => { setShowSearch(false); setSearchVal('') }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 12,
                              padding: '10px 14px', textDecoration: 'none', color: 'inherit',
                              borderBottom: `1px solid ${dahila.border}`,
                            }}
                          >
                            <div style={{ position: 'relative', width: 40, height: 50, flexShrink: 0, borderRadius: 6, overflow: 'hidden', background: dahila.cream50 }}>
                              <Image src={sug.photo} alt="" fill sizes="40px" style={{ objectFit: 'cover' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 14, color: dahila.ink900, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sug.name}</div>
                              <div style={{ fontFamily: dahila.fontSans, fontSize: 12, color: sug.soldout ? dahila.ink500 : dahila.ink700 }}>
                                {sug.soldout ? 'Agotado' : formatPrice(sug.price)}
                              </div>
                            </div>
                          </Link>
                        ))}
                        <button
                          onClick={submitSearch}
                          style={{
                            width: '100%', textAlign: 'left', background: dahila.cream50, border: 'none', cursor: 'pointer',
                            padding: '11px 14px', fontFamily: dahila.fontSans, fontSize: 12,
                            color: dahila.ink900, letterSpacing: '0.04em',
                          }}
                        >
                          Ver todos los resultados →
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setShowSearch(true)} style={{ ...iconBtn, width: 26, height: 26 }} aria-label="Buscar">
                <Icon name="magnifying-glass" size={20}/>
              </button>
            )}

            <Link
              href="/favoritos"
              style={{ ...iconBtn, position: 'relative', width: 26, height: 26, color: dahila.ink900, textDecoration: 'none' }}
              aria-label={`Favoritos${showFavBadge ? ` (${favCount})` : ''}`}
            >
              <Icon name="heart" size={20}/>
              {showFavBadge && (
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute', top: -5, right: -7,
                    minWidth: 17, height: 17, borderRadius: 999,
                    background: dahila.ink900, color: '#fff',
                    fontFamily: dahila.fontSans, fontSize: 10, fontWeight: 500,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 5px', lineHeight: 1,
                    boxShadow: '0 0 0 2px #fff',
                  }}
                >{favCount}</span>
              )}
            </Link>

            <button
              onClick={openDrawer}
              style={{ ...iconBtn, position: 'relative', width: 26, height: 26 }}
              aria-label={`Abrir carrito${showBadge ? ` (${cartCount})` : ''}`}
            >
              <Icon name="shopping-bag" size={20}/>
              {showBadge && (
                <span
                  key={cartCount}
                  aria-hidden="true"
                  className="cart-badge-pop"
                  style={{
                    position: 'absolute', top: -5, right: -7,
                    minWidth: 17, height: 17, borderRadius: 999,
                    background: '#B6314A', color: '#fff',
                    fontFamily: dahila.fontSans, fontSize: 10, fontWeight: 500,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 5px', lineHeight: 1,
                    boxShadow: '0 0 0 2px #fff',
                  }}
                >{cartCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* Mega-menu (desktop) — drops from the Tienda item, full width */}
        <div
          className="mega-menu"
          onMouseEnter={openMega}
          onMouseLeave={scheduleMegaClose}
          inert={!megaOpen}
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
                    <Link href={`/tienda/${c.slug}`} onClick={() => setMegaOpen(false)} style={{ textDecoration: 'none', fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 17, color: dahila.ink700 }}>
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
                <li><Link href="/atelier" onClick={() => setMegaOpen(false)} style={{ textDecoration: 'none', fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 17, color: dahila.ink700 }}>Sobre nosotros</Link></li>
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

      </header>

      {/* Mobile menu — rendered OUTSIDE the <header> so backdrop-filter on the
          sticky header doesn't create a new stacking context that traps these
          fixed-position overlays and clips/hides them on iOS Safari / Chrome. */}
      <div
        className="mobile-menu-scrim"
        onClick={() => setOpen(false)}
        aria-hidden={!open}
        style={{
          position: 'fixed', inset: 0, zIndex: 80,
          background: 'rgba(20,16,17,0.4)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: `opacity 220ms ${dahila.ease}`,
        }}
      />
      <aside
        id="mobile-menu"
        className="mobile-menu-panel"
        inert={!open}
        aria-label="Menú"
        style={{
          position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 81,
          width: 'min(320px, 86vw)',
          background: '#fff',
          display: 'flex', flexDirection: 'column',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: `transform 280ms ${dahila.ease}`,
          boxShadow: open ? '20px 0 50px -30px rgba(31,26,27,0.4)' : 'none',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: `1px solid ${dahila.border}`,
        }}>
          <span style={{ fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 20, letterSpacing: '0.16em', color: dahila.ink900 }}>DAHILA</span>
          <button onClick={() => setOpen(false)} aria-label="Cerrar menú" style={{
            background: 'transparent', border: 'none', cursor: 'pointer', color: dahila.ink900,
            width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="x" size={20} />
          </button>
        </div>
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 16px', display: 'flex', flexDirection: 'column' }}>
          {NAV_ITEMS.map((it) => {
            const base = it.id.split('?')[0]
            const on = !it.id.includes('?') && pathname === base
            return (
              <Link key={it.id} href={it.id} onClick={() => setOpen(false)} style={{
                textDecoration: 'none',
                fontFamily: dahila.fontSans, fontSize: 16, fontWeight: it.accent ? 500 : (on ? 500 : 300),
                color: it.accent ? '#B6314A' : dahila.ink900, textAlign: 'left', padding: '15px 0',
                letterSpacing: '0.04em',
                borderBottom: `1px solid ${dahila.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span>{it.label}</span>
                {on && <span aria-hidden style={{ width: 6, height: 6, borderRadius: 999, background: it.accent ? '#B6314A' : dahila.ink900 }} />}
              </Link>
            )
          })}
          <Link href="/favoritos" onClick={() => setOpen(false)} style={{
            textDecoration: 'none',
            fontFamily: dahila.fontSans, fontSize: 16, fontWeight: 300,
            color: dahila.ink900, textAlign: 'left', padding: '15px 0',
            letterSpacing: '0.04em', borderBottom: `1px solid ${dahila.border}`,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Icon name="heart" size={18} color={dahila.ink700} />
            <span>Favoritos{showFavBadge ? ` (${favCount})` : ''}</span>
          </Link>
        </nav>
        <div style={{ padding: '16px 20px calc(env(safe-area-inset-bottom, 0px) + 16px)', borderTop: `1px solid ${dahila.border}`, display: 'flex', gap: 16 }}>
          <a href="https://www.instagram.com/dahila.crochet/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ color: dahila.ink700 }}><Icon name="instagram-logo" size={20} /></a>
          <a href="https://wa.me/59894605015" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" style={{ color: dahila.ink700 }}><Icon name="whatsapp-logo" size={20} /></a>
        </div>
      </aside>
    </>
  )
}
