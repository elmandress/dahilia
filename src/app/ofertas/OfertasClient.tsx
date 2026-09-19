'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import type { Product, Discount } from '@/lib/types'
import { ProductCard } from '@/components/ProductCard'
import { getFinalPrice, getEffectivePrice } from '@/lib/types'
import { dahila, Eyebrow, Button } from '@/components/ui/Primitives'

const QuickViewModal = dynamic(
  () => import('@/components/QuickViewModal').then((m) => m.QuickViewModal),
  { ssr: false }
)

export function OfertasClient({
  products,
  discounts,
  fallbackProducts = [],
}: {
  products: Product[]
  discounts: Discount[]
  /** Sin ofertas vigentes: piezas en stock y lo más nuevo, para no dejar un callejón sin salida. */
  fallbackProducts?: Product[]
}) {
  const [quickView, setQuickView] = useState<Product | null>(null)

  // Compute aggregate savings to show in the strip
  const savings = useMemo(() => {
    let totalList = 0
    let totalFinal = 0
    for (const p of products) {
      const list = getEffectivePrice(p)
      const final = getFinalPrice(p, undefined, discounts)
      totalList += list
      totalFinal += final
    }
    const saved = totalList - totalFinal
    const maxPct = products.reduce((best, p) => {
      const list = getEffectivePrice(p)
      const final = getFinalPrice(p, undefined, discounts)
      if (list <= 0) return best
      return Math.max(best, Math.round(((list - final) / list) * 100))
    }, 0)
    return { saved, maxPct }
  }, [products, discounts])

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: products.length > 0 ? 20 : 28 }}>
        <Eyebrow>Tienda</Eyebrow>
        <h1 style={{
          fontFamily: dahila.fontDisplay, fontWeight: 300,
          fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: 1.05, letterSpacing: '-0.02em',
          color: dahila.ink900, margin: 0,
        }}>Ofertas</h1>
        <p style={{ fontFamily: dahila.fontSans, fontSize: 15, fontWeight: 300, color: dahila.ink700, margin: 0 }}>
          {products.length > 0
            ? 'Prendas con descuento, por tiempo limitado.'
            : 'Acá aparecen las piezas con descuento, cuando las hay.'}
        </p>
      </div>

      {/* Savings strip — only shown when there are real discounts */}
      {products.length > 0 && savings.maxPct > 0 && (
        <div className="ofertas-savings-strip" style={{
          display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
          background: 'rgba(182,49,74,0.06)',
          border: '1px solid rgba(182,49,74,0.18)',
          borderRadius: 12,
          padding: '14px 20px',
          marginBottom: 28,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              background: '#B6314A', color: '#fff',
              borderRadius: 8, padding: '4px 10px',
              fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 600,
              letterSpacing: '0.02em',
            }}>
              Hasta {savings.maxPct}% OFF
            </span>
            <span style={{ fontFamily: dahila.fontSans, fontSize: 14, fontWeight: 300, color: '#7a1e2f' }}>
              en prendas seleccionadas
            </span>
          </div>
          <span style={{
            fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink500,
            marginLeft: 'auto',
          }}>
            {products.length} {products.length === 1 ? 'prenda' : 'prendas'} en oferta
          </span>
        </div>
      )}

      {products.length === 0 ? (
        // Sin ofertas vigentes. Antes era un callejón sin salida ("Volvé
        // pronto") para quien llegaba desde Google; ahora muestra piezas reales.
        <>
          <div style={{
            textAlign: 'center', padding: '40px 24px',
            background: dahila.cream100, borderRadius: 16,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          }}>
            <Eyebrow>Hoy no hay ofertas</Eyebrow>
            <h2 style={{ fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 24, color: dahila.ink900, margin: 0 }}>
              Ninguna pieza tiene descuento en este momento.
            </h2>
            <p style={{ fontFamily: dahila.fontSans, fontSize: 15, fontWeight: 300, color: dahila.ink700, margin: 0, maxWidth: 460, lineHeight: 1.7 }}>
              Mientras tanto, mirá lo que sale sin espera y lo más nuevo.
            </p>
            <div style={{ marginTop: 4 }}>
              <Button variant="primary" href="/tienda">Ver toda la tienda</Button>
            </div>
          </div>
          {fallbackProducts.length > 0 && (
            <section aria-label="Piezas para mirar" style={{ marginTop: 40 }}>
              <div className="tienda-grid" style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 22, rowGap: 44,
              }}>
                {fallbackProducts.map((p) => (
                  <ProductCard key={p.id} product={p} discounts={discounts} onQuickView={() => setQuickView(p)} />
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <div className="tienda-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 22, rowGap: 44,
        }}>
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              discounts={discounts}
              onQuickView={() => setQuickView(p)}
            />
          ))}
        </div>
      )}

      {quickView && (
        <QuickViewModal product={quickView} discounts={discounts} onClose={() => setQuickView(null)} />
      )}
    </div>
  )
}
