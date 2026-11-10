'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ImagenConRespaldo } from '@/components/ui/ImagenConRespaldo'
import { useCart, type AddSource } from '@/components/CartProvider'
import { EncargosDisponibles, type EncargosCuposState } from '@/components/EncargosDisponibles'
import { ProductGallery } from '@/components/ProductGallery'
import { ProductCard } from '@/components/ProductCard'
import { RecentlyViewed } from '@/components/RecentlyViewed'
import { SizeGuide } from '@/components/SizeGuide'
import { ProcessStepper } from '@/components/ProcessStepper'
import { ShareButton } from '@/components/ShareButton'
import { PinterestButton } from '@/components/PinterestButton'
import { FavoriteButton } from '@/components/FavoriteButton'
import type { Product, Discount } from '@/lib/types'
import { descuentoHastaTexto } from '@/lib/drop-date'
import {
  getEffectivePrice, getFinalPrice, resolveDiscountEndsAt, getPrimaryPhoto, getScarcity, formatPrice, BLUR_DATA_URL, productPhotoAlt, productKindLabel, getPrimaryPhotoAlt,
  isReadyToShip, sortSizes, isTalleUnico, getListingPrice, formatListingPrice, leadTimeMessage, variantLabel,
  getListingSize, hasPriceRange,
} from '@/lib/types'
import { useSizeSelection, getRestockWhatsAppUrl } from '@/lib/product-selection'
import { tieneVariantes } from '@/lib/catalog-ids'
import { promesaFicha } from '@/lib/seo-copy'
import { waLink, WHATSAPP_DEFAULT } from '@/lib/whatsapp'
import { PriceBlock } from '@/components/ui/PriceBlock'
import { dahila, Button, Eyebrow, Icon, Breadcrumb } from '@/components/ui/Primitives'
import { track, gaCommerce } from '@/lib/analytics'
import type { Testimonial } from '@/components/TestimonialsStrip'
import { NavidadFicha } from '@/components/NavidadAviso'
import { ClientasGallery } from '@/components/ClientasGallery'
import { ReelLink } from '@/components/ReelsSection'
import type { ReelCard } from '@/lib/reels'

/** Desde este precio base la ficha muestra "En otro color o a tu medida" como
 *  botón propio (ver el bloque del botón principal). */
