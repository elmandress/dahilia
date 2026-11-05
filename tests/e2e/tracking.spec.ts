// La medición de Meta, probada sin tocar Meta (TRK-01, TRK-04 y TRK-06; WS5,
// 04/11/2026). Solo tiene sentido contra un build con un ID de píxel de prueba
// (NEXT_PUBLIC_META_PIXEL_ID=000000000000000, sin META_CAPI_TOKEN): ahí fbq
// existe, el guardián aborta fbevents.js y facebook.com, y lo que iría a
// /api/meta se queda en guard.metaEvents. Sin píxel en el build (window.fbq no
// existe), cada prueba se saltea.
//
// Los ids que recibe Meta tienen que ser los del feed (merchant-feed.xml): es
// lo que va a leer un catálogo de Meta el día que se cree.
import type { APIRequestContext, Page } from '@playwright/test'
import { test, expect, fetchProduct } from './support/guard'

type LlamadaFbq = unknown[]
type DatosMeta = { content_type?: string; content_ids?: string[]; value?: number }

/** ¿El build trae el píxel? Se sabe recién después de hidratar la ficha. */
async function hayPixel(page: Page): Promise<boolean> {
  await page.locator('.producto-detail').waitFor()
  return page
    .waitForFunction(() => typeof (window as unknown as { fbq?: unknown }).fbq === 'function', null, { timeout: 5000 })
    .then(() => true, () => false)
}

/** La cola del píxel: fbevents.js está abortado, así que nada la consume. */
async function colaFbq(page: Page): Promise<LlamadaFbq[]> {
  return page.evaluate(() => {
    const fbq = (window as unknown as { fbq?: { queue?: ArrayLike<unknown>[] } }).fbq
    return (fbq?.queue ?? []).map((a) => Array.from(a))
  })
}

async function eventos(page: Page, nombre: string): Promise<LlamadaFbq[]> {
  return (await colaFbq(page)).filter((a) => a[0] === 'track' && a[1] === nombre)
}

/** El primer evento con ese nombre, cuando llega. */
async function primero(page: Page, nombre: string): Promise<DatosMeta> {
  await expect.poll(async () => (await eventos(page, nombre)).length, { message: `sin ${nombre}` }).toBeGreaterThan(0)
  return (await eventos(page, nombre))[0][2] as DatosMeta
}

async function idsDelFeed(request: APIRequestContext): Promise<Set<string>> {
  const xml = await (await request.get('/merchant-feed.xml')).text()
  const un = (v: string) => v.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&')
  return new Set([...xml.matchAll(/<g:id>([^<]*)<\/g:id>/g)].map((m) => un(m[1])))
}

type Talle = { size: string; available?: boolean | null }
const talles = (p: Record<string, unknown> | null) => (p?.sizes as Talle[] | undefined) ?? []

test('ViewContent: product en una prenda sin talles, product_group en una con talles', async ({ page }) => {
  const [bandana, spring] = await Promise.all([fetchProduct({ slug: 'bandana' }), fetchProduct({ slug: 'spring-cardigan' })])
  test.skip(!bandana || talles(bandana).length > 0, 'bandana ya no es una prenda sin talles')
  test.skip(!spring || talles(spring).length < 2, 'spring-cardigan ya no tiene talles')

  await page.goto('/tienda/bandana')
  test.skip(!(await hayPixel(page)), 'este build no tiene el ID de píxel de prueba')
  const vista = await primero(page, 'ViewContent')
  expect(vista.content_type).toBe('product')
  expect(vista.content_ids).toEqual(['bandana'])

  await page.goto('/tienda/spring-cardigan')
  await hayPixel(page)
  const grupo = await primero(page, 'ViewContent')
  expect(grupo.content_type).toBe('product_group')
  expect(grupo.content_ids).toEqual(['spring-cardigan'])
})

