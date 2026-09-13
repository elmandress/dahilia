import type { Metadata } from 'next'
import { getCatalog } from '@/lib/catalog'
import { getFinalPrice, getEffectivePrice, isReadyToShip } from '@/lib/types'
import { OfertasClient } from './OfertasClient'
import { OG_BASE_NO_IMAGE } from '@/lib/og'

export const revalidate = 1800

// Productos activos con precio final por debajo del de lista (descuento por
// producto o regla por lote vigente). Sale del catálogo cacheado: antes esta
// página hacía su propia consulta a Supabase en cada regeneración.
async function getOfertas() {
  const { products, discounts } = await getCatalog()
  const active = products.filter((p) => p.status === 'active')
  const onSale = active.filter((p) => getFinalPrice(p, undefined, discounts) < getEffectivePrice(p))
  return { active, onSale, discounts }
}

export async function generateMetadata(): Promise<Metadata> {
  const { onSale } = await getOfertas()
  // Sin ofertas vigentes, la página no promete "descuento real" en Google ni
  // compite por búsquedas que después aterrizan en una página vacía: al
  // 12/09/2026 tenía 70 impresiones y 3 clics en 28 días con 0 ofertas. Mismo
  // criterio que /colecciones: noindex mientras no haya nada que mostrar
  // (follow, para que los links sigan contando).
  if (onSale.length === 0) {
    return {
      title: 'Ofertas',
      description: 'Cuando hay piezas de crochet con descuento, aparecen acá. Hoy no hay: mirá lo que sale sin espera y lo más nuevo.',
      alternates: { canonical: '/ofertas' },
      robots: { index: false, follow: true },
      openGraph: { ...OG_BASE_NO_IMAGE, title: 'Ofertas', url: '/ofertas' },
    }
  }
  return {
    title: 'Ofertas en prendas tejidas a mano',
    description: 'Piezas de crochet con descuento real, tejidas una por una en Montevideo. Pocas unidades de cada modelo: cuando se van, se van. Envío a todo Uruguay.',
    alternates: { canonical: '/ofertas' },
    openGraph: {
      ...OG_BASE_NO_IMAGE,
      title: 'Ofertas en prendas tejidas a mano',
      description: 'Piezas de crochet con descuento real, tejidas una por una en Montevideo. Pocas unidades de cada modelo.',
      url: '/ofertas',
    },
  }
}

export default async function OfertasPage() {
  const { active, onSale, discounts } = await getOfertas()

  // Sin ofertas: en vez de un callejón sin salida ("Volvé pronto"), lo que
  // sale sin espera primero y después lo más nuevo.
  const newest = [...active].sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
  const fallback = onSale.length > 0
    ? []
    : [...newest.filter(isReadyToShip), ...newest.filter((p) => !isReadyToShip(p))].slice(0, 4)

  return <OfertasClient products={onSale} discounts={discounts} fallbackProducts={fallback} />
}
