'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Image from 'next/image'
import type { Product, Category, Color, Discount } from '@/lib/types'
import { ProductCard } from '@/components/ProductCard'
import { getFinalPrice, BLUR_DATA_URL } from '@/lib/types'
import { dahila, Eyebrow, Chip, Icon } from '@/components/ui/Primitives'
import { track } from '@/lib/analytics'

/** Reads recently-viewed from localStorage and shows a strip above the grid. */
function RecentlyViewedStrip() {
  const [items, setItems] = useState<{ slug: string; name: string; photo: string; price: number }[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('dahila_recently_viewed')
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw) ?? [])
    } catch {}
  }, [])

  if (items.length < 2) return null

  return (
    <section className="tienda-recent" style={{ marginBottom: 40 }}>
      <div style={{
        fontFamily: dahila.fontSans, fontSize: 11, letterSpacing: '0.18em',
        textTransform: 'uppercase', color: dahila.ink500, marginBottom: 16,
      }}>
        Viste hace poco
      </div>
      <div style={{
        display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 4,
        scrollSnapType: 'x proximity',
      }}>
        {items.slice(0, 6).map((p) => (
          <Link
            key={p.slug}
            href={`/tienda/${p.slug}`}
            className="tienda-recent-item"
            style={{
              flexShrink: 0, width: 100, textDecoration: 'none', color: 'inherit',
              scrollSnapAlign: 'start',
            }}
          >
            <div className="tienda-recent-thumb" style={{
              position: 'relative', width: 100, height: 124,
              borderRadius: 8, overflow: 'hidden', background: dahila.cream50, marginBottom: 6,
            }}>
              <Image src={p.photo} alt={p.name} fill quality={82} sizes="100px"
                placeholder="blur" blurDataURL={BLUR_DATA_URL} style={{ objectFit: 'cover' }} />
            </div>
            <div style={{ fontFamily: dahila.fontSans, fontSize: 11, color: dahila.ink900, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {p.name}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

// Quick-view is only needed once the shopper opens it — load it on demand so
// it stays out of the initial tienda bundle.
const QuickViewModal = dynamic(
  () => import('@/components/QuickViewModal').then((m) => m.QuickViewModal),
  { ssr: false }
)

type SortKey = 'recientes' | 'precio-asc' | 'precio-desc' | 'nombre'

const SORT_LABELS: Record<SortKey, string> = {
  recientes: 'Más recientes',
  'precio-asc': 'Precio: de menor a mayor',
  'precio-desc': 'Precio: de mayor a menor',
  nombre: 'Nombre (A–Z)',
}
const SORT_KEYS = Object.keys(SORT_LABELS) as SortKey[]

export function TiendaClient({
  initialProducts,
  categories,
  colors,
  discounts,
  initialFilter,
  initialSearch,
  initialColor,
  initialMax,
  initialSort,
  initialOnlyOffers,
}: {
  initialProducts: Product[]
  categories: Category[]
  colors: Color[]
  discounts: Discount[]
  initialFilter: string
  initialSearch?: string
  initialColor?: string
  initialMax?: string
  initialSort?: string
  initialOnlyOffers?: boolean
}) {
  const router = useRouter()

  // Carrusel de categorías (mobile): al aterrizar en /tienda/bolsos desde el
  // mega-menú, el chip activo puede quedar fuera de pantalla a la derecha —
  // se trae a la vista una sola vez al montar, sin animación (es estado
  // inicial, no un cambio que haya que dramatizar).
  const catsRailRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const rail = catsRailRef.current
    if (!rail || rail.scrollWidth <= rail.clientWidth) return
    const active = rail.querySelector<HTMLElement>('[aria-pressed="true"]')
    if (!active) return
    const overflowRight = active.offsetLeft + active.offsetWidth - rail.clientWidth
    if (overflowRight > 0) rail.scrollLeft = overflowRight + 40
  }, []) // solo al montar: después la clienta controla el scroll

  const [filter, setFilter] = useState(initialFilter || 'todo')
  const [search, setSearch] = useState(initialSearch || '')
  const [sort, setSort] = useState<SortKey>(
    SORT_KEYS.includes(initialSort as SortKey) ? (initialSort as SortKey) : 'recientes'
  )
  const [colorIds, setColorIds] = useState<string[]>(
    initialColor ? initialColor.split(',').filter(Boolean) : []
  )
  const [onlyDiscount, setOnlyDiscount] = useState(!!initialOnlyOffers)
  const [showFilters, setShowFilters] = useState(false)
  const [quickView, setQuickView] = useState<Product | null>(null)

  // Price bounds derived from the catalogue (discounted price).
  const priceBounds = useMemo(() => {
    const prices = initialProducts
      .map((p) => getFinalPrice(p, undefined, discounts))
      .filter((n) => n > 0)
    if (prices.length === 0) return { min: 0, max: 0 }
    return { min: Math.min(...prices), max: Math.max(...prices) }
  }, [initialProducts, discounts])

  const parsedMax = initialMax ? Number(initialMax) : NaN
  const [maxPrice, setMaxPrice] = useState<number | null>(
    Number.isFinite(parsedMax) ? parsedMax : null
  )
  const effectiveMax = maxPrice ?? priceBounds.max

  // Sync filter state → URL (shareable, indexable). Debounced so dragging the
  // price slider or typing doesn't spam history. router.replace keeps the back
  // button sane.
  // When a canonical category slug is set (/tienda/[cat]), category changes
  // navigate to the proper slug route for clean SEO URLs.
  const firstRun = useRef(true)
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return }
    const t = setTimeout(() => {
      const sp = new URLSearchParams()
      if (search.trim()) sp.set('q', search.trim())
      if (colorIds.length) sp.set('color', colorIds.join(','))
      if (maxPrice !== null && maxPrice < priceBounds.max) sp.set('max', String(maxPrice))
      if (sort !== 'recientes') sp.set('sort', sort)
      if (onlyDiscount) sp.set('oferta', '1')
      const qs = sp.toString()

      // Prefer clean category URLs over query params
      if (filter !== 'todo') {
        const base = `/tienda/${filter}`
        router.replace(qs ? `${base}?${qs}` : base, { scroll: false })
      } else {
        router.replace(qs ? `/tienda?${qs}` : '/tienda', { scroll: false })
      }
    }, 350)
    return () => clearTimeout(t)
  }, [filter, search, colorIds, maxPrice, sort, onlyDiscount, priceBounds.max, router])

  // Only show colours that are actually used by at least one product.
  const usedColors = useMemo(() => {
    const used = new Set<string>()
    initialProducts.forEach((p) => p.colors?.forEach((c) => used.add(c.id)))
    return colors.filter((c) => used.has(c.id))
  }, [initialProducts, colors])

  const filtered = useMemo(() => {
    const result = initialProducts.filter((p) => {
      const matchesCat = filter === 'todo' || p.category?.slug === filter
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
      const matchesColor =
        colorIds.length === 0 || (p.colors ?? []).some((c) => colorIds.includes(c.id))
      const finalPrice = getFinalPrice(p, undefined, discounts)
      const matchesPrice = effectiveMax <= 0 || finalPrice <= effectiveMax
      const matchesDiscount = !onlyDiscount || finalPrice < (p.base_price_uyu ?? Infinity)
      return matchesCat && matchesSearch && matchesColor && matchesPrice && matchesDiscount
    })

    const withFinal = result.map((p) => ({ p, price: getFinalPrice(p, undefined, discounts) }))
    switch (sort) {
      case 'precio-asc':
        withFinal.sort((a, b) => a.price - b.price)
        break
      case 'precio-desc':
        withFinal.sort((a, b) => b.price - a.price)
        break
      case 'nombre':
        withFinal.sort((a, b) => a.p.name.localeCompare(b.p.name, 'es'))
        break
      case 'recientes':
      default:
        withFinal.sort((a, b) => {
          const ta = new Date(a.p.created_at).getTime()
          const tb = new Date(b.p.created_at).getTime()
          if (tb !== ta) return tb - ta
          return a.p.sort_order - b.p.sort_order
        })
        break
    }
    return withFinal.map((x) => x.p)
  }, [initialProducts, filter, search, colorIds, effectiveMax, onlyDiscount, sort, discounts])

  const activeFilterCount =
    (filter !== 'todo' ? 1 : 0) +
    colorIds.length +
    (maxPrice !== null && maxPrice < priceBounds.max ? 1 : 0) +
    (onlyDiscount ? 1 : 0)

  // "Limpiar filtros" también debe aparecer cuando lo único activo es una
  // búsqueda (en mobile el input está oculto: sin esto, un ?q= del buscador
  // del header dejaría la grilla filtrada sin ninguna forma visible de volver).
  const hasActiveCriteria = activeFilterCount > 0 || search.trim().length > 0

  const clearAll = () => {
    setFilter('todo')
    setColorIds([])
    setMaxPrice(null)
    setOnlyDiscount(false)
    setSearch('')
    setSort('recientes')
  }

  const toggleColor = (id: string) => {
    setColorIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
  }

  const activeCategory = filter !== 'todo' ? categories.find((c) => c.slug === filter) : undefined
  const heading = activeCategory?.name || (filter !== 'todo' ? 'Colección' : onlyDiscount ? 'Ofertas' : 'Colección')

  return (
    <div className="tienda-page" style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 0' }}>
      <div className="tienda-head" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
        <Eyebrow>Tienda</Eyebrow>
        <h1 style={{
          fontFamily: dahila.fontDisplay, fontWeight: 300,
          fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: 1.05, letterSpacing: '-0.02em',
          color: dahila.ink900, margin: 0,
        }}>
          {heading}
        </h1>
        {/* Intro de categoría (COS/Zara): 1-2 frases editables desde el admin
            (categories.description). Es copy indexable que responde "qué hay
            acá" — la descripción ya alimentaba el <meta>; ahora también se ve. */}
        {activeCategory?.description?.trim() && (
          <p className="tienda-cat-desc" style={{
            fontFamily: dahila.fontSans, fontSize: 14, fontWeight: 300, lineHeight: 1.65,
            color: dahila.ink700, margin: '2px 0 0', maxWidth: 560,
          }}>
            {activeCategory.description}
          </p>
        )}
      </div>

      {/* Toolbar: category chips + search + sort + filter toggle
          On mobile (<640px) splits into 2 rows via .tienda-toolbar CSS class:
          row 1 → category chips (scrollable horizontally)
          row 2 → search + sort + filter toggle */}
      <div className="tienda-toolbar" style={{
        display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 18,
      }}>
        {/* Row 1: category chips — full-bleed snap carousel on mobile */}
        <div ref={catsRailRef} className="tienda-toolbar-cats" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Chip on={filter === 'todo'} onClick={() => setFilter('todo')}>Todo</Chip>
          {categories.map((c) => (
            <Chip key={c.id} on={filter === c.slug} onClick={() => setFilter(c.slug)}>
              {c.name}
            </Chip>
          ))}
        </div>

        {/* Row 2: search + sort + filter toggle */}
        <div className="tienda-toolbar-actions" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search — en mobile se oculta (.tienda-toolbar-search): duplica el
              buscador del header, que queda a un tap, y su fila entera de 40px
              es el mayor espacio recuperable antes de la primera prenda. */}
          <div className="tienda-toolbar-search" style={{
            position: 'relative', display: 'flex', alignItems: 'center',
            borderBottom: `1px solid ${dahila.borderStrong}`, minWidth: 160,
          }}>
            <input
              type="text"
              placeholder="Buscar prenda..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar prendas"
              style={{
                border: 'none', background: 'transparent',
                fontFamily: dahila.fontSans, fontSize: 14, width: '100%',
                padding: '8px 24px 8px 0', color: dahila.ink900,
              }}
            />
            <span style={{ position: 'absolute', right: 2, color: dahila.ink500, display: 'flex' }}>
              <Icon name="magnifying-glass" size={15} />
            </span>
          </div>

          {/* Sort */}
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span className="tienda-sort-label" style={{ fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink500 }}>
              Ordenar por
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Ordenar productos"
              style={{
                fontFamily: dahila.fontSans, fontSize: 13, color: dahila.ink900,
                border: `1px solid ${dahila.borderStrong}`, borderRadius: 8,
                padding: '8px 10px', background: '#fff', cursor: 'pointer',
              }}
            >
              {SORT_KEYS.map((k) => (
                <option key={k} value={k}>{SORT_LABELS[k]}</option>
              ))}
            </select>
          </label>

          {/* Filters toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontFamily: dahila.fontSans, fontSize: 13, color: dahila.ink900,
              border: `1px solid ${activeFilterCount > 0 ? dahila.ink900 : dahila.borderStrong}`,
              borderRadius: 8, padding: '8px 12px', background: '#fff', cursor: 'pointer',
            }}
          >
            <Icon name="sliders-horizontal" size={15} />
            Filtrar
            {activeFilterCount > 0 && (
              <span style={{
                background: dahila.ink900, color: '#fff', borderRadius: 999,
                fontSize: 10, minWidth: 16, height: 16, display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center', padding: '0 4px',
              }}>{activeFilterCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Expandable filter panel */}
      {showFilters && (
        <div style={{
          background: dahila.cream50,
          border: `1px solid ${dahila.border}`,
          borderRadius: 12,
          padding: '20px 22px',
          marginBottom: 24,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 24,
        }}>
          {/* Price */}
          {priceBounds.max > 0 && (
            <div>
              <div style={{ fontFamily: dahila.fontSans, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: dahila.ink500, marginBottom: 12 }}>
                Precio hasta
              </div>
              <input
                type="range"
                min={priceBounds.min}
                max={priceBounds.max}
                step={Math.max(1, Math.round((priceBounds.max - priceBounds.min) / 50))}
                value={effectiveMax}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{ width: '100%', accentColor: dahila.ink900 }}
                aria-label="Precio máximo"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink700 }}>
                <span>UYU {priceBounds.min.toLocaleString('es-UY')}</span>
                <span style={{ fontWeight: 500, color: dahila.ink900 }}>UYU {effectiveMax.toLocaleString('es-UY')}</span>
              </div>
            </div>
          )}

          {/* Colors */}
          {usedColors.length > 0 && (
            <div>
              <div style={{ fontFamily: dahila.fontSans, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: dahila.ink500, marginBottom: 12 }}>
                Color
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {usedColors.map((c) => {
                  const on = colorIds.includes(c.id)
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggleColor(c.id)}
                      aria-pressed={on}
                      title={c.name}
                      aria-label={c.name}
                      style={{
                        width: 32, height: 32, borderRadius: 999,
                        background: c.hex, cursor: 'pointer',
                        border: on ? `2px solid ${dahila.ink900}` : `1px solid ${dahila.borderStrong}`,
                        boxShadow: on ? `0 0 0 2px #fff inset` : 'none',
                      }}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* Discount toggle */}
          <div>
            <div style={{ fontFamily: dahila.fontSans, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: dahila.ink500, marginBottom: 12 }}>
              Ofertas
            </div>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: dahila.fontSans, fontSize: 14, color: dahila.ink900 }}>
              <input
                type="checkbox"
                checked={onlyDiscount}
                onChange={(e) => setOnlyDiscount(e.target.checked)}
                style={{ accentColor: '#B6314A', width: 18, height: 18 }}
              />
              Mostrar solo ofertas
            </label>
          </div>
        </div>
      )}

      {/* Results meta — en mobile solo aparece con filtros/búsqueda activos
          (.has-criteria): con el catálogo completo a la vista, el conteo no
          paga la fila que ocupa antes de la primera prenda. */}
      <div className={`tienda-meta${hasActiveCriteria ? ' has-criteria' : ''}`} style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${dahila.border}`,
        fontFamily: dahila.fontSans, fontSize: 13, color: dahila.ink700,
      }}>
        <span>{filtered.length} {filtered.length === 1 ? 'prenda' : 'prendas'}</span>
        {hasActiveCriteria && (
          <button
            onClick={clearAll}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              textDecoration: 'underline', color: dahila.wine600, fontSize: 13,
              fontFamily: dahila.fontSans, padding: 0,
            }}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <RecentlyViewedStrip />

      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 24px',
          background: dahila.cream100, borderRadius: 16,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        }}>
          <Eyebrow>Sin resultados</Eyebrow>
          <h3 style={{ fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 24, color: dahila.ink900, margin: 0 }}>
            {initialProducts.length === 0
              ? 'No hay prendas en la tienda por ahora.'
              : 'No encontramos prendas con esos filtros.'}
          </h3>
          <p style={{ fontFamily: dahila.fontSans, fontSize: 15, fontWeight: 300, color: dahila.ink700, margin: 0, maxWidth: 460, lineHeight: 1.7 }}>
            {initialProducts.length === 0
              ? 'Estoy preparando la próxima edición. Mientras tanto, podés pedir una prenda a medida.'
              : 'Probá ampliando el precio o sacando algún filtro.'}
          </p>
        </div>
      ) : (
        <div className="tienda-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22, rowGap: 44,
        }}>
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              discounts={discounts}
              onQuickView={() => { track('quickview_open', { product: p.slug }); setQuickView(p) }}
            />
          ))}
        </div>
      )}

      {quickView && (
        <QuickViewModal
          product={quickView}
          discounts={discounts}
          onClose={() => setQuickView(null)}
        />
      )}
    </div>
  )
}
