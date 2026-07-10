'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
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
}: {
  products: Product[]
  discounts: Discount[]
}) {
  const router = useRouter()
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
          Prendas con descuento, por tiempo limitado.
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
        <div style={{
          textAlign: 'center', padding: '80px 24px',
          background: dahila.cream100, borderRadius: 16,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        }}>
          <Eyebrow>Por ahora no hay ofertas</Eyebrow>
          <h3 style={{ fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 24, color: dahila.ink900, margin: 0 }}>
            Volvé pronto.
          </h3>
          <p style={{ fontFamily: dahila.fontSans, fontSize: 15, fontWeight: 300, color: dahila.ink700, margin: 0, maxWidth: 460, lineHeight: 1.7 }}>
            Mientras tanto, mirá toda la colección.
          </p>
          <div style={{ marginTop: 6 }}>
            <Button variant="primary" onClick={() => router.push('/tienda')}>Ver la tienda</Button>
          </div>
        </div>
      ) : (
        <div className="tienda-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22, rowGap: 44,
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
