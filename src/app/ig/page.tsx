import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getCatalog } from '@/lib/catalog'
import { getPrimaryPhoto, formatListingPrice, BLUR_DATA_URL, getPrimaryPhotoAlt, isReadyToShip } from '@/lib/types'
import { Icon } from '@/components/ui/Primitives'
import { dahila } from '@/components/ui/tokens'

export const revalidate = 300

// /ig — el link de la bio de Instagram, en el propio dominio.
// Reemplaza a un Linktree: cero fuga a dominios ajenos, branding intacto y
// medición completa (todo lo que pase después — product_view, add_to_cart,
// order_sent — queda en el mismo embudo).
//
// El link para la bio es simplemente:
//   https://dahila.uy/ig
// Sin parámetros: como esta página existe SOLO para la bio de Instagram,
// lib/attribution.ts asume instagram/bio cuando alguien llega acá sin UTM
// (la URL larga con ?utm_source=... quedaba fea a la vista en el perfil).
// Si algún día se quiere medir un reel puntual aparte, un UTM explícito
// sigue pisando el default: /ig?utm_medium=reel-poncho
// Pensada para el navegador in-app de Instagram: una columna, tap targets
// grandes, lo nuevo primero (el último reel casi siempre es la última pieza).
// noindex: es una utilidad de navegación, no una landing para Google.

export const metadata: Metadata = {
  title: 'Enlaces — lo nuevo, la tienda y encargos',
  description: 'Lo último de Dahila Crochet: piezas nuevas, tienda completa y encargos a medida.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/ig' },
}

