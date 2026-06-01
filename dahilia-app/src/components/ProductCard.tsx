'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Product } from '@/lib/types'
import { getEffectivePrice, formatPrice, getPrimaryPhoto } from '@/lib/types'
import { useCart } from './CartProvider'
import { dahila, Badge } from './ui/Primitives'

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter()
  const { addToCart } = useCart()
  const [hover, setHover] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  const photo = getPrimaryPhoto(product)
  const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0].size : 'Único'
  const price = getEffectivePrice(product, defaultSize)

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.stopPropagation() 
    e.preventDefault()
    if (product.status === 'soldout' || product.is_custom_only) return
    
    setIsAdding(true)
    await addToCart(product, defaultSize, 1)
    setTimeout(() => setIsAdding(false), 500)
  }

  return (
    <button
      onClick={() => router.push(`/tienda/${product.slug}`)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'transparent', border: 'none', padding: 0, textAlign: 'left',
        cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10,
      }}>
      
      <div style={{
        position: 'relative',
        aspectRatio: '3 / 4',
        borderRadius: 12, overflow: 'hidden',
        background: dahila.cream50,
      }}>
        <img src={photo} alt={product.name} style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%', objectFit: 'cover',
          transition: `transform 600ms ${dahila.ease}`,
          transform: hover ? 'scale(1.02)' : 'scale(1)',
        }}/>
        
        {product.status === 'soldout' ? (
          <span style={{ position: 'absolute', top: 10, left: 10 }}><Badge tone="sold">Agotado</Badge></span>
        ) : product.badge ? (
          <span style={{ position: 'absolute', top: 10, left: 10 }}><Badge tone="white">{product.badge}</Badge></span>
        ) : product.is_custom_only ? (
          <span style={{ position: 'absolute', top: 10, left: 10 }}><Badge tone="cream">A medida</Badge></span>
        ) : null}

        {/* Quick-add bar on hover */}
        {product.status !== 'soldout' && !product.is_custom_only && (
          <div 
            onClick={handleQuickAdd}
            style={{
              position: 'absolute', left: 10, right: 10, bottom: 10,
              background: 'rgba(255,255,255,0.95)',
              borderRadius: 8,
              padding: '8px 12px',
              fontFamily: dahila.fontSans, fontSize: 11, fontWeight: 500,
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: dahila.ink900, textAlign: 'center',
              opacity: hover ? 1 : 0,
              transform: hover ? 'translateY(0)' : 'translateY(8px)',
              transition: `all 220ms ${dahila.ease}`,
              pointerEvents: hover ? 'auto' : 'none',
          }}>
            {isAdding ? '✓ Añadido' : 'Elegir'}
          </div>
        )}
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        gap: 12, padding: '0 2px',
      }}>
        <span style={{
          fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 16,
          color: dahila.ink900, lineHeight: 1.2,
        }}>{product.name}</span>
        <span style={{
          fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 400, color: dahila.ink900,
          whiteSpace: 'nowrap',
        }}>{formatPrice(price)}</span>
      </div>
    </button>
  )
}
