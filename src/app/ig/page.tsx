import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import type { Product, Discount } from '@/lib/types'
import { getPrimaryPhoto, getFinalPrice, formatPrice, BLUR_DATA_URL } from '@/lib/types'
import { dahila, Icon } from '@/components/ui/Primitives'

export const revalidate = 300

// /ig — el link de la bio de Instagram, en el propio dominio.
// Reemplaza a un Linktree: cero fuga a dominios ajenos, branding intacto y
// medición completa (Umami registra la pageview con sus UTM, y todo lo que
// pase después — product_view, add_to_cart, order_sent — queda en el mismo
// embudo). El link recomendado para la bio:
//   https://dahila.uy/ig?utm_source=instagram&utm_medium=bio
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
  const supabase = await createClient()

  const [{ data: newestData }, { data: discountData }, { data: settingRows }] = await Promise.all([
    supabase
      .from('products')
      .select('*, media:product_media(*), sizes:product_sizes(*)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(4),
    supabase.from('discounts').select('*').eq('active', true),
    supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['drop_enabled', 'drop_name', 'drop_collection_slug', 'contact_whatsapp_url']),
  ])

  const newest = (newestData ?? []) as Product[]
  const discounts = (discountData ?? []) as Discount[]
  const settings = (settingRows ?? []).reduce<Record<string, string>>(
    (acc, r) => ({ ...acc, [r.key as string]: String(r.value ?? '') }), {}
  )
  const waUrl = settings.contact_whatsapp_url?.trim() || 'https://wa.me/59899850073'

  // Bloque de drop — solo si está prendido, tiene nombre y (si apunta a una
  // colección) esa colección está publicada. Misma regla que la home: el
  // teaser nunca linkea una página que dé 404.
  let dropHref: string | null = null
  const dropName = (settings.drop_name ?? '').trim()
  const showDrop = settings.drop_enabled !== 'false' && dropName.length > 0
  const dropSlug = (settings.drop_collection_slug ?? '').trim()
  if (showDrop && dropSlug) {
    const { data: dropCol } = await supabase
      .from('collections')
      .select('slug, published')
      .eq('slug', dropSlug)
      .maybeSingle()
    if (dropCol?.published) dropHref = `/colecciones/${dropCol.slug}`
  }

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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {newest.map((p) => {
              const photo = getPrimaryPhoto(p)
              const price = getFinalPrice(p, undefined, discounts)
              return (
                <Link key={p.id} href={`/tienda/${p.slug}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ position: 'relative', aspectRatio: '3/4', borderRadius: 12, overflow: 'hidden', background: dahila.cream50, display: 'block' }}>
                    <Image
                      src={photo}
                      alt={p.name}
                      fill
                      quality={82}
                      sizes="(max-width: 480px) 50vw, 220px"
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL}
                      style={{ objectFit: 'cover' }}
                    />
                  </span>
                  <span style={{ fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 14, color: dahila.ink900, lineHeight: 1.25 }}>{p.name}</span>
                  <span style={{ fontFamily: dahila.fontSans, fontSize: 12.5, color: dahila.ink700 }}>{formatPrice(price)}</span>
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
        <Link href="/encargo" style={bigLink}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <Icon name="ruler" size={18} color={dahila.wine600} /> Pedir una prenda a medida
          </span>
          <Icon name="caret-right" size={15} color={dahila.ink300} />
        </Link>
        <Link href="/tejedoras" style={bigLink}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <Icon name="hand-heart" size={18} color={dahila.wine600} /> Tejé con Dahila
          </span>
          <Icon name="caret-right" size={15} color={dahila.ink300} />
        </Link>
        <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{ ...bigLink, background: '#25D366', color: '#fff', border: 'none' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <Icon name="whatsapp-logo" weight="fill" size={18} color="#fff" /> Escribime por WhatsApp
          </span>
          <Icon name="caret-right" size={15} color="#fff" />
        </a>
      </nav>

      <p style={{
        fontFamily: dahila.fontSans, fontSize: 12, fontWeight: 300, color: dahila.ink500,
        textAlign: 'center', margin: '26px 0 0', lineHeight: 1.6,
      }}>
        Cada colección sale en cantidades chicas — la lista VIP la ve 24 horas antes.
        Anotate al pie de la página.
      </p>
    </div>
  )
}
