// SEO técnico de cada plantilla: estado, title, description, canonical, un solo
// H1, Open Graph, datos estructurados válidos, robots y sitemap.
import { test, expect } from './support/guard'

const SITE = 'https://dahila.uy'
const PLANTILLAS: { ruta: string; tipos: string[]; indexable: boolean }[] = [
  { ruta: '/', tipos: ['Organization', 'WebSite'], indexable: true },
  { ruta: '/tienda', tipos: ['CollectionPage'], indexable: true },
  { ruta: '/tienda/cardigans', tipos: ['CollectionPage'], indexable: true },
  { ruta: '/tienda/spring-cardigan', tipos: ['ProductGroup', 'BreadcrumbList'], indexable: true },
  { ruta: '/tienda/bandana', tipos: ['Product', 'BreadcrumbList'], indexable: true },
  { ruta: '/blog', tipos: ['Blog'], indexable: true },
  { ruta: '/blog/regalos-tejidos-a-mano', tipos: ['BlogPosting', 'BreadcrumbList'], indexable: true },
  { ruta: '/encargo', tipos: ['Service'], indexable: true },
  { ruta: '/atelier', tipos: ['Person'], indexable: true },
  { ruta: '/carrito', tipos: [], indexable: false },
  { ruta: '/favoritos', tipos: [], indexable: false },
  { ruta: '/encargo/estado', tipos: [], indexable: false },
]

for (const p of PLANTILLAS) {
  test(`SEO de ${p.ruta}`, async ({ page }) => {
    const res = await page.goto(p.ruta)
    expect(res?.status()).toBe(200)
    const head = await page.evaluate(() => ({
      title: document.title,
      desc: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '',
      robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? '',
      ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content') ?? '',
      ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content') ?? '',
      lang: document.documentElement.lang,
      h1: document.querySelectorAll('h1').length,
      ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent ?? ''),
      imgsSinAlt: [...document.querySelectorAll('img')].filter((i) => !i.hasAttribute('alt')).length,
    }))
    expect(head.lang).toBe('es-UY')
    expect(head.title.length).toBeGreaterThan(10)
    expect(head.desc.length).toBeGreaterThan(50)
    expect(head.h1).toBe(1)
    expect(head.imgsSinAlt).toBe(0)
    if (p.indexable) {
      expect(head.robots).not.toMatch(/noindex/)
      expect(head.canonical).toBe(SITE + (p.ruta === '/' ? '' : p.ruta))
      expect(head.ogImage).toMatch(/^https:\/\/dahila\.uy\//)
      expect(head.ogTitle).not.toBe('')
    } else {
      expect(head.robots).toMatch(/noindex/)
    }
    // JSON-LD: parsea, no trae "<" sin escapar y tiene los tipos esperados.
    const tipos: string[] = []
    for (const raw of head.ld) {
      expect(raw).not.toContain('<')
      const data = JSON.parse(raw)
      for (const nodo of data['@graph'] ?? [data]) tipos.push(...[nodo['@type']].flat())
    }
    for (const t of p.tipos) expect(tipos).toContain(t)
  })
}

test('robots.txt y sitemap.xml', async ({ request }) => {
  const robots = await (await request.get('/robots.txt')).text()
  expect(robots).toMatch(/Sitemap: https:\/\/dahila\.uy\/sitemap\.xml/)
  expect(robots).toMatch(/Disallow: \/admin/)
  expect(robots).not.toMatch(/Disallow: \/\s*$/m)
  const sitemap = await (await request.get('/sitemap.xml')).text()
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => !/\/storage\/|\.(jpg|png|webp)/.test(u))
  expect(locs.length).toBeGreaterThan(50)
  expect(locs.some((u) => u === 'https://dahila.uy' || u === 'https://dahila.uy/')).toBe(true)
  for (const u of ['https://dahila.uy/tienda', 'https://dahila.uy/encargo', 'https://dahila.uy/blog']) expect(locs).toContain(u)
  expect(locs.some((u) => /\/(carrito|favoritos|admin|api)\b/.test(u))).toBe(false)
})

test('las imágenes para compartir existen', async ({ request }) => {
  for (const ruta of ['/og', '/tienda/spring-cardigan/og', '/tienda/cardigans/og', '/atelier/opengraph-image']) {
    const r = await request.get(ruta)
    expect(r.status(), ruta).toBe(200)
    expect(r.headers()['content-type'], ruta).toMatch(/image\//)
  }
})
