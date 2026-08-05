import { SITE_URL } from '@/lib/env'

// IndexNow: protocolo compartido por Bing, Yandex y otros — un solo POST
// avisa "esta URL cambió" y esos motores la recrawlean en minutos en vez de
// esperar su próximo rastreo programado. Google NO consume IndexNow (solo
// tiene su Indexing API, restringida por ToS a JobPosting/BroadcastEvent —
// usarla para productos arriesga el acceso), así que para Google el sitemap
// arreglado + Search Console siguen siendo el camino. Pero Bing sí lo usa
// directo, y el índice de Bing es lo que ChatGPT/Copilot consultan (ver
// README § Bing Webmaster) — este ping cierra ese loop sin intervención manual.
//
// La key NO es secreta: el protocolo exige publicarla en
// https://dahila.uy/<key>.txt para probar dominio propio (ver public/).
const INDEXNOW_KEY = 'a7f3d9c1b5e84f2a9d6c0b3e7f1a5d8c'

export function notifyIndexNow(paths: string[]): void {
  const urlList = paths
    .filter((p): p is string => typeof p === 'string' && p.trim() !== '')
    .map((p) => `${SITE_URL}${p.startsWith('/') ? p : `/${p}`}`)

  if (urlList.length === 0) return

  // Fire-and-forget: nunca debe demorar ni romper el guardado del producto
  // en el admin. Bing igual vuelve a rastrear el sitemap si esto falla.
  fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: new URL(SITE_URL).hostname,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList,
    }),
  }).catch(() => {})
}

export { INDEXNOW_KEY }
