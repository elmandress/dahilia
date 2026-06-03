import type { Metadata } from 'next'
import EncargoForm from './EncargoForm'

export const metadata: Metadata = {
  title: 'Encargos a medida',
  description: 'Pedí tu prenda de crochet a medida. Te respondo en 48hs con boceto y presupuesto.',
  alternates: { canonical: '/encargo' },
  openGraph: {
    title: 'Encargos a medida | Dahila Crochet',
    description: 'Pedí tu prenda de crochet a medida. Te respondo en 48hs con boceto y presupuesto.',
    url: '/encargo',
  },
}

export default function EncargoPage() {
  return <EncargoForm />
}
