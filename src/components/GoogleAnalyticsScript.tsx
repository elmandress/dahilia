'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import { GA_MEASUREMENT_ID, ensureGtag } from '@/lib/analytics'
import { useAnalyticsAllowed } from '@/lib/use-analytics-allowed'

// Google Analytics 4 (gtag.js). Inerte hasta que exista
// NEXT_PUBLIC_GA_MEASUREMENT_ID en Netlify; al setearla, next.config.ts agrega
// solo los hosts de Google a la CSP (script-src/connect-src) en el mismo build.
//
// lazyOnload (13/09/2026, cambia la decisión R-08 de la auditoría del 12/09):
// gtag.js era el script más pesado de la home en el celular (Lighthouse: 171 KB,
// ~0,9 s de CPU, 73 KB sin usar). Solo la LIBRERÍA llega tarde: la cola de
// gtag (js + config) se arma apenas se sabe que se puede medir (ensureGtag,
// en analytics.ts), así ningún evento se pierde mientras tanto.
// No mide /admin ni el tráfico interno (use-analytics-allowed.ts).
export function GoogleAnalyticsScript() {
  const allowed = useAnalyticsAllowed()
  useEffect(() => {
    if (allowed) ensureGtag()
  }, [allowed])
  if (!GA_MEASUREMENT_ID || !allowed) return null
  return (
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      strategy="lazyOnload"
    />
  )
}
