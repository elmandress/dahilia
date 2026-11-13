'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from '@/components/ui/Foto'
import type { Product, Discount } from '@/lib/types'
import {
  getEffectivePrice, getFinalPrice, resolveDiscountPercent,
  getPrimaryPhoto, BLUR_DATA_URL, getPrimaryPhotoAlt, leadTimeMessage, sortSizes,
  variantLabel, hasPriceRange, getListingSize,
} from '@/lib/types'
import { useSizeSelection, getRestockWhatsAppUrl } from '@/lib/product-selection'
import { useCart } from './CartProvider'
import { useScrollLock } from '@/lib/scroll-lock'
import { useFocusTrap } from '@/lib/focus-trap'
import { dahila, Button, Icon } from './ui/Primitives'
import { PriceBlock } from './ui/PriceBlock'
import { track } from '@/lib/analytics'

/**
 * Quick-view: a focused product preview the shopper can open from the grid
 * without losing their place. Deliberately simple — one photo, price, size,
 * add-to-cart, and a link to the full page. Big targets, plain language.
 */
export function QuickViewModal({
  product,
  discounts = [],
  onClose,
  whatsappUrl,
}: {
  product: Product
  discounts?: Discount[]
  onClose: () => void
  whatsappUrl?: string
}) {
  const router = useRouter()
  // queueNote y el WhatsApp del sitio salen del contexto: ninguna de las
  // páginas que abren la vista rápida se los pasaba, así que el modal no decía
  // cuánto tarda y "avisame cuando vuelva" usaba un número fijo en el código.
  const { addToCart, queueNote, whatsappUrl: siteWhatsappUrl } = useCart()
  // Mismo criterio que el PDP, factorizado en un hook compartido (auditoría
  // 03/09/2026: antes duplicado letra por letra en los dos archivos). Ningún
  // talle aparece elegido hasta que alguien lo elige (VIS-01).
  const { talle, setTalle, sizeAvailable, elegido, necesitaElegir } = useSizeSelection(product)
  const etiqueta = variantLabel(product.sizes)
  const esModelo = etiqueta === 'Modelo'
  // El aviso "Elegí un talle…", después de tocar el botón sin haber elegido.
  const [avisoTalle, setAvisoTalle] = useState(false)
  // "Agregando…" mientras se guarda (CRO-21); la traba va en un ref.
  const [adding, setAdding] = useState(false)
  const addingRef = useRef(false)
  const sizesRef = useRef<HTMLDivElement>(null)

  const photo = getPrimaryPhoto(product)
  // Sin talle elegido y con precio por talle: "desde" el más bajo, como la ficha.
  const precioDesde = !elegido && hasPriceRange(product)
  const tallePrecio = precioDesde ? getListingSize(product) : talle
  const listPrice = getEffectivePrice(product, tallePrecio)
  const finalPrice = getFinalPrice(product, tallePrecio, discounts)
  const discountPct = resolveDiscountPercent(product, discounts)
  const hasDiscount = discountPct > 0 && listPrice > 0
  const isSoldOut = product.status === 'soldout'
  const canBuy = !isSoldOut && !product.is_custom_only

  // Mismo flujo de captura de demanda que el PDP completo: sin esto, quien
  // abre la vista rápida de un producto agotado se topa con un callejón sin
  // salida (antes: un botón "Agotado" deshabilitado y nada más).
  const restockUrl = getRestockWhatsAppUrl(product, whatsappUrl || siteWhatsappUrl)
  const leadTime = leadTimeMessage(product, queueNote)

  useScrollLock(true)

  // Esc to close.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Trap Tab inside the card so keyboard users can't fall through into the
  // product grid sitting behind the scrim.
  const cardRef = useRef<HTMLDivElement>(null)
  useFocusTrap(cardRef, true)

  const handleAdd = async () => {
    if (!sizeAvailable || addingRef.current) return
    addingRef.current = true
    setAdding(true)
    try {
      const ok = await addToCart(product, talle, 1, { source: 'vista_rapida' })
      // addToCart opens the mini-cart drawer; close this modal so we don't stack
      // two dialogs on top of each other. Si falló, la vista rápida se queda
      // abierta: cerrarla escondería el aviso y la salida por WhatsApp.
      if (ok) onClose()
    } finally {
      addingRef.current = false
      setAdding(false)
    }
  }

  // Con dos o más talles y ninguno elegido, el botón no agrega: avisa debajo
  // de los talles y deja el foco en el primero disponible (mismo gesto que la
  // ficha).
  const pedirTalle = () => {
    setAvisoTalle(true)
    sizesRef.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Vista rápida: ${product.name}`}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 120,
        background: 'rgba(20,16,17,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        ref={cardRef}
        tabIndex={-1}
        className="quickview-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 16, overflow: 'hidden',
          width: '100%', maxWidth: 760, maxHeight: '90vh',
          display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          boxShadow: dahila.shadowMd,
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          style={{
            position: 'absolute', top: 12, right: 12, zIndex: 2,
            width: 38, height: 38, borderRadius: 999,
            background: 'rgba(255,255,255,0.92)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: dahila.ink900, boxShadow: dahila.shadowSm,
          }}
        >
          <Icon name="x" size={18} />
        </button>

        {/* Image */}
        <div className="quickview-img" style={{ position: 'relative', aspectRatio: '4/5', background: dahila.cream50 }}>
          <Image
            src={photo}
            alt={getPrimaryPhotoAlt(product)}
            fill
            quality={90}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            sizes="(max-width: 760px) 100vw, 380px"
            style={{ objectFit: 'cover' }}
          />
          {hasDiscount && (
            <span style={{
              position: 'absolute', top: 12, left: 12,
              background: '#B6314A', color: '#fff',
              fontFamily: dahila.fontSans, fontSize: 11, fontWeight: 600,
              letterSpacing: '0.06em', padding: '5px 10px', borderRadius: 999,
            }}>−{discountPct}%</span>
          )}
        </div>

        {/* Details */}
        <div className="quickview-body" style={{
          padding: '28px 26px', display: 'flex', flexDirection: 'column', gap: 16,
          overflowY: 'auto',
        }}>
          <div>
            <h2 style={{
              fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 26,
              color: dahila.ink900, margin: '0 0 8px', lineHeight: 1.15,
            }}>{product.name}</h2>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <PriceBlock list={listPrice} final={finalPrice} size="md" soldOut={isSoldOut} from={precioDesde} />
            </div>
            {leadTime && (
              <p style={{
                display: 'flex', alignItems: 'flex-start', gap: 7, margin: '10px 0 0',
                fontFamily: dahila.fontSans, fontSize: 13, lineHeight: 1.45,
                color: leadTime.ready ? dahila.wine600 : dahila.ink700,
                fontWeight: leadTime.ready ? 500 : 400,
              }}>
                <span style={{ flexShrink: 0, marginTop: 1 }}>
                  <Icon name={leadTime.ready ? 'check' : 'arrow-clockwise'} size={15} color={leadTime.ready ? dahila.wine600 : dahila.ink500} />
                </span>
                <span>{leadTime.text}</span>
              </p>
            )}
          </div>

          {product.description && (
            <p style={{
              fontFamily: dahila.fontSans, fontSize: 14, fontWeight: 300, lineHeight: 1.65,
              color: dahila.ink700, margin: 0,
              display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>{product.description}</p>
          )}

          {/* Sizes */}
          {canBuy && product.sizes && product.sizes.length > 0 && (
            <div>
              <div style={{ fontFamily: dahila.fontSans, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: dahila.ink500, marginBottom: 8 }}>
                {etiqueta}
              </div>
              <div ref={sizesRef} style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {sortSizes(product.sizes).map((s) => {
                  const on = elegido === s.size
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setTalle(s.size)}
                      disabled={!s.available}
                      aria-pressed={on}
                      style={{
                        minWidth: 44, height: 44, padding: '0 12px', borderRadius: 8,
                        fontFamily: dahila.fontSans, fontSize: 13,
                        border: `1px solid ${on ? dahila.ink900 : dahila.borderStrong}`,
                        background: on ? dahila.ink900 : '#fff',
                        color: on ? '#fff' : dahila.ink900,
                        cursor: s.available ? 'pointer' : 'not-allowed',
                        opacity: s.available ? 1 : 0.5,
                        textDecoration: s.available ? 'none' : 'line-through',
                      }}
                    >{s.size}</button>
                  )
                })}
              </div>
              {necesitaElegir && avisoTalle && (
                <p role="alert" style={{ margin: '8px 0 0', fontFamily: dahila.fontSans, fontSize: 13, color: dahila.wine600 }}>
                  {esModelo ? 'Elegí un modelo para agregarla' : 'Elegí un talle para agregarla'}
                </p>
              )}
            </div>
          )}

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {canBuy ? (
              sizeAvailable ? (
                // Ocupado = aria-disabled y no disabled: un botón enfocado que
                // pasa a disabled pierde el foco (Chromium lo manda al body).
                <Button
                  variant="primary"
                  size="lg"
                  full
                  onClick={necesitaElegir ? pedirTalle : handleAdd}
                  aria-busy={adding}
                  aria-disabled={adding || undefined}
                  style={adding ? { opacity: 0.7, cursor: 'progress' } : undefined}
                >
                  {necesitaElegir ? (esModelo ? 'Elegí el modelo' : 'Elegí tu talle') : adding ? 'Agregando…' : 'Agregar al carrito'}
                </Button>
              ) : (
                <Button variant="secondary" size="lg" full disabled>
                  {esModelo ? 'Sin stock en ese modelo' : `Sin stock en el talle ${talle}`}
                </Button>
              )
            ) : product.is_custom_only ? (
              <Button variant="primary" size="lg" full onClick={() => router.push('/encargo')}>
                Pedir a medida
              </Button>
            ) : (
              <a
                href={restockUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('restock_click', { product: product.slug, source: 'quickview' })}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                  background: '#1E8449', color: '#fff', textDecoration: 'none',
                  borderRadius: 10, padding: '15px 22px', width: '100%',
                  fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 500,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}
              >
                <Icon name="whatsapp-logo" size={18} /> Avisame cuando vuelva
              </a>
            )}
            <button
              onClick={() => router.push(`/tienda/${product.slug}`)}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontFamily: dahila.fontSans, fontSize: 13, color: dahila.ink700,
                textDecoration: 'underline', padding: '4px 0',
              }}
            >
              Ver todos los detalles
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
