import { jsonLdScript } from '@/lib/json-ld'
import { createClient } from '@/lib/supabase/public'
import { notFound, permanentRedirect, unstable_rethrow } from 'next/navigation'
import type { Metadata } from 'next'
import { dropVisibility, type Product, type Category, type Discount } from '@/lib/types'
import {
  getPrimaryPhoto, getFinalPrice, getEffectivePrice, resolveDiscountPercent, getListingPrice, getListingSize, isReadyToShip,
  hasPriceRange as productHasPriceRange, sortSizes, isUnicoLabel, variantLabel,
} from '@/lib/types'
import { getCatalog, getProductBySlug, getSnapshotData, getTestimonials } from '@/lib/catalog'
import { promesaFicha } from '@/lib/seo-copy'
import { tieneVariantes, variantUrl } from '@/lib/catalog-ids'
import { ProductDetailsClient } from './ProductDetailsClient'
import { CatalogReadOnlyBanner } from '@/components/CatalogReadOnlyBanner'
import { MaintenanceScreen } from '@/components/MaintenanceScreen'
import { getEncargosCuposState } from '@/components/EncargosDisponibles'
import { TiendaClient } from '../TiendaClient'
import { SITE_URL } from '@/lib/env'
import { OG_BASE } from '@/lib/og'
import { botImageUrl } from '@/lib/media'
import { COMPLEMENT_PREFS } from '@/lib/complements'
import { slugRedirectTarget } from '@/lib/slug'
import { getCategoryGuides } from '@/content/blog'
import type { Testimonial } from '@/components/TestimonialsStrip'
import { resolveReels } from '@/lib/reels'
import { lineaEnvio } from '@/lib/envio'

export const revalidate = 3600

// Sin esto, Next trata `params` como una Request-time API (como cookies() o
// searchParams) y renderiza la ruta entera en modo dinámico — cada visita
// vuelve a pegarle a Supabase en vez de servir HTML cacheado. Con la lista
// de slugs acá, el build pre-renderiza cada ficha y categoría como HTML
// estático servido por el CDN de Netlify, y se revalida solo cada hora
// (`revalidate` arriba). Un producto nuevo que no estaba en el build igual
// funciona: `dynamicParams` es `true` por default, así que la primera visita
// lo renderiza on-demand y lo cachea para las siguientes — no hace falta
// redeployar para que un producto nuevo tenga página.
export async function generateStaticParams() {
  const supabase = createClient()
  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from('categories').select('slug'),
    supabase.from('products').select('slug').in('status', ['active', 'soldout']),
  ])
  return [
    ...(categories ?? []).map((c) => ({ slug: c.slug })),
    ...(products ?? []).map((p) => ({ slug: p.slug })),
  ]
}

/**
 * This single dynamic segment handles two URL shapes:
 *   /tienda/cardigans        → category page (CollectionPage schema, full filter UI)
 *   /tienda/cardigan-merino  → product detail page (Product schema, PDP)
 *
 * Resolution order: check categories first (fast, few rows), then products.
 * If neither matches → 404.
 */
type ResolvedSlug = { type: 'category'; category: Category } | { type: 'product' } | 'down' | null

