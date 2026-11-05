import { jsonLdScript } from '@/lib/json-ld'
import { createClient } from '@/lib/supabase/public'
import { brandProfileUrls, googleBusinessUrl } from '@/lib/profiles'
import { getCatalog, getTestimonials } from '@/lib/catalog'
import { HomeClient } from './HomeClient'
import { CatalogReadOnlyBanner } from '@/components/CatalogReadOnlyBanner'
import { MaintenanceScreen } from '@/components/MaintenanceScreen'
import { SITE_URL } from '@/lib/env'
import { getHomeArticles } from '@/content/blog'
import { withHeroOverride } from '@/content/blog/hero'
import { resolveReels } from '@/lib/reels'
import { isReadyToShip } from '@/lib/types'
import { dropHasLaunched } from '@/lib/drop-date'
import { armarSeccionesHome, destinoPortada, varianteDropArriba } from '@/lib/home-sections'

export const revalidate = 3600

export default async function Home() {
  const supabase = await createClient()

  // Catálogo con fallback al snapshot si la DB está caída (ver src/lib/catalog.ts).
  // Featured y "Nuevo" se derivan de la misma tanda — así la home queda
  // resiliente sin queries extra que dependan de la base.
  const catalog = await getCatalog()
  const { discounts, settings, source } = catalog

  // DB caída y sin snapshot → cartel de mantenimiento (no una home vacía).
  if (source === 'snapshot' && catalog.products.length === 0) return <MaintenanceScreen />

  const activeProducts = catalog.products.filter((p) => p.status === 'active')
  // "Nuevo" (por fecha de alta), "Disponible ahora" y "Accesorios" se arman
  // acá, sin repetir prendas entre secciones (VIS-06, lib/home-sections): al
  // cliente viajan como mucho 12, como antes.
  const secciones = armarSeccionesHome(activeProducts)
  // Sobre todo el catálogo activo y no sobre lo que viaja: decide si el bloque
  // del drop ofrece "Ver en stock".
  const hayEnStock = activeProducts.some(isReadyToShip)

  // Testimonios: cacheados junto al catálogo (los usa también la ficha) y
  // tolerantes a DB caída (si falla, queda vacío).
  const testimonials = await getTestimonials()

  // Bloque "Próximo drop": si apunta a una colección, el link solo se pasa
  // cuando esa colección está realmente publicada — el teaser nunca puede
  // filtrar una página que todavía da 404.
  let dropCollectionHref: string | null = null
  const dropSlug = (settings.drop_collection_slug ?? '').trim()
  if (settings.drop_enabled !== 'false' && dropSlug) {
    const { data: dropCol } = await supabase
      .from('collections')
      .select('slug, published')
      .eq('slug', dropSlug)
      .maybeSingle()
    if (dropCol?.published) dropCollectionHref = `/colecciones/${dropCol.slug}`
  }

  // El estado del drop sale del servidor (VIS-05): el HTML decía "Muy pronto"
  // y "Verlo 24 h antes" con el drop abierto hasta que hidrataba. Con el ISR
  // de 1 h, en la primera hora después del lanzamiento el HTML puede seguir
  // diciendo "Próximo drop": el reloj del navegador lo corrige al hidratar.
  const dropLive = dropHasLaunched(settings.drop_date)
  // Si la portada ya lleva a la colección del drop, el bloque del drop no la
  // repite en el celular (VIS-02). Los textos de la portada no se tocan.
  const dropArriba = varianteDropArriba({ dropLive, heroHref: destinoPortada(settings.hero_cta_href), dropCollectionHref })

  // FAQPage schema — Google can render FAQ dropdowns in search results.
  const faqItems = [1, 2, 3, 4, 5]
    .map((n) => ({ q: settings[`faq_${n}_q`], a: settings[`faq_${n}_a`] }))
    .filter((f) => f.q?.trim() && f.a?.trim())

  const faqJsonLd = faqItems.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  } : null

  // (El WebSite vive solo en el layout, con @id y las variantes de la marca.
  // Acá había un segundo WebSite para el cuadro de búsqueda de Google, que
  // Google retiró en noviembre de 2024 — auditoría 12/09/2026.)

  // LocalBusiness — shows brand panel in Google with location, contact, links.
  const waUrl = settings.contact_whatsapp_url || 'https://wa.me/59899850073'
  const igUrl = settings.contact_instagram_url || 'https://www.instagram.com/dahila.crochet/'
  const localBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'ClothingStore'],
    name: 'Dahila Crochet',
    description: settings.brand_short_intro || 'Prendas tejidas a crochet, hechas a mano y a medida, desde Montevideo.',
    url: SITE_URL,
    // ImageObject explícito (no solo la URL) — Google recomienda ancho/alto
    // declarados para el logo del panel de marca; el isotype ya es 512×512.
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/isotype-color.png`, width: 512, height: 512 },
    image: { '@type': 'ImageObject', url: `${SITE_URL}/logo-full.jpg`, width: 1200, height: 630 },
    telephone: settings.contact_whatsapp || '+598 99 850 073',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Montevideo',
      addressCountry: 'UY',
    },
    // Perfiles oficiales (Configuración → Contacto) + WhatsApp. hasMap ata
    // esta ficha al Perfil de Negocio de Google cuando el link está cargado.
    sameAs: [...new Set([igUrl, ...brandProfileUrls(settings), waUrl])],
    ...(googleBusinessUrl(settings) ? { hasMap: googleBusinessUrl(settings) } : {}),
    areaServed: [
      { '@type': 'City', name: 'Montevideo' },
      { '@type': 'Country', name: 'Uruguay' },
    ],
    priceRange: '$$',
    currenciesAccepted: 'UYU',
    // Coherente con lo que el carrito realmente ofrece (CarritoClient.tsx):
    // transferencia o Mercado Pago — nada de "Cash" para piezas hechas a
    // pedido y coordinadas por WhatsApp.
    paymentAccepted: 'Bank Transfer, Mercado Pago',
    openingHours: 'Mo-Fr 09:00-18:00',
  }

  return (
    <>
      {source === 'snapshot' && <CatalogReadOnlyBanner waUrl={waUrl} />}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(localBusinessJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(faqJsonLd) }}
        />
      )}
      <HomeClient
        secciones={secciones}
        hayEnStock={hayEnStock}
        dropLive={dropLive}
        dropArriba={dropArriba}
        settings={settings}
        discounts={discounts}
        testimonials={testimonials}
        dropCollectionHref={dropCollectionHref}
        // Reels cargados en el admin, cada uno con su prenda (lib/reels.ts).
        reels={resolveReels(settings.reels, activeProducts)}
        // Para que cada foto de "Clientas con su Dahila" linkee a su prenda.
        productLinks={Object.fromEntries(activeProducts.map((p) => [p.id, { name: p.name, slug: p.slug }]))}
        // Solo lo que dibuja la tira: nombre y slug.
        categorias={catalog.categories.map(({ name, slug }) => ({ name, slug }))}
        // Solo lo que muestra la tarjeta: el cuerpo de las notas no viaja al cliente.
        notes={getHomeArticles().map((a) => withHeroOverride(a, settings)).map(({ slug, title, excerpt, hero }) => ({ slug, title, excerpt, hero }))}
      />
    </>
  )
}
