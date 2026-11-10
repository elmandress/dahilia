import { jsonLdScript } from '@/lib/json-ld'
import type { Metadata } from 'next'
import { notFound, unstable_rethrow } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/public'
import type { Collection, Product, Discount, Color } from '@/lib/types'
import { getListingPrice } from '@/lib/types'
import { botImageUrl } from '@/lib/media'
import { ProductCard } from '@/components/ProductCard'
import { TestimonialsStrip } from '@/components/TestimonialsStrip'
import { ColeccionDescripcion } from '@/components/ColeccionDescripcion'
import { getCatalog, getTestimonials } from '@/lib/catalog'
import { getArticlesForProducts } from '@/content/blog'
import { Eyebrow, Breadcrumb } from '@/components/ui/Primitives'
import { dahila } from '@/components/ui/tokens'
import { SITE_URL } from '@/lib/env'
import { OG_BASE } from '@/lib/og'

export const revalidate = 300

const HOW_TO_BUY = ['Elegís tu pieza', 'La pedís por WhatsApp', 'Pagás cuando confirmamos']

// Mismo motivo que tienda/[slug]: sin esto, `params` fuerza dinámico en toda
// la ruta. Colecciones "unlisted" (acceso anticipado VIP) quedan afuera a
// propósito — no se pre-generan, y `dynamicParams` (true por default) las
// sigue sirviendo on-demand para quien tiene el link directo, sin publicarlas.
export async function generateStaticParams() {
  const supabase = createClient()
  // select('*') a propósito, no .eq('unlisted', ...): esa columna depende de
  // una migración (drops-2026-07.sql) que puede no estar corrida — traer todo
  // y filtrar acá tolera una DB sin esa columna (mismo criterio que
  // colecciones/page.tsx y sitemap.ts).
  const { data } = await supabase.from('collections').select('*')
  return (data ?? [])
    .filter((c) => (c as Collection).published && !(c as Collection).unlisted)
    .map((c) => ({ slug: (c as Collection).slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  // select('*') y no columnas sueltas: trae `unlisted` sin exigir que
  // drops-2026-07.sql esté corrido (mismo criterio que generateStaticParams).
  const { data } = await supabase.from('collections').select('*').eq('slug', slug).eq('published', true).maybeSingle()
  if (!data) return { title: 'Colección' }
  const col = data as Collection

  // SEO-06 (04/11/2026): el title era solo el nombre ("Sunset ‘26 | Dahila
  // Crochet", 27 caracteres): ni "crochet", ni "tejido", ni qué hay adentro.
  // La descripción, con datos: cuántas piezas y desde cuánto, del catálogo
  // cacheado (sin otra consulta). Sin "en stock": una colección de pocas
  // unidades cambia antes de que Google vuelva a pasar. El texto de Anush
  // sigue en la página.
  const title = `${col.name}: colección tejida a mano en Uruguay`
  let datos = ''
  try {
    const piezas = (await getCatalog()).products.filter((p) => p.collection_id === col.id)
    const precios = piezas
      .filter((p) => p.status === 'active' && !p.is_custom_only)
      .map((p) => getListingPrice(p))
      .filter((n) => n > 0)
    if (piezas.length > 0 && precios.length > 0) {
      datos = `${piezas.length} ${piezas.length === 1 ? 'pieza tejida' : 'piezas tejidas'} a mano en Montevideo, desde UYU ${Math.min(...precios).toLocaleString('es-UY')}. Envío a todo Uruguay.`
    }
  } catch (e) {
    unstable_rethrow(e)
  }
  const desc = datos || col.description || `Colección ${col.name}: piezas tejidas a crochet, hechas a mano por Dahila Crochet.`
  return {
    title,
    description: desc,
    alternates: { canonical: `/colecciones/${slug}` },
    // "Solo con link" (acceso anticipado de la lista VIP): la página abre pero
    // Google no la indexa hasta que se publique, igual que sus fichas.
    ...(col.unlisted ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      ...OG_BASE,
      title,
      description: desc,
      url: `${SITE_URL}/colecciones/${slug}`,
      // Vía botImageUrl: el original de Supabase pesaba 420 KB (WhatsApp suele
      // dejar la vista previa sin foto) y cada link compartido gastaba egress.
      // Sin alto: la portada puede tener cualquier proporción y el
      // optimizador la conserva, así que un alto fijo sería inventado.
      ...(col.cover_url ? { images: [{ url: botImageUrl(SITE_URL, col.cover_url, 1200), width: 1200, alt: col.name }] } : {}),
    },
  }
}

export default async function ColeccionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: col, error: colError } = await supabase
    .from('collections')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  // Error de la base ≠ colección inexistente: lanzar mantiene la versión ISR
  // cacheada viva en vez de reemplazarla por un 404 (mismo patrón que la PDP).
  if (colError) throw new Error(`Supabase falló al cargar /colecciones/${slug}: ${colError.message}`)
  if (!col) notFound()
  const collection = col as Collection

  const [{ data: prodData }, { data: discountData }, testimonials] = await Promise.all([
    supabase
      .from('products')
      .select('*, category:categories(*), media:product_media(*), sizes:product_sizes(*), colors:product_colors(color:colors(*))')
      .eq('collection_id', collection.id)
      .in('status', ['active', 'soldout'])
      .order('sort_order', { ascending: true }),
    supabase.from('discounts').select('*').eq('active', true),
    getTestimonials(),
  ])

  const products = (prodData ?? []).map((p) => {
    const joined = (p.colors ?? []) as Array<{ color: Color | null }>
    return { ...p, colors: joined.map((c) => c.color).filter((c): c is Color => !!c) }
  }) as Product[]
  const discounts = (discountData ?? []) as Discount[]

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.name,
    description: collection.description || `Colección ${collection.name}, de Dahila Crochet.`,
    url: `${SITE_URL}/colecciones/${collection.slug}`,
    // Vía botImageUrl (lib/media.ts): sin esto, Googlebot bajaba la portada
    // original directo de Supabase Storage en cada rastreo de la colección.
    ...(collection.cover_url ? { image: botImageUrl(SITE_URL, collection.cover_url) } : {}),
    // Las migas que ya se ven arriba de la página (SEO-06, 04/11/2026), como
    // en las categorías de la tienda.
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Colecciones', item: `${SITE_URL}/colecciones` },
        { '@type': 'ListItem', position: 3, name: collection.name, item: `${SITE_URL}/colecciones/${collection.slug}` },
      ],
    },
    // Solo la lista de fichas, sin Product ni Offer (SEO-10): Google
    // recomienda marcar el producto en su ficha y no en las páginas que
    // listan productos. Era otra fuente de precios que tenía que coincidir.
    mainEntity: products.length > 0 ? {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_URL}/tienda/${p.slug}`,
        name: p.name,
      })),
    } : undefined,
  }

  // Las notas que recomiendan prendas de esta colección (SEO-06): ellas
  // enlazaban acá, pero la colección no enlazaba a ninguna.
  const notas = getArticlesForProducts(products.map((p) => p.slug), 3)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(collectionJsonLd) }}
      />
    {/* coleccion-pagina / coleccion-bloque: aire de 16 px entre bloques en el
        celular (globals.css, VIS-13). Quien llega del anuncio tiene que ver
        prendas en el primer pantallazo: la primera foto arrancaba en 606 px
        de 664 en un iPhone 13. */}
    <div className="coleccion-pagina" style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 80px' }}>
      <Breadcrumb items={[
        { label: 'Inicio', href: '/' },
        { label: 'Colecciones', href: '/colecciones' },
        { label: collection.name },
      ]} />

      {/* Cover / hero band */}
      <div className="coleccion-bloque" style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', background: dahila.cream100, marginBottom: 28 }}>
        {collection.cover_url ? (
          // 30vh (antes 42vh): con la portada, la descripción y los pasos, la
          // primera prenda quedaba a 1,28 pantallas en un iPhone (auditoría
          // 04/11/2026) y quien llega del anuncio veía texto, no prendas.
          <div className="hero-frame" style={{ position: 'relative', height: 'clamp(200px, 30vh, 400px)' }}>
            <Image src={collection.cover_url} alt={collection.name} fill fetchPriority="high" loading="eager" quality={90} sizes="100vw" style={{ objectFit: 'cover' }} />
            {/* 02/11/2026: con 0,55 y la letra fina, "Sunset '26" no se leía
                sobre la portada clara (captura en celular) — y es lo primero
                que ve quien llega del anuncio. */}
            <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(31,26,27,0.78), rgba(31,26,27,0.25) 45%, rgba(31,26,27,0) 70%)' }} />
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 'clamp(20px, 4vw, 40px)', color: '#fff', textShadow: '0 1px 12px rgba(31,26,27,0.45)' }}>
              <Eyebrow style={{ color: 'rgba(255,255,255,0.92)' }}>Colección</Eyebrow>
              {/* color explícito: el estilo global de h1 pisaba el blanco
                  heredado y el título salía oscuro sobre la foto. */}
              <h1 style={{ fontFamily: dahila.fontDisplay, fontWeight: 400, fontSize: 'clamp(34px, 5vw, 52px)', margin: '6px 0 0', lineHeight: 1.05, color: '#fff' }}>{collection.name}</h1>
            </div>
          </div>
        ) : (
          <div style={{ padding: 'clamp(32px, 6vw, 64px)' }}>
            <Eyebrow>Colección</Eyebrow>
            <h1 style={{ fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 'clamp(30px, 5vw, 48px)', margin: '8px 0 0', lineHeight: 1.05, color: dahila.ink900 }}>{collection.name}</h1>
          </div>
        )}
      </div>

      {/* Inter 15 y no la itálica de 16 a 20 px, que en el celular ocupaba 4
          renglones: ahí va en 2, con "Leer más" (VIS-13). */}
      {collection.description && (
        <ColeccionDescripcion texto={collection.description} className="coleccion-bloque" />
      )}

      {/* Cómo se compra, antes de las prendas (02/11/2026). La colección es
          donde aterriza el anuncio del drop: 243 vistas en 6 días, solo 56
          pasaron a una ficha y 2 agregaron al carrito. Quien llega de
          Instagram no sabe que se paga recién al confirmar por WhatsApp — la
          misma promesa que hace el anuncio, repetida donde se decide. */}
      {products.length > 0 && (
        // Un renglón de texto de 12 px, sin caja ni íconos (04/11/2026, VIS-13):
        // la franja con caja ocupaba 63 px del primer pantallazo del celular,
        // justo antes de las prendas. Cada paso no se corta por la mitad y se
        // separan por espacio (los números ya ordenan): con "·" el punto
        // quedaba colgado al final del renglón en el celular.
        <ol aria-label="Cómo se compra" className="coleccion-bloque" style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexWrap: 'wrap', gap: '2px 18px', fontFamily: dahila.fontSans, fontSize: 12, lineHeight: 1.6, color: dahila.ink700 }}>
          {HOW_TO_BUY.map((step, i) => (
            <li key={step} style={{ whiteSpace: 'nowrap' }}>
              <strong style={{ fontWeight: 500, color: dahila.ink900 }}>{i + 1}.</strong> {step}
            </li>
          ))}
        </ol>
      )}

      {products.length === 0 ? (
        <p style={{ fontFamily: dahila.fontSans, fontSize: 14, color: dahila.ink500 }}>
          Todavía no hay piezas en esta colección. <Link href="/tienda" style={{ color: dahila.wine600 }}>Ver la tienda →</Link>
        </p>
      ) : (
        <div className="tienda-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 22, rowGap: 44 }}>
          {products.map((p) => (
            <ProductCard key={p.id} product={p} discounts={discounts} />
          ))}
        </div>
      )}

      {/* Cómo usarlas: las notas del blog de estas mismas prendas, debajo de
          la grilla (SEO-06). Mismo formato que "Antes de elegir" en las
          categorías de la tienda. */}
      {notas.length > 0 && (
        <section aria-labelledby="coleccion-notas" style={{ marginTop: 56 }}>
          <h2 id="coleccion-notas" style={{
            fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 24,
            color: dahila.ink900, margin: '0 0 16px',
          }}>Cómo usarlas</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 16 }}>
            {notas.map((n) => (
              <Link key={n.slug} href={`/blog/${n.slug}`} style={{
                display: 'flex', flexDirection: 'column', gap: 6, textDecoration: 'none',
                padding: '16px 18px', borderRadius: 12, border: `1px solid ${dahila.border}`, background: '#fff',
              }}>
                <span style={{ fontFamily: dahila.fontSans, fontSize: 15, fontWeight: 500, color: dahila.ink900, lineHeight: 1.35 }}>{n.title}</span>
                <span style={{ fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 300, color: dahila.ink700, lineHeight: 1.55 }}>{n.excerpt}</span>
                <span style={{ fontFamily: dahila.fontSans, fontSize: 12, color: dahila.wine600, marginTop: 'auto', paddingTop: 4 }}>Leer la nota →</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
    {/* Reseñas reales debajo de las prendas: antes, después de la grilla
        no había nada más que el pie de página. */}
    {products.length > 0 && testimonials.length > 0 && <TestimonialsStrip items={testimonials} />}
    </>
  )
}
