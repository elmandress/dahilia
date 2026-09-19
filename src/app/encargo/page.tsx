import { jsonLdScript } from '@/lib/json-ld'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/public'
import EncargoForm, { type EncargoReferencia } from './EncargoForm'
import { getCatalog } from '@/lib/catalog'
import { ENCARGO_FAQ } from './faq'
import { getEncargosCuposState } from '@/components/EncargosDisponibles'
import { OG_BASE } from '@/lib/og'
import { SITE_URL } from '@/lib/env'

export const revalidate = 3600

export const metadata: Metadata = {
  // Sin la promesa "48hs" que el formulario no hace — el gancho es el proceso
  // sin riesgo: contás la idea y recibís propuesta y presupuesto sin comprometerte.
  title: 'Encargá tu prenda de crochet a medida',
  description: 'Contanos qué tenés en mente: Anush te responde con opciones, materiales y presupuesto, sin compromiso. Tu talle exacto, tus colores — tejido a mano en Montevideo.',
  alternates: { canonical: '/encargo' },
  openGraph: {
    ...OG_BASE,
    title: 'Encargá tu prenda de crochet a medida',
    description: 'Contanos qué tenés en mente: te respondemos con opciones, materiales y presupuesto, sin compromiso.',
    url: '/encargo',
  },
}

// Schema del servicio a medida. Esta es la página que mejor rankea en Google
// ("tejidos a medida" pos. 2, "dónde mandar hacer" pos. 3, "ropa tejida a
// mano" pos. 4) y era la única sin structured data. Service es el tipo
// correcto acá: no se vende un producto con precio fijo, se ofrece un
// servicio de confección a pedido con área de cobertura.
const serviceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${SITE_URL}/encargo#service`,
  name: 'Prendas de crochet tejidas a medida',
  serviceType: 'Confección de prendas de crochet a medida',
  description:
    'Tejido a mano de prendas de crochet a medida en Montevideo: elegís modelo, talle, lana y colores, y recibís propuesta y presupuesto sin compromiso.',
  url: `${SITE_URL}/encargo`,
  provider: {
    '@type': 'Organization',
    name: 'Dahila Crochet',
    url: SITE_URL,
  },
  areaServed: { '@type': 'Country', name: 'Uruguay' },
  availableChannel: {
    '@type': 'ServiceChannel',
    serviceUrl: `${SITE_URL}/encargo`,
    availableLanguage: { '@type': 'Language', name: 'Spanish' },
  },
}

// FAQPage con las MISMAS preguntas que se ven en la página (fuente única en
// ./faq.ts). Google pide que el marcado coincida con el contenido visible —
// por eso no se escriben aparte. Hasta el 04/09/2026 esta página publicaba
// `Service` pero no tenía FAQ ni visible ni marcada.
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': `${SITE_URL}/encargo#faq`,
  mainEntity: ENCARGO_FAQ.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

export default async function EncargoPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', [
      'contact_whatsapp_url',
      'encargos_cupos_enabled', 'encargos_cupos_total', 'encargos_cupos_taken', 'encargos_cupos_label',
      'pdp_process_enabled',
      'pdp_process_step_1_icon', 'pdp_process_step_1_label', 'pdp_process_step_1_body',
      'pdp_process_step_2_icon', 'pdp_process_step_2_label', 'pdp_process_step_2_body',
      'pdp_process_step_3_icon', 'pdp_process_step_3_label', 'pdp_process_step_3_body',
    ])

  const settings = (data ?? []).reduce<Record<string, string>>(
    (acc, r) => ({ ...acc, [r.key as string]: String(r.value ?? '') }), {}
  )
  const getSetting = (key: string) => settings[key] ?? ''

  // Prendas que pueden llegar como referencia desde su ficha (?desde=slug).
  // Salen del catálogo en caché: no suman consultas a la base.
  const { products, categories } = await getCatalog()
  const categorySlug = new Map(categories.map((c) => [c.id, c.slug]))
  const referencias: EncargoReferencia[] = products.map((p) => ({
    slug: p.slug,
    name: p.name,
    category: p.category_id ? categorySlug.get(p.category_id) ?? null : null,
  }))

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(faqJsonLd) }}
      />
      <EncargoForm
        whatsappUrl={settings.contact_whatsapp_url || 'https://wa.me/59899850073'}
        encargosCupos={getEncargosCuposState(settings)}
        referencias={referencias}
        processEnabled={getSetting('pdp_process_enabled') === 'true'}
        processSteps={[
          { icon: getSetting('pdp_process_step_1_icon') || 'chat-text',  label: getSetting('pdp_process_step_1_label') || 'Escribís',        body: getSetting('pdp_process_step_1_body') || 'Contame qué prenda querés, tu medida y colores favoritos.' },
          { icon: getSetting('pdp_process_step_2_icon') || 'scissors',   label: getSetting('pdp_process_step_2_label') || 'Elegimos juntas', body: getSetting('pdp_process_step_2_body') || 'Te muestro las lanas disponibles y confirmamos todos los detalles.' },
          { icon: getSetting('pdp_process_step_3_icon') || 'needle',     label: getSetting('pdp_process_step_3_label') || 'Te lo tejo',      body: getSetting('pdp_process_step_3_body') || 'Trabajo en tu prenda y te aviso cuando está lista para enviar.' },
        ].filter((s) => s.label.trim())}
      />
    </>
  )
}
