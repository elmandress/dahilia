'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useFavorites } from '@/components/FavoritesProvider'
import { ProductCard } from '@/components/ProductCard'
import { dahila, Button, Eyebrow, Icon } from '@/components/ui/Primitives'
import { formatPrice, getFinalPrice } from '@/lib/types'

export function FavoritosClient({ whatsappUrl }: { whatsappUrl: string }) {
  const router = useRouter()
  const { items, count, hasMounted } = useFavorites()

  // Pre-fill a WhatsApp message listing the saved pieces — turns the wishlist
  // into a conversation, which is how this brand actually sells.
  const consultUrl = (() => {
    const lines = items.map((it) => `• ${it.product.name} — ${formatPrice(getFinalPrice(it.product))}`)
    const text = encodeURIComponent(
      `Hola! Estuve mirando la web y guardé estas piezas en favoritos:\n\n${lines.join('\n')}\n\n¿Me contás disponibilidad? 🧶`
    )
    return `${whatsappUrl}${whatsappUrl.includes('?') ? '&' : '?'}text=${text}`
  })()

  // Until the client has loaded the list we render the empty-state skeleton-free
  // (no flash of "vacío" before the fetch resolves).
  if (!hasMounted) {
    return (
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 80px' }}>
        <Eyebrow>Favoritos</Eyebrow>
        <h1 style={headingStyle}>Tus favoritos</h1>
        <p style={{ fontFamily: dahila.fontSans, fontSize: 14, color: dahila.ink500 }}>Cargando…</p>
      </div>
    )
  }

  if (count === 0) {
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '96px 24px', textAlign: 'center' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 64, height: 64, borderRadius: 999, background: dahila.cream100, color: dahila.wine600,
          marginBottom: 20,
        }}>
          <Icon name="heart" size={28} />
        </span>
        <h1 style={{ ...headingStyle, textAlign: 'center' }}>Todavía no guardaste nada</h1>
        <p style={{ fontFamily: dahila.fontSerif, fontStyle: 'italic', fontWeight: 300, fontSize: 18, color: dahila.ink700, margin: '12px 0 28px' }}>
          Tocá el corazón en las piezas que te gusten y las vas a encontrar acá.
        </p>
        <Button variant="primary" size="lg" onClick={() => router.push('/tienda')}>Explorar la tienda</Button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 80px' }}>
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        gap: 16, flexWrap: 'wrap', marginBottom: 32,
      }}>
        <div>
          <Eyebrow>Favoritos</Eyebrow>
          <h1 style={headingStyle}>Tus favoritos</h1>
          <p style={{ fontFamily: dahila.fontSans, fontSize: 14, color: dahila.ink700, margin: '6px 0 0' }}>
            {count} {count === 1 ? 'pieza guardada' : 'piezas guardadas'}
          </p>
        </div>
        <a
          href={consultUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 9,
            background: '#25D366', color: '#fff', textDecoration: 'none',
            borderRadius: 10, padding: '13px 22px',
            fontFamily: dahila.fontSans, fontSize: 12, fontWeight: 500,
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}
        >
          <Icon name="whatsapp-logo" size={18} /> Consultar mis favoritos
        </a>
      </div>

      <div className="tienda-grid" style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22, rowGap: 44,
      }}>
        {items.map((it) => (
          <ProductCard key={it.id} product={it.product} onQuickView={() => router.push(`/tienda/${it.product.slug}`)} />
        ))}
      </div>

      <p style={{ fontFamily: dahila.fontSans, fontSize: 13, color: dahila.ink500, marginTop: 32 }}>
        ¿Buscás algo más? <Link href="/tienda" style={{ color: dahila.wine600 }}>Seguí explorando la tienda →</Link>
      </p>
    </div>
  )
}

const headingStyle: React.CSSProperties = {
  fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 'clamp(30px, 5vw, 44px)',
  lineHeight: 1.05, letterSpacing: '-0.02em', color: dahila.ink900, margin: '10px 0 0',
}
