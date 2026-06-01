'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/components/CartProvider'
import type { Product } from '@/lib/types'
import { getEffectivePrice, formatPrice, getPrimaryPhoto } from '@/lib/types'
import { dahila, Button, Eyebrow, Field, Icon } from '@/components/ui/Primitives'

export function ProductDetailsClient({ product }: { product: Product }) {
  const router = useRouter()
  const { addToCart } = useCart()
  const [talle, setTalle] = useState<string>(product.sizes?.[0]?.size || 'Único')
  const [added, setAdded] = useState(false)

  const photo1 = getPrimaryPhoto(product)
  const media = product.media && product.media.length > 0 ? product.media.sort((a,b) => a.position - b.position) : []
  const photo2 = media[1]?.url || photo1
  const photo3 = media[2]?.url || photo1

  const currentPrice = getEffectivePrice(product, talle)
  const isSoldOut = product.status === 'soldout'

  const crumb = {
    background: 'none', border: 'none', color: 'inherit', cursor: 'pointer',
    padding: 0, fontFamily: 'inherit', fontSize: 'inherit', letterSpacing: 'inherit', textTransform: 'inherit' as const,
  }

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 0' }}>
      <nav style={{
        display: 'flex', gap: 6, fontFamily: dahila.fontSans, fontSize: 11,
        color: dahila.ink500, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 28,
      }}>
        <button onClick={() => router.push('/')} style={crumb}>Inicio</button>
        <span>/</span>
        <button onClick={() => router.push('/tienda')} style={crumb}>Tienda</button>
        <span>/</span>
        <span style={{ color: dahila.ink900 }}>{product.name}</span>
      </nav>

      <div className="producto-split" style={{
        display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 56, alignItems: 'start',
      }}>
        {/* Image stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{
            aspectRatio: '4/5', borderRadius: 12, overflow: 'hidden',
            background: dahila.cream50,
          }}>
            <img src={photo1} alt={product.name} style={{
              width: '100%', height: '100%', objectFit: 'cover',
            }}/>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[photo1, photo2, photo3].map((p, i) => (
              <div key={i} style={{
                aspectRatio: '1/1', borderRadius: 8, overflow: 'hidden',
                background: dahila.cream50,
                border: i === 0 ? `1px solid ${dahila.ink900}` : `1px solid ${dahila.border}`,
              }}>
                <img src={p} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
              </div>
            ))}
          </div>
        </div>

        {/* Detail */}
        <div className="producto-detail" style={{
          position: 'sticky', top: 90, display: 'flex', flexDirection: 'column', gap: 20,
        }}>
          <div>
            <Eyebrow>{product.badge || 'Hecho a mano'}</Eyebrow>
            <h1 style={{
              fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 38,
              color: dahila.ink900, margin: '10px 0 4px', letterSpacing: '-0.02em', lineHeight: 1.1,
            }}>{product.name}</h1>
            <div style={{
              fontFamily: dahila.fontSans, fontSize: 16, fontWeight: 400, color: dahila.ink900,
            }}>{isSoldOut ? 'Agotado' : formatPrice(currentPrice)}</div>
          </div>

          <p style={{ fontFamily: dahila.fontSans, fontSize: 14, fontWeight: 300, lineHeight: 1.7, color: dahila.ink700, margin: 0 }}>
            {product.description || 'Tejida a mano en mi atelier. Empieza cuando vos confirmás colores y medida — entre dos y seis semanas según el modelo.'}
          </p>

          {!isSoldOut && !product.is_custom_only && (
            <Field label="Talle">
              <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                {product.sizes && product.sizes.length > 0 ? product.sizes.map((s) => (
                  <button key={s.id} onClick={() => setTalle(s.size)} disabled={!s.available} style={{
                    width: 44, height: 40, borderRadius: 8,
                    fontFamily: dahila.fontSans, fontSize: 12, fontWeight: 400,
                    border: `1px solid ${talle === s.size ? dahila.ink900 : dahila.borderStrong}`,
                    background: talle === s.size ? dahila.ink900 : '#fff',
                    color: talle === s.size ? '#fff' : dahila.ink900,
                    cursor: s.available ? 'pointer' : 'not-allowed', transition: `all 140ms ${dahila.ease}`,
                    opacity: s.available ? 1 : 0.5
                  }}>{s.size}</button>
                )) : ['XS', 'S', 'M', 'L', 'XL'].map((t) => (
                  <button key={t} onClick={() => setTalle(t)} style={{
                    width: 44, height: 40, borderRadius: 8,
                    fontFamily: dahila.fontSans, fontSize: 12, fontWeight: 400,
                    border: `1px solid ${talle === t ? dahila.ink900 : dahila.borderStrong}`,
                    background: talle === t ? dahila.ink900 : '#fff',
                    color: talle === t ? '#fff' : dahila.ink900,
                    cursor: 'pointer', transition: `all 140ms ${dahila.ease}`,
                  }}>{t}</button>
                ))}
                
                <button onClick={() => router.push('/encargo')} style={{
                  padding: '0 14px', height: 40, borderRadius: 8,
                  fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink900,
                  background: 'transparent', border: `1px dashed ${dahila.borderStrong}`, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}>
                  <Icon name="ruler" size={14}/> A medida
                </button>
              </div>
            </Field>
          )}

          {product.is_custom_only && (
            <div style={{ marginTop: '1rem' }}>
              <p style={{ marginBottom: '1rem', fontFamily: dahila.fontSans, fontSize: 14 }}>Esta pieza se realiza únicamente a medida.</p>
              <Button variant="primary" full onClick={() => router.push('/encargo')}>Solicitar presupuesto</Button>
            </div>
          )}

          {!isSoldOut && !product.is_custom_only && (
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="primary" size="lg" full onClick={async () => { 
                setAdded(true); 
                await addToCart(product, talle, 1);
                setTimeout(() => setAdded(false), 2200); 
              }} style={{ flex: 1 }}>
                {added ? '✓ Añadido' : 'Añadir al carrito'}
              </Button>
              <Button variant="secondary" size="lg" onClick={() => {}}>
                <Icon name="heart" size={16}/>
              </Button>
            </div>
          )}

          <ul style={{
            margin: '6px 0 0', padding: 0, listStyle: 'none',
            display: 'flex', flexDirection: 'column', gap: 8,
            borderTop: `1px solid ${dahila.border}`, paddingTop: 16,
          }}>
            {[
              ['ruler',       product.material || '90% algodón pima · 10% lurex'],
              ['flower',      'Tejido a mano en Montevideo'],
              ['package',     'Envío a todo Uruguay'],
              ['arrow-clockwise', `Encargos a medida (consultar plazos)`],
            ].map(([icon, txt]) => (
              <li key={txt} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 300, color: dahila.ink700,
              }}>
                <Icon name={icon} size={16} color={dahila.ink500}/> {txt}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .producto-split { grid-template-columns: 1fr !important; gap: 24px !important;}
          .producto-detail { position: static !important; }
        }
      `}</style>
    </main>
  )
}
