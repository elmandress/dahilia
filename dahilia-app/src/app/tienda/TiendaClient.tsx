'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Product, Category } from '@/lib/types'
import { ProductCard } from '@/components/ProductCard'
import { dahila, Eyebrow, Chip, Icon } from '@/components/ui/Primitives'

export function TiendaClient({ 
  initialProducts, 
  categories, 
  initialFilter,
  initialSearch
}: { 
  initialProducts: Product[], 
  categories: Category[], 
  initialFilter: string,
  initialSearch?: string
}) {
  const router = useRouter()
  const [filter, setFilter] = useState(initialFilter || 'todo')
  const [search, setSearch] = useState(initialSearch || '')

  // Keep search and filter state in sync with initial props when navigated
  useEffect(() => {
    setFilter(initialFilter || 'todo')
  }, [initialFilter])

  useEffect(() => {
    setSearch(initialSearch || '')
  }, [initialSearch])

  const filtered = initialProducts.filter((p) => {
    const matchesCat = filter === 'todo' || p.category?.slug === filter
    const matchesSearch = !search || 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
    return matchesCat && matchesSearch
  })

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
        <Eyebrow>Tienda</Eyebrow>
        <h1 style={{
          fontFamily: dahila.fontDisplay, fontWeight: 300,
          fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: 1.05, letterSpacing: '-0.02em',
          color: dahila.ink900, margin: 0,
        }}>Colección actual</h1>
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 16, marginBottom: 32,
        borderBottom: `1px solid ${dahila.border}`, paddingBottom: 24
      }}>
        {/* Categories */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Chip on={filter === 'todo'} onClick={() => { setFilter('todo'); router.push(search ? `/tienda?q=${search}` : '/tienda', { scroll: false }) }}>Todo</Chip>
          {categories.map((c) => (
            <Chip key={c.id} on={filter === c.slug} onClick={() => { setFilter(c.slug); router.push(`/tienda?cat=${c.slug}${search ? `&q=${search}` : ''}`, { scroll: false }) }}>
              {c.name}
            </Chip>
          ))}
        </div>

        {/* Search box */}
        <div style={{ 
          position: 'relative', display: 'flex', alignItems: 'center', 
          width: '100%', maxWidth: 280, borderBottom: `1px solid ${dahila.borderStrong}` 
        }}>
          <input
            type="text"
            placeholder="Buscar prenda..."
            value={search}
            onChange={(e) => {
              const val = e.target.value
              setSearch(val)
              const catParam = filter !== 'todo' ? `cat=${filter}` : ''
              const qParam = val ? `q=${val}` : ''
              const paramsStr = [catParam, qParam].filter(Boolean).join('&')
              router.push(paramsStr ? `/tienda?${paramsStr}` : '/tienda', { scroll: false })
            }}
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              fontFamily: dahila.fontSans, fontSize: 13, width: '100%',
              padding: '6px 24px 6px 0', color: dahila.ink900
            }}
          />
          <span style={{ position: 'absolute', right: 4, color: dahila.ink500, display: 'flex', alignItems: 'center' }}>
            <Icon name="magnifying-glass" size={14} />
          </span>
        </div>
      </div>

      {search && (
        <div style={{
          display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24,
          fontFamily: dahila.fontSans, fontSize: 14, color: dahila.ink700
        }}>
          <span>Búsqueda: <strong>"{search}"</strong> ({filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'})</span>
          <button 
            onClick={() => {
              setSearch('')
              router.push(filter === 'todo' ? '/tienda' : `/tienda?cat=${filter}`)
            }}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              textDecoration: 'underline', color: dahila.wine600, fontSize: 13,
              fontFamily: dahila.fontSans, padding: 0
            }}
          >
            Limpiar búsqueda
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', fontFamily: dahila.fontSans, color: dahila.ink500 }}>
          No se encontraron prendas que coincidan con tu búsqueda.
        </div>
      ) : (
        <div className="tienda-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22, rowGap: 44,
        }}>
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 720px) {
          .tienda-grid { grid-template-columns: 1fr 1fr !important; gap: 14px !important; row-gap: 32px !important; }
        }
      `}</style>
    </main>
  )
}
