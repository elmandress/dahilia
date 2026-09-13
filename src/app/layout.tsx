import type { Metadata, Viewport } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import { CartProvider } from '@/components/CartProvider'
import { FavoritesProvider } from '@/components/FavoritesProvider'
import { CartDrawer } from '@/components/CartDrawer'
import { BackToTop } from '@/components/BackToTop'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { WhatsAppFloat } from '@/components/WhatsAppFloat'
import { WeaverCallout } from '@/components/WeaverCallout'
import { VipCallout } from '@/components/VipCallout'
import { AnalyticsScript } from '@/components/AnalyticsScript'
import { ClarityScript } from '@/components/ClarityScript'
import { GoogleAnalyticsScript } from '@/components/GoogleAnalyticsScript'
import { AttributionCapture } from '@/components/AttributionCapture'
import { SITE_URL, SUPABASE_STORAGE_ORIGIN } from '@/lib/env'
import { OG_BASE, OG_DEFAULT_IMAGE } from '@/lib/og'
import { brandProfileUrls } from '@/lib/profiles'
import { getCatalog } from '@/lib/catalog'
import { isReadyToShip, getListingPrice } from '@/lib/types'
import { ADDON_MAX_UYU } from '@/lib/addons'
import './globals.css'

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
  colorScheme: 'light',
}

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  // Solo el eje óptico: el CSS únicamente setea "opsz" (globals.css h1/h2).
  // SOFT y WONK no se usan en ningún lado y cada eje agranda el woff2 que
  // baja cada visitante — en sus valores por defecto el render es idéntico.
  axes: ['opsz']
})

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap' 
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // CTR: keyword exacto ("tejida a mano", "crochet", "Uruguay") + el
  // diferencial ("a tu medida") en vez de la genérica "ropa de diseño".
  // El template agrega "| Dahila Crochet" a cada página — los titles de
  // página no repiten la marca.
  title: {
    template: '%s | Dahila Crochet',
    default: 'Dahila Crochet — Ropa tejida a mano en Uruguay, a tu medida',
  },
  description: 'Tops, cardigans y accesorios tejidos a crochet en Montevideo. Elegís el talle y los colores, y se teje especialmente para vos. Envío a todo Uruguay.',
  keywords: ['crochet', 'ropa a medida', 'uruguay', 'tejido', 'handmade', 'slow fashion', 'dahila'],
  applicationName: 'Dahila Crochet',
  authors: [{ name: 'Dahila Crochet' }],
  creator: 'Dahila Crochet',
  publisher: 'Dahila Crochet',
  category: 'shopping',
  // Evita que iOS convierta números (precios, medidas) en enlaces de teléfono.
  formatDetection: { telephone: false, address: false, email: false },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    ...OG_BASE,
    url: SITE_URL,
    title: 'Dahila Crochet — tejido a mano en Uruguay, a tu medida',
    description: 'Cada prenda se teje especialmente para vos: tu talle, tus colores. Envío a todo Uruguay.',
    // Tarjeta con la foto real del hero (src/app/og/route.tsx, JPEG por CDN).
    // Antes: /logo-full.jpg — correcto de marca, pero un share con prenda
    // real convierte más que un isotipo. Fallback estático si /og fallara:
    // los crawlers reintentan; el resto del metadata no depende de esto.
    images: [OG_DEFAULT_IMAGE],
  },
  // Solo el tipo de tarjeta, a propósito (11/09/2026): con título,
  // descripción e imagen fijos acá, toda página sin `twitter` propio
  // (/tienda, /encargo, /contacto, /atelier…) heredaba los de la home y se
  // compartía en X con el título equivocado. Sin ellos, Next completa la
  // tarjeta con el openGraph de cada página (postProcessMetadata en
  // next/dist/lib/metadata/resolve-metadata.js), y la home toma el openGraph
  // de arriba, que dice lo mismo.
  twitter: { card: 'summary_large_image' },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

