import type { Metadata } from 'next'
import ContactoClient from './ContactoClient'

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Escribime por mail, WhatsApp o Instagram. Te respondo en 48hs.',
  alternates: { canonical: '/contacto' },
  openGraph: {
    title: 'Contacto | Dahila Crochet',
    description: 'Escribime por mail, WhatsApp o Instagram. Te respondo en 48hs.',
    url: '/contacto',
  },
}

export default function ContactoPage() {
  return <ContactoClient />
}