test('AddToCart: los content_ids son ids del feed (con talle y con "Único")', async ({ page, request }) => {
  const ids = await idsDelFeed(request)
  const spring = await fetchProduct({ slug: 'spring-cardigan' })
  test.skip(!talles(spring).some((t) => t.available !== false), 'spring-cardigan no tiene talles disponibles')

  await page.goto('/tienda/spring-cardigan')
  test.skip(!(await hayPixel(page)), 'este build no tiene el ID de píxel de prueba')
  await page.locator('.pdp-sizes button:not([disabled])').first().click()
  await page.locator('[data-pdp-cta]').click()
  const agregado = await primero(page, 'AddToCart')
  expect(agregado.content_type).toBe('product')
  expect(agregado.content_ids?.length).toBeGreaterThan(0)
  for (const id of agregado.content_ids ?? []) expect(ids.has(id), `${id} no es un g:id del feed`).toBe(true)

  // El Sweater net tiene una sola fila, "Único": su id es el slug, como en el
  // feed (antes Meta recibía 'sweater-net' y el feed decía 'sweater-net-Único').
  const net = await fetchProduct({ slug: 'sweater-net' })
  if (net && net.status === 'active' && talles(net).some((t) => t.available !== false)) {
    await page.goto('/tienda/sweater-net')
    await hayPixel(page)
    await page.locator('[data-pdp-cta]').click()
    const unico = await primero(page, 'AddToCart')
    for (const id of unico.content_ids ?? []) expect(ids.has(id), `${id} no es un g:id del feed`).toBe(true)
  }
})

test('el eventID del píxel es el event_id que iría a /api/meta', async ({ page, guard }) => {
  await page.goto('/tienda/bandana')
  test.skip(!(await hayPixel(page)), 'este build no tiene el ID de píxel de prueba')
  await expect.poll(() => guard.metaEvents.length, { message: 'nada interceptado en /api/meta' }).toBeGreaterThan(0)
  const delPixel = (await colaFbq(page))
    .filter((a) => a[0] === 'track')
    .map((a) => (a[3] as { eventID?: string } | undefined)?.eventID)
  const delServidor = guard.metaEvents.map((b) => (b as { event_id?: string } | null)?.event_id)
  for (const id of delServidor) {
    expect(id).toBeTruthy()
    expect(delPixel).toContain(id)
  }
})

test('AddToWishlist y Contact desde la ficha dicen qué prenda (no llegan vacíos)', async ({ page, request }) => {
  const ids = await idsDelFeed(request)
  await page.goto('/tienda/bandana')
  test.skip(!(await hayPixel(page)), 'este build no tiene el ID de píxel de prueba')
  await page.locator('.producto-detail').getByRole('button', { name: 'Guardar en favoritos' }).click()
  const guardado = await primero(page, 'AddToWishlist')
  expect(guardado.content_ids).toEqual(['bandana'])
  expect(guardado.value).toBeGreaterThan(0)

  await page.locator('.producto-detail a[href*="wa.me"]').first().click()
  const consulta = await primero(page, 'Contact')
  expect(consulta.content_ids?.length).toBeGreaterThan(0)
  for (const id of consulta.content_ids ?? []) expect(ids.has(id), `${id} no es un g:id del feed`).toBe(true)
  expect(consulta.value).toBeGreaterThan(0)
})

test('nada llega a facebook.com: ni fbevents.js ni los eventos', async ({ page }) => {
  const aMeta: string[] = []
  // Un pedido abortado por el guardián dispara "request" pero nunca termina:
  // se cuentan los que terminaron (o sea, los que de verdad salieron).
  page.on('requestfinished', (r) => { if (/facebook\.(com|net)/.test(r.url())) aMeta.push(r.url()) })
  await page.goto('/tienda/spring-cardigan')
  test.skip(!(await hayPixel(page)), 'este build no tiene el ID de píxel de prueba')
  await page.locator('.pdp-sizes button:not([disabled])').first().click()
  await page.locator('[data-pdp-cta]').click()
  await primero(page, 'AddToCart')
  // fbevents.js carga con lazyOnload: se le da tiempo a intentarlo.
  await page.waitForTimeout(1500)
  expect(aMeta).toEqual([])
})
