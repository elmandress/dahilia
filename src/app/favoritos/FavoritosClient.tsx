'use client'

import { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useFavorites } from '@/components/FavoritesProvider'
import { ProductCard } from '@/components/ProductCard'
import { dahila, Button, Eyebrow, Icon } from '@/components/ui/Primitives'
import { formatPrice, getFinalPrice } from '@/lib/types'
import type { Discount, Product } from '@/lib/types'
import { track } from '@/lib/analytics'

// El mismo modal que /tienda y /ofertas. Antes el botón decía "Vista rápida"
// pero navegaba a la ficha completa: se perdía el agregado rápido justo en la
// página de quien ya eligió lo que le gusta (auditoría 12/09/2026).
const QuickViewModal = dynamic(
  () => import('@/components/QuickViewModal').then((m) => m.QuickViewModal),
  { ssr: false }
)

export function FavoritosClient({ whatsappUrl, discounts = [] }: { whatsappUrl: string; discounts?: Discount[] }) {
  const { items, count, hasMounted } = useFavorites()
  const [quickView, setQuickView] = useState<Product | null>(null)

  // Pre-fill a WhatsApp message listing the saved pieces — turns the wishlist
  // into a conversation, which is how this brand actually sells.
  const consultUrl = (() => {
    const lines = items.map((it) => `• ${it.product.name} — ${formatPrice(getFinalPrice(it.product, undefined, discounts))}`)
    const text = encodeURIComponent(
      `Hola! Estuve mirando la web y guardé estas piezas en favoritos:\n\n${lines.join('\n')}\n\n¿Me contás disponibilidad? 🧶`
    )
    return `${whatsappUrl}${whatsappUrl.includes('?') ? '&' : '?'}text=${text}`
  })()

  // Lista compartible (08/10/2026): un link con los slugs para mandarle a
  // quien le va a regalar. utm_source=compartido, como el resto de los links
  // de Compartir, para que "De dónde vienen" lo cuente.
  const [shareName, setShareName] = useState('')
  const [shareMsg, setShareMsg] = useState<string | null>(null)
  const shareList = async () => {
    const sp = new URLSearchParams({ p: items.map((it) => it.product.slug).join(',') })
    if (shareName.trim()) sp.set('de', shareName.trim().slice(0, 40))
    sp.set('utm_source', 'compartido')
    sp.set('utm_medium', 'lista-deseos')
    const url = `${window.location.origin}/favoritos/compartida?${sp.toString()}`
    const text = shareName.trim()
      ? `Mi lista de deseos de Dahila (${shareName.trim()}) 🧶`
      : 'Mi lista de deseos de Dahila 🧶'
    track('wishlist_share', { items: items.length })
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Mi lista de Dahila', text, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setShareMsg('¡Link copiado! Pegalo en WhatsApp o donde quieras.')
    } catch (e) {
      // Cerrar el menú de compartir no es un error.
      if (e instanceof Error && e.name === 'AbortError') return
      window.prompt('Copiá este link:', url)
    }
  }

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
        <Button variant="primary" size="lg" href="/tienda">Explorar la tienda</Button>
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
            background: dahila.whatsapp, color: '#fff', textDecoration: 'none',
            borderRadius: 10, padding: '13px 22px',
            fontFamily: dahila.fontSans, fontSize: 12, fontWeight: 500,
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}
        >
          <Icon name="whatsapp-logo" size={18} /> Consultar mis favoritos
        </a>
      </div>

      {/* Compartir la lista: para que te regalen exactamente lo que te gusta. */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 12,
        background: dahila.cream50, border: `1px solid ${dahila.border}`, borderRadius: 14,
        padding: '16px 18px', marginBottom: 32,
      }}>
        <div style={{ flex: '1 1 260px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: dahila.fontSans, fontSize: 14, fontWeight: 500, color: dahila.ink900 }}>
            <Icon name="gift" size={18} color={dahila.wine600} /> ¿Se acerca un cumple o las fiestas?
          </div>
          <p style={{ margin: '4px 0 10px', fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 300, color: dahila.ink700 }}>
            Mandale tu lista a quien te va a regalar: ve tus prendas y me escribe directo.
          </p>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 280 }}>
            <span style={{ fontFamily: dahila.fontSans, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: dahila.ink500 }}>Tu nombre (opcional)</span>
            <input
              value={shareName}
              onChange={(e) => setShareName(e.target.value)}
              maxLength={40}
              autoComplete="given-name"
              placeholder="Así sabe que es tuya"
              style={{
                minHeight: 44, padding: '8px 12px', borderRadius: 8, border: `1px solid ${dahila.borderStrong}`,
                fontFamily: dahila.fontSans, fontSize: 16, color: dahila.ink900, background: '#fff',
              }}
            />
          </label>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button
            type="button"
            onClick={shareList}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, padding: '0 20px',
              borderRadius: 10, border: 'none', cursor: 'pointer', background: dahila.ink900, color: '#fff',
              fontFamily: dahila.fontSans, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase',
            }}
          >
            <Icon name="share-network" size={16} /> Compartir mi lista
          </button>
          {shareMsg && <span role="status" style={{ fontFamily: dahila.fontSans, fontSize: 12.5, color: dahila.wine600 }}>{shareMsg}</span>}
        </div>
      </div>

      <div className="tienda-grid" style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 22, rowGap: 44,
      }}>
        {items.map((it) => (
          <ProductCard key={it.id} product={it.product} discounts={discounts} onQuickView={() => setQuickView(it.product)} />
        ))}
      </div>

      {quickView && (
        <QuickViewModal
          product={quickView}
          discounts={discounts}
          whatsappUrl={whatsappUrl}
          onClose={() => setQuickView(null)}
        />
      )}

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
