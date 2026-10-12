import type { Metadata } from 'next'
import { getCatalog } from '@/lib/catalog'
import { googleReviewUrl } from '@/lib/profiles'
import GraciasClient from './GraciasClient'
import { OG_BASE } from '@/lib/og'

export const revalidate = 3600

// /gracias — a donde apunta el QR de la tarjeta de agradecimiento que va en
// cada paquete. No se linkea desde ningún otro lado del sitio (nav, footer,
// sitemap) — se llega únicamente escaneando. noindex por el mismo motivo
// que /ig: es una utilidad puntual, no contenido para Google.
//
// 12/10/2026: de "un código de descuento" a la experiencia de quien acaba de
// recibir su prenda: nota firmada de Anush, el regalo para la próxima (se
// aplica solo en el carrito), cómo cuidarla, dejar una reseña o mandar una
// foto (sin atarlo al descuento: Google lo prohíbe) y la lista privada.
// Lee del catálogo cacheado (antes consultaba la base en cada render).
export const metadata: Metadata = {
  title: 'Gracias por tu compra',
  description: 'Gracias por elegir algo tejido a mano. Un regalo para la próxima y cómo cuidar tu prenda.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/gracias' },
  openGraph: {
    ...OG_BASE,
    title: 'Gracias por tu compra — Dahila',
    description: 'Un regalo para la próxima y cómo cuidar tu prenda.',
    url: '/gracias',
  },
}

export default async function GraciasPage() {
  const { settings: s, source } = await getCatalog()
  const val = (key: string, fallback: string) => (s[key]?.trim() ? s[key] : fallback)
  const wa = (s.contact_whatsapp_url?.trim() || 'https://wa.me/59899850073').replace(/\/+$/, '')

  return (
    <GraciasClient
      enabled={s.qr_thanks_enabled !== 'false'}
      eyebrow={val('qr_thanks_eyebrow', 'Solo para vos')}
      title={val('qr_thanks_title', 'Gracias por elegir algo hecho a mano')}
      body={val('qr_thanks_body', 'Tu prenda se tejió a mano, punto por punto, en Montevideo. Ojalá la uses mucho y te acompañe años.')}
      code={val('qr_discount_code', 'GRACIAS15')}
      percent={val('qr_discount_percent', '15')}
      makerName={val('maker_name', 'Anush')}
      makerPhoto={(s.maker_photo_url ?? '').trim()}
      reviewEnabled={Boolean(googleReviewUrl(s))}
      photoWhatsapp={`${wa}?text=${encodeURIComponent('¡Hola! Te mando una foto con mi Dahila 🧶')}`}
      listEnabled={source !== 'snapshot'}
    />
  )
}
