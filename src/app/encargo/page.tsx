import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/public'
import EncargoForm from './EncargoForm'
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

export default async function EncargoPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', [
      'contact_whatsapp_url',
      'encargos_cupos_enabled', 'encargos_cupos_total', 'encargos_cupos_taken', 'encargos_cupos_label',
    ])

  const settings = (data ?? []).reduce<Record<string, string>>(
    (acc, r) => ({ ...acc, [r.key as string]: String(r.value ?? '') }), {}
  )
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <EncargoForm
        whatsappUrl={settings.contact_whatsapp_url || 'https://wa.me/59899850073'}
        encargosCupos={getEncargosCuposState(settings)}
      />
    </>
  )
}