function organizationJsonLd(settings: Record<string, string>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'Dahila Crochet',
    // Variantes de escritura reales (Dalia/Dahlia) que la gente usa al buscar
    // — le dice a Google que son la misma entidad, sin tocar el copy visible
    // ni el <title> (evita keyword stuffing).
    alternateName: ['Dahila', 'Dalia Crochet', 'Dahlia Crochet', 'Dahilia Crochet', 'Dailhia Crochet'],
    url: SITE_URL,
    // ImageObject explícito (no solo la URL) — Google recomienda ancho/alto
    // declarados para el logo del panel de marca; el isotype ya es 512×512.
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/isotype-color.png`, width: 512, height: 512 },
    image: { '@type': 'ImageObject', url: `${SITE_URL}/logo-full.jpg`, width: 1200, height: 630 },
    description: 'Prendas tejidas a crochet, hechas a mano y a medida, desde Montevideo, Uruguay.',
    // Instagram y los demás perfiles cargados en Configuración → Contacto.
    sameAs: brandProfileUrls(settings),
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Montevideo',
      addressCountry: 'UY',
    },
    areaServed: { '@type': 'Country', name: 'Uruguay' },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: '+59899850073',
      availableLanguage: ['Spanish'],
    },
    // Sin hasMerchantReturnPolicy a propósito (04/09/2026): se sacó del sitio
    // todo lo referido a cambios y devoluciones, también del structured data.
  }
}

// WebSite (distinto de Organization arriba): Google lo lee aparte para
// entender el NOMBRE del sitio en sí — Organization.alternateName ayuda al
// panel de marca, pero no todo lo que decide cómo emparejar una búsqueda con
// "el sitio" pasa por ahí. Mismas variantes de escritura, mismo motivo: cero
// costo de keyword stuffing porque no toca copy visible.
// Es el ÚNICO WebSite del sitio (12/09/2026): la home publicaba otro, sin
// @id ni variantes, solo por el SearchAction del cuadro de búsqueda en Google,
// que Google retiró en noviembre de 2024. Dos WebSite distintos para el mismo
// sitio eran ruido justo en el problema activo de la marca (dahila → dahlia).
const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: 'Dahila Crochet',
  alternateName: ['Dahila', 'Dalia Crochet', 'Dahlia Crochet', 'Dahilia Crochet', 'Dailhia Crochet'],
  url: SITE_URL,
  publisher: { '@id': `${SITE_URL}/#organization` },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Active discount rules are seeded into the cart provider so every cart view
  // (drawer, page) prices with the same batch/category logic as the storefront.
  // The short shipping line rides along so the drawer can reassure without an
  // extra round-trip.
  //
  // EGRESS: este layout corre en TODAS las páginas del sitio, así que sus
  // consultas se multiplicaban por cada visita a cualquier ruta (eran 4-5
  // queries por pageview, incluso en /contacto o /info, que no tienen nada
  // que ver con el catálogo). Ahora se sirve del MISMO catálogo cacheado que
  // la tienda (lib/catalog.ts): las cuentas de ofertas, las colecciones de la
  // nav y los settings salen en memoria de un payload que ya estaba cacheado,
  // sin una sola consulta extra. El admin invalida ese caché al guardar
  // (lib/seo-notify.ts → /api/seo/reindex → revalidateTag), así que la
  // frescura no cambia.
  const catalog = await getCatalog()
  const discounts = catalog.discounts
  const settings = catalog.settings
  const collectionRows = catalog.collections
  const productOfferCount = catalog.products.filter(
    (p) => p.status === 'active' && p.discount_active && (p.discount_percent ?? 0) > 0
  ).length

  // "Ofertas" solo entra a la navegación cuando hay ofertas DE VERDAD — que
  // una clienta pueda ver en /ofertas. Una marca hecha a mano con lista de
  // espera no entrena a su público a esperar descuentos: el ítem aparece
  // durante las campañas y desaparece después. Una regla de lote solo cuenta
  // si está vigente, con % real, y (si es por categoría) esa categoría tiene
  // productos activos — si no, la nav prometería una página vacía.
  // Server Component por request (mismo patrón documentado que priceValidUntil
  // en tienda/[slug]/page.tsx): leer el reloj acá es intencional y seguro.
  // eslint-disable-next-line react-hooks/purity
  const nowMs = Date.now()
  const liveBatch = discounts.filter((d) =>
    (d.percent ?? 0) > 0 &&
    (!d.starts_at || new Date(d.starts_at).getTime() <= nowMs) &&
    (!d.ends_at || new Date(d.ends_at).getTime() >= nowMs)
  )
  let hasBatchOffer = liveBatch.some((d) => d.scope === 'all')
  const batchCatIds = liveBatch
    .filter((d) => d.scope === 'category' && d.category_id)
    .map((d) => d.category_id as string)
  if (!hasBatchOffer && batchCatIds.length > 0) {
    // Antes: una consulta COUNT extra por visita. Ahora se resuelve sobre los
    // productos que el catálogo cacheado ya trajo.
    hasBatchOffer = catalog.products.some(
      (p) => p.status === 'active' && p.category_id && batchCatIds.includes(p.category_id)
    )
  }
  const showOfertas = hasBatchOffer || productOfferCount > 0

  // "Colecciones" en la nav — misma regla que "Ofertas": el ítem existe solo
  // cuando hay algo real para ver (publicada visible o un teaser "próximamente").
  // Un ítem permanente hacia una página vacía cobra un clic y devuelve
  // "pronto…" — tienda incompleta. Aparece solo alrededor de los drops.
  const showColecciones = collectionRows.some((c) => {
    const col = c as { published?: boolean; unlisted?: boolean; coming_soon?: boolean }
    return (col.published && !col.unlisted) || (!col.published && col.coming_soon)
  })
  const shippingEstimate = settings.shipping_estimate ?? ''
  // Umbral de envío gratis (UYU). Vacío o no numérico = apagado. Lo fija la
  // dueña en Configuración; carrito y drawer muestran cuánto falta para llegar.
  const freeShippingThreshold = Math.max(0, parseInt(settings.free_shipping_threshold ?? '', 10) || 0)
  // Aviso de lista de espera: visible salvo que la dueña lo apague, y solo si
  // escribió el texto (misma semántica default-ON que los demás toggles del CMS).
  const queueNote = settings.queue_note_enabled !== 'false' ? (settings.queue_note_text ?? '').trim() : ''
  const promo = {
    // Default ON unless the owner saved the literal string 'false'.
    enabled: settings.promo_bar_enabled !== 'false',
    text: settings.promo_bar_text ?? '',
    link: settings.promo_bar_link ?? '',
    bg: settings.promo_bar_bg ?? '',
    fg: settings.promo_bar_fg ?? '',
  }
  const tagline = settings.brand_short_intro?.trim() || undefined
  const waEnabled = settings.whatsapp_float_enabled === 'true'
  const waUrl = settings.contact_whatsapp_url?.trim() || 'https://wa.me/59899850073'

  // Candidatos del "Sumale un detalle" del mini-carrito. Antes viajaba el
  // catálogo entero (37 productos con fotos, talles y colores anidados: ~114 KB
  // de JSON en el HTML de CADA página, y CPU para deserializarlo antes de
  // pintar el LCP) solo para elegir 3 piezas baratas (auditoría 12/09/2026).
  // Ahora van solo las que pueden salir sugeridas, con su foto principal.
  const addonCandidates = catalog.products
    .filter((p) => p.status === 'active' && !p.is_custom_only && getListingPrice(p, discounts) <= ADDON_MAX_UYU)
    .map((p) => ({
      ...p,
      description: null,
      care_instructions: null,
      category: undefined,
      collection: undefined,
      colors: [],
      media: (p.media ?? [])
        .filter((m) => m.type === 'image')
        .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.position - b.position)
        .slice(0, 1),
    }))

  return (
    <html lang="es-UY" className={`${fraunces.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd(settings)) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {/* Icons are inline SVG (see components/ui/icons.tsx) — no icon-font
            CDN, so nothing render-blocking from a third-party domain here. */}
        {/* Favicon kit (RealFaviconGenerator) — static files in public/, not
            Next's file-convention icons, so there's a stable /favicon.ico
            Google and browsers can cache reliably. */}
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="Dahila" />
        {/* Verificación del sitio en Pinterest (Configuración → Sitios web
            reclamados). Reclamar el dominio es lo que activa los Rich Pins:
            los pines toman precio y disponibilidad del schema.org que las
            fichas ya publican, y se actualizan solos cuando cambia el
            precio en el admin. No caduca: si se saca, hay que re-reclamar. */}
        <meta name="p:domain_verify" content="cfc7470c4dc04012bdc53503424844d7" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="preconnect" href={SUPABASE_STORAGE_ORIGIN} />
      </head>
      <body>
        <a href="#contenido" className="skip-link">Saltar al contenido</a>
        <CartProvider initialDiscounts={discounts} shippingEstimate={shippingEstimate} freeShippingThreshold={freeShippingThreshold} queueNote={queueNote} whatsappUrl={waUrl}>
          <FavoritesProvider>
            <Header
              promo={promo}
              showOfertas={showOfertas}
              showColecciones={showColecciones}
              categories={catalog.categories.map((c) => ({ slug: c.slug, label: c.name }))}
              readyToShipCount={catalog.products.filter(isReadyToShip).length}
            />
            {/* Sin loading.tsx en la raíz, a propósito (13/09/2026): envolvía
                todas las páginas en un Suspense, y en las estáticas la página
                real llegaba escondida y se revelaba tarde (ver
                app/tienda/(listado)/loading.tsx). */}
            <main id="contenido">
              {children}
            </main>
            <Footer tagline={tagline} showOfertas={showOfertas} showColecciones={showColecciones} />
            <CartDrawer products={addonCandidates} />
            <BackToTop />
            <WhatsAppFloat enabled={waEnabled} waUrl={waUrl} />
            <WeaverCallout />
            <VipCallout />
          </FavoritesProvider>
        </CartProvider>
        <AttributionCapture />
        <AnalyticsScript />
        <ClarityScript />
        <GoogleAnalyticsScript />
      </body>
    </html>
  );
}
