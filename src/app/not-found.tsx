import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Product, Discount } from '@/lib/types'
import { ProductCard } from '@/components/ProductCard'

export default async function NotFound() {
  // Show a few real pieces so a broken link still leads somewhere useful.
  let products: Product[] = []
  let discounts: Discount[] = []
  try {
    const supabase = await createClient()
    const [pRes, dRes] = await Promise.all([
      supabase
        .from('products')
        .select('*, category:categories(*), media:product_media(*), sizes:product_sizes(*)')
        .eq('status', 'active')
        .order('sort_order', { ascending: true })
        .limit(4),
      supabase.from('discounts').select('*').eq('active', true),
    ])
    products = (pRes.data ?? []) as Product[]
    discounts = (dRes.data ?? []) as Discount[]
  } catch {
    // If the DB is unreachable, the page still renders without suggestions.
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '96px 24px 64px' }}>
      <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
        <span className="eyebrow" style={{ color: 'var(--ink-500)' }}>Error 404</span>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 300,
          fontSize: 'clamp(36px, 6vw, 64px)', lineHeight: 1.05,
          letterSpacing: '-0.02em', color: 'var(--ink-900)', margin: '14px 0 16px',
        }}>
          Esta página se perdió.
        </h1>
        <p style={{
          fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 300,
          fontSize: 18, color: 'var(--ink-700)', marginBottom: 28,
        }}>
          Quizá la prenda que buscabas ya no está, o el link cambió.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/tienda" style={{
            background: 'var(--ink-900)', color: '#fff', padding: '14px 24px', borderRadius: 12,
            fontFamily: 'var(--font-sans)', fontSize: 12, letterSpacing: '0.06em',
            textTransform: 'uppercase', textDecoration: 'none',
          }}>Ir a la tienda</Link>
          <Link href="/" style={{
            background: 'transparent', color: 'var(--ink-900)', padding: '14px 24px', borderRadius: 12,
            border: '1px solid var(--ink-900)', fontFamily: 'var(--font-sans)', fontSize: 12,
            letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none',
          }}>Volver al inicio</Link>
        </div>
      </div>

      {products.length > 0 && (
        <section style={{ marginTop: 72 }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 20,
            letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-900)',
            margin: '0 0 24px', textAlign: 'center',
          }}>
            Mientras tanto, mirá esto
          </h2>
          <div className="tienda-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22, rowGap: 44,
          }}>
            {products.map((p) => (
              <ProductCard key={p.id} product={p} discounts={discounts} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
