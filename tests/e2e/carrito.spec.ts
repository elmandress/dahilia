// Carrito honesto y checkout único (WS1, 04/11/2026): el globito, el cajón,
// /carrito, la línea de envío gratis y el mensaje cuentan lo mismo; ningún
// doble toque duplica unidades ni pedidos; los errores dicen qué pasó.
// Igual que el resto: el guardián intercepta escrituras, fotos y WhatsApp. Las
// prendas son reales (lectura con la clave pública); lo "agotado" se simula
// solo dentro de la prueba, en la respuesta de GET /api/cart.
import type { Locator, Page, Route } from '@playwright/test'
import { test, expect, fetchProduct } from './support/guard'

type Producto = NonNullable<Awaited<ReturnType<typeof fetchProduct>>>
type Talle = { size: string; available?: boolean | null; sort_order?: number | null }

const pausa = (ms: number) => new Promise((r) => setTimeout(r, ms))
const pesos = (s: string | null | undefined) => Number(String(s ?? '').replace(/[^\d]/g, ''))
const textoWa = (url: string | null) => (url ? new URL(url).searchParams.get('text') ?? '' : '')

function talles(p: Producto): Talle[] {
  return [...((p.sizes as Talle[] | undefined) ?? [])].sort((a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99))
}
function disponibles(p: Producto): string[] {
  return talles(p).filter((s) => s.available !== false).map((s) => s.size)
}

/** Un ítem del carrito como lo devuelve GET /api/cart. */
function item(n: number, product: Producto, size: string, qty = 1) {
  return {
    id: `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`, cart_id: 'e2e',
    product_id: product.id, size, qty, added_at: new Date(2026, 10, 4, 12, n).toISOString(), product,
  }
}

/** GET /api/cart responde este carrito; el resto (POST, PATCH…) sigue al guardián. */
async function carritoFijo(page: Page, items: unknown[]) {
  await page.route('**/api/cart', (route: Route) =>
    route.request().method() === 'GET' ? route.fulfill({ json: { cartId: 'e2e', items } }) : route.fallback()
  )
}

async function producto(slug: string): Promise<Producto> {
  const p = await fetchProduct({ slug })
  expect(p, `no se pudo leer la prenda ${slug}`).not.toBeNull()
  return p!
}

const globito = (page: Page) => page.locator('header button[aria-label^="Abrir carrito"]')
const cajon = (page: Page) => page.locator('aside.cart-drawer')

/**
 * Anota cada window.open de la página (el checkout abre WhatsApp así). El
 * guardián guarda solo la última URL: para saber si un segundo toque reabrió
 * el MISMO pedido hace falta la lista.
 */
async function espiarAperturas(page: Page) {
  await page.addInitScript(() => {
    const w = window as Window & { __aperturas?: string[] }
    w.__aperturas = []
    const abrir = window.open.bind(window)
    window.open = (url?: string | URL, ...resto: [string?, string?]) => {
      if (url) w.__aperturas!.push(String(url))
      return abrir(url, ...resto)
    }
  })
}
const aperturas = (page: Page) => page.evaluate(() => (window as Window & { __aperturas?: string[] }).__aperturas ?? [])

test('cajón y /carrito cuentan solo lo pedible: sin la agotada ni el talle que ya no existe', async ({ page, guard }) => {
  const poncho = await producto('poncho-ete')
  const spring = await producto('spring-cardigan')
  const chaleco = await producto('chaleco')
  expect(talles(chaleco).some((s) => s.size === 'XL')).toBe(false)
  await carritoFijo(page, [
    item(1, poncho, disponibles(poncho)[0]),
    item(2, { ...spring, status: 'soldout' }, disponibles(spring)[0]),
    item(3, chaleco, 'XL'),
  ])

  await page.goto('/carrito')
  const resumen = page.locator('.cart-summary')
  const totalCarrito = pesos(await resumen.getByText(/^UYU [\d.]+$/).first().innerText())
  const envioCarrito = (await resumen.innerText()).match(/Te faltan UYU [\d.]+|✓ Envío gratis/)?.[0] ?? ''
  // El precio de la única pieza pedible (el final, el primero de la fila).
  const filaPoncho = page.locator('.cart-row').filter({ hasText: poncho.name })
  const precioPoncho = pesos((await filaPoncho.innerText()).match(/UYU [\d.]+/)?.[0])
  expect(totalCarrito).toBe(precioPoncho)

  // El globito cuenta 1 (antes, 3).
  await expect(globito(page)).toHaveAttribute('aria-label', 'Abrir carrito (1)')

  await globito(page).click()
  await expect(cajon(page)).toHaveJSProperty('inert', false)
  const textoCajon = await cajon(page).innerText()
  const subtotalCajon = pesos(textoCajon.match(/total\s*UYU ([\d.]+)/i)?.[1])
  const envioCajon = textoCajon.match(/Te faltan UYU [\d.]+|✓ Envío gratis/)?.[0] ?? ''
  expect(textoCajon).toMatch(/subtotal/i)
  expect(subtotalCajon).toBe(totalCarrito)
  expect(envioCajon.replace(/\.$/, '')).toBe(envioCarrito.replace(/\.$/, ''))
  // Las dos que no se pueden pedir se ven en gris, con su aviso, sin +/−.
  expect(textoCajon).toMatch(/ya no está disponible/i)
  expect(textoCajon).toMatch(/ese talle cambió/i)
  await expect(cajon(page).getByRole('button', { name: 'Sumar uno' })).toHaveCount(1)
  expect(guard.pageErrors).toEqual([])
})

