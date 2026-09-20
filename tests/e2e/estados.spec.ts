// Estados fuera del camino feliz: vacíos, sin resultados, fotos rotas, sin
// conexión y celular en horizontal.
import { test, expect } from './support/guard'

test('carrito vacío: explica y ofrece seguir', async ({ page }) => {
  await page.goto('/carrito')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByRole('main').getByRole('link', { name: /tienda|colecci|ver/i }).first()).toBeVisible()
})

test('favoritos vacíos: explica y ofrece seguir', async ({ page }) => {
  await page.goto('/favoritos')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByRole('main').getByRole('link').first()).toBeVisible()
})

test('búsqueda sin resultados, con emojis y con texto larguísimo', async ({ page, guard }) => {
  for (const q of ['zzzqqq', '🧶👗', 'cardigan'.repeat(40), '<b>hola</b>']) {
    const res = await page.goto(`/tienda?q=${encodeURIComponent(q)}`)
    expect(res?.status(), q).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  }
  expect(guard.pageErrors).toEqual([])
})

test('si las fotos no cargan, la tienda sigue usable', async ({ page, guard }) => {
  await page.route(/\/_next\/image|supabase\.co\/storage/, (r) => r.abort())
  await page.goto('/tienda')
  const primera = page.locator('main a[href^="/tienda/"]').first()
  await expect(primera).toBeVisible()
  await primera.click()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByRole('button', { name: /agregar al carrito/i }).first()).toBeVisible()
  expect(guard.pageErrors).toEqual([])
})

test('sin conexión a mitad de la navegación no deja la página rota', async ({ page, context, guard }) => {
  await page.goto('/tienda')
  await context.setOffline(true)
  await page.locator('main a[href^="/tienda/"]').first().click().catch(() => {})
  await page.waitForTimeout(1500)
  await context.setOffline(false)
  // Al volver la red, recargar funciona y no quedaron errores de JS sin atrapar.
  await page.goto('/tienda')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  expect(guard.pageErrors.filter((e) => !/Failed to fetch|NetworkError|Load failed|ERR_INTERNET_DISCONNECTED/i.test(e))).toEqual([])
})

test.describe('celular en horizontal', () => {
  test.use({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true })
  test('la ficha y el carrito lateral entran en pantalla', async ({ page }) => {
    await page.goto('/tienda/bandana')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await page.getByRole('button', { name: /agregar al carrito/i }).first().click()
    const panel = page.getByRole('dialog').first()
    await expect(panel).toBeVisible()
    const box = await panel.boundingBox()
    expect(box!.height).toBeLessThanOrEqual(390 + 1)
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false)
  })
})

// Las páginas de servidor que importaban los colores desde Primitives (un
// módulo 'use client') recibían undefined en cada token: el botón de WhatsApp
// de /ig salía blanco sobre blanco. Los tokens viven en ui/tokens.ts.
test('las páginas de servidor reciben los colores de la marca', async ({ page, request }) => {
  for (const ruta of ['/ig', '/info', '/atelier', '/terminos', '/colecciones', '/blog', '/blog/regalos-tejidos-a-mano']) {
    const html = await (await request.get(ruta)).text()
    const rotos = html.match(/style="[^"]*undefined[^"]*"/g) ?? []
    expect(rotos, `${ruta} tiene estilos con undefined`).toEqual([])
  }
  await page.goto('/ig')
  const wa = page.getByRole('link', { name: /WhatsApp/ }).first()
  await expect(wa).toBeVisible()
  expect(await wa.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(30, 132, 73)')
  // El botón de cada nota hacia la tienda: era blanco sobre blanco.
  await page.goto('/blog/regalos-tejidos-a-mano')
  const cta = page.getByRole('main').getByRole('link', { name: 'Ver accesorios' }).first()
  expect(await cta.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(31, 26, 27)')
})