async function resolveSlug(slug: string): Promise<ResolvedSlug> {
  const supabase = await createClient()
  try {
    const [catRes, prodRes] = await Promise.all([
      supabase.from('categories').select('*').eq('slug', slug).maybeSingle(),
      supabase.from('products').select('slug, status, collection_id, collection:collections(*)').eq('slug', slug).maybeSingle(),
    ])
    // Un 402 de cuota puede volver como {error} o como excepción — cubrimos las
    // dos: cualquier señal de fallo cae al snapshot.
    if (catRes.error || prodRes.error) throw new Error('db-down')
    if (catRes.data) return { type: 'category', category: catRes.data as Category }
    // Drop sin lanzar (colección en borrador / próximamente) → 404.
    if (prodRes.data && dropVisibility(prodRes.data as unknown as Product) !== 'hidden') return { type: 'product' }
    return null
  } catch (e) {
    // Dejar pasar los errores de control de Next (bailout dinámico, notFound…);
    // solo el fallo de DB cae al snapshot.
    unstable_rethrow(e)
    // DB caída: resolver contra el snapshot para que la tienda siga navegable
    // (si no, cada URL daría 404), o mostrar mantenimiento si no hay snapshot.
    const snap = getSnapshotData()
    const cat = snap.categories.find((c) => c.slug === slug)
    if (cat) return { type: 'category', category: cat }
    if (snap.products.some((p) => p.slug === slug)) return { type: 'product' }
    if (snap.products.length === 0) return 'down'
    // La base falló y el snapshot no conoce este slug: eso NO es "no existe"
    // (puede ser un producto posterior al snapshot). Antes devolvía null → 404,
    // el 404 quedaba guardado en la caché y Google lo veía: sweater-cherry,
    // creado el 03/09 y ausente del snapshot del 22/08, dio 404 al rastreo
    // del 14/09/2026. Lanzar es un error transitorio: ISR sigue sirviendo la
    // versión anterior y Google reintenta sin desindexar (mismo criterio que
    // ProductPage).
    throw new Error(`Supabase caído y sin snapshot para /tienda/${slug}`)
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  // Try category first (con fallback al snapshot si la DB está caída — el 402
  // de cuota puede volver como {error} o como excepción, así que try/catch).
  let cat: { name: string; description: string | null } | null = null
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('name, description')
      .eq('slug', slug)
      .maybeSingle()
    if (error) throw error
    cat = data as { name: string; description: string | null } | null
  } catch (e) {
    unstable_rethrow(e)
    const snapCat = getSnapshotData().categories.find((c) => c.slug === slug)
    cat = snapCat ? { name: snapCat.name, description: snapCat.description } : null
  }

  if (cat) {
    // CTR: keyword exacto ("cardigans de crochet") + beneficio concreto en la
    // descripción — no una definición de la página. Backlinko (4M resultados):
    // el keyword exacto en el title rinde +24% de clicks que una variante.
    // "en Uruguay" no es relleno: es el modificador que decide dónde podemos
    // rankear. En Search Console, los términos genéricos caen en posición
    // 50-70 ("cardigan" 69, "cardigans de mujer" 58, "chaleco" 53) — ahí
    // competimos contra fast fashion global y no hay nada que hacer. Los
    // mismos términos con intención local o artesanal están en el top 10
    // ("cardigan tejido a mano" 7, "crochet uruguay" 16, "tienda crochet" 6).
    // El title apunta a la pelea que se puede ganar.
    // 13/09/2026: con la fórmula general, Accesorios tuvo 70 impresiones y 0
    // clics, y a Tops la buscan como "top de hilo" y "tops tejidos". Estas
    // categorías nombran lo que de verdad tienen adentro (según su propia
    // descripción: bolsos, bufandas y bandanas; tops de algodón y de hilo
    // acrílico; sets de playa, de salida y de abrigo). El resto, la fórmula.
    const CATEGORY_TITLES: Record<string, string> = {
      tops: 'Tops de crochet y de hilo tejidos a mano en Uruguay',
      accesorios: 'Bolsos, bufandas y bandanas tejidos a crochet en Uruguay',
      sets: 'Sets de crochet tejidos a mano: playa, salida y abrigo',
      // 08/10/2026: con la palabra uruguaya (lib/vocabulario.ts). "cardigan"
      // y "sweater" a secas rankean 20-48 contra fast fashion global; "saco
      // tejido" y "buzo tejido a mano" casi no tienen tiendas uruguayas.
      cardigans: 'Cardigans y sacos tejidos a crochet en Uruguay',
      sweaters: 'Sweaters y buzos tejidos a mano en Uruguay',
    }
    const title = CATEGORY_TITLES[slug] ?? `${cat.name} de crochet tejidos a mano en Uruguay`
    // Precio de entrada al principio, como ya hacen las fichas: en Google, un
    // número concreto le dice a quien busca si está en su rango antes de
    // entrar. Es el precio de listado más bajo de la categoría (el de las
    // tarjetas, sin reglas de lote). Si el catálogo no responde, va sin precio.
    let fromBit = ''
    try {
      const { products } = await getCatalog()
      const prices = products
        .filter((p) => p.status === 'active' && !p.is_custom_only && p.category?.slug === slug)
        .map((p) => getListingPrice(p))
        .filter((n) => n > 0)
      if (prices.length) fromBit = `Desde UYU ${Math.min(...prices).toLocaleString('es-UY')}. `
    } catch (e) {
      unstable_rethrow(e)
    }
    const desc = fromBit + (
      cat.description ||
      `${cat.name} hechos a mano en Montevideo, en tu talle y tus colores. Precios claros, envío a todo Uruguay — y si querés algo distinto, se teje a medida para vos.`
    )
    return {
      title,
      description: desc,
      alternates: { canonical: `/tienda/${slug}` },
      // og:title sin "| Dahila Crochet": la marca ya viaja en og:site_name
      // (OG_BASE) y duplicarla desperdicia los ~65 caracteres del preview.
      openGraph: {
        ...OG_BASE,
        title,
        description: desc,
        url: `${SITE_URL}/tienda/${slug}`,
        images: [{ url: `${SITE_URL}/tienda/${slug}/og`, width: 1200, height: 630, alt: title, type: 'image/jpeg' }],
      },
      // Twitter explícito: sin esto, la página HEREDA el twitter:title genérico
      // del layout y la twitter-image de la SECCIÓN /tienda (la convención de
      // archivo cascadea a los segmentos hijos) — en X/Discord/Slack la
      // categoría compartida mostraba la tarjeta genérica de la tienda.
      twitter: {
        card: 'summary_large_image',
        title,
        description: desc,
        images: [`${SITE_URL}/tienda/${slug}/og`],
      },
    }
  }

  // Try product (con fallback al snapshot si la DB está caída).
  let product: Product | null = null
  // El snapshot solo guarda prendas públicas (scripts/snapshot-catalog.mjs) y
  // no trae el join de la colección: la visibilidad por drop se mira en vivo.
  let visibility: ReturnType<typeof dropVisibility> = 'public'
  try {
    const { data, error } = await supabase
      .from('products')
      // category: para el title con la palabra uruguaya (ver más abajo).
      .select('*, category:categories(slug, name), collection:collections(*), media:product_media(*), sizes:product_sizes(*)')
      .eq('slug', slug)
      .maybeSingle()
    if (error) throw error
    product = data as Product | null
    if (product) visibility = dropVisibility(product)
  } catch (e) {
    unstable_rethrow(e)
    product = getSnapshotData().products.find((p) => p.slug === slug) ?? null
    // Sin base y sin snapshot para este slug: no emitir "no encontrado" con
    // noindex para una ficha que puede existir (ver resolveSlug).
    if (!product) throw e
  }
  if (!product || visibility === 'hidden') {
    return { title: 'Producto no encontrado', robots: { index: false, follow: false } }
  }

  // CTR de la ficha: el title lleva el diferencial ("tejido a mano, a tu
  // medida") y la descripción VENDE — precio incluido cuando existe (los
  // estudios de e-commerce coinciden: precio/beneficio en el snippet trae
  // clicks calificados; la genérica "Comprar X" no le da razones a nadie).
  // Sin reglas de lote: el precio exacto ya viaja en el schema. Es el mismo
  // precio "desde" que la tarjeta (antes: el precio base, que en algunos
  // productos no es el de ningún talle disponible — auditoría 12/09/2026).
  //
  // 21/10/2026: el precio va primero y el texto propio se corta en la primera
  // oración, no a los 87 caracteres. En el celular (86% de las impresiones)
  // Google muestra ~120 caracteres: antes se leía "en el pelo, al cuello o…" y
  // el precio y el envío quedaban fuera (bandana: 254 impresiones, 0 clics).
  // 04/11/2026 (SEO-03): title y línea de valor salen de promesaFicha. Una
  // pieza en stock ya no promete "a tu medida" ni "en tus colores", y una de
  // talle único no promete "en tu talle"; "En stock" va solo acá en la
  // descripción, que se renueva con el ISR.
  const finalPrice = getListingPrice(product)
  const priceBit = finalPrice > 0
    ? `${productHasPriceRange(product) ? 'Desde ' : ''}UYU ${finalPrice.toLocaleString('es-UY')}. `
    : ''
  const promesa = promesaFicha(product)
  const valueLine = promesa.linea
  const ownDesc = (product.description ?? '').replace(/\s+/g, ' ').trim()
  const firstSentence = ownDesc.split(/(?<=[.!?])\s/)[0] ?? ''
  const ownDescCut = firstSentence.length <= 115
    ? firstSentence
    : `${firstSentence.slice(0, 112).replace(/[\s,;:]+\S*$/, '')}…`
  const description = ownDesc
    ? `${priceBit}${ownDescCut}${/[.!?…]$/.test(ownDescCut) ? '' : '.'} ${valueLine}`
    : `${priceBit}${product.name}. ${valueLine}`

  // "Spring cardigan — saco tejido a mano, a tu medida": la palabra con la
  // que se busca en Uruguay, solo si el nombre no la trae (lib/vocabulario.ts).
  // En stock o sin talles reales: "— tejido a mano en Uruguay".
  const pageTitle = `${product.name} — ${promesa.titulo}`

  return {
    title: pageTitle,
    description,
    alternates: { canonical: `/tienda/${product.slug}` },
    // Drop en acceso anticipado ("Solo con link"): la ficha abre para la lista
    // VIP pero Google no la indexa hasta que la colección se publique.
    ...(visibility === 'link' ? { robots: { index: false, follow: false } } : {}),
    // La imagen para compartir es la tarjeta JPEG de ./og (ver og/route.tsx:
    // la convención opengraph-image.tsx generaba un PNG de ~915 KB que
    // WhatsApp descartaba). X/Twitter cae solo al og:image cuando no hay
    // twitter:image propio.
    openGraph: {
      ...OG_BASE,
      title: pageTitle,
      description,
      url: `${SITE_URL}/tienda/${product.slug}`,
      images: [{
        url: `${SITE_URL}/tienda/${product.slug}/og`,
        width: 1200,
        height: 630,
        alt: `${product.name} — Dahila Crochet`,
        type: 'image/jpeg',
      }],
    },
    // Twitter explícito — mismo motivo que en la rama de categoría: sin esto,
    // X/Discord/Slack mostraban el título del layout y la twitter-image de
    // /tienda en vez de la foto y el precio de ESTE producto.
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
      images: [`${SITE_URL}/tienda/${product.slug}/og`],
    },
  }
}

