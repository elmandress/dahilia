import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { dahila, Eyebrow } from '@/components/ui/Primitives'
import { SITE_URL } from '@/lib/env'
import { OG_BASE } from '@/lib/og'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Envíos, pagos y cuidados de tu prenda',
  description: 'Todo claro antes de comprar: cómo llega tu pedido a cualquier punto de Uruguay, cómo pagás (transferencia o Mercado Pago) y cómo cuidar una prenda tejida a mano.',
  alternates: { canonical: '/info' },
  openGraph: {
    ...OG_BASE,
    title: 'Envíos, pagos y cuidados de tu prenda',
    description: 'Cómo llega tu pedido, cómo pagás y cómo cuidar una prenda tejida a mano.',
    url: `${SITE_URL}/info`,
  },
}

const BLOCKS: Array<{ key: string; title: string; fallback: string }> = [
  {
    key: 'info_shipping',
    title: 'Envíos',
    fallback: 'Hacemos envíos a todo Uruguay. El costo y el plazo los coordinamos por WhatsApp según dónde estés. Para envíos al exterior, escribinos y vemos juntas.',
  },
  {
    key: 'info_custom',
    title: 'Cómo encargar a medida',
    fallback: 'Contanos qué tenés en mente desde la sección "A medida" o por WhatsApp. Te respondemos con opciones de modelo, materiales y presupuesto. Cuando confirmás, empezamos a tejer.',
  },
  {
    key: 'info_payment',
    title: 'Formas de pago',
    fallback: 'Coordinamos el pago por WhatsApp: transferencia o el medio que te quede cómodo.',
  },
  {
    key: 'info_returns',
    title: 'Cambios y devoluciones',
    fallback: 'Como cada prenda se hace a mano y muchas veces a medida, no hacemos cambios por talle. Por eso te acompañamos durante todo el proceso para que quede perfecta. Si llega algo mal, escribinos y lo resolvemos.',
  },
  {
    key: 'info_care',
    title: 'Cuidados de las prendas',
    fallback: 'Lavá a mano con agua fría y jabón neutro. Secá en horizontal, a la sombra, sin colgar. No uses secarropas. Así tu prenda dura años.',
  },
]

export default async function InfoPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', BLOCKS.map((b) => b.key))

  const s = (data ?? []).reduce<Record<string, string>>(
    (acc, curr) => ({ ...acc, [curr.key]: String(curr.value ?? '') }),
    {}
  )

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 96px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 40 }}>
        <Eyebrow>Información</Eyebrow>
        <h1 style={{
          fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 'clamp(32px, 5vw, 52px)',
          lineHeight: 1.05, letterSpacing: '-0.02em', color: dahila.ink900, margin: 0,
        }}>
          Todo lo que necesitás saber.
        </h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {BLOCKS.map((b) => {
          const text = s[b.key]?.trim() ? s[b.key] : b.fallback
          return (
            <section key={b.key} style={{ padding: '28px 0', borderTop: `1px solid ${dahila.border}` }}>
              <h2 style={{
                fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 24,
                color: dahila.ink900, margin: '0 0 10px',
              }}>{b.title}</h2>
              <p style={{
                fontFamily: dahila.fontSans, fontSize: 15, fontWeight: 300, lineHeight: 1.75,
                color: dahila.ink700, margin: 0, whiteSpace: 'pre-line',
              }}>{text}</p>
            </section>
          )
        })}
      </div>
    </div>
  )
}