const PREMIUM_FROM_UYU = 2800

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
  testimonial = null,
  totalTestimonios = 0,
  reel = null,
  soloConsulta = false,
  navidadEncargoHasta,
  navidadStockHasta,
  clientPhotos = [],
  giftEnabled = false,
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
  /** Un testimonio real de la tienda (ver pickTestimonial en page.tsx). */
  testimonial?: Testimonial | null
  /** Cuántos testimonios hay en total: el número pesa tanto como la cita. */
  totalTestimonios?: number
  /** Reel de Instagram de esta prenda (admin → Reels), o null. */
  reel?: ReelCard | null
  /** La base no responde y la ficha se está sirviendo del respaldo: el carrito
   *  no puede guardar nada, así que el pedido se toma por WhatsApp. */
  soloConsulta?: boolean
  /** Fechas de corte para Navidad ("2026-12-05"), desde Configuración. */
  navidadEncargoHasta?: string
  navidadStockHasta?: string
  /** Testimonios con foto de clientas que compraron ESTA prenda. */
  clientPhotos?: Testimonial[]
  /** La tarjeta de regalo está prendida (Configuración). */
  giftEnabled?: boolean
}) {
  const trust = trustItems && trustItems.length > 0 ? trustItems : [
    { icon: 'truck', text: 'Envío a todo Uruguay' },
    { icon: 'hand-heart', text: 'Hecho a mano' },
    { icon: 'whatsapp-logo', text: 'Coordinás por WhatsApp' },
  ]
  const router = useRouter()
  const { addToCart } = useCart()
  // Factorizado en un hook compartido con QuickViewModal (auditoría
  // 03/09/2026: antes duplicado letra por letra en los dos archivos).
  // `elegido` es el talle que se muestra elegido: null mientras haya dos o más
  // disponibles y nadie haya elegido (VIS-01, ver resolverSeleccion).
  const { talle, setTalle, sizeAvailable, elegido, necesitaElegir } = useSizeSelection(product)
  // Color con la foto del ovillo abierta (solo colores con image_url).
  const [lanaAbierta, setLanaAbierta] = useState<string | null>(null)

  // Barra fija de "Agregar" (mobile): cuando el botón principal no está en
  // pantalla, esté arriba o abajo. Antes solo aparecía después de pasarlo, y
  // en un iPhone el botón queda a ~1,5 pantallas de la foto: quien llegaba del
  // anuncio no veía precio ni botón hasta scrollear (auditoría 04/11/2026).
  // La marca va justo antes del botón; con rootMargin negativo arriba, cuenta
  // como "fuera" apenas el botón se va.
  const buyAnchorRef = useRef<HTMLSpanElement>(null)
  const [showSticky, setShowSticky] = useState(false)
  useEffect(() => {
    const el = buyAnchorRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([entry]) => {
      setShowSticky(!entry.isIntersecting)
    }, { rootMargin: '-80px 0px 0px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const [added, setAdded] = useState(false)
  // "Agregando…" mientras se guarda (CRO-21, 04/11/2026): en el navegador de
  // Instagram con datos móviles el POST tarda más de un segundo, y sin señal
  // la gente vuelve a tocar. La traba va en un ref porque el estado llega un
  // render tarde.
  const [adding, setAdding] = useState(false)
  const addingRef = useRef(false)
  // El aviso "Elegí un talle…" debajo del selector, después de tocar el botón
  // sin haber elegido.
  const [avisoTalle, setAvisoTalle] = useState(false)
  const sizesRef = useRef<HTMLDivElement>(null)

  // ¿Va como grupo de variantes en el feed? (lib/catalog-ids.ts). Decide si
  // Meta recibe la prenda como product_group (el item_group_id del feed) o
  // como product (TRK-01).
  const variantes = tieneVariantes(product)

  useEffect(() => {
    // GA4: view_item con precio y producto (informes de e-commerce).
    track('product_view', { product: product.slug }, {
      name: 'view_item',
      params: {
        ...gaCommerce([{
          item_id: product.slug, item_name: product.name, price: getListingPrice(product),
          item_category: product.category?.slug,
        }]),
        meta_group: tieneVariantes(product),
      },
    })
  }, [product])

  const galleryImages = (product.media && product.media.length > 0
    ? [...product.media]
        .filter((m) => m.type === 'image')
        .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.position - b.position)
        .map((m, i) => ({ url: m.url, alt: m.alt?.trim() || productPhotoAlt(product.name, i, productKindLabel(product)) }))
    : [])

  // Sin talle elegido y con precio distinto por talle, el precio es "desde" (el
  // más bajo, como en la tarjeta): la ficha no muestra el precio de un talle
  // que nadie eligió ni lo "sube" por sorpresa al elegir.
  const precioDesde = !elegido && hasPriceRange(product)
  const tallePrecio = precioDesde ? getListingSize(product) : talle
  const listPrice = getEffectivePrice(product, tallePrecio)
  const hasDiscount = discountPercent > 0 && listPrice > 0
  const hastaTexto = hasDiscount ? descuentoHastaTexto(resolveDiscountEndsAt(product, discounts)) : null
  // Antes recalculaba el descuento a mano en vez de usar getFinalPrice (ya
  // centralizada y usada más abajo en este mismo archivo, línea 349) — dan el
  // mismo resultado hoy porque la página padre calcula discountPercent con la
  // misma fórmula, pero quedaba frágil ante cualquier cambio futuro de regla
  // de redondeo. Auditoría 03/09/2026.
  const finalPrice = getFinalPrice(product, tallePrecio, discounts)
  const isSoldOut = product.status === 'soldout'
  const canBuy = !isSoldOut && !product.is_custom_only
  const scarcity = getScarcity(product)
  const sizes = sortSizes(product.sizes)
  const talleUnico = isTalleUnico(sizes)
  // "Talle" o "Modelo" (VIS-M4): las variantes de Pulseras Terra (Lisas, Con
  // lurex, Con caracolas) no son talles; sin guía de talles ni "¿Dudas con el
  // talle?" para una pulsera.
  const etiqueta = variantLabel(sizes)
  const esModelo = etiqueta === 'Modelo'
  const pedirLabel = esModelo ? 'Elegí el modelo' : 'Elegí tu talle'
  const readyNow = isReadyToShip(product)
  // numeric de Postgres puede llegar como string; 0, vacío o basura = no se muestra.
  const knitHoursRaw = Number(product.knit_hours)
  const knitHours = Number.isFinite(knitHoursRaw) && knitHoursRaw > 0 ? knitHoursRaw : null

  // Cuánto tarda, dicho una vez y arriba, junto al precio: antes vivía al final
  // de la lista de detalles, a tres pantallas del precio en el celular
  // (auditoría 12/09/2026). Una pieza ya tejida lo dice y NO muestra el aviso
  // de cola, que es de los encargos: antes la ficha de una pieza en stock
  // decía "los pedidos estarán listos a finales de septiembre".
  const plazo = leadTimeMessage(product, queueNote)?.text ?? null

  // El encargo arranca con esta prenda como referencia y el talle marcado
  // (EncargoForm lee ?desde y ?talle), no con un formulario en blanco. Solo el
  // talle que alguien eligió: el primero de la lista no viaja a ningún lado.
  const encargoHref = `/encargo?desde=${encodeURIComponent(product.slug)}${elegido ? `&talle=${encodeURIComponent(elegido)}` : ''}`

  // Sold-out demand capture: a pre-filled WhatsApp message asking for a heads-up
  // when the piece is back. No backend/email — just opens the chat.
  const restockUrl = getRestockWhatsAppUrl(product, whatsappUrl)

  // Links de WhatsApp de la ficha, armados con waLink (QA-15). El texto se
  // arma al tocar (usa window.location), con el talle solo si está elegido.
  const waHref = waLink(whatsappUrl) ?? WHATSAPP_DEFAULT
  const waConTexto = (texto: string) => waLink(whatsappUrl, texto) ?? waLink(WHATSAPP_DEFAULT, texto)!
  const conTalle = elegido && !talleUnico ? ` (${etiqueta.toLowerCase()} ${elegido})` : ''
  const textoConsulta = () => `Hola! Estoy mirando ${product.name}${conTalle} en la web: ${window.location.origin}/tienda/${product.slug}\nTengo una consulta 🧶`
  // Con el precio adentro: durante una caída el panel tampoco anda, así que el
  // chat tiene que bastarse solo.
  const textoPedido = () => `Hola! Quiero pedir ${product.name}${conTalle}, ${precioDesde ? 'desde ' : ''}${formatPrice(finalPrice)}: ${window.location.origin}/tienda/${product.slug}`
  // Lo que reciben GA4 y Meta de una consulta por WhatsApp desde la ficha
  // (TRK-04, 04/11/2026): la prenda, el precio que se ve y el talle si
  // alguien lo eligió. Antes el Contact llegaba vacío. Sin talle elegido, una
  // prenda con talles va como grupo, igual que su vista.
  const talleConsulta = elegido && !talleUnico ? elegido : undefined
  const gaConsulta = () => ({
    params: {
      ...gaCommerce([{
        item_id: product.slug, item_name: product.name, price: finalPrice,
        ...(talleConsulta ? { item_variant: talleConsulta } : {}),
        item_category: product.category?.slug,
      }]),
      meta_group: variantes && !talleConsulta,
    },
  })

  const handleAdd = async (source: AddSource) => {
    if (!sizeAvailable || addingRef.current) return
    addingRef.current = true
    setAdding(true)
    try {
      // El '✓ Agregado' sale SOLO si de verdad se guardó: con la base caída el
      // botón decía 'Agregado' mientras el aviso decía que había fallado
      // (20/09/2026).
      const ok = await addToCart(product, talle, 1, { source })
      if (!ok) return
      setAdded(true)
      setTimeout(() => setAdded(false), 2200)
    } finally {
      addingRef.current = false
      setAdding(false)
    }
  }

  // Nadie eligió talle todavía (VIS-01): el botón no agrega. Lleva al
  // selector, avisa debajo y deja el foco en el primer talle disponible. El
  // scroll mira "reducir movimiento": un behavior explícito pisa el CSS (VIS-19).
  const pedirTalle = () => {
    setAvisoTalle(true)
    const box = sizesRef.current
    if (!box) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    box.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
    box.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus({ preventScroll: true })
  }

  // "Completá el look" con un toque (solo piezas de talle único). No abre el
  // drawer: la clienta sigue en esta ficha, el badge del header ya confirma.
  const [addedLookId, setAddedLookId] = useState<string | null>(null)
  const handleLookAdd = async (p: Product) => {
    const avail = (p.sizes ?? []).filter((s) => s.available)
    const size = avail.length > 0 ? avail[0].size : 'Único'
    const ok = await addToCart(p, size, 1, { openDrawer: false, source: 'look' })
    if (!ok) return
    setAddedLookId(p.id)
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
        display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)', gap: 56, alignItems: 'start',
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
          <ProductGallery images={galleryImages} productName={product.name} slug={product.slug} />
        </div>

        {/* Detail. Los data-* son para la burbuja de WhatsApp (WhatsAppFloat):
            con ellos su Contact dice qué prenda, a qué precio y si va como
            grupo (TRK-04). */}
        <div
          className="producto-detail"
          data-slug={product.slug}
          data-nombre={product.name}
          data-precio={finalPrice}
          data-variantes={variantes ? 'si' : 'no'}
          style={{
            position: 'sticky', top: 90, display: 'flex', flexDirection: 'column', gap: 20,
          }}
        >
          <div>
            {/* Un dato útil arriba del nombre (VIS-17): antes decía "Hecho a
                mano" en todas las prendas. */}
            <Eyebrow>{product.badge || product.collection?.name || product.category?.name || 'Hecho a mano'}</Eyebrow>
            <h1 style={{
              fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 38,
              color: dahila.ink900, margin: '10px 0 4px', letterSpacing: '-0.02em', lineHeight: 1.1,
            }}>{product.name}</h1>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <PriceBlock list={listPrice} final={finalPrice} size="md" soldOut={isSoldOut} from={precioDesde} />
              {hastaTexto && !isSoldOut && (
                <span style={{ fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink500 }}>{hastaTexto}</span>
              )}
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

            {!isSoldOut && plazo && (
              <p style={{
                display: 'flex', alignItems: 'flex-start', gap: 7, margin: '10px 0 0',
                fontFamily: dahila.fontSans, fontSize: 13, lineHeight: 1.45,
                color: readyNow ? dahila.wine600 : dahila.ink700,
                fontWeight: readyNow ? 500 : 400,
              }}>
                <span style={{ flexShrink: 0, marginTop: 1 }}>
                  <Icon name={readyNow ? 'check' : 'arrow-clockwise'} size={15} color={readyNow ? dahila.wine600 : dahila.ink500} />
                </span>
                <span>{plazo}</span>
              </p>
            )}
          </div>

          <NavidadFicha
            encargoHasta={navidadEncargoHasta}
            stockHasta={navidadStockHasta}
            readyNow={readyNow}
            leadMaxWeeks={product.lead_time_weeks_max ?? 0}
          />

          {/* Colour palette — these are the tones Anush can work this piece in.
              Selecting is coordinated over WhatsApp, so this is informational. */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <span style={{
                display: 'block', marginBottom: 8,
                fontFamily: dahila.fontSans, fontSize: 11, letterSpacing: '0.22em',
                textTransform: 'uppercase', color: dahila.ink500,
              }}>
                Colores
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {product.colors.map((c) => {
                  const swatch = (
                    <>
                      <span aria-hidden style={{
                        width: 16, height: 16, borderRadius: 999,
                        background: c.hex || dahila.cream200,
                        boxShadow: 'inset 0 0 0 1px rgba(31,26,27,0.18)',
                      }} />
                      <span style={{ fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink700 }}>{c.name}</span>
                    </>
                  )
                  // Con foto del ovillo, el color se puede tocar para verlo de
                  // verdad (sin devoluciones, el color real es lo que da confianza).
                  return c.image_url ? (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setLanaAbierta(lanaAbierta === c.id ? null : c.id)}
                      aria-pressed={lanaAbierta === c.id}
                      aria-label={`Ver la lana ${c.name}`}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                        minHeight: 32, padding: '4px 10px', borderRadius: 999,
                        background: lanaAbierta === c.id ? dahila.cream100 : '#fff',
                        border: `1px solid ${lanaAbierta === c.id ? dahila.ink900 : dahila.borderStrong}`,
                      }}
                    >
                      {swatch}
                    </button>
                  ) : (
                    <span key={c.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>{swatch}</span>
                  )
                })}
              </div>
              {(() => {
                const lana = product.colors.find((c) => c.id === lanaAbierta && c.image_url)
                if (!lana) {
                  return product.colors.some((c) => c.image_url) ? (
                    <span style={{ display: 'block', marginTop: 6, fontFamily: dahila.fontSans, fontSize: 11.5, color: dahila.ink500 }}>
                      Tocá un color para ver la lana real.
                    </span>
                  ) : null
                }
                return (
                  <figure style={{ margin: '10px 0 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ position: 'relative', width: 120, height: 120, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: dahila.cream100 }}>
                      <ImagenConRespaldo
                        src={lana.image_url as string}
                        alt={`Lana color ${lana.name}, de cerca`}
                        fill
                        sizes="120px"
                        quality={82}
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <figcaption style={{ fontFamily: dahila.fontSans, fontSize: 12.5, lineHeight: 1.5, color: dahila.ink700 }}>
                      <strong style={{ fontWeight: 500, color: dahila.ink900 }}>{lana.name}</strong><br />
                      La lana real, sin filtros. En pantalla puede variar un poco según el brillo.
                    </figcaption>
                  </figure>
                )
              })()}
            </div>
          )}

          {/* El reel de la prenda, antes de elegir el talle: ver cómo cae
              puesta es lo que la foto quieta no muestra. */}
          {reel && <ReelLink reel={reel} />}

          {!isSoldOut && !product.is_custom_only && sizes.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{
                  fontFamily: dahila.fontSans, fontSize: 11, letterSpacing: '0.22em',
                  textTransform: 'uppercase', color: dahila.ink500, fontWeight: 400,
                }}>{etiqueta}</span>
                {/* Con un único talle ("Talle único") no hay nada que elegir:
                    "¿Qué talle soy?" sumaba una duda donde no la hay. Tampoco
                    cuando las variantes son modelos y no talles. */}
                {!talleUnico && !esModelo && <SizeGuide
                  note={sizeGuideNote}
                  productSizes={sizes.map((s) => s.size)}
                  encargoHref={encargoHref}
                  onPick={(sz) => {
                    const match = sizes.find((s) => s.size.trim().toUpperCase() === sz && s.available)
                    if (match) setTalle(match.size)
                  }}
                />}
              </div>
              {/* pdp-sizes: WhatsAppFloat lee de acá el talle elegido (el
                  botón con aria-pressed) y cómo se llama (data-rotulo). Solo
                  `elegido` va en negro: hasta que alguien elige, ninguno. */}
              <div ref={sizesRef} className="pdp-sizes" data-rotulo={etiqueta.toLowerCase()} style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {sizes.map((s) => {
                  const on = elegido === s.size
                  return (
                    <button key={s.id} type="button" onClick={() => setTalle(s.size)} disabled={!s.available} aria-pressed={on} style={{
                      minWidth: 44, height: 44, padding: '0 12px', borderRadius: 8,
                      fontFamily: dahila.fontSans, fontSize: 12, fontWeight: 400,
                      border: `1px solid ${on ? dahila.ink900 : dahila.borderStrong}`,
                      background: on ? dahila.ink900 : '#fff',
                      color: on ? '#fff' : dahila.ink900,
                      cursor: s.available ? 'pointer' : 'not-allowed',
                      // Por propiedad y no 'all': el estilo en línea le ganaba a
                      // la compresión de 90 ms del toque (globals.css, VIS-19).
                      transition: `background-color 140ms ${dahila.ease}, color 140ms ${dahila.ease}, border-color 140ms ${dahila.ease}, transform 90ms ${dahila.ease}`,
                      opacity: s.available ? 1 : 0.5,
                      textDecoration: s.available ? 'none' : 'line-through',
                    }}>{s.size}</button>
                  )
                })}

                <Link href={encargoHref} onClick={() => track('encargo_click', { source: 'pdp_talles', product: product.slug })} style={{
                  padding: '0 14px', height: 44, borderRadius: 8, textDecoration: 'none',
                  fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink900,
                  background: 'transparent', border: `1px dashed ${dahila.borderStrong}`, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}>
                  <Icon name="ruler" size={14}/> A medida
                </Link>
              </div>
              {necesitaElegir && avisoTalle && (
                <p role="alert" style={{
                  margin: '8px 0 0', fontFamily: dahila.fontSans, fontSize: 13, color: dahila.wine600,
                }}>
                  {esModelo ? 'Elegí un modelo para agregarla' : 'Elegí un talle para agregarla'}
                </p>
              )}
            </div>
          )}

          {/* Sin filas de talle = pieza de talle único (bolsos, bufandas,
              poncho). Antes se inventaban cinco botones XS–XL y el talle
              "elegido" llegaba al carrito y al WhatsApp como si fuera real. */}
          {!isSoldOut && !product.is_custom_only && sizes.length === 0 && (
            <p style={{ margin: 0, fontFamily: dahila.fontSans, fontSize: 13, color: dahila.ink700 }}>
              Talle único
            </p>
          )}

          {/* Cupos de encargo reales (CMS: encargos_cupos_*) — la agenda de
              producción es la urgencia honesta de un taller a pedido. No
              renderiza nada si Anush no la tiene activada. */}
          {!isSoldOut && <EncargosDisponibles state={encargosCupos} />}

          {product.is_custom_only && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {processEnabled && <ProcessStepper steps={processSteps} />}
              <Button variant="primary" full href={encargoHref} onClick={() => track('encargo_click', { source: 'pdp_custom_only', product: product.slug })}>Solicitar presupuesto</Button>
            </div>
          )}

          {canBuy && soloConsulta && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.currentTarget.href = waConTexto(textoPedido())
                  track('whatsapp_click', { source: 'pdp_solo_consulta', product: product.slug }, gaConsulta())
                }}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                  background: dahila.whatsapp, color: '#fff', textDecoration: 'none',
                  borderRadius: 12, padding: '16px 20px', minHeight: 52,
                  fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 500,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}
              >
                <Icon name="whatsapp-logo" weight="fill" size={18} /> Pedir por WhatsApp
              </a>
              <span style={{ fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink500, lineHeight: 1.5 }}>
                El carrito está en mantenimiento unos días. Tu pedido lo coordinamos por WhatsApp, igual que siempre, con el mismo precio y el mismo plazo.
              </span>
            </div>
          )}

          {/* Marca invisible justo arriba del botón principal: cuando sale de
              pantalla hacia arriba, entra la barra fija de abajo. */}
          <span ref={buyAnchorRef} aria-hidden style={{ display: 'block', height: 0 }} />
          {canBuy && !soloConsulta && (
            sizeAvailable ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Ocupado = aria-disabled y no disabled: un botón enfocado que
                    pasa a disabled pierde el foco (Chromium lo manda al body) y
                    al cerrar el cajón el foco no tenía adónde volver. */}
                <Button
                  variant="primary"
                  size="lg"
                  full
                  data-pdp-cta
                  onClick={necesitaElegir ? pedirTalle : () => handleAdd('ficha_boton')}
                  aria-busy={adding}
                  aria-disabled={adding || undefined}
                  style={adding ? { opacity: 0.7, cursor: 'progress' } : undefined}
                >
                  {necesitaElegir ? pedirLabel : adding ? 'Agregando…' : added ? '✓ Agregado' : 'Agregar al carrito'}
                </Button>
                {/* Prendas de $2.800 o más (21/10/2026): en 60 días juntaron 18
                    de los 28 toques a "a medida" y la mayor intención cada 100
                    vistas (3,4 contra 1,6–2,7 del resto). Quien mira una pieza
                    así quiere su color o su medida: el camino va a la vista,
                    como secundario para no competir con el carrito. */}
                {(product.base_price_uyu ?? 0) >= PREMIUM_FROM_UYU && (
                  <Button
                    variant="secondary"
                    full
                    href={encargoHref}
                    onClick={() => track('encargo_click', { source: 'pdp_premium', product: product.slug })}
                  >
                    En otro color o a tu medida
                  </Button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Button variant="secondary" size="lg" full disabled>
                  {esModelo ? 'Sin stock en ese modelo' : `Sin stock en el talle ${talle}`}
                </Button>
                <button onClick={() => { track('encargo_click', { source: 'pdp_sin_talle', product: product.slug }); router.push(encargoHref) }} style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  fontFamily: dahila.fontSans, fontSize: 13, color: dahila.wine600,
                  textDecoration: 'underline', padding: 0,
                }}>
                  {esModelo ? '¿Lo querés en este modelo? Pedilo a medida →' : '¿Lo querés en este talle? Pedilo a medida →'}
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
                  background: dahila.whatsapp, color: '#fff', textDecoration: 'none',
                  borderRadius: 10, padding: '15px 22px',
                  fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 500,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}
              >
                <Icon name="whatsapp-logo" size={18} /> Avisame cuando vuelva
              </a>
              <button onClick={() => { track('encargo_click', { source: 'pdp_agotado', product: product.slug }); router.push(encargoHref) }} style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontFamily: dahila.fontSans, fontSize: 13, color: dahila.wine600,
                textDecoration: 'underline', padding: 0, alignSelf: 'center',
              }}>
                O pedila a medida y la tejemos para vos →
              </button>
            </div>
          )}

          {/* Trust strip — pegado al CTA, donde muere la ansiedad de compra */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px 12px' }}>
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

          {/* Preguntar antes de comprar, con la prenda y el talle ya puestos en
              el mensaje. En 90 días hubo 11 toques a la burbuja flotante (que
              no dice nada) contra 35 "agregar al carrito": el chat es un camino
              que la clienta busca sola. Baymard: el chat que abre la clienta,
              como link estático, ayuda; el que se abre solo, molesta. Va como
              texto secundario para no competir con el botón principal. */}
          {canBuy && (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.currentTarget.href = waConTexto(textoConsulta())
                track('whatsapp_click', { source: 'pdp_pregunta', product: product.slug }, gaConsulta())
              }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7, alignSelf: 'flex-start',
                fontFamily: dahila.fontSans, fontSize: 13, color: dahila.ink700,
                textDecoration: 'underline', textUnderlineOffset: 3, padding: '6px 0',
              }}
            >
              <Icon name="whatsapp-logo" weight="fill" size={15} color={dahila.whatsapp} />
              {talleUnico
                ? '¿Querés ver más fotos o medidas? Preguntame por WhatsApp'
                : esModelo ? '¿Dudas con el modelo? Preguntame por WhatsApp' : '¿Dudas con el talle? Preguntame por WhatsApp'}
            </a>
          )}
          {/* Para quien regala (12/10/2026): la tarjeta de regalo no se
              encontraba desde ningún lado. Solo en piezas con talle, que es
              donde regalar es difícil. */}
          {giftEnabled && !talleUnico && !esModelo && (
            <Link
              href="/regalo"
              onClick={() => track('gift_link_click', { source: 'pdp', product: product.slug })}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7, alignSelf: 'flex-start',
                fontFamily: dahila.fontSans, fontSize: 13, color: dahila.ink700,
                textDecoration: 'underline', textUnderlineOffset: 3, padding: '6px 0', marginTop: -8,
              }}
            >
              <Icon name="gift" size={15} color={dahila.wine600} />
              ¿Es un regalo y no sabés su talle? Regalá una tarjeta
            </Link>
          )}

          {/* Una clienta real, pegada al botón: quien entra directo desde
              Instagram no pasa por los testimonios de la home. La etiqueta
              dice que es de la tienda (como "Reseñas de esta tienda" en Etsy):
              a veces la cita habla de otra prenda. */}
          {testimonial && (
            <figure style={{
              margin: 0, padding: '2px 0 2px 12px',
              borderLeft: `2px solid ${dahila.rose200}`,
            }}>
              <div style={{
                fontFamily: dahila.fontSans, fontSize: 11, letterSpacing: '0.22em',
                textTransform: 'uppercase', color: dahila.ink500, marginBottom: 4,
              }}>
                Lo que dicen de Dahila
              </div>
              <blockquote style={{
                margin: 0, fontFamily: dahila.fontSerif, fontStyle: 'italic', fontWeight: 300,
                fontSize: 15, lineHeight: 1.5, color: dahila.ink700,
              }}>
                “{testimonial.text.trim()}”
              </blockquote>
              <figcaption style={{
                marginTop: 4, fontFamily: dahila.fontSans, fontSize: 11,
                letterSpacing: '0.02em', color: dahila.ink500,
              }}>
                {testimonial.author.trim()}{testimonial.location?.trim() ? `, ${testimonial.location.trim()}` : ''}
                {totalTestimonios > 1 && (
                  <>
                    {' · '}
                    <Link href="/#testimonios" style={{ color: dahila.ink500, textDecoration: 'underline', textUnderlineOffset: 2 }}>
                      una de {totalTestimonios} clientas
                    </Link>
                  </>
                )}
              </figcaption>
            </figure>
          )}

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
                fontFamily: dahila.fontSans, fontSize: 11, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: dahila.ink500,
              }}>
                Completá el look · viaja en el mismo envío
              </span>
              {lookComplements.map((p) => {
                const cPhoto = getPrimaryPhoto(p)
                const cFinal = getListingPrice(p, discounts)
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
                      <ImagenConRespaldo slug={p.slug} src={cPhoto} alt={getPrimaryPhotoAlt(p)} fill sizes="46px" placeholder="blur" blurDataURL={BLUR_DATA_URL} style={{ objectFit: 'cover' }} />
                    </Link>
                    <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Link
                        href={`/tienda/${p.slug}`}
                        onClick={() => track('look_click', { from: product.slug, to: p.slug })}
                        // padding: nombre y "+ Agregar" quedaban de ~17 px de alto,
                        // uno pegado al otro (Lighthouse target-size, WCAG 2.5.8
                        // pide 24 px). Con el padding entran en los 56 px de la
                        // miniatura y la fila no crece.
                        style={{
                          fontFamily: dahila.fontDisplay, fontSize: 14, color: dahila.ink900, lineHeight: 1.25,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'none',
                          padding: '4px 0',
                        }}
                      >{p.name}</Link>
                      {oneTap ? (
                        <button
                          onClick={() => handleLookAdd(p)}
                          disabled={justAdded}
                          aria-label={`Agregar ${p.name} al carrito por ${formatPrice(cFinal)}`}
                          style={{
                            background: 'transparent', border: 'none', padding: '5px 0',
                            cursor: justAdded ? 'default' : 'pointer', alignSelf: 'flex-start',
                            fontFamily: dahila.fontSans, fontSize: 12,
                            color: justAdded ? '#1E8449' : dahila.wine600,
                            textDecoration: justAdded ? 'none' : 'underline', textUnderlineOffset: 3,
                          }}
                        >
                          {justAdded ? '✓ Sumado al carrito' : `+ Agregar · ${formatListingPrice(p, discounts)}`}
                        </button>
                      ) : (
                        <Link
                          href={`/tienda/${p.slug}`}
                          onClick={() => track('look_click', { from: product.slug, to: p.slug })}
                          style={{
                            fontFamily: dahila.fontSans, fontSize: 12, color: dahila.wine600,
                            textDecoration: 'underline', textUnderlineOffset: 3, alignSelf: 'flex-start', padding: '5px 0',
                          }}
                        >
                          {`${variantLabel(p.sizes) === 'Modelo' ? 'Elegir modelo' : 'Elegir talle'} · ${formatListingPrice(p, discounts)}`}
                        </Link>
                      )}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <FavoriteButton
              productId={product.id}
              variant="inline"
              product={{ slug: product.slug, name: product.name, price: getListingPrice(product, discounts), category: product.category?.slug, variantes }}
            />
            <ShareButton title={`${product.name} — Dahila Crochet`} text={`Mirá esta prenda de Dahila: ${product.name}`} itemId={product.slug} />
            {/* La misma promesa que el title de la ficha (SEO-03): "a tu
                medida" iba en todas, también en las piezas ya tejidas. */}
            <PinterestButton
              imageUrl={getPrimaryPhoto(product)}
              description={`${product.name} — ${promesaFicha(product).titulo} | Dahila Crochet`}
            />
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
                  <ImagenConRespaldo respaldo="/fotos-respaldo/sobre-anush.jpg" src={makerPhoto} alt={makerName} fill sizes="40px" placeholder="blur" blurDataURL={BLUR_DATA_URL} style={{ objectFit: 'cover' }} />
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
                <Icon name="leaf" size={16} color={dahila.ink500}/> {product.material}
              </li>
            )}
            {/* Las horas explican el precio de algo hecho a mano mejor que
                cualquier adjetivo. Solo aparecen si Anush las cargó y marcó
                "Mostrar en la ficha" en el admin (columna knit_hours). */}
            {knitHours != null && (
              <li style={liStyle}>
                <Icon name="clock" size={16} color={dahila.ink500}/>
                <span>
                  Lleva unas {knitHours.toLocaleString('es-UY')} horas de tejido a mano, punto por punto.{' '}
                  <Link href="/blog/cuanto-demora-una-prenda-tejida-a-mano" style={{ color: dahila.ink500, textDecoration: 'underline', textUnderlineOffset: 2 }}>
                    ¿Por qué tanto?
                  </Link>
                </span>
              </li>
            )}
            <li style={liStyle}>
              <Icon name="flower" size={16} color={dahila.ink500}/> Tejido a mano en Montevideo
            </li>
            <li style={liStyle}>
              <Icon name="package" size={16} color={dahila.ink500}/>
              {shippingEstimate && shippingEstimate.trim() ? shippingEstimate : 'Envío a todo Uruguay'}
            </li>
            {/* El plazo (o la cola, o "en stock") ya se dice arriba, junto al
                precio. "A tu medida" no aplica a una pieza ya tejida ni a una
                de talle único (un bolso no se ajusta al cuerpo), ni cuando las
                variantes son modelos. */}
            {!readyNow && sizes.length > 0 && !esModelo && (
              <li style={liStyle}>
                <Icon name="check" size={16} color={dahila.ink500}/>
                Hecho a tu medida: te acompaño en todo el proceso para que quede perfecta.
              </li>
            )}
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

      {/* Barra fija del celular (04/11/2026: VIS-01, VIS-08 y CRO-14). Opaca,
          con "sin pagar ahora" (la duda de quien llega de Instagram es si
          "Agregar" ya cobra) y WhatsApp adentro: en la ficha queda un solo
          elemento fijo tocable, y la burbuja y "volver arriba" se esconden
          (globals.css). El botón tiene el ancho justo para que precio y
          tachado entren siempre (~140 px) a la izquierda. */}
      {canBuy && (
        <div
          className={`pdp-sticky-bar${showSticky ? ' is-visible' : ''}`}
          // Escondida = fuera del orden de tabulación y del lector de pantalla.
          inert={!showSticky}
        >
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2, minWidth: 0, flex: '1 1 0', overflow: 'hidden' }}>
            <span style={{
              fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 14, color: dahila.ink900,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{product.name}</span>
            <PriceBlock list={listPrice} final={finalPrice} size="sm" align="start" from={precioDesde} />
            {/* Qué talle va a agregar este botón (solo si alguien lo eligió:
                con la barra fija el selector quedó muy arriba) y que agregar
                no cobra nada. Un modelo va sin la palabra ("Lisas · …"): con
                ella, "sin pagar ahora" no entraba. */}
            <span style={{
              fontFamily: dahila.fontSans, fontSize: 11, color: dahila.ink700, marginTop: 1,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{elegido && !talleUnico ? `${esModelo ? '' : 'Talle '}${elegido} · ` : ''}sin pagar ahora</span>
          </div>
          {/* Con la base caída la barra fija también toma el pedido por
              WhatsApp: si no, decía "Agregar" y fallaba al tocarla. */}
          {soloConsulta ? (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.currentTarget.href = waConTexto(textoPedido())
                track('whatsapp_click', { source: 'pdp_barra_solo_consulta', product: product.slug }, gaConsulta())
              }}
              style={{
                flex: 1,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: dahila.whatsapp, color: '#fff', textDecoration: 'none',
                borderRadius: 10, padding: '14px 18px',
                fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 500,
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}
            >
              <Icon name="whatsapp-logo" weight="fill" size={16} /> Pedir
            </a>
          ) : (
            <>
              {/* La consulta, con el mismo texto que "¿Dudas…?". Antes era la
                  burbuja suelta, que en la ficha se apilaba con la barra y
                  "volver arriba". Se mide aparte (pdp_barra) para compararla
                  con la burbuja (float_ficha). */}
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Preguntar por WhatsApp"
                onClick={(e) => {
                  e.currentTarget.href = waConTexto(textoConsulta())
                  track('whatsapp_click', { source: 'pdp_barra', product: product.slug }, gaConsulta())
                }}
                style={{
                  flex: '0 0 auto', width: 44, height: 44, boxSizing: 'border-box',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: '#fff', borderRadius: 10, border: `1px solid ${dahila.borderStrong}`,
                }}
              >
                <Icon name="whatsapp-logo" weight="fill" size={22} color={dahila.whatsapp} />
              </a>
              {necesitaElegir ? (
                // Nadie eligió talle todavía: la barra lleva al selector en vez
                // de agregar el primero de la lista sin que ella lo haya visto.
                <button type="button" className="pdp-sticky-cta" onClick={pedirTalle} style={stickyCta}>
                  {pedirLabel}
                </button>
              ) : (
                <button
                  type="button"
                  className="pdp-sticky-cta"
                  onClick={() => handleAdd('barra_fija')}
                  disabled={!sizeAvailable}
                  aria-busy={adding}
                  aria-disabled={adding || undefined}
                  style={{
                    ...stickyCta,
                    background: sizeAvailable ? dahila.ink900 : dahila.ink300,
                    cursor: !sizeAvailable ? 'not-allowed' : adding ? 'progress' : 'pointer',
                    opacity: adding ? 0.7 : 1,
                  }}
                >
                  {!sizeAvailable ? 'Sin stock' : adding ? 'Agregando…' : added ? '✓ Agregado' : 'Agregar'}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Clientas con esta prenda puesta (solo si hay fotos cargadas). */}
      <ClientasGallery items={clientPhotos} title="Así les quedó" compact />

      {/* Related products — cross-sell con título contextual */}
      {related.length > 0 && (() => {
        const sameCollection = related.some((p) => p.collection_id && p.collection_id === product.collection_id)
        const sectionTitle = sameCollection && product.collection?.name
          ? `De la colección ${product.collection.name}`
          : 'También tejemos'
        return (
        <section style={{ marginTop: 88 }}>
          {/* Título en oración (VIS-10): en mayúsculas espaciadas "De la
              colección Sunset ’26" ocupaba 3 renglones en el celular. Si no
              entra al lado del título, el link baja abajo. */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: '6px 16px',
            margin: '0 0 28px', paddingBottom: 12, borderBottom: `1px solid ${dahila.border}`,
          }}>
            <h2 style={{
              fontFamily: dahila.fontDisplay, fontWeight: 300,
              fontSize: 22, letterSpacing: '-0.01em', lineHeight: 1.2,
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
            display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 22, rowGap: 44,
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

// Botón de la barra fija. El ancho deja siempre ~140 px a la izquierda para
// precio y tachado: 100% es el ancho útil de la barra y 200 = 140 + el
// WhatsApp de 44 + dos espacios de 8. Si el texto no entra en un renglón
// ("Elegí tu talle" a 360 px) baja a dos, dentro de los 48 px de alto.
const stickyCta: React.CSSProperties = {
  flex: '0 0 auto', width: 'clamp(96px, calc(100% - 200px), 180px)', minHeight: 48,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
  background: dahila.ink900, color: '#fff', border: 'none', borderRadius: 10,
  padding: '6px 10px', cursor: 'pointer', lineHeight: 1.15, textWrap: 'balance',
  fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 500,
  letterSpacing: '0.06em', textTransform: 'uppercase',
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
        {/* La guía completa, para quien abrió este panel porque justamente
            tiene la duda. Es post-compra útil (menos prendas arruinadas) y
            enlace interno hacia el blog desde la página más visitada. */}
        <div style={{ marginTop: 10 }}>
          <Link href="/blog/como-cuidar-prendas-de-crochet" style={{
            fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 400,
            color: dahila.ink900, textDecoration: 'underline',
            textDecorationColor: dahila.wine600, textUnderlineOffset: 3,
          }}>
            Cómo cuidar una prenda de crochet →
          </Link>
        </div>
      </div>
    </div>
  )
}