// ─── Category view ───────────────────────────────────────────────────────────

async function CategoryPage({ slug, category }: { slug: string; category: Category }) {
  // Catálogo cacheado con fallback al snapshot si la DB está caída (ver src/lib/catalog.ts).
  const { products, categories, colors, discounts, source } = await getCatalog()

  const categoryProducts = products.filter((p) => p.category?.slug === slug)

  const collectionPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: category.description || `${category.name} de Dahila Crochet`,
    url: `${SITE_URL}/tienda/${slug}`,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Tienda', item: `${SITE_URL}/tienda` },
        { '@type': 'ListItem', position: 3, name: category.name, item: `${SITE_URL}/tienda/${slug}` },
      ],
    },
    // Solo la lista de fichas, sin Product ni Offer (SEO-10, 04/11/2026). La
    // guía de fichas de comerciante de Google recomienda marcar el producto en
    // su ficha y no en las páginas que listan productos: acá eran 15 Product
    // con precio en /tienda/tops, duplicados de las fichas y otra fuente de
    // precios que también tenía que coincidir. De paso, son hasta 24 fotos
    // menos que Googlebot pide por /_next/image en cada rastreo.
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: categoryProducts.slice(0, 24).map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_URL}/tienda/${p.slug}`,
        name: p.name,
      })),
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(collectionPageJsonLd) }}
      />
      {source === 'snapshot' && <CatalogReadOnlyBanner />}
      <TiendaClient
        conFotoPrimero={source === 'snapshot'}
        key={`cat:${slug}`}
        initialProducts={products}
        categories={categories}
        colors={colors}
        discounts={discounts}
        initialFilter={slug}
        guides={getCategoryGuides(slug).map(({ slug: s, title, excerpt }) => ({ slug: s, title, excerpt }))}
      />
    </>
  )
}

// ─── Product detail view ──────────────────────────────────────────────────────

async function ProductPage({ slug }: { slug: string }) {
  // Producto cacheado con fallback al snapshot si la DB está caída (ver src/lib/catalog.ts).
  const { product, source } = await getProductBySlug(slug)

  // Distinguir "no existe" de "la base falló": si la consulta EN VIVO dice que
  // no está → 404 real. Si la base falló y el snapshot tampoco lo tiene → lanzar
  // (5xx transitorio): así ISR/Google reintentan y no desindexan la ficha.
  if (!product) {
    if (source === 'snapshot') {
      throw new Error(`Supabase caído y sin snapshot para /tienda/${slug}`)
    }
    notFound()
  }

  // Descuentos, settings y relacionados salen del MISMO payload cacheado que
  // usa el resto del sitio (lib/catalog.ts), que además ya trae su propio
  // fallback al snapshot si la DB está caída. Antes esta ficha hacía 3
  // consultas extra por render (descuentos + settings + hasta 24 productos
  // relacionados con sus joins) que devolvían datos que el catálogo ya tenía
  // en memoria: con ~36 fichas, eso era descargar el catálogo varias veces por
  // ciclo de revalidación. De paso desaparece la rama duplicada
  // snapshot/en-vivo: ahora hay un solo camino.
  const catalog = await getCatalog()
  // La ficha puede venir en vivo (su propio caché) con el catálogo en respaldo:
  // entonces descuentos y settings son los del snapshot, y la ficha va en modo
  // consulta con el banner, como el resto del sitio (QA-08, 04/11/2026).
  const isSnapshot = source === 'snapshot' || catalog.source === 'snapshot'
  const discounts: Discount[] = catalog.discounts
  const settings: Record<string, string> = catalog.settings
  // Las activas y públicas (el catálogo ya deja afuera los drops sin lanzar y
  // los "Solo con link"), menos esta.
  const relatedAll: Product[] = catalog.products.filter((p) => p.status === 'active' && p.id !== product.id)

  const getSetting = (k: string): string | undefined => settings[k]
  const sizeGuideNote = getSetting('size_guide_note')
  const whatsappUrl = getSetting('contact_whatsapp_url') || 'https://wa.me/59899850073'
  const shippingEstimate = lineaEnvio(settings) ?? getSetting('shipping_estimate')
  // Aviso de lista de espera (misma semántica que el layout: ON salvo 'false').
  const queueNote = getSetting('queue_note_enabled') !== 'false' ? (getSetting('queue_note_text') ?? '').trim() : ''
  const trustItems = [
    { icon: 'truck',         text: getSetting('pdp_trust_1')?.trim() || 'Envío a todo Uruguay' },
    { icon: 'hand-heart',    text: getSetting('pdp_trust_2')?.trim() || 'Hecho a mano' },
    { icon: 'whatsapp-logo', text: getSetting('pdp_trust_3')?.trim() || 'Coordinás por WhatsApp' },
    // "¿Cuándo y cómo pago?" estaba contestado tres pantallas más abajo, en la
    // lista de detalles. Es la duda que frena el botón, así que vive al lado
    // del botón (05/10/2026). Dice lo mismo que el carrito: no se cobra nada
    // hasta que está todo confirmado por WhatsApp.
    { icon: 'sparkle', text: getSetting('pdp_trust_4')?.trim() || 'Pagás recién al confirmar' },
  ].filter((t) => t.text.length > 0)
  const encargosCupos = getEncargosCuposState({
    encargos_cupos_enabled: getSetting('encargos_cupos_enabled') || '',
    encargos_cupos_total: getSetting('encargos_cupos_total') || '',
    encargos_cupos_taken: getSetting('encargos_cupos_taken') || '',
    encargos_cupos_label: getSetting('encargos_cupos_label') || '',
  })

  // "Completá el look": otro top al lado de un top compite por la misma venta;
  // un bolso o un accesorio al lado de un top la agranda. Por eso la fila mezcla
  // 2 piezas que COMPLEMENTAN (otra categoría, priorizando los pares que se usan
  // juntos) + 2 similares para quien busca alternativas.
  //
  // 04/11/2026 (SEO-04 y SEO-05): la selección ya no depende del orden de la
  // tienda. Antes salía de los primeros 24 de sort_order: reordenar la tienda
  // cambiaba los enlaces de casi todas las fichas sin que su lastmod lo
  // dijera, todas mostraban las mismas 4 piezas y 24 de 41 fichas no recibían
  // ni un enlace desde otra. Ahora cada lista va por slug y arranca justo
  // después de esta ficha: depende solo del catálogo (estable entre
  // regeneraciones del ISR) y cada prenda es "la siguiente" de otra de su
  // categoría, así que toda ficha recibe al menos un enlace.
  const porSlug = (a: Product, b: Product) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0)
  const desdeEsta = (lista: Product[]) => {
    const orden = [...lista].sort(porSlug)
    const k = orden.findIndex((p) => p.slug > product.slug)
    return k <= 0 ? orden : [...orden.slice(k), ...orden.slice(0, k)]
  }
  const prefs = COMPLEMENT_PREFS[product.category?.slug ?? ''] ?? []
  const prefRank = (p: Product) => {
    const i = prefs.indexOf(p.category?.slug ?? '')
    return i === -1 ? prefs.length : i
  }
  // Otra categoría (o sin categoría, como la Box de regalo): por preferencia y,
  // dentro de cada una, en el orden de arriba (el sort es estable).
  const complements = desdeEsta(relatedAll.filter((p) => p.category_id !== product.category_id))
    .sort((a, b) => prefRank(a) - prefRank(b))
  const similar = desdeEsta(relatedAll.filter((p) => p.category_id && p.category_id === product.category_id))
  // La colección con lugar fijo (NEG-1): la de esta prenda o, si no es de
  // ninguna, la del drop de Configuración (prendido y publicado). El plan de
  // SEO-05 pedía ese lugar en todas las fichas, y la rama lo daba solo en las
  // del drop: en el resto, sus piezas en stock (las que se venden ya) habían
  // desaparecido de las relacionadas.
  const dropSlug = settings.drop_enabled !== 'false' ? (settings.drop_collection_slug ?? '').trim() : ''
  const coleccionActiva = product.collection_id
    ?? (dropSlug ? catalog.collections.find((c) => c.slug === dropSlug && c.published)?.id : undefined)
  // "Completá el look · viaja en el mismo envío" tiene que ser cierto: con la
  // prenda en stock, la tira sugiere solo piezas en stock (la regla del cajón,
  // CRO-11). Una pieza de invierno a pedido al lado del poncho en stock haría
  // esperar 1–2 semanas un pedido que sale ya. Si no hay, va una sola o ninguna.
  const paraLaTira = isReadyToShip(product) ? complements.filter(isReadyToShip) : complements
  // Un lugar fijo para la colección: la tira arranca con una de sus piezas en
  // stock de otra categoría. Si no hay, el mejor complemento.
  const delDrop = coleccionActiva
    ? paraLaTira.find((p) => p.collection_id === coleccionActiva && isReadyToShip(p))
    : undefined
  const lookComplements = [...(delDrop ? [delDrop] : []), ...paraLaTira.filter((p) => p !== delDrop)].slice(0, 2)
  // En una ficha del drop, el grid arranca con sus hermanas de colección que
  // la tira no mostró: vuelven "De la colección …" y su link. Los 2 similares
  // siguen yendo por slug (son los que le aseguran a cada ficha un enlace desde
  // otra, SEO-04) y los complementos completan hasta 4 sin repetir la tira.
  const hermanas = product.collection_id
    ? desdeEsta(relatedAll.filter((p) => p.collection_id === product.collection_id && !lookComplements.includes(p))).slice(0, 2)
    : []
  const related = [
    ...hermanas,
    ...similar.filter((p) => !hermanas.includes(p)).slice(0, 2),
    ...complements.filter((p) => !lookComplements.includes(p) && !hermanas.includes(p)).slice(0, Math.max(0, 2 - hermanas.length)),
  ]
  const yaVista = (p: Product) => related.includes(p) || lookComplements.includes(p)
  const enRonda = desdeEsta(relatedAll)
  for (const p of enRonda) {
    if (related.length >= 4) break
    if (!yaVista(p)) related.push(p)
  }
  // Una prenda sola en su categoría (hoy, la Box de regalo, que no tiene) no
  // es "la siguiente similar" de nadie: la ficha anterior por slug le deja el
  // último lugar del grid.
  const siguiente = enRonda[0]
  const solaEnSuCategoria = (p: Product) =>
    !p.category_id || !relatedAll.some((q) => q.id !== p.id && q.category_id === p.category_id)
  if (siguiente && solaEnSuCategoria(siguiente) && !yaVista(siguiente)) related[Math.min(related.length, 3)] = siguiente

  // Prueba social en la ficha (19/09/2026): quien llega desde un link de
  // Instagram entra directo acá y nunca ve los testimonios de la home. Va uno
  // real, cerca del botón. Si la base falla (o ya se está sirviendo el
  // snapshot), la ficha sale igual, sin testimonio.
  const testimonios = isSnapshot ? [] : await getTestimonials()
  const testimonial = pickTestimonial(testimonios, product)

  const photo = getPrimaryPhoto(product)
  // Full image set → richer Product structured data (Google can show several).
  // Vía /_next/image (botImageUrl): Googlebot-Image descarga ~100 KB desde
  // dahila.uy en vez del original de varios MB desde supabase.co — el JSON-LD
  // era una de las 3 canillas del egress de Supabase (ver lib/media.ts).
  const galleryImages = (product.media ?? [])
    .filter((m) => m.type === 'image')
    .map((m) => botImageUrl(SITE_URL, m.url))
  const schemaImages = galleryImages.length > 0 ? galleryImages : [botImageUrl(SITE_URL, photo)]

  // Precio de una oferta: el final, y con descuento también el de lista como
  // StrikethroughPrice (SEO-09, 04/11/2026). Es lo que pide la guía de fichas
  // de comerciante para mostrar el tachado: el de lista con ese priceType y el
  // activo sin priceType. Antes la ficha decía solo el final mientras el feed
  // mandaba los dos, y Google solo muestra el tachado si la página lo sostiene.
  const precioOferta = (talle: string | undefined) => {
    const final = getFinalPrice(product, talle, discounts)
    const lista = getEffectivePrice(product, talle)
    return {
      price: final.toFixed(2),
      ...(final < lista
        ? {
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              priceType: 'https://schema.org/StrikethroughPrice',
              price: lista.toFixed(2),
              priceCurrency: 'UYU',
            },
          }
        : {}),
    }
  }

  // Price validity one year out — keeps Google Merchant / rich-results parsing
  // happy without asserting a promo end date the owner didn't set. This is a
  // Server Component that runs per-request (revalidate=3600), so reading the
  // clock here is intentional and safe.
  // eslint-disable-next-line react-hooks/purity
  const priceValidUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)

  const productUrl = `${SITE_URL}/tienda/${product.slug}`

  // Honestidad con Google (y con la clienta): "InStock" solo si la pieza
  // realmente está tejida y sale ya. Lo que se teje a pedido es BackOrder —
  // declararlo InStock y después entregar en semanas es la clase de
  // discrepancia que Merchant Center marca como problema. Un talle agotado es
  // OutOfStock aunque la prenda siga activa.
  const availabilityFor = (sizeAvailable = true) =>
    product.status === 'soldout' || !sizeAvailable
      ? 'https://schema.org/OutOfStock'
      : product.status !== 'active'
        ? 'https://schema.org/PreOrder'
        : isReadyToShip(product)
          ? 'https://schema.org/InStock'
          : 'https://schema.org/BackOrder'

  // Lo que comparten todas las ofertas de la ficha.
  const offerCommon = {
    seller: { '@type': 'Organization', name: 'Dahila Crochet', url: SITE_URL },
    priceCurrency: 'UYU',
    itemCondition: 'https://schema.org/NewCondition',
    priceValidUntil,
    // Sin hasMerchantReturnPolicy (04/09/2026): se sacó del sitio todo lo
    // referido a cambios y devoluciones. Es un campo opcional para Google.
    // Merchant listings: destino + tiempos. El "handling" es el tejido de la
    // pieza (semanas del producto → días); el tránsito es el courier en UY.
    shippingDetails: {
      '@type': 'OfferShippingDetails',
      shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'UY' },
      // Ojo con el 0: una pieza "Disponible ahora" (lead_time_weeks_min = 0,
      // ver isReadyToShip en lib/types) tiene handling 0 días, que es un dato
      // REAL y bueno para Google — no la ausencia de dato. Por eso el guard
      // mira que los valores sean números válidos, no que sean > 0: con `> 0`
      // el bloque entero desaparecía justo en las piezas listas para enviar.
      ...(Number.isFinite(product.lead_time_weeks_min) && Number.isFinite(product.lead_time_weeks_max)
        ? {
            deliveryTime: {
              '@type': 'ShippingDeliveryTime',
              handlingTime: {
                '@type': 'QuantitativeValue',
                // En stock sale ya (armar el paquete): el máximo viejo de la
                // ficha (p. ej. 3 semanas) le hacía decir a Google "llega en
                // 3 semanas" de una pieza ya tejida (auditoría 04/11/2026).
                minValue: isReadyToShip(product) ? 0 : Math.min(product.lead_time_weeks_min, product.lead_time_weeks_max) * 7,
                maxValue: isReadyToShip(product) ? 2 : Math.max(product.lead_time_weeks_min, product.lead_time_weeks_max) * 7,
                unitCode: 'DAY',
              },
              transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' },
            },
          }
        : {}),
    },
  }

  const brand = { '@type': 'Brand', name: 'Dahila Crochet' }
  const productCommon = {
    name: product.name,
    ...(product.description ? { description: product.description } : {}),
    image: schemaImages,
    brand,
    ...(product.category ? { category: product.category.name } : {}),
    ...(product.material ? { material: product.material } : {}),
  }

  // Prenda con talles → ProductGroup, un Product por talle (17/09/2026). Antes
  // era un AggregateOffer (low/high): los fragmentos de producto lo aceptan,
  // pero las fichas de comerciantes NO ("merchant listings require an Offer",
  // documentación de Google). Spring, Amour y Granny's, las fichas más vistas,
  // quedaban afuera de la caja con precio y disponibilidad (confirmado con la
  // inspección de URLs de Search Console el 17/09).
  // Para sitios de una sola página, Google pide que cada variante se pueda
  // abrir ya elegida desde su propia URL: eso es el ?talle= que lee
  // lib/product-selection.ts, el mismo link que manda el feed para esa
  // variante (variantUrl). La canónica sigue siendo la ficha sin talle.
  // 04/11/2026 (TRK-01, SEO-08): grupo siempre que la prenda tenga talles
  // (tieneVariantes, la misma regla que el item_group_id del feed), no solo
  // cuando el precio cambia: así cada talle publica su disponibilidad. Las
  // Pulseras Terra varían por modelo (Lisas, Con lurex, Con caracolas), no
  // por talle: van con pattern.
  const porModelo = variantLabel(product.sizes) === 'Modelo'
  const variantes = sortSizes(product.sizes ?? [])
    .filter((s) => !isUnicoLabel(s.size))
    .map((s) => ({ size: s.size, available: s.available !== false, price: getFinalPrice(product, s.size, discounts) }))
    .filter((v) => v.price > 0)
  // Sin variantes: el precio del talle disponible más barato (el de la
  // tarjeta) o, si no queda ninguno, el de su fila; y agotada si tiene filas y
  // ninguna está disponible (antes salía InStock o BackOrder).
  const filas = sortSizes(product.sizes ?? [])
  const talleSuelto = getListingSize(product) ?? filas[0]?.size
  const sueltoAgotado = filas.length > 0 && filas.every((s) => s.available === false)

  const productJsonLd = tieneVariantes(product) && variantes.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'ProductGroup',
        ...productCommon,
        url: productUrl,
        productGroupID: product.id,
        variesBy: [porModelo ? 'https://schema.org/pattern' : 'https://schema.org/size'],
        hasVariant: variantes.map((v) => ({
          '@type': 'Product',
          name: porModelo ? `${product.name}, ${v.size}` : `${product.name}, talle ${v.size}`,
          sku: `${product.id}-${v.size}`,
          image: schemaImages[0],
          ...(porModelo ? { pattern: v.size } : { size: v.size }),
          brand,
          offers: {
            '@type': 'Offer',
            url: variantUrl(SITE_URL, product.slug, v.size),
            ...precioOferta(v.size),
            availability: availabilityFor(v.available),
            ...offerCommon,
          },
        })),
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'Product',
        ...productCommon,
        // Sin `mpn` ni `gtin`: son piezas hechas a mano, una por una — no existe un
        // número de parte de fabricante real, y reusar el UUID interno ahí es dato
        // de relleno que Google no puede aprovechar. `sku` (el id interno) alcanza.
        // NO va `identifier_exists` acá: es un atributo del FEED de Merchant
        // Center, no una propiedad de schema.org (verificado 23/08); vive en
        // /merchant-feed.xml.
        sku: product.id,
        offers: {
          '@type': 'Offer',
          url: productUrl,
          // El precio de su fila (no el base): el Sweater net tiene su precio
          // en la fila "Único". Es el mismo que publica el feed.
          ...precioOferta(talleSuelto),
          availability: availabilityFor(!sueltoAgotado),
          ...offerCommon,
        },
      }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Tienda', item: `${SITE_URL}/tienda` },
      ...(product.category
        ? [{ '@type': 'ListItem', position: 3, name: product.category.name, item: `${SITE_URL}/tienda/${product.category.slug}` }]
        : []),
      {
        '@type': 'ListItem',
        position: product.category ? 4 : 3,
        name: product.name,
        item: `${SITE_URL}/tienda/${product.slug}`,
      },
    ],
  }

  return (
    <div style={{ paddingBottom: '4rem' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbJsonLd) }} />
      {isSnapshot && <CatalogReadOnlyBanner waUrl={whatsappUrl} />}

      <ProductDetailsClient
        product={product}
        discountPercent={resolveDiscountPercent(product, discounts)}
        related={related}
        lookComplements={lookComplements}
        discounts={discounts}
        sizeGuideNote={sizeGuideNote}
        whatsappUrl={whatsappUrl}
        shippingEstimate={shippingEstimate}
        queueNote={queueNote}
        trustItems={trustItems}
        makerName={getSetting('maker_name') || 'Anush'}
        makerBio={getSetting('maker_bio') || ''}
        makerPhoto={getSetting('maker_photo_url') || ''}
        processEnabled={getSetting('pdp_process_enabled') === 'true'}
        processSteps={[
          { icon: getSetting('pdp_process_step_1_icon') || 'chat-text',  label: getSetting('pdp_process_step_1_label') || 'Escribís',        body: getSetting('pdp_process_step_1_body') || 'Contame qué prenda querés, tu medida y colores favoritos.' },
          { icon: getSetting('pdp_process_step_2_icon') || 'scissors',   label: getSetting('pdp_process_step_2_label') || 'Elegimos juntas', body: getSetting('pdp_process_step_2_body') || 'Te muestro las lanas disponibles y confirmamos todos los detalles.' },
          { icon: getSetting('pdp_process_step_3_icon') || 'needle',     label: getSetting('pdp_process_step_3_label') || 'Te lo tejo',      body: getSetting('pdp_process_step_3_body') || 'Trabajo en tu prenda y te aviso cuando está lista para enviar.' },
        ].filter((s) => s.label.trim())}
        encargosCupos={encargosCupos}
        testimonial={testimonial}
        totalTestimonios={testimonios.length}
        // El reel de esta prenda, si hay uno cargado (admin → Reels).
        reel={resolveReels(settings.reels, catalog.products).find((r) => r.product.slug === product.slug) ?? null}
        navidadEncargoHasta={getSetting('navidad_enabled') !== 'false' ? getSetting('navidad_encargo_hasta') : undefined}
        navidadStockHasta={getSetting('navidad_enabled') !== 'false' ? getSetting('navidad_stock_hasta') : undefined}
        giftEnabled={getSetting('regalo_enabled') !== 'false'}
        clientPhotos={testimonios.filter((t) => t.product_id === product.id && t.photo_url?.trim())}
        // Con la base caída el carrito no puede guardar nada: la ficha toma el
        // pedido por WhatsApp en vez de fallar al tocar "Agregar".
        soloConsulta={isSnapshot}
      />
    </div>
  )
}

// El testimonio que nombra el mismo tipo de prenda ("el sweater", "las
// bufandas", "el set"), comparando palabra por palabra en singular. Si ninguno
// la nombra, uno fijo por ficha (según el slug) para que no se repita el mismo
// en todas. Son opiniones de la tienda, no del producto: por eso no van al
// JSON-LD como Review.
function pickTestimonial(list: Testimonial[], product: Product): Testimonial | null {
  const usable = list.filter((t) => t.text?.trim() && t.author?.trim())
  if (usable.length === 0) return null
  // Una clienta que compró ESTA prenda gana siempre (product_id, cargado
  // desde /admin/testimonios).
  const own = usable.find((t) => t.product_id === product.id)
  if (own) return own
  const words = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length >= 3)
      .map((w) => w.replace(/(?<=[rldnz])es$/, '').replace(/s$/, ''))
  const kind = new Set(words(`${product.category?.slug ?? ''} ${product.name}`))
  const match = usable.find((t) => words(t.text).some((w) => kind.has(w)))
  if (match) return match
  // Sin coincidencia, uno que no nombre otra prenda: "las bikinis" en la ficha
  // de un bolso restaba más de lo que sumaba (recorridos 04/11/2026).
  const PRENDAS = /sweater|buzo|bikini|falda|pollera|bufanda|calentador|chaleco|cortina|cardigan|top|bolso|cartera|gorro|manta|poncho|manguita|vestido/i
  const neutral = usable.filter((t) => !PRENDAS.test(t.text.normalize('NFD').replace(/\p{Diacritic}/gu, '')))
  const pool = neutral.length > 0 ? neutral : usable
  const seed = [...product.slug].reduce((n, c) => n + c.charCodeAt(0), 0)
  return pool[seed % pool.length]
}

// ─── Entry point ─────────────────────────────────────────────────────────────

export default async function TiendaSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  // Nada acá lee `searchParams` (TiendaClient maneja los filtros con su
  // propio estado de URL en el cliente) — no declarar el prop es lo que
  // permite que esta página vuelva a ser ISR en vez de forzar dinámico en
  // cada visita (ver supabase/public.ts para el resto del mismo fix).
  const resolved = await resolveSlug(slug)
  // DB caída y sin snapshot → cartel de mantenimiento, no un 404.
  if (resolved === 'down') return <MaintenanceScreen />

  // Slug con basura pegada (emoji/espacio/punto de un link copiado desde
  // Instagram: `/tienda/spring-cardigan 🥰`). Antes era un 404 que perdía la
  // visita. Solo redirigimos si el slug limpio EXISTE — si no, un 404
  // legítimo terminaría redirigiendo a otro 404.
  if (!resolved) {
    const target = slugRedirectTarget(slug)
    if (target) {
      const cleanResolved = await resolveSlug(target)
      if (cleanResolved && cleanResolved !== 'down') {
        permanentRedirect(`/tienda/${target}`)
      }
    }
    notFound()
  }

  if (resolved.type === 'category') {
    return <CategoryPage slug={slug} category={resolved.category} />
  }
  return <ProductPage slug={slug} />
}
