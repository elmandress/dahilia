import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getCatalog } from '@/lib/catalog'
import { EstadoClient } from './EstadoClient'

export const metadata: Metadata = {
  title: 'Estado de tu encargo',
  description: 'Seguí el estado de tu encargo a medida con tu código.',
  alternates: { canonical: '/encargo/estado' },
  robots: { index: false, follow: false },
}

export default async function EstadoPage() {
  // El número de WhatsApp sale del catálogo cacheado (mismos settings que usa
  // el layout): cero consultas nuevas a Supabase por esta página.
  const { settings } = await getCatalog()
  const whatsappUrl = settings.contact_whatsapp_url?.trim() || 'https://wa.me/59899850073'
  // Título y explicación desde el servidor: quien llega por el link del mail ve
  // la página enseguida, aunque el formulario (que lee ?codigo= de la URL)
  // todavía no haya cargado.
  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '48px 24px 80px' }}>
      <span className="eyebrow" style={{ color: 'var(--ink-500)' }}>Seguimiento</span>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 'clamp(28px, 5vw, 40px)',
        lineHeight: 1.05, letterSpacing: '-0.02em', color: 'var(--ink-900)', margin: '10px 0 8px',
      }}>Estado de tu encargo</h1>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 300, color: 'var(--ink-700)', margin: '0 0 28px' }}>
        Ingresá el código que te dimos al hacer el encargo (ej. DAH-AB2CDE).
      </p>
      <Suspense fallback={null}>
        <EstadoClient whatsappUrl={whatsappUrl} />
      </Suspense>
    </div>
  )
}
