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
import { AnalyticsScript } from '@/components/AnalyticsScript'
import { ClarityScript } from '@/components/ClarityScript'
import { SITE_URL, SUPABASE_STORAGE_ORIGIN } from '@/lib/env'
import { OG_BASE } from '@/lib/og'
import { createClient } from '@/lib/supabase/server'
import type { Discount } from '@/lib/types'
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
    images: [
      {
        url: '/og',
        width: 1200,
        height: 630,
        alt: 'Dahila Crochet — prendas tejidas a mano en Uruguay',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dahila Crochet — tejido a mano en Uruguay, a tu medida',
    description: 'Cada prenda se teje especialmente para vos: tu talle, tus colores. Envío a todo Uruguay.',
    images: ['/og'],
  },
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

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Dahila Crochet',
  // Variantes de escritura reales (Dalia/Dahlia) que la gente usa al buscar
  // — le dice a Google que son la misma entidad, sin tocar el copy visible
  // ni el <title> (evita keyword stuffing).
  alternateName: ['Dahila', 'Dalia Crochet', 'Dahlia Crochet'],
  url: SITE_URL,
  // ImageObject explícito (no solo la URL) — Google recomienda ancho/alto
  // declarados para el logo del panel de marca; el isotype ya es 512×512.
  logo: { '@type': 'ImageObject', url: `${SITE_URL}/isotype-color.png`, width: 512, height: 512 },
  image: { '@type': 'ImageObject', url: `${SITE_URL}/logo-full.jpg`, width: 1200, height: 630 },
  description: 'Prendas tejidas a crochet, hechas a mano y a medida, desde Montevideo, Uruguay.',
  sameAs: ['https://www.instagram.com/dahila.crochet/'],
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
  // Store-wide return policy — piezas a medida no admiten cambios (coherente con
  // la FAQ). Google recomienda declararla a nivel Organization cuando aplica a
  // toda la tienda, y sirve como override base para el Product schema.
  hasMerchantReturnPolicy: {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: 'UY',
    returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
  },
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
  const supabase = await createClient()
  const [{ data: discountData }, { data: settingRows }, { count: productOfferCount }, { data: collectionRows }] = await Promise.all([
    supabase.from('discounts').select('*').eq('active', true),
    supabase.from('site_settings').select('key, value').in('key', [
      'shipping_estimate', 'free_shipping_threshold',
      'queue_note_enabled', 'queue_note_text',
      'promo_bar_enabled', 'promo_bar_text', 'promo_bar_link', 'promo_bar_bg', 'promo_bar_fg',
      'brand_short_intro', 'whatsapp_float_enabled', 'contact_whatsapp_url',
    ]),
    supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
      .eq('discount_active', true)
      .gt('discount_percent', 0),
    // select('*') a propósito (mismo criterio que el sitemap): filtrar
    // unlisted/coming_soon en SQL exigiría que esas columnas existan
    // (drops-2026-07.sql); traer las pocas filas y filtrar en JS tolera
    // una DB sin esa migración.
    supabase.from('collections').select('*').limit(12),
  ])
  const discounts = (discountData ?? []) as Discount[]

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
    const { count } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
      .in('category_id', batchCatIds)
    hasBatchOffer = (count ?? 0) > 0
  }
  const showOfertas = hasBatchOffer || (productOfferCount ?? 0) > 0

  // "Colecciones" en la nav — misma regla que "Ofertas": el ítem existe solo
  // cuando hay algo real para ver (publicada visible o un teaser "próximamente").
  // Un ítem permanente hacia una página vacía cobra un clic y devuelve
  // "pronto…" — tienda incompleta. Aparece solo alrededor de los drops.
  const showColecciones = (collectionRows ?? []).some((c) => {
    const col = c as { published?: boolean; unlisted?: boolean; coming_soon?: boolean }
    return (col.published && !col.unlisted) || (!col.published && col.coming_soon)
  })
  const settings = (settingRows ?? []).reduce<Record<string, string>>(
    (acc, r) => ({ ...acc, [r.key as string]: String(r.value ?? '') }), {}
  )
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

  return (
    <html lang="es-UY" className={`${fraunces.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
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
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="preconnect" href={SUPABASE_STORAGE_ORIGIN} />
      </head>
      <body>
        <a href="#contenido" className="skip-link">Saltar al contenido</a>
        <CartProvider initialDiscounts={discounts} shippingEstimate={shippingEstimate} freeShippingThreshold={freeShippingThreshold} queueNote={queueNote}>
          <FavoritesProvider>
            <Header promo={promo} showOfertas={showOfertas} showColecciones={showColecciones} />
            <main id="contenido">
              {children}
            </main>
            <Footer tagline={tagline} showOfertas={showOfertas} showColecciones={showColecciones} />
            <CartDrawer />
            <BackToTop />
            <WhatsAppFloat enabled={waEnabled} waUrl={waUrl} />
            <WeaverCallout />
          </FavoritesProvider>
        </CartProvider>
        <AnalyticsScript />
        <ClarityScript />
      </body>
    </html>
  );
}