test('carrito con todo agotado: sin "UYU 0" ni "Te faltan", y el botón abre WhatsApp con la prenda', async ({ page, guard }) => {
  const spring = await producto('spring-cardigan')
  await carritoFijo(page, [item(1, { ...spring, status: 'soldout' }, disponibles(spring)[0])])

  await page.goto('/carrito')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/tu carrito/i)
  await expect(page.getByText(spring.name).first()).toBeVisible()
  await expect(page.getByText(/UYU 0(?![\d.])/)).toHaveCount(0)
  await expect(page.getByText(/Te faltan/)).toHaveCount(0)

  // Nunca un botón mudo: el de WhatsApp del resumen abre el chat.
  const cta = page.locator('.cart-summary').locator('a, button').filter({ hasText: /whatsapp|volver a tejer/i }).first()
  await cta.click()
  await expect.poll(() => guard.whatsappUrl() ?? '', { timeout: 5000 }).toMatch(/wa\.me|api\.whatsapp\.com/)
  expect(textoWa(guard.whatsappUrl())).toContain(spring.name)
  expect(guard.orders.length).toBe(0)
})

test('doble toque en "Agregar" con la red lenta: un solo POST y cantidad 1', async ({ page }) => {
  let posts = 0
  await page.route('**/api/cart', async (route) => {
    if (route.request().method() === 'POST') {
      posts++
      await pausa(1200)
    }
    return route.fallback()
  })
  await page.goto('/tienda/bandana')
  const agregar = page.getByRole('button', { name: /agregar al carrito/i }).first()
  await agregar.click()
  await page.waitForTimeout(500)
  // Si el botón ya está trabado (deshabilitado), el segundo toque no hace nada.
  await agregar.click({ force: true, timeout: 2000 }).catch(() => {})
  await expect(cajon(page)).toHaveJSProperty('inert', false, { timeout: 8000 })
  await page.waitForTimeout(1500)
  expect(posts).toBe(1)
  await expect(cajon(page).getByText(/tu carrito \(1\)/i)).toBeVisible()
})

test('una pieza que se agota al agregarla: lo dice y el link lleva la prenda', async ({ page }) => {
  const bandana = await producto('bandana')
  await page.route('**/api/cart', (route) =>
    route.request().method() === 'POST'
      ? route.fulfill({ status: 409, json: { error: 'El producto no está disponible.' } })
      : route.fallback()
  )
  await page.goto('/tienda/bandana')
  await page.getByRole('button', { name: /agregar al carrito/i }).first().click()
  const aviso = page.locator('[role="alert"]').filter({ hasText: /agot/i })
  await expect(aviso).toBeVisible()
  await expect(aviso).not.toContainText(/intentá de nuevo/i)
  const href = await aviso.getByRole('link').getAttribute('href')
  expect(textoWa(href)).toContain(bandana.name)
  expect(textoWa(href)).not.toMatch(/no me está funcionando/i)
})

test('el cajón nunca agrega con un toque una pieza con 2 o más variantes', async ({ page }) => {
  // Un cardigan a pedido: la sugerencia más barata de otra categoría suele ser
  // Pulseras Terra (Lisas / Con lurex / Con caracolas).
  const spring = await producto('spring-cardigan')
  await carritoFijo(page, [item(1, spring, disponibles(spring)[0])])
  await page.goto('/tienda')
  await expect(globito(page)).toHaveAttribute('aria-label', 'Abrir carrito (1)')
  await globito(page).click()
  await expect(cajon(page)).toHaveJSProperty('inert', false)
  await expect(cajon(page).getByText(/sumale un detalle/i)).toBeVisible()

  const hrefs = await cajon(page).locator('a[href^="/tienda/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href') ?? ''))
  const slugs = [...new Set(hrefs.map((h) => h.replace('/tienda/', '').split('?')[0]))].filter((s) => s && s !== spring.slug)
  expect(slugs.length).toBeGreaterThan(0)
  let conVariantes = 0
  for (const slug of slugs) {
    const p = await producto(slug)
    if (disponibles(p).length < 2) continue
    conVariantes++
    await expect(cajon(page).locator(`button[aria-label^="Agregar ${p.name}"]`), `${slug} se agrega sin elegir`).toHaveCount(0)
    await expect(cajon(page).locator(`a[href="/tienda/${slug}"]`).filter({ hasText: /elegir/i })).toHaveCount(1)
  }
  test.info().annotations.push({ type: 'sugerencias con variantes', description: String(conVariantes) })
})

