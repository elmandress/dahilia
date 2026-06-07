import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Dahila Crochet',
    short_name: 'Dahila',
    description: 'Prendas únicas tejidas a crochet en Uruguay. Hechas a mano, a tu medida.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFBF2',
    theme_color: '#FFFFFF',
    lang: 'es-UY',
    categories: ['shopping', 'lifestyle'],
    icons: [
      { src: '/icon.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon.png', sizes: '512x512', type: 'image/png' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
