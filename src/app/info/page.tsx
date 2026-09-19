import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/public'
import { dahila, Eyebrow, Icon } from '@/components/ui/Primitives'
import { SITE_URL } from '@/lib/env'
import { OG_BASE_NO_IMAGE } from '@/lib/og'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Envíos, pagos y cuidados de tu prenda',
  description: 'Todo claro antes de comprar: cómo llega tu pedido a cualquier punto de Uruguay, cómo pagás (transferencia o Mercado Pago) y cómo cuidar una prenda tejida a mano.',
  alternates: { canonical: '/info' },
  openGraph: {
    ...OG_BASE_NO_IMAGE,
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
    .in('key', [...BLOCKS.map((b) => b.key), 'contact_whatsapp_url'])

  const s = (data ?? []).reduce<Record<string, string>>(
    (acc, curr) => ({ ...acc, [curr.key]: String(curr.value ?? '') }),
    {}
  )
  const whatsappUrl = s.contact_whatsapp_url?.trim() || 'https://wa.me/59899850073'
  const closingText = encodeURIComponent('Hola! Tengo una duda que no encontré en la página de info.')
  const closingUrl = `${whatsappUrl}${whatsappUrl.includes('?') ? '&' : '?'}text=${closingText}`

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
              {/* Enlace contextual a la nota que amplía este bloque. Solo donde
                  hay una guía de verdad detrás: es la lectora que ya está
                  preguntándose "¿y cómo la lavo?" la que mejor convierte en
                  lectura, y de paso le da a Google una señal de tema fuerte
                  entre /info y el blog. */}
              {DEEPER_READ[b.key] && (
                <p style={{ margin: '12px 0 0' }}>
                  <Link href={DEEPER_READ[b.key].href} style={{
                    fontFamily: dahila.fontSans, fontSize: 14, fontWeight: 400,
                    color: dahila.ink900, textDecoration: 'underline',
                    textDecorationColor: dahila.wine600, textUnderlineOffset: 3,
                  }}>
                    {DEEPER_READ[b.key].label} →
                  </Link>
                </p>
              )}
            </section>
          )
        })}
      </div>

      <div style={{
        marginTop: 8, padding: '28px 0 0', borderTop: `1px solid ${dahila.border}`,
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <p style={{
          fontFamily: dahila.fontSans, fontSize: 15, fontWeight: 300, lineHeight: 1.6,
          color: dahila.ink700, margin: 0,
        }}>
          ¿No encontraste tu respuesta? Escribinos por WhatsApp.
        </p>
        <a
          href={closingUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
            alignSelf: 'flex-start',
            background: dahila.whatsapp, color: '#fff', textDecoration: 'none',
            borderRadius: 10, padding: '14px 22px',
            fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 500,
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}
        >
          <Icon name="whatsapp-logo" size={18} /> Escribinos
        </a>
      </div>
    </div>
  )
}

const DEEPER_READ: Record<string, { href: string; label: string }> = {
  info_care: {
    href: '/blog/como-cuidar-prendas-de-crochet',
    label: 'Guía completa: cómo cuidar una prenda de crochet',
  },
  info_custom: {
    href: '/blog/como-encargar-prenda-a-medida',
    label: 'Cómo funciona un encargo a medida, paso a paso',
  },
}
