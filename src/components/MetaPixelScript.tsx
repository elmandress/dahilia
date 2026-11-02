'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'
import { META_PIXEL_ID, metaPageView } from '@/lib/meta-pixel'
import { useAnalyticsAllowed } from '@/lib/use-analytics-allowed'

// Píxel de Meta (ver src/lib/meta-pixel.ts). Inerte hasta que exista
// NEXT_PUBLIC_META_PIXEL_ID en Netlify; al setearla, next.config.ts agrega los
// hosts de Meta a la CSP en el mismo build.
//
// lazyOnload, igual que GA4 y Clarity: fbevents.js no compite con la primera
// pintura. La cola de fbq se arma antes (ensureFbq), así que la vista de la
// ficha y la vista de página no se pierden mientras tanto.
// No mide /admin ni el tráfico interno (use-analytics-allowed.ts).
export function MetaPixelScript() {
  const allowed = useAnalyticsAllowed()
  const pathname = usePathname()
  // El sitio navega sin recargar: una vista de página por cada ruta.
  useEffect(() => {
    if (allowed) metaPageView()
  }, [allowed, pathname])
  if (!META_PIXEL_ID || !allowed) return null
  return <Script src="https://connect.facebook.net/en_US/fbevents.js" strategy="lazyOnload" />
}
