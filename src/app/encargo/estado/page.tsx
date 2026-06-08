import type { Metadata } from 'next'
import { Suspense } from 'react'
import { EstadoClient } from './EstadoClient'

export const metadata: Metadata = {
  title: 'Estado de tu encargo',
  description: 'Seguí el estado de tu encargo a medida con tu código.',
  alternates: { canonical: '/encargo/estado' },
  robots: { index: false, follow: false },
}

export default function EstadoPage() {
  return (
    <Suspense fallback={null}>
      <EstadoClient />
    </Suspense>
  )
}
