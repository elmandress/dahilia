import type { Metadata, Viewport } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import { CartProvider } from '@/components/CartProvider'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { SITE_URL } from '@/lib/env'
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
  url: SITE_URL,
  logo: `${SITE_URL}/isotype-color.png`,
  sameAs: ['https://www.instagram.com/dahila.crochet/'],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Montevideo',
    addressCountry: 'UY',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-UY" className={`${fraunces.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {/* Preconnect to icon CDN to reduce TTFB for icon font/CSS */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        {/* Phosphor Icons CDN */}
        <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/regular/style.css" />
        <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/light/style.css" />
        <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/fill/style.css" />
        <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/bold/style.css" />
      </head>
      <body>
        <CartProvider>
          <Header />
          <main>
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
