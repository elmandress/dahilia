// SEO técnico de cada plantilla: estado, title, description, canonical, un solo
// H1, Open Graph, datos estructurados válidos, robots y sitemap.
import type { APIRequestContext } from '@playwright/test'
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

// @og: la tarjeta de una ficha baja la foto de la prenda (Supabase, egress).
// La integración corre la suite con --grep-invert @og; esta va solo a mano.
test('las imágenes para compartir existen @og', async ({ request }) => {
  for (const ruta of ['/og', '/tienda/spring-cardigan/og']) {
    const r = await request.get(ruta)
    expect(r.status(), ruta).toBe(200)
    expect(r.headers()['content-type'], ruta).toMatch(/image\//)
  }
})

// ── Lo que se promete fuera del sitio (WS5, 04/11/2026) ──────────────────────
// Sin navegador: el HTML que devuelve el servidor es lo que leen Google,
// Merchant y las vistas previas (SEO-ARQ-1: la ficha elige el ?talle= recién
// en el navegador, así que abrir los links con JavaScript daría verde en falso).

type ItemFeed = {
  id: string
  group?: string
  link?: string
  price?: string
  sale?: string
  availability?: string
  minHandling?: string
}

const desescapar = (v: string | undefined) =>
  v?.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&')

async function leerFeed(request: APIRequestContext): Promise<ItemFeed[]> {
  const xml = await (await request.get('/merchant-feed.xml')).text()
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => {
    const g = (k: string) => desescapar(m[1].match(new RegExp(`<g:${k}>([^<]*)</g:${k}>`))?.[1])
    return {
      id: g('id') ?? '', group: g('item_group_id'), link: g('link'), price: g('price'), sale: g('sale_price'),
      availability: g('availability'), minHandling: g('min_handling_time'),
    }
  })
}

/** "2210.00 UYU" → 2210. */
const monto = (v: string | undefined) => Number.parseFloat(v ?? 'NaN')

/** La ficha de un ítem del feed: su grupo, o su id si va suelto. */
const fichaDe = (i: ItemFeed) => i.group ?? i.id

type Nodo = Record<string, unknown>

/** Todos los nodos de los JSON-LD del HTML, también los anidados (ofertas, migas). */
function nodosLd(html: string): Nodo[] {
  const todos = (x: unknown): Nodo[] => {
    if (Array.isArray(x)) return x.flatMap(todos)
    if (!x || typeof x !== 'object') return []
    return [x as Nodo, ...Object.values(x).flatMap(todos)]
  }
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((m) => todos(JSON.parse(m[1])))
}
const tiposDe = (n: Nodo) => [n['@type']].flat().map(String)

async function htmlDe(request: APIRequestContext, ruta: string) {
  const res = await request.get(ruta)
  return { status: res.status(), html: await res.text() }
}

test('feed: cada variante lleva su ?talle= y la ficha publica esa oferta, al mismo precio', async ({ request }) => {
  const variantes = (await leerFeed(request)).filter((i) => i.group)
  expect(variantes.length).toBeGreaterThan(0)
  for (const i of variantes) expect(i.link, i.id).toContain('?talle=')
  // Hasta 5 prendas: la oferta del JSON-LD con esa misma url, al precio del feed.
  for (const grupo of [...new Set(variantes.map((i) => i.group as string))].slice(0, 5)) {
    const ofertas = nodosLd((await htmlDe(request, `/tienda/${grupo}`)).html).filter((n) => tiposDe(n).includes('Offer'))
    for (const i of variantes.filter((v) => v.group === grupo)) {
      const oferta = ofertas.find((o) => o.url === i.link)
      expect(oferta, `${i.id}: no hay oferta con url ${i.link}`).toBeTruthy()
      expect(monto(String(oferta?.price)), i.id).toBe(monto(i.sale ?? i.price))
    }
  }
})

test('fichas en stock: ni "a tu medida" en el title ni "en tus colores" en la descripción', async ({ request }) => {
  const items = await leerFeed(request)
  const enStock = [...new Set(items.filter((i) => i.availability === 'in_stock' && i.minHandling === '0').map(fichaDe))]
  test.skip(enStock.length === 0, 'hoy el feed no tiene piezas en stock')
  for (const slug of enStock) {
    const { html } = await htmlDe(request, `/tienda/${slug}`)
    const title = desescapar(html.match(/<title>([^<]*)<\/title>/)?.[1]) ?? ''
    const desc = desescapar(html.match(/<meta name="description" content="([^"]*)"/)?.[1]) ?? ''
    expect(title, slug).not.toMatch(/a tu medida/i)
    expect(desc, slug).not.toMatch(/en tus colores/i)
  }
})

test('precio tachado: con rebaja en el feed, el JSON-LD trae el de lista como StrikethroughPrice', async ({ request }) => {
  const conRebaja = (await leerFeed(request)).find((i) => i.sale)
  test.skip(!conRebaja, 'hoy ninguna prenda tiene rebaja')
  const item = conRebaja as ItemFeed
  const tachados = nodosLd((await htmlDe(request, `/tienda/${fichaDe(item)}`)).html)
    .filter((n) => n.priceType === 'https://schema.org/StrikethroughPrice')
  expect(tachados.length, item.id).toBeGreaterThan(0)
  expect(tachados.map((n) => monto(String(n.price))), item.id).toContain(monto(item.price))
})

for (const ruta of ['/tienda/tops', '/colecciones/sunset-26']) {
  test(`${ruta}: la lista de prendas no publica Product (vive en cada ficha)`, async ({ request }) => {
    const { status, html } = await htmlDe(request, ruta)
    test.skip(status === 404, `${ruta} no existe hoy`)
    const nodos = nodosLd(html)
    expect(nodos.filter((n) => tiposDe(n).some((t) => t === 'Product' || t === 'ProductGroup' || t === 'Offer'))).toEqual([])
    expect(nodos.some((n) => tiposDe(n).includes('ItemList'))).toBe(true)
  })
}

test('colección: el title dice qué es y el JSON-LD trae las migas', async ({ request }) => {
  const { status, html } = await htmlDe(request, '/colecciones/sunset-26')
  test.skip(status === 404, 'la colección sunset-26 no existe hoy')
  const title = desescapar(html.match(/<title>([^<]*)<\/title>/)?.[1]) ?? ''
  expect(title.length, title).toBeGreaterThanOrEqual(35)
  expect(title).toMatch(/tejid/i)
  expect(nodosLd(html).some((n) => tiposDe(n).includes('BreadcrumbList'))).toBe(true)
})

test('llms.txt: el precio de spring-cardigan va con "desde" y sin plazos inventados', async ({ request }) => {
  const txt = await (await request.get('/llms.txt')).text()
  const linea = txt.split('\n').find((l) => l.includes('/tienda/spring-cardigan)'))
  test.skip(!linea, 'spring-cardigan no está en el catálogo de llms.txt')
  expect(linea).toMatch(/\): desde UYU [\d.]+/)
  expect(txt).not.toContain('2–6 semanas')
})

test('home: sameAs solo con perfiles de la marca, sin el link de WhatsApp', async ({ request }) => {
  const sameAs = nodosLd((await htmlDe(request, '/')).html).flatMap((n) => [n.sameAs ?? []].flat().map(String))
  expect(sameAs.length).toBeGreaterThan(0)
  expect(sameAs.filter((u) => /wa\.me|whatsapp/i.test(u))).toEqual([])
})
