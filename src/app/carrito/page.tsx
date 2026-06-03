import type { Metadata } from 'next'
import CarritoClient from './CarritoClient'

export const metadata: Metadata = {
  title: 'Tu carrito',
  description: 'Revisá tu selección antes de pasar al checkout.',
  alternates: { canonical: '/carrito' },
  robots: { index: false, follow: false },
}

export default function CarritoPage() {
  return <CarritoClient />
}
