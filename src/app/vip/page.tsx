import type { Metadata } from 'next'
import Link from 'next/link'
import { getCatalog } from '@/lib/catalog'
import { dahila } from '@/components/ui/tokens'
import { VipForm } from '@/components/VipForm'
import { SITE_URL } from '@/lib/env'
import { OG_BASE } from '@/lib/og'
import { parseDropDateUY, dropDayText } from '@/lib/drop-date'

export const revalidate = 3600

const TITLE = 'Lista privada de Dahila'
const DESCRIPTION = 'Cada tanda de Dahila es chica y tejida a mano. La lista privada la ve 24 horas antes que nadie y elige primero.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/vip' },
  // Página para mandar desde Instagram, no para buscar en Google.
  robots: { index: false, follow: true },
  openGraph: { ...OG_BASE, title: TITLE, description: DESCRIPTION, url: `${SITE_URL}/vip` },
}


/**
 * /vip (12/10/2026): la entrada a la lista privada que se puede compartir.
 * La lista tenía 6 personas porque solo existía como popup (que además
 * esperaba a otro popup) y en el footer. Esta página es el destino del link
 * de historias y de /ig. Mismo tono que el popup: privado, sin escasez
 * inventada. Si hay un drop cargado, se nombra (y su fecha si es futura).
 */
export default async function VipPage() {
  const { settings } = await getCatalog()
  const dropOn = settings.drop_enabled !== 'false' && (settings.drop_name ?? '').trim() !== ''
  const dropName = dropOn ? settings.drop_name!.trim() : ''
  const launch = parseDropDateUY(settings.drop_date)
  const dropDate = dropOn && launch ? dropDayText(launch) : ''

  const perks: Array<[string, string]> = [
    ['24 horas antes', 'Cada tanda nueva la ve la lista un día antes de que llegue a la tienda.'],
    ['Elegís primero', 'Son pocas piezas por tanda, tejidas una por una. Las primeras en ver, eligen.'],
    ['Un mail por tanda', 'Solo te escribimos cuando hay algo nuevo. Si un día no querés más, respondés el mail y te sacamos.'],
  ]

  return (
    <div style={{ background: dahila.ink900, color: '#F5EDE6', minHeight: '78vh' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: 'clamp(56px, 10vw, 104px) 24px 80px' }}>
        <div style={{ fontFamily: dahila.fontSans, fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#E9B8C4' }}>
          Lista privada
        </div>
        <h1 style={{
          fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 'clamp(38px, 7vw, 60px)',
          lineHeight: 1.02, letterSpacing: '-0.02em', margin: '14px 0 18px',
          // Explícito: la regla global de h1 (globals.css) le gana al color
          // heredado del fondo oscuro y el título quedaba negro sobre negro.
          color: '#F5EDE6',
        }}>
          {dropName ? <>«{dropName}» ya se está tejiendo.</> : <>Lo próximo ya se está tejiendo.</>}
        </h1>
        <p style={{ fontFamily: dahila.fontSans, fontSize: 16, fontWeight: 300, lineHeight: 1.7, color: 'rgba(245,237,230,0.82)', margin: '0 0 30px', maxWidth: 520 }}>
          {dropDate ? `Sale el ${dropDate}. ` : ''}
          Antes de la tienda, la lista: cada tanda es chica, y quien está adentro la ve primero.
        </p>

        <VipForm source="vip" tone="dark" idSuffix="page" cta="Entrar a la lista" />

        <ul style={{ listStyle: 'none', padding: 0, margin: '44px 0 0', display: 'grid', gap: 22 }}>
          {perks.map(([t, d], i) => (
            <li key={t} style={{ display: 'flex', gap: 16, alignItems: 'baseline' }}>
              <span aria-hidden style={{ fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 22, color: '#E9B8C4', minWidth: 22 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>
                <strong style={{ display: 'block', fontFamily: dahila.fontSans, fontWeight: 500, fontSize: 15 }}>{t}</strong>
                <span style={{ fontFamily: dahila.fontSans, fontSize: 14, fontWeight: 300, lineHeight: 1.6, color: 'rgba(245,237,230,0.72)' }}>{d}</span>
              </span>
            </li>
          ))}
        </ul>

        <p style={{ fontFamily: dahila.fontSans, fontSize: 13, color: 'rgba(245,237,230,0.6)', margin: '48px 0 0' }}>
          ¿Preferís mirar lo que ya está? <Link href="/tienda" style={{ color: '#F5EDE6', textDecoration: 'underline', textUnderlineOffset: 3 }}>Ver la tienda</Link>
        </p>
      </div>
    </div>
  )
}
