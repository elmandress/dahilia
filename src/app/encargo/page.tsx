import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import EncargoForm from './EncargoForm'
import { getEncargosCuposState } from '@/components/EncargosDisponibles'
import { OG_BASE } from '@/lib/og'

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
    <EncargoForm
      whatsappUrl={settings.contact_whatsapp_url || 'https://wa.me/59899850073'}
      encargosCupos={getEncargosCuposState(settings)}
    />
  )
}