test('pedido desde el cajón: dos toques, el mismo link y un solo pedido registrado', async ({ page, guard }) => {
  await espiarAperturas(page)
  await page.goto('/tienda/bandana')
  await page.getByRole('button', { name: /agregar al carrito/i }).first().click()
  await expect(cajon(page)).toHaveJSProperty('inert', false)

  const pedir = cajon(page).getByRole('button', { name: /pedir por whatsapp/i })
  let otraVez: Locator
  if (await pedir.count()) {
    await pedir.click()
    otraVez = cajon(page).getByRole('button', { name: /pedir por whatsapp|abrir whatsapp de nuevo/i })
  } else {
    // Regla del cupón recordado o de la cola: el cajón manda a /carrito.
    await cajon(page).getByRole('button', { name: /ver carrito y pedir/i }).click()
    await page.waitForURL(/\/carrito$/)
    otraVez = page.locator('button[aria-label^="Coordinar pedido por WhatsApp"]:visible').first()
    await otraVez.click()
  }
  await expect.poll(async () => (await aperturas(page)).length, { timeout: 5000 }).toBe(1)
  const [primero] = await aperturas(page)
  expect(textoWa(primero)).toMatch(/Código de pedido: PED-[A-Z2-9]{6}/)
  await expect.poll(() => guard.orders.length).toBe(1)

  // Pasada la traba del doble toque: reabre el mismo pedido, sin registrar otro.
  await page.waitForTimeout(1500)
  await otraVez.click()
  await expect.poll(async () => (await aperturas(page)).length, { timeout: 5000 }).toBe(2)
  expect((await aperturas(page))[1]).toBe(primero)
  await page.waitForTimeout(800)
  expect(guard.orders.length).toBe(1)
  expect(guard.pageErrors).toEqual([])
})

test('en /carrito, dos toques con 1,5 s de diferencia: el mismo PED y un solo pedido', async ({ page, guard }) => {
  await espiarAperturas(page)
  await page.goto('/tienda/bandana')
  await page.getByRole('button', { name: /agregar al carrito/i }).first().click()
  await expect(globito(page)).toHaveAttribute('aria-label', 'Abrir carrito (1)')
  await page.goto('/carrito')
  const boton = page.locator('button[aria-label^="Coordinar pedido por WhatsApp"]:visible').first()
  await boton.click()
  await expect.poll(async () => (await aperturas(page)).length, { timeout: 5000 }).toBe(1)
  await page.waitForTimeout(1500)
  await boton.click()
  await expect.poll(async () => (await aperturas(page)).length, { timeout: 5000 }).toBe(2)
  const codigos = (await aperturas(page)).map((u) => textoWa(u).match(/PED-[A-Z2-9]{6}/)?.[0])
  expect(codigos[0]).toBeTruthy()
  expect(codigos[1]).toBe(codigos[0])
  await page.waitForTimeout(800)
  expect(guard.orders.length).toBe(1)
})

test('un GET viejo del carrito no borra la prenda que se acaba de agregar', async ({ page }) => {
  // El "servidor" de esta prueba: el GET devuelve la foto del momento en que
  // leyó la base, 2,5 s después (función fría, red lenta).
  let servidor: ReturnType<typeof item>[] = []
  await page.route('**/api/cart', async (route) => {
    const req = route.request()
    if (req.method() === 'GET') {
      const foto = JSON.parse(JSON.stringify(servidor))
      await pausa(2500)
      return route.fulfill({ json: { cartId: 'e2e', items: foto } })
    }
    if (req.method() === 'POST') {
      const body = JSON.parse(req.postData() || '{}') as { productId: string; size: string; qty?: number }
      const p = await fetchProduct({ id: body.productId })
      if (!p) return route.fulfill({ status: 409, json: { error: 'El producto no está disponible.' } })
      servidor = [...servidor, item(servidor.length + 1, p, body.size, body.qty ?? 1)]
      return route.fulfill({ json: { cartId: 'e2e', items: servidor } })
    }
    return route.fallback()
  })
  await page.goto('/tienda/bandana', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(300)
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
  await page.waitForTimeout(2600) // pasa la carga inicial
  // Volver a la pestaña (desde Instagram) pide el carrito otra vez...
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
  await page.waitForTimeout(150)
  // ...y la clienta toca Agregar mientras ese GET (vacío) está en vuelo.
  await page.getByRole('button', { name: /agregar al carrito/i }).first().click()
  await expect(globito(page)).toHaveAttribute('aria-label', 'Abrir carrito (1)')
  await page.waitForTimeout(3000)
  await expect(globito(page)).toHaveAttribute('aria-label', 'Abrir carrito (1)')
})
