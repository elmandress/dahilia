'use client'

import Script from 'next/script'
import { useAnalyticsAllowed } from '@/lib/use-analytics-allowed'

// Microsoft Clarity — heatmaps y grabaciones de sesión, gratis y sin límite.
// Complementa a Umami (AnalyticsScript): Umami cuenta el embudo (qué pasa),
// Clarity muestra la sesión (por qué pasa). Inerte hasta que exista
// NEXT_PUBLIC_CLARITY_ID en Netlify; al setearla, next.config.ts agrega solo
// los hosts de Clarity a la CSP (script-src/connect-src) en el mismo build.
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID

// lazyOnload (13/09/2026): Clarity graba el DOM entero y es de lo más pesado
// que corre en la página. Con afterInteractive competía con la primera pintura
// en el celular (Lighthouse: la foto de la home tardaba 1,4 s en pintarse ya
// descargada). Ahora arranca cuando la página terminó de cargar: se pierde el
// primer par de segundos de cada grabación, no la sesión.
// No graba /admin ni el tráfico interno (use-analytics-allowed.ts).
export function ClarityScript() {
  const allowed = useAnalyticsAllowed()
  if (!CLARITY_ID || !allowed) return null
  // Grabaciones y mapas de calor sí; publicidad no (19/09/2026). Lighthouse
  // encontró 8 cookies de terceros en producción, todas de Clarity, entre
  // ellas el ID publicitario de Microsoft (MUID) sincronizado con
  // c.bing.com. Dahila no usa Microsoft Ads: ese rastreo no le sirve a
  // Anush y sí le pone un identificador publicitario a cada clienta. Según
  // la API ConsentV2 de Clarity, ad_Storage "denied" corta lo publicitario
  // y analytics_Storage "granted" mantiene todas las funciones de Clarity.
  // La llamada entra en la cola que arma el snippet, antes de que cargue.
  return (
    <Script id="ms-clarity" strategy="lazyOnload">
      {`(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", ${JSON.stringify(CLARITY_ID)});
      window.clarity("consentv2", { ad_Storage: "denied", analytics_Storage: "granted" });`}
    </Script>
  )
}