export default async function IgLandingPage() {
  // Desde el 12/10/2026 lee el catálogo cacheado como el resto del sitio (antes
  // consultaba la base directo cada 5 min: más egress y sin respaldo si la
  // base se cae). Es la página de la bio: la entrada de la mayoría del tráfico.
  const { products, discounts, settings, collections } = await getCatalog()
  const active = products.filter((p) => p.status === 'active')
  const newest = [...active].sort((x, y) => (y.created_at ?? '').localeCompare(x.created_at ?? '')).slice(0, 4)
  const readyCount = active.filter(isReadyToShip).length
  // "Fijar en la bio" (admin → Productos): la prenda del último reel, grande y
  // primera. Las guías de link-in-bio coinciden: el reel muestra UNA prenda y
  // la bio tiene que llevar a esa, no a una página genérica.
  const pinnedSlug = (settings.ig_destacado_slug ?? '').trim()
  const pinned = pinnedSlug ? active.find((p) => p.slug === pinnedSlug) : undefined
  const giftOn = settings.regalo_enabled !== 'false'
  const waUrl = settings.contact_whatsapp_url?.trim() || 'https://wa.me/59899850073'

  // Bloque de drop — solo si está prendido, tiene nombre y (si apunta a una
  // colección) esa colección está publicada. Misma regla que la home: el
  // teaser nunca linkea una página que dé 404.
  const dropName = (settings.drop_name ?? '').trim()
  const showDrop = settings.drop_enabled !== 'false' && dropName.length > 0
  const dropSlug = (settings.drop_collection_slug ?? '').trim()
  const dropCol = dropSlug ? collections.find((c) => c.slug === dropSlug && c.published) : undefined
  const dropHref: string | null = dropCol ? `/colecciones/${dropCol.slug}` : null

  const bigLink: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    background: '#fff', border: `1px solid ${dahila.borderStrong}`,
    borderRadius: 14, padding: '16px 18px', textDecoration: 'none',
    fontFamily: dahila.fontSans, fontSize: 14, fontWeight: 400, color: dahila.ink900,
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 20px 72px' }}>
      {/* Marca compacta — quien llega ya viene del perfil, no hace falta hero */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 26, textAlign: 'center' }}>
        <Image src="/isotype-color.png" alt="" width={52} height={52} loading="eager" style={{ objectFit: 'contain' }} />
        <span style={{ fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 24, letterSpacing: '0.18em', color: dahila.ink900 }}>
          DAHILA
        </span>
        <p style={{ fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 300, color: dahila.ink700, margin: 0, lineHeight: 1.5 }}>
          Tejido a mano en Uruguay, a tu medida.
        </p>
      </div>

      {pinned && (
        <Link
          href={`/tienda/${pinned.slug}?utm_source=instagram&utm_medium=bio&utm_campaign=reel`}
          style={{ display: 'block', textDecoration: 'none', marginBottom: 14, borderRadius: 16, overflow: 'hidden', border: `1px solid ${dahila.border}`, background: '#fff' }}
        >
          <span style={{ position: 'relative', display: 'block', aspectRatio: '4 / 5', background: dahila.cream50 }}>
            <Image
              src={getPrimaryPhoto(pinned)}
              alt={getPrimaryPhotoAlt(pinned)}
              fill
              quality={82}
              sizes="(max-width: 480px) 100vw, 440px"
              fetchPriority="high"
              loading="eager"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              style={{ objectFit: 'cover' }}
            />
            <span style={{
              position: 'absolute', top: 12, left: 12, padding: '6px 11px', borderRadius: 999,
              background: 'rgba(255,255,255,0.94)', fontFamily: dahila.fontSans, fontSize: 10.5,
              letterSpacing: '0.16em', textTransform: 'uppercase', color: dahila.ink900,
            }}>La del último reel</span>
          </span>
          <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 20, color: dahila.ink900 }}>{pinned.name}</span>
              <span style={{ fontFamily: dahila.fontSans, fontSize: 13, color: dahila.ink700 }}>{formatListingPrice(pinned, discounts)}</span>
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10,
              background: dahila.ink900, color: '#fff', fontFamily: dahila.fontSans, fontSize: 12,
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>Verla <Icon name="caret-right" size={13} color="#fff" /></span>
          </span>
        </Link>
      )}

      {/* Drop activo — el motivo #1 por el que alguien toca el link de la bio
          en semana de lanzamiento va primero. */}
      {showDrop && (
        <Link
          href={dropHref ?? '/tienda'}
          style={{
            ...bigLink,
            background: dahila.ink900, color: '#fff', border: 'none',
            marginBottom: 10,
          }}
        >
          <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.75 }}>Próximo drop</span>
            <span style={{ fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 17 }}>{dropName}</span>
          </span>
          <Icon name="caret-right" size={16} color="#fff" />
        </Link>
      )}

      {/* Lo nuevo — el último reel casi siempre muestra la última pieza:
          la conexión reel → producto tiene que ser de UN toque. */}
      {newest.length > 0 && (
        <section style={{ margin: '18px 0 22px' }}>
          <h2 style={{
            fontFamily: dahila.fontSans, fontSize: 11, fontWeight: 400,
            letterSpacing: '0.2em', textTransform: 'uppercase', color: dahila.ink500,
            margin: '0 0 12px',
          }}>
            Lo nuevo
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 12 }}>
            {newest.filter((p) => p.slug !== pinned?.slug).map((p) => {
              const photo = getPrimaryPhoto(p)
              // Mismo precio que la tarjeta de la tienda y la ficha (antes esta
              // página mostraba el precio base: el Granny's salía 3.300 acá y
              // 3.800 en la tienda).
              const price = formatListingPrice(p, discounts)
              return (
                <Link key={p.id} href={`/tienda/${p.slug}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ position: 'relative', aspectRatio: '3/4', borderRadius: 12, overflow: 'hidden', background: dahila.cream50, display: 'block' }}>
                    <Image
                      src={photo}
                      alt={getPrimaryPhotoAlt(p)}
                      fill
                      quality={82}
                      sizes="(max-width: 480px) 50vw, 220px"
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL}
                      style={{ objectFit: 'cover' }}
                    />
                  </span>
                  <span style={{ fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 14, color: dahila.ink900, lineHeight: 1.25 }}>{p.name}</span>
                  <span style={{ fontFamily: dahila.fontSans, fontSize: 12.5, color: dahila.ink700 }}>{price}</span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Enlaces principales — tap targets grandes, un propósito por fila */}
      <nav aria-label="Enlaces" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Link href="/tienda" style={bigLink}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <Icon name="shopping-bag" size={18} color={dahila.wine600} /> Ver toda la tienda
          </span>
          <Icon name="caret-right" size={15} color={dahila.ink300} />
        </Link>
        {readyCount > 0 && (
          <Link href="/tienda?ya=1" style={bigLink}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <Icon name="package" size={18} color={dahila.wine600} /> Ya tejido, sale sin espera
            </span>
            <Icon name="caret-right" size={15} color={dahila.ink300} />
          </Link>
        )}
        {giftOn && (
          <Link href="/regalo" style={bigLink}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <Icon name="gift" size={18} color={dahila.wine600} /> Tarjeta de regalo
            </span>
            <Icon name="caret-right" size={15} color={dahila.ink300} />
          </Link>
        )}
        <Link href="/encargo" style={bigLink}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <Icon name="ruler" size={18} color={dahila.wine600} /> Pedir una prenda a medida
          </span>
          <Icon name="caret-right" size={15} color={dahila.ink300} />
        </Link>
        <Link href="/vip" style={{ ...bigLink, background: dahila.ink900, color: '#F5EDE6', border: 'none' }}>
          <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#E9B8C4' }}>Lista privada</span>
            <span>Ver cada tanda 24 h antes</span>
          </span>
          <Icon name="caret-right" size={15} color="#F5EDE6" />
        </Link>
        <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{ ...bigLink, background: dahila.whatsapp, color: '#fff', border: 'none' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <Icon name="whatsapp-logo" weight="fill" size={18} color="#fff" /> Escribime por WhatsApp
          </span>
          <Icon name="caret-right" size={15} color="#fff" />
        </a>
        <Link href="/tejedoras" style={bigLink}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <Icon name="hand-heart" size={18} color={dahila.wine600} /> Tejé con Dahila
          </span>
          <Icon name="caret-right" size={15} color={dahila.ink300} />
        </Link>
      </nav>

    </div>
  )
}
