import type { Metadata } from 'next'
import Link from 'next/link'
import { getCatalog } from '@/lib/catalog'
import { ProductCard } from '@/components/ProductCard'
import { dahila } from '@/components/ui/tokens'
import { formatPrice, getFinalPrice } from '@/lib/types'

/**
 * Lista de deseos compartida (08/10/2026): /favoritos/compartida?p=slug1,slug2&de=Nombre
 *
 * Los favoritos viven atados al navegador de cada clienta; este link los
 * vuelve algo que se le puede mandar a la pareja o a la familia antes de un
 * cumpleaños. Quien regala ve exactamente qué prendas le gustan. Solo viajan
 * slugs públicos en la URL — nada de la cuenta ni del navegador de nadie.
 */
export const metadata: Metadata = {
  title: 'Una lista de deseos de Dahila',
  description: 'Las prendas tejidas a mano que alguien guardó para que se las regalen.',
  robots: { index: false, follow: true },
}

const MAX_ITEMS = 24

export default async function ListaCompartidaPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string; de?: string }>
}) {
  const { p = '', de = '' } = await searchParams
  const slugs = [...new Set(p.split(',').map((s) => s.trim()).filter(Boolean))].slice(0, MAX_ITEMS)
  // El nombre es texto libre de la URL: corto y sin nada raro; React lo escapa.
  const nombre = de.trim().replace(/\s+/g, ' ').slice(0, 40)

  const { products, discounts, settings } = await getCatalog()
  const bySlug = new Map(products.filter((x) => x.status !== 'draft').map((x) => [x.slug, x]))
  const items = slugs.map((s) => bySlug.get(s)).filter((x): x is NonNullable<typeof x> => Boolean(x))

  const whatsappUrl = (settings.contact_whatsapp_url?.trim() || 'https://wa.me/59899850073').replace(/\/+$/, '')
  const regaloOn = settings.regalo_enabled !== 'false'
  const consult = (() => {
    const lines = items.map((it) => `• ${it.name} — ${formatPrice(getFinalPrice(it, undefined, discounts))}`)
    const text = `Hola! Quiero regalarle algo a ${nombre || 'alguien'} de su lista de Dahila:\n\n${lines.join('\n')}\n\n¿Me ayudás a elegir? 🎁`
    return `${whatsappUrl}${whatsappUrl.includes('?') ? '&' : '?'}text=${encodeURIComponent(text)}`
  })()

  const heading: React.CSSProperties = {
    fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 'clamp(30px, 5vw, 44px)',
    lineHeight: 1.05, letterSpacing: '-0.02em', color: dahila.ink900, margin: '10px 0 0',
  }

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '96px 24px', textAlign: 'center' }}>
        <h1 style={{ ...heading, textAlign: 'center' }}>Esta lista está vacía</h1>
        <p style={{ fontFamily: dahila.fontSans, fontSize: 15, color: dahila.ink700, margin: '14px 0 28px' }}>
          Puede que las prendas ya no estén en la tienda. Mirá lo que hay hoy:
        </p>
        <Link href="/tienda" style={{ color: dahila.wine600, fontFamily: dahila.fontSans }}>Ver la tienda →</Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 80px' }}>
      <span style={{ fontFamily: dahila.fontSans, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: dahila.ink500 }}>
        Lista de deseos
      </span>
      <h1 style={heading}>{nombre ? `Lo que le gusta a ${nombre}` : 'Una lista de deseos'}</h1>
      <p style={{ fontFamily: dahila.fontSans, fontSize: 15, fontWeight: 300, color: dahila.ink700, margin: '10px 0 24px', maxWidth: 620, lineHeight: 1.6 }}>
        {items.length === 1 ? 'Esta prenda tejida a mano' : `Estas ${items.length} prendas tejidas a mano`} están en su lista.
        Si querés regalarle una y no sabés el talle, escribime y lo resolvemos juntas.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
        <a
          href={consult}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', minHeight: 44, padding: '0 20px', borderRadius: 10,
            background: dahila.whatsapp, color: '#fff', textDecoration: 'none',
            fontFamily: dahila.fontSans, fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase',
          }}
        >
          Quiero regalarle una
        </a>
        {regaloOn && (
          <Link href="/regalo" style={{
            display: 'inline-flex', alignItems: 'center', minHeight: 44, padding: '0 20px', borderRadius: 10,
            border: `1px solid ${dahila.borderStrong}`, color: dahila.ink900, textDecoration: 'none',
            fontFamily: dahila.fontSans, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            Mejor una tarjeta de regalo
          </Link>
        )}
      </div>
      <div className="tienda-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 22, rowGap: 44 }}>
        {items.map((it) => <ProductCard key={it.id} product={it} discounts={discounts} />)}
      </div>
    </div>
  )
}
