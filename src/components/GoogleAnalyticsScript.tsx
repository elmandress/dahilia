'use client'

import Script from 'next/script'

// Google Analytics 4 (gtag.js). Inerte hasta que exista
// NEXT_PUBLIC_GA_MEASUREMENT_ID en Netlify; al setearla, next.config.ts agrega
// solo los hosts de Google a la CSP (script-src/connect-src) en el mismo build.
// Los 15 eventos ya instrumentados con track() (src/lib/analytics.ts) llegan
// acá solos — no hace falta tocar los componentes que ya llaman track().
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

// lazyOnload (13/09/2026, cambia la decisión R-08 de la auditoría del 12/09):
// gtag.js era el script más pesado de la home en el celular (Lighthouse: 171 KB,
// ~0,9 s de CPU, 73 KB sin usar). Ahora carga cuando la página terminó de
// cargar. Trade-off aceptado: GA puede perder alguna visita de menos de un par
// de segundos; Umami (AnalyticsScript) sigue en afterInteractive y la base es
// la fuente de verdad de pedidos y carritos.
export function GoogleAnalyticsScript() {
  if (!GA_MEASUREMENT_ID) return null
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="lazyOnload"
      />
      <Script id="ga4-init" strategy="lazyOnload">
        {`window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', ${JSON.stringify(GA_MEASUREMENT_ID)});`}
      </Script>
    </>
  )
}
