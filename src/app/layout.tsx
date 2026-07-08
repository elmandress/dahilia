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
import { SITE_URL } from '@/lib/env'
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
  axes: ['opsz', 'SOFT', 'WONK']
})

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap' 
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: '%s | Dahila Crochet',
    default: 'Dahila Crochet | Ropa de diseño hecha a mano',
  },
  description: 'Prendas únicas tejidas a crochet en Uruguay. Colecciones a medida, tops, cardigans y accesorios con diseño contemporáneo.',
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
    type: 'website',
    locale: 'es_UY',
    url: SITE_URL,
    title: 'Dahila Crochet',
    description: 'Prendas únicas tejidas a crochet en Uruguay.',
    siteName: 'Dahila',
    images: [
      {
        url: '/logo-full.jpg',
        width: 1200,
        height: 630,
        alt: 'Dahila Crochet - Ropa de diseño hecha a mano',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dahila Crochet',
    description: 'Prendas únicas tejidas a crochet en Uruguay.',
    images: ['/logo-full.jpg'],
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
  alternateName: 'Dahila',
  url: SITE_URL,
  logo: `${SITE_URL}/isotype-color.png`,
  image: `${SITE_URL}/logo-full.jpg`,
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
    telephone: '+59894605015',
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
  const [{ data: discountData }, { data: settingRows }] = await Promise.all([
    supabase.from('discounts').select('*').eq('active', true),
    supabase.from('site_settings').select('key, value').in('key', [
      'shipping_estimate',
      'promo_bar_enabled', 'promo_bar_text', 'promo_bar_link', 'promo_bar_bg', 'promo_bar_fg',
    ]),
  ])
  const discounts = (discountData ?? []) as Discount[]
  const settings = (settingRows ?? []).reduce<Record<string, string>>(
    (acc, r) => ({ ...acc, [r.key as string]: String(r.value ?? '') }), {}
  )
  const shippingEstimate = settings.shipping_estimate ?? ''
  const promo = {
    // Default ON unless the owner saved the literal string 'false'.
    enabled: settings.promo_bar_enabled !== 'false',
    text: settings.promo_bar_text ?? '',
    link: settings.promo_bar_link ?? '',
    bg: settings.promo_bar_bg ?? '',
    fg: settings.promo_bar_fg ?? '',
  }

  return (
    <html lang="es-UY" className={`${fraunces.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {/* Icons are inline SVG (see components/ui/icons.tsx) — no icon-font
            CDN, so nothing render-blocking from a third-party domain here. */}
      </head>
      <body>
        <a href="#contenido" className="skip-link">Saltar al contenido</a>
        <CartProvider initialDiscounts={discounts} shippingEstimate={shippingEstimate}>
          <FavoritesProvider>
            <Header promo={promo} />
            <main id="contenido">
              {children}
            </main>
            <Footer />
            <CartDrawer />
            <BackToTop />
            <WhatsAppFloat />
            <WeaverCallout />
          </FavoritesProvider>
        </CartProvider>
      </body>
    </html>
  );
}
