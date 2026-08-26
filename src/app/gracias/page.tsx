import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/public'
import GraciasClient from './GraciasClient'
import { OG_BASE } from '@/lib/og'

export const revalidate = 3600

// /gracias — a donde apunta el QR de la tarjeta de agradecimiento que va en
// cada paquete. No se linkea desde ningún otro lado del sitio (nav, footer,
// sitemap) — se llega únicamente escaneando. noindex por el mismo motivo
// que /ig: es una utilidad puntual, no contenido para Google.
export const metadata: Metadata = {
  title: 'Gracias por tu compra',
  description: 'Un descuento exclusivo para quien escaneó el QR de su paquete de Dahila.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/gracias' },
  openGraph: {
    ...OG_BASE,
    title: 'Gracias por tu compra — Dahila',
    description: 'Un descuento exclusivo para quien escaneó el QR de su paquete.',
    url: '/gracias',
  },
}

const KEYS = [
  'qr_thanks_enabled', 'qr_thanks_eyebrow', 'qr_thanks_title', 'qr_thanks_body',
  'qr_discount_code', 'qr_discount_percent',
]

export default async function GraciasPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('site_settings').select('key, value').in('key', KEYS)
  const s = (data ?? []).reduce<Record<string, string>>(
    (acc, r) => ({ ...acc, [r.key as string]: String(r.value ?? '') }), {}
  )
  const val = (key: string, fallback: string) => (s[key]?.trim() ? s[key] : fallback)

  return (
    <GraciasClient
      enabled={s.qr_thanks_enabled !== 'false'}
      eyebrow={val('qr_thanks_eyebrow', 'Solo para vos')}
      title={val('qr_thanks_title', 'Gracias por tu compra')}
      body={val('qr_thanks_body', 'Escaneaste el QR de tu paquete — este descuento es exclusivo para quien llega hasta acá.')}
      code={val('qr_discount_code', 'GRACIAS15')}
      percent={val('qr_discount_percent', '15')}
    />
  )
}
