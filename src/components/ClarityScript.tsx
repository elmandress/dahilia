'use client'

import Script from 'next/script'

// Microsoft Clarity — heatmaps y grabaciones de sesión, gratis y sin límite.
// Complementa a Umami (AnalyticsScript): Umami cuenta el embudo (qué pasa),
// Clarity muestra la sesión (por qué pasa). Inerte hasta que exista
// NEXT_PUBLIC_CLARITY_ID en Netlify; al setearla, next.config.ts agrega solo
// los hosts de Clarity a la CSP (script-src/connect-src) en el mismo build.
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID

export function ClarityScript() {
  if (!CLARITY_ID) return null
  return (
    <Script id="ms-clarity" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", ${JSON.stringify(CLARITY_ID)});`}
    </Script>
  )
}
