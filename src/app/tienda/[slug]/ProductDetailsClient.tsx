'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/components/CartProvider'
import { EncargosDisponibles, type EncargosCuposState } from '@/components/EncargosDisponibles'
import { ProductGallery } from '@/components/ProductGallery'
import { ProductCard } from '@/components/ProductCard'
import { RecentlyViewed } from '@/components/RecentlyViewed'
import { SizeGuide } from '@/components/SizeGuide'
import { ShareButton } from '@/components/ShareButton'
import { FavoriteButton } from '@/components/FavoriteButton'
import type { Product, Discount } from '@/lib/types'
import { getEffectivePrice, getFinalPrice, getPrimaryPhoto, getScarcity, readyDateEstimate, formatPrice, BLUR_DATA_URL } from '@/lib/types'
import { PriceBlock } from '@/components/ui/PriceBlock'
import { dahila, Button, Eyebrow, Icon, Breadcrumb } from '@/components/ui/Primitives'
import { track } from '@/lib/analytics'

export function ProductDetailsClient({
  product,
  discountPercent = 0,
  related = [],
  lookComplements = [],
  discounts = [],
  sizeGuideNote,
  whatsappUrl = 'https://wa.me/59899850073',
  shippingEstimate,
  queueNote = '',
  trustItems,
  makerName = 'Anush',
  makerBio = '',
  makerPhoto = '',
  processEnabled = false,
  processSteps = [],
  encargosCupos,
}: {
  product: Product
  discountPercent?: number
  related?: Product[]
  /** Complementos para la tira "Completá el look" del bloque de compra (máx 2). */
  lookComplements?: Product[]
  discounts?: Discount[]
  sizeGuideNote?: string
  whatsappUrl?: string
  shippingEstimate?: string
  /** Aviso de lista de espera; cuando existe, reemplaza a la fecha estimada. */
  queueNote?: string
  trustItems?: { icon: string; text: string }[]
  makerName?: string
  makerBio?: string
  makerPhoto?: string
  processEnabled?: boolean
  processSteps?: { icon: string; label: string; body: string }[]
  encargosCupos: EncargosCuposState
}) {
  const trust = trustItems && trustItems.length > 0 ? trustItems : [
    { icon: 'truck', text: 'Envío a todo Uruguay' },
    { icon: 'hand-heart', text: 'Hecho a mano' },
    { icon: 'whatsapp-logo', text: 'Coordinás por WhatsApp' },
  ]
  const router = useRouter()
  const { addToCart } = useCart()
  // Default to the first AVAILABLE size, not just the first one.
  const firstAvailable = product.sizes?.find((s) => s.available)?.size
  const [talle, setTalle] = useState<string>(firstAvailable || product.sizes?.[0]?.size || 'Único')
  const [added, setAdded] = useState(false)

  useEffect(() => { track('product_view', { product: product.slug }) }, [product.slug])

  // Is the currently selected size in stock? (Products with no size rows are
  // treated as available — they're single-size pieces.)
  const selectedSizeRow = product.sizes?.find((s) => s.size === talle)
  const sizeAvailable = !selectedSizeRow || selectedSizeRow.available

  const galleryImages = (product.media && product.media.length > 0
    ? [...product.media]
        .filter((m) => m.type === 'image')
        .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.position - b.position)
        .map((m) => ({ url: m.url, alt: m.alt || product.name }))
    : [])

  const listPrice = getEffectivePrice(product, talle)
  const hasDiscount = discountPercent > 0 && listPrice > 0
  const finalPrice = hasDiscount ? Math.round((listPrice * (100 - discountPercent)) / 100) : listPrice
  const isSoldOut = product.status === 'soldout'
  const canBuy = !isSoldOut && !product.is_custom_only
  const scarcity = getScarcity(product)

  // Sold-out demand capture: a pre-filled WhatsApp message asking for a heads-up
  // when the piece is back. No backend/email — just opens the chat.
  const restockText = encodeURIComponent(
    `Hola! Vi "${product.name}" en la web pero está agotado. ¿Me avisás cuando vuelva? 🧶`
  )
  const restockUrl = `${whatsappUrl}${whatsappUrl.includes('?') ? '&' : '?'}text=${restockText}`

  const handleAdd = async () => {
    if (!sizeAvailable) return
    setAdded(true)
    await addToCart(product, talle, 1)
    setTimeout(() => setAdded(false), 2200)
  }

  // "Completá el look" con un toque (solo piezas de talle único). No abre el
  // drawer: la clienta sigue en esta ficha, el badge del header ya confirma.
  const [addedLookId, setAddedLookId] = useState<string | null>(null)
  const handleLookAdd = async (p: Product) => {
    const avail = (p.sizes ?? []).filter((s) => s.available)
    const size = avail.length > 0 ? avail[0].size : 'Único'
    setAddedLookId(p.id)
    await addToCart(p, size, 1, { openDrawer: false })
    track('look_add', { from: product.slug, to: p.slug })
    setTimeout(() => setAddedLookId(null), 2200)
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 0' }}>
      <Breadcrumb items={[
        { label: 'Inicio', href: '/' },
        { label: 'Tienda', href: '/tienda' },
        ...(product.category ? [{ label: product.category.name, href: `/tienda/${product.category.slug}` }] : []),
        { label: product.name },
      ]} />

      <div className="producto-split" style={{
        display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 56, alignItems: 'start',
      }}>
        {/* Gallery */}
        <div style={{ position: 'relative' }}>
          {hasDiscount && (
            <span style={{
              position: 'absolute', top: 12, left: 12, zIndex: 3,
              background: '#B6314A', color: '#fff',
              fontFamily: dahila.fontSans, fontSize: 11, fontWeight: 600,
              letterSpacing: '0.06em',
              padding: '5px 10px', borderRadius: 999,
            }}>
              −{discountPercent}%
            </span>
          )}
          <ProductGallery images={galleryImages} productName={product.name} />
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
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <PriceBlock list={listPrice} final={finalPrice} size="md" soldOut={isSoldOut} />
            </div>

            {/* Honest scarcity — only shown when there's something true to say. */}
            {!isSoldOut && scarcity && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10,
                fontFamily: dahila.fontSans, fontSize: 12, fontWeight: 500,
                color: scarcity.level === 'last' ? '#B6314A' : dahila.wine600,
                letterSpacing: '0.02em',
              }}>
                <span aria-hidden style={{
                  width: 6, height: 6, borderRadius: 999,
                  background: scarcity.level === 'last' ? '#B6314A' : dahila.wine600,
                }} />
                {scarcity.label}
              </span>
            )}
          </div>

          {/* Colour palette — these are the tones Anush can work this piece in.
              Selecting is coordinated over WhatsApp, so this is informational. */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <span style={{
                display: 'block', marginBottom: 8,
                fontFamily: dahila.fontSans, fontSize: 10, letterSpacing: '0.22em',
                textTransform: 'uppercase', color: dahila.ink500,
              }}>
                Colores
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {product.colors.map((c) => (
                  <span key={c.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span aria-hidden style={{
                      width: 16, height: 16, borderRadius: 999,
                      background: c.hex || dahila.cream200,
                      boxShadow: 'inset 0 0 0 1px rgba(31,26,27,0.18)',
                    }} />
                    <span style={{ fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink700 }}>{c.name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {!isSoldOut && !product.is_custom_only && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{
                  fontFamily: dahila.fontSans, fontSize: 10, letterSpacing: '0.22em',
                  textTransform: 'uppercase', color: dahila.ink500, fontWeight: 400,
                }}>Talle</span>
                <SizeGuide note={sizeGuideNote} />
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {product.sizes && product.sizes.length > 0 ? product.sizes.map((s) => (
                  <button key={s.id} onClick={() => setTalle(s.size)} disabled={!s.available} style={{
                    minWidth: 44, height: 44, padding: '0 12px', borderRadius: 8,
                    fontFamily: dahila.fontSans, fontSize: 12, fontWeight: 400,
                    border: `1px solid ${talle === s.size ? dahila.ink900 : dahila.borderStrong}`,
                    background: talle === s.size ? dahila.ink900 : '#fff',
                    color: talle === s.size ? '#fff' : dahila.ink900,
                    cursor: s.available ? 'pointer' : 'not-allowed', transition: `all 140ms ${dahila.ease}`,
                    opacity: s.available ? 1 : 0.5,
                    textDecoration: s.available ? 'none' : 'line-through',
                  }}>{s.size}</button>
                )) : ['XS', 'S', 'M', 'L', 'XL'].map((t) => (
                  <button key={t} onClick={() => setTalle(t)} style={{
                    minWidth: 44, height: 44, borderRadius: 8,
                    fontFamily: dahila.fontSans, fontSize: 12, fontWeight: 400,
                    border: `1px solid ${talle === t ? dahila.ink900 : dahila.borderStrong}`,
                    background: talle === t ? dahila.ink900 : '#fff',
                    color: talle === t ? '#fff' : dahila.ink900,
                    cursor: 'pointer', transition: `all 140ms ${dahila.ease}`,
                  }}>{t}</button>
                ))}

                <button onClick={() => router.push('/encargo')} style={{
                  padding: '0 14px', height: 44, borderRadius: 8,
                  fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink900,
                  background: 'transparent', border: `1px dashed ${dahila.borderStrong}`, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}>
                  <Icon name="ruler" size={14}/> A medida
                </button>
              </div>
            </div>
          )}

          {/* Cupos de encargo reales (CMS: encargos_cupos_*) — la agenda de
              producción es la urgencia honesta de un taller a pedido. No
              renderiza nada si Anush no la tiene activada. */}
          {!isSoldOut && <EncargosDisponibles state={encargosCupos} />}

          {product.is_custom_only && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Process stepper — solo si está habilitado y tiene pasos */}
              {processEnabled && processSteps.length > 0 && (
                <div style={{
                  background: dahila.cream50, borderRadius: 14,
                  padding: '18px 20px', border: `1px solid ${dahila.border}`,
                }}>
                  <div style={{
                    fontFamily: dahila.fontSans, fontSize: 10, letterSpacing: '0.18em',
                    textTransform: 'uppercase', color: dahila.ink500, marginBottom: 14,
                  }}>
                    Cómo funciona
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {processSteps.map((step, i) => (
                      <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                        <div style={{
                          flexShrink: 0, width: 32, height: 32, borderRadius: 999,
                          background: dahila.cream200, display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Icon name={step.icon} size={15} color={dahila.wine600} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 6 }}>
                          <span style={{
                            fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 500,
                            color: dahila.ink900,
                          }}>{step.label}</span>
                          <span style={{
                            fontFamily: dahila.fontSans, fontSize: 12, fontWeight: 300,
                            color: dahila.ink700, lineHeight: 1.55,
                          }}>{step.body}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Button variant="primary" full onClick={() => router.push('/encargo')}>Solicitar presupuesto</Button>
            </div>
          )}

          {canBuy && (
            sizeAvailable ? (
              <Button variant="primary" size="lg" full onClick={handleAdd}>
                {added ? '✓ Agregado' : 'Agregar al carrito'}
              </Button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Button variant="secondary" size="lg" full disabled>Sin stock en el talle {talle}</Button>
                <button onClick={() => router.push('/encargo')} style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  fontFamily: dahila.fontSans, fontSize: 13, color: dahila.wine600,
                  textDecoration: 'underline', padding: 0,
                }}>
                  ¿Lo querés en este talle? Pedilo a medida →
                </button>
              </div>
            )
          )}

          {/* Sold out → capture demand instead of a dead end. */}
          {isSoldOut && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a
                href={restockUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('restock_click', { product: product.slug })}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                  background: '#25D366', color: '#fff', textDecoration: 'none',
                  borderRadius: 10, padding: '15px 22px',
                  fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 500,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}
              >
                <Icon name="whatsapp-logo" size={18} /> Avisame cuando vuelva
              </a>
              <button onClick={() => router.push('/encargo')} style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontFamily: dahila.fontSans, fontSize: 13, color: dahila.wine600,
                textDecoration: 'underline', padding: 0, alignSelf: 'center',
              }}>
                O pedila a medida y la tejemos para vos →
              </button>
            </div>
          )}

          {/* Trust strip — pegado al CTA, donde muere la ansiedad de compra */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {trust.map(({ icon, text }) => (
              <span key={text} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontFamily: dahila.fontSans, fontSize: 11, color: dahila.ink500,
                letterSpacing: '0.02em',
              }}>
                <Icon name={icon} size={14} color={dahila.ink500} /> {text}
              </span>
            ))}
          </div>

          {/* Descripción — abajo del bloque de compra: quien ya decidió no la
              necesita; quien duda la encuentra enseguida (y ANTES del
              cross-sell: primero se termina de vender esta pieza). */}
          <p style={{
            fontFamily: dahila.fontSans, fontSize: 14, fontWeight: 300, lineHeight: 1.7,
            color: dahila.ink700, margin: 0,
            borderTop: `1px solid ${dahila.border}`, paddingTop: 16,
          }}>
            {product.description || 'Tejida a mano. Empieza cuando vos confirmás colores y medida.'}
          </p>

          {/* Completá el look — 2 complementos discretos, después del CTA y de
              la descripción (Baymard: el cross-sell nunca compite con la acción
              principal). Mismo gesto que "Sumale un detalle" del carrito: las
              piezas de talle único se agregan con un toque, sin salir del PDP;
              las que tienen talles llevan a su ficha a elegirlo. */}
          {lookComplements.length > 0 && (
            <div style={{
              borderTop: `1px solid ${dahila.border}`, paddingTop: 14,
              display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              <span style={{
                fontFamily: dahila.fontSans, fontSize: 10, letterSpacing: '0.22em',
                textTransform: 'uppercase', color: dahila.ink500,
              }}>
                Completá el look · viaja en el mismo envío
              </span>
              {lookComplements.map((p) => {
                const cPhoto = getPrimaryPhoto(p)
                const cFinal = getFinalPrice(p, undefined, discounts)
                const cAvail = (p.sizes ?? []).filter((s) => s.available)
                const oneTap = !p.is_custom_only && p.status === 'active' && cAvail.length <= 1
                const justAdded = addedLookId === p.id
                return (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Link
                      href={`/tienda/${p.slug}`}
                      onClick={() => track('look_click', { from: product.slug, to: p.slug })}
                      aria-label={`Ver ${p.name}`}
                      style={{
                        position: 'relative', width: 46, height: 56, flexShrink: 0,
                        borderRadius: 8, overflow: 'hidden', background: dahila.cream50, display: 'block',
                      }}
                    >
                      <Image src={cPhoto} alt={p.name} fill sizes="46px" placeholder="blur" blurDataURL={BLUR_DATA_URL} style={{ objectFit: 'cover' }} />
                    </Link>
                    <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Link
                        href={`/tienda/${p.slug}`}
                        onClick={() => track('look_click', { from: product.slug, to: p.slug })}
                        style={{
                          fontFamily: dahila.fontDisplay, fontSize: 14, color: dahila.ink900, lineHeight: 1.25,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'none',
                        }}
                      >{p.name}</Link>
                      {oneTap ? (
                        <button
                          onClick={() => handleLookAdd(p)}
                          disabled={justAdded}
                          aria-label={`Agregar ${p.name} al carrito por ${formatPrice(cFinal)}`}
                          style={{
                            background: 'transparent', border: 'none', padding: '2px 0',
                            cursor: justAdded ? 'default' : 'pointer', alignSelf: 'flex-start',
                            fontFamily: dahila.fontSans, fontSize: 12,
                            color: justAdded ? '#1E8449' : dahila.wine600,
                            textDecoration: justAdded ? 'none' : 'underline', textUnderlineOffset: 3,
                          }}
                        >
                          {justAdded ? '✓ Sumado al carrito' : `+ Agregar · ${formatPrice(cFinal)}`}
                        </button>
                      ) : (
                        <Link
                          href={`/tienda/${p.slug}`}
                          onClick={() => track('look_click', { from: product.slug, to: p.slug })}
                          style={{
                            fontFamily: dahila.fontSans, fontSize: 12, color: dahila.wine600,
                            textDecoration: 'underline', textUnderlineOffset: 3, alignSelf: 'flex-start', padding: '2px 0',
                          }}
                        >
                          {`Elegir talle · ${formatPrice(cFinal)}`}
                        </Link>
                      )}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <FavoriteButton productId={product.id} variant="inline" />
            <ShareButton title={`${product.name} — Dahila Crochet`} text={`Mirá esta prenda de Dahila: ${product.name}`} />
          </div>

          {/* Maker bio — who made this piece; builds trust for artisan brands */}
          {makerBio.trim().length > 0 && (
            <div style={{
              display: 'flex', gap: 12, alignItems: 'flex-start',
              background: dahila.cream50, borderRadius: 12, padding: '14px 16px',
              border: `1px solid ${dahila.border}`,
            }}>
              {makerPhoto.trim().length > 0 && (
                <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 999, overflow: 'hidden', position: 'relative' }}>
                  <Image src={makerPhoto} alt={makerName} fill sizes="40px" placeholder="blur" blurDataURL={BLUR_DATA_URL} style={{ objectFit: 'cover' }} />
                </div>
              )}
              <div>
                <div style={{ fontFamily: dahila.fontSans, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: dahila.ink500, marginBottom: 4 }}>
                  Hecho por {makerName}
                </div>
                <p style={{ fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 300, lineHeight: 1.6, color: dahila.ink700, margin: 0 }}>
                  {makerBio}
                </p>
              </div>
            </div>
          )}

          <ul style={{
            margin: '6px 0 0', padding: 0, listStyle: 'none',
            display: 'flex', flexDirection: 'column', gap: 8,
            borderTop: `1px solid ${dahila.border}`, paddingTop: 16,
          }}>
            {product.material && (
              <li style={liStyle}>
                <Icon name="ruler" size={16} color={dahila.ink500}/> {product.material}
              </li>
            )}
            <li style={liStyle}>
              <Icon name="flower" size={16} color={dahila.ink500}/> Tejido a mano en Montevideo
            </li>
            <li style={liStyle}>
              <Icon name="package" size={16} color={dahila.ink500}/>
              {shippingEstimate && shippingEstimate.trim() ? shippingEstimate : 'Envío a todo Uruguay'}
            </li>
            {queueNote ? (
              // Lista de espera activa: manda sobre la fecha estimada del
              // producto — prometer "lista en 3 semanas" con cola sería mentir.
              <li style={liStyle}>
                <Icon name="arrow-clockwise" size={16} color={dahila.ink500}/> {queueNote}
              </li>
            ) : (product.lead_time_weeks_min || product.lead_time_weeks_max) && (
              <li style={liStyle}>
                <Icon name="arrow-clockwise" size={16} color={dahila.ink500}/>
                {(() => {
                  // Urgencia honesta: fecha estimada concreta en vez de "N semanas"
                  // abstractas — cada pieza se teje al encargarla, y eso es un plus.
                  const estimate = readyDateEstimate(product.lead_time_weeks_min, product.lead_time_weeks_max)
                  return estimate
                    ? <>Se teje al encargar — si la pedís hoy, lista {estimate}</>
                    : 'Plazo a coordinar'
                })()}
              </li>
            )}
            <li style={liStyle}>
              <Icon name="check" size={16} color={dahila.ink500}/>
              Hecho a tu medida — por eso no aceptamos cambios, pero te acompaño en todo el proceso para que quede perfecta.
            </li>
            <li style={liStyle}>
              <Icon name="tag" size={16} color={dahila.ink500}/>
              Pagás por transferencia o Mercado Pago, coordinado por WhatsApp — nada se cobra hasta que confirmemos todo.
            </li>
          </ul>

          {product.care_instructions && (
            <CareInstructions text={product.care_instructions} />
          )}
        </div>
      </div>

      {/* Sticky mobile add-to-cart — visible only on small screens */}
      {canBuy && (
        <div className="pdp-sticky-bar">
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1, minWidth: 0, flex: '0 1 auto' }}>
            <span style={{
              fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 14,
              color: dahila.ink900, lineHeight: 1.2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              maxWidth: '40vw',
            }}>{product.name}</span>
            <PriceBlock list={listPrice} final={finalPrice} size="sm" align="start" />
          </div>
          <button
            onClick={handleAdd}
            disabled={!sizeAvailable}
            style={{
              flex: 1, marginLeft: 16,
              background: sizeAvailable ? dahila.ink900 : dahila.ink300,
              color: '#fff', border: 'none',
              borderRadius: 10, padding: '14px 18px',
              cursor: sizeAvailable ? 'pointer' : 'not-allowed',
              fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 500,
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}
          >
            {!sizeAvailable ? 'Sin stock' : added ? '✓ Agregado' : 'Agregar'}
          </button>
        </div>
      )}

      {/* Related products — cross-sell con título contextual */}
      {related.length > 0 && (() => {
        const sameCollection = related.some((p) => p.collection_id && p.collection_id === product.collection_id)
        const sectionTitle = sameCollection && product.collection?.name
          ? `De la colección ${product.collection.name}`
          : 'También tejemos'
        return (
        <section style={{ marginTop: 88 }}>
          <div style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16,
            margin: '0 0 28px', paddingBottom: 12, borderBottom: `1px solid ${dahila.border}`,
          }}>
            <h2 style={{
              fontFamily: dahila.fontDisplay, fontWeight: 300,
              fontSize: 22, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: dahila.ink900, margin: 0,
            }}>
              {sectionTitle}
            </h2>
            {sameCollection && product.collection?.slug && (
              <Link href={`/colecciones/${product.collection.slug}`} style={{
                fontFamily: dahila.fontSans, fontSize: 12, color: dahila.wine600,
                textDecoration: 'underline', whiteSpace: 'nowrap',
              }}>
                Ver toda la colección →
              </Link>
            )}
          </div>
          <div className="tienda-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22, rowGap: 44,
          }}>
            {related.map((p) => (
              <ProductCard key={p.id} product={p} discounts={discounts} />
            ))}
          </div>
        </section>
        )
      })()}

      <RecentlyViewed
        current={{
          slug: product.slug,
          name: product.name,
          photo: getPrimaryPhoto(product),
          price: finalPrice,
        }}
      />

    </div>
  )
}

const liStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 10,
  fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 300, color: dahila.ink700,
}

function CareInstructions({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderTop: `1px solid ${dahila.border}`, paddingTop: 14 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="care-panel"
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px 0',
          fontFamily: dahila.fontSans, fontSize: 12, fontWeight: 500,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          color: dahila.ink900,
        }}
      >
        <span>Cuidados</span>
        <Icon name={open ? 'minus' : 'plus'} size={14} color={dahila.ink500} />
      </button>
      <div
        id="care-panel"
        hidden={!open}
        style={{
          fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 300, lineHeight: 1.7,
          color: dahila.ink700, padding: '8px 0 4px', whiteSpace: 'pre-line',
        }}
      >
        {text}
      </div>
    </div>
  )
}
