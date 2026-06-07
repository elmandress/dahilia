'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import type { Product, Discount } from '@/lib/types'
import { ProductCard } from '@/components/ProductCard'
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

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
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
        <>
          <div style={{
            marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${dahila.border}`,
            fontFamily: dahila.fontSans, fontSize: 13, color: dahila.ink700,
          }}>
            {products.length} {products.length === 1 ? 'prenda en oferta' : 'prendas en oferta'}
          </div>
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
        </>
      )}

      {quickView && (
        <QuickViewModal product={quickView} discounts={discounts} onClose={() => setQuickView(null)} />
      )}
    </main>
  )
}
