'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { Product, Category, Color, Discount } from '@/lib/types'
import { ProductCard } from '@/components/ProductCard'
import { getFinalPrice } from '@/lib/types'
import { dahila, Eyebrow, Chip, Icon } from '@/components/ui/Primitives'

type SortKey = 'recientes' | 'precio-asc' | 'precio-desc' | 'nombre'

const SORT_LABELS: Record<SortKey, string> = {
  recientes: 'Más recientes',
  'precio-asc': 'Precio: menor a mayor',
  'precio-desc': 'Precio: mayor a menor',
  nombre: 'Nombre (A–Z)',
}

export function TiendaClient({
  initialProducts,
  categories,
  colors,
  discounts,
  initialFilter,
  initialSearch,
}: {
  initialProducts: Product[]
  categories: Category[]
  colors: Color[]
  discounts: Discount[]
  initialFilter: string
  initialSearch?: string
}) {
  const router = useRouter()
  const [filter, setFilter] = useState(initialFilter || 'todo')
  const [search, setSearch] = useState(initialSearch || '')
  const [sort, setSort] = useState<SortKey>('recientes')
  const [colorIds, setColorIds] = useState<string[]>([])
  const [onlyDiscount, setOnlyDiscount] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Price bounds derived from the catalogue (discounted price).
  const priceBounds = useMemo(() => {
    const prices = initialProducts
      .map((p) => getFinalPrice(p, undefined, discounts))
      .filter((n) => n > 0)
    if (prices.length === 0) return { min: 0, max: 0 }
    return { min: Math.min(...prices), max: Math.max(...prices) }
  }, [initialProducts, discounts])

  const [maxPrice, setMaxPrice] = useState<number | null>(null)
  const effectiveMax = maxPrice ?? priceBounds.max

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
      const matchesDiscount = !onlyDiscount || getFinalPrice(p, undefined, discounts) < (p.base_price_uyu ?? Infinity)
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

  const clearAll = () => {
    setFilter('todo')
    setColorIds([])
    setMaxPrice(null)
    setOnlyDiscount(false)
    setSearch('')
    router.push('/tienda', { scroll: false })
  }

  const toggleColor = (id: string) => {
    setColorIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
  }

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
        <Eyebrow>Tienda</Eyebrow>
        <h1 style={{
          fontFamily: dahila.fontDisplay, fontWeight: 300,
          fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: 1.05, letterSpacing: '-0.02em',
          color: dahila.ink900, margin: 0,
        }}>
          {filter !== 'todo'
            ? (categories.find((c) => c.slug === filter)?.name || 'Colección')
            : 'Colección'}
        </h1>
      </div>

      {/* Toolbar: category chips + search + sort + filter toggle */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 18,
      }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Chip on={filter === 'todo'} onClick={() => setFilter('todo')}>Todo</Chip>
          {categories.map((c) => (
            <Chip key={c.id} on={filter === c.slug} onClick={() => setFilter(c.slug)}>
              {c.name}
            </Chip>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{
            position: 'relative', display: 'flex', alignItems: 'center',
            borderBottom: `1px solid ${dahila.borderStrong}`, minWidth: 180,
          }}>
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: 'none', outline: 'none', background: 'transparent',
                fontFamily: dahila.fontSans, fontSize: 13, width: '100%',
                padding: '6px 24px 6px 0', color: dahila.ink900,
              }}
            />
            <span style={{ position: 'absolute', right: 2, color: dahila.ink500, display: 'flex' }}>
              <Icon name="magnifying-glass" size={14} />
            </span>
          </div>

          {/* Sort */}
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: dahila.fontSans, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: dahila.ink500 }}>
              Ordenar
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Ordenar productos"
              style={{
                fontFamily: dahila.fontSans, fontSize: 13, color: dahila.ink900,
                border: `1px solid ${dahila.borderStrong}`, borderRadius: 8,
                padding: '7px 10px', background: '#fff', cursor: 'pointer',
              }}
            >
              {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
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
              borderRadius: 8, padding: '7px 12px', background: '#fff', cursor: 'pointer',
            }}
          >
            <Icon name="sliders-horizontal" size={15} />
            Filtros
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
                        width: 30, height: 30, borderRadius: 999,
                        background: c.hex, cursor: 'pointer',
                        border: on ? `2px solid ${dahila.ink900}` : `1px solid ${dahila.borderStrong}`,
                        boxShadow: on ? `0 0 0 2px #fff inset` : 'none',
                        outline: 'none',
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
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: dahila.fontSans, fontSize: 13, color: dahila.ink900 }}>
              <input
                type="checkbox"
                checked={onlyDiscount}
                onChange={(e) => setOnlyDiscount(e.target.checked)}
                style={{ accentColor: '#B6314A', width: 16, height: 16 }}
              />
              Solo con descuento
            </label>
          </div>
        </div>
      )}

      {/* Results meta */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${dahila.border}`,
        fontFamily: dahila.fontSans, fontSize: 13, color: dahila.ink700,
      }}>
        <span>{filtered.length} {filtered.length === 1 ? 'pieza' : 'piezas'}</span>
        {activeFilterCount > 0 && (
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

      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 24px',
          background: dahila.cream100, borderRadius: 16,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        }}>
          <Eyebrow>Sin resultados</Eyebrow>
          <h3 style={{ fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 24, color: dahila.ink900, margin: 0 }}>
            {initialProducts.length === 0
              ? 'No hay piezas en la tienda por ahora.'
              : 'No encontramos piezas con esos filtros.'}
          </h3>
          <p style={{ fontFamily: dahila.fontSans, fontSize: 14, fontWeight: 300, color: dahila.ink700, margin: 0, maxWidth: 460, lineHeight: 1.7 }}>
            {initialProducts.length === 0
              ? 'Estoy preparando la próxima edición. Mientras tanto, podés pedir una prenda a medida.'
              : 'Probá ampliando el rango de precio o sacando algún filtro.'}
          </p>
        </div>
      ) : (
        <div className="tienda-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22, rowGap: 44,
        }}>
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} discounts={discounts} />
          ))}
        </div>
      )}
    </main>
  )
}
