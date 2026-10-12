// Lo agregado el 08/10/2026: "¿Qué talle soy?", tarjeta de regalo, lista de
// deseos compartida, el orden del admin en la tienda y /regalo en el sitemap.
// Igual que el resto: el guardián intercepta escrituras, fotos y WhatsApp.
import { test, expect } from './support/guard'

test('"¿Qué talle soy?" marca el talle con el busto y ofrece a medida fuera de tabla', async ({ page, guard }) => {
  await page.goto('/tienda/spring-cardigan')
  await page.getByRole('button', { name: /qué talle soy/i }).click()
  const dialog = page.getByRole('dialog', { name: /tabla de talles/i })
  await expect(dialog).toBeVisible()

  await dialog.getByLabel('Busto').fill('90')
  await expect(dialog.getByRole('status')).toContainText(/tu talle es\s*M/i)

  // Busto y cadera en talles distintos: se marca el más grande.
  await dialog.getByLabel(/cadera/i).fill('100')
  await expect(dialog.getByRole('status')).toContainText(/tu talle es\s*L/i)
  await expect(dialog.getByRole('status')).toContainText(/talles distintos/i)

  await dialog.getByLabel(/cadera/i).fill('')
  await dialog.getByLabel('Busto').fill('130')
  await expect(dialog.getByRole('status')).toContainText(/fuera de la tabla/i)
  await expect(dialog.getByRole('link', { name: /a medida/i })).toBeVisible()

  // Si la prenda viene en M, "Elegir talle M" la marca en la ficha.
  await dialog.getByLabel('Busto').fill('90')
  const elegir = dialog.getByRole('button', { name: /elegir talle m/i })
  if (await elegir.isVisible()) {
    await elegir.click()
    await expect(dialog).toBeHidden()
    await expect(page.locator('.pdp-sizes button[aria-pressed="true"]').first()).toHaveText(/^M$/i)
  }
  expect(guard.pageErrors).toEqual([])
})

test('tarjeta de regalo: montos reales, vista previa y pedido por WhatsApp', async ({ page, guard }) => {
  const res = await page.goto('/regalo')
  expect(res?.status()).toBe(200)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/regal/i)
  // Montos sugeridos sacados del catálogo (cada uno nombra una prenda).
  expect(await page.getByRole('button', { name: /alcanza para/i }).count()).toBeGreaterThan(0)

  // Sin datos: botón deshabilitado (no un link mudo).
  await expect(page.getByRole('button', { name: /pedir la tarjeta/i })).toBeDisabled()
  const pedir = page.getByRole('link', { name: /pedir la tarjeta/i })

  await page.getByLabel('Para', { exact: true }).fill('Lucía')
  await page.getByLabel('De parte de').fill('Mamá')
  await page.getByLabel(/mensaje/i).fill('Feliz cumple')
  await page.getByLabel('Otro monto').fill('2500')
  await expect(page.getByLabel('Vista previa de la tarjeta')).toContainText('Lucía')
  await expect(page.getByLabel('Vista previa de la tarjeta')).toContainText(/2\.?500/)

  await expect(pedir).toBeVisible()
  await Promise.all([page.waitForEvent('popup'), pedir.click()])
  await expect.poll(() => guard.whatsappUrl()).not.toBeNull()
  const text = new URL(guard.whatsappUrl()!).searchParams.get('text') ?? ''
  expect(text).toMatch(/tarjeta de regalo/i)
  expect(text).toMatch(/Para: Lucía/)
  expect(text).toMatch(/De parte de: Mamá/)
  expect(text).toMatch(/2\.?500/)
  expect(guard.pageErrors).toEqual([])
})

test('lista de deseos compartida: muestra las prendas y el nombre', async ({ page, guard }) => {
  await page.goto('/favoritos/compartida?p=spring-cardigan,bandana,no-existe&de=Ana')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/lo que le gusta a ana/i)
  await expect(page.locator('main a[href="/tienda/spring-cardigan"]').first()).toBeVisible()
  await expect(page.locator('main a[href="/tienda/bandana"]').first()).toBeVisible()
  await expect(page.locator('main a[href="/tienda/no-existe"]')).toHaveCount(0)
  await expect(page.getByRole('link', { name: /quiero regalarle una/i })).toHaveAttribute('href', /wa\.me|whatsapp/)
  expect(guard.pageErrors).toEqual([])
})

test('lista compartida vacía o rota: salida útil, sin error', async ({ page }) => {
  const res = await page.goto('/favoritos/compartida?p=no-existe')
  expect(res?.status()).toBe(200)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/vacía/i)
  await expect(page.getByRole('link', { name: /ver la tienda/i })).toBeVisible()
})

test('la tienda respeta el orden que se arma en el admin', async ({ page }) => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  test.skip(!url || !key, 'faltan las claves públicas en .env.local')
  const rows = await (await fetch(`${url}/rest/v1/products?status=eq.active&select=slug,sort_order&order=sort_order.asc`, {
    headers: { apikey: key!, Authorization: `Bearer ${key}` },
  })).json() as Array<{ slug: string }>
  const order = rows.map((r) => r.slug)

  await page.goto('/tienda')
  await expect(page.getByRole('combobox').filter({ hasText: /destacados/i }).first()).toBeVisible()
  const hrefs = await page.locator('main a[href^="/tienda/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href') ?? ''))
  const seen = [...new Set(hrefs.map((h) => h.replace('/tienda/', '')))].filter((s) => order.includes(s)).slice(0, 8)
  expect(seen.length).toBeGreaterThan(3)
  const idx = seen.map((s) => order.indexOf(s))
  expect(idx).toEqual([...idx].sort((a, b) => a - b))
})

test('el sitemap incluye /regalo', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text()
  expect(xml).toContain('/regalo</loc>')
})

// Vocabulario uruguayo (lib/vocabulario.ts): antes "buzo", "saco" y
// "musculosa" daban 0 resultados.
for (const [palabra, categoria] of [['buzo', 'sweaters'], ['saco', 'cardigans'], ['musculosa', 'tops']] as const) {
  test(`buscar "${palabra}" encuentra ${categoria}`, async ({ request }) => {
    const res = await request.get(`/api/search?q=${palabra}`)
    const { results } = await res.json() as { results: Array<{ slug: string }> }
    expect(results.length).toBeGreaterThan(0)
  })
}

test('la grilla de /tienda también entiende "buzo"', async ({ page }) => {
  await page.goto('/tienda?q=buzo')
  await expect(page.getByText(/no encontramos/i)).toHaveCount(0)
  expect(await page.locator('main a[href^="/tienda/"]').count()).toBeGreaterThan(0)
})

test('la ficha de un cardigan lleva "saco" en el título', async ({ page }) => {
  await page.goto('/tienda/spring-cardigan')
  await expect(page).toHaveTitle(/saco tejido a mano/i)
})

// Barra fija de "Agregar" (12/10/2026): no tapa nombre y precio al entrar;
// aparece recién cuando el botón principal salió de pantalla.
test('barra fija de la ficha: escondida arriba, visible al pasar el botón', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('celular'), 'la barra existe solo en el celular')
  await page.goto('/tienda/spring-cardigan')
  const bar = page.locator('.pdp-sticky-bar')
  await expect(bar).not.toHaveClass(/is-visible/)
  await expect(page.getByRole('heading', { level: 1 })).toBeInViewport()
  await page.getByRole('button', { name: /agregar al carrito/i }).first().scrollIntoViewIfNeeded()
  await page.mouse.wheel(0, 1600)
  await expect(bar).toHaveClass(/is-visible/)
})

// Lista privada (12/10/2026): página propia, un solo popup (el de tejedoras
// dejó de existir) y el título visible sobre el fondo oscuro.
test('/vip: título visible y formulario a mano', async ({ page }) => {
  const res = await page.goto('/vip')
  expect(res?.status()).toBe(200)
  const h1 = page.getByRole('heading', { level: 1 })
  await expect(h1).toBeVisible()
  // El color tiene que ser claro: un h1 oscuro sobre el fondo negro no se ve.
  const color = await h1.evaluate((el) => getComputedStyle(el).color)
  expect(color).not.toBe('rgb(31, 26, 27)')
  await expect(page.getByRole('textbox', { name: 'Tu email', exact: true })).toBeVisible()
  // El formulario del pie no se repite en esta página.
  await expect(page.getByRole('textbox', { name: /para la lista privada/i })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /entrar a la lista/i })).toBeVisible()
})

test('un solo popup: la lista privada sale, la de tejedoras no', async ({ page }) => {
  test.setTimeout(60_000)
  await page.goto('/')
  await page.waitForTimeout(13_500)
  await expect(page.getByRole('complementary', { name: /lista privada/i })).toBeVisible()
  await expect(page.getByText(/¿tejés a crochet/i)).toHaveCount(0)
})

test('el popup de la lista no interrumpe el carrito', async ({ page }) => {
  test.setTimeout(60_000)
  await page.goto('/carrito')
  await page.waitForTimeout(13_500)
  await expect(page.getByRole('complementary', { name: /lista privada/i })).toHaveCount(0)
})

// Mails de la lista (12/10/2026): sin el secreto no se dispara nada, y la
// baja no acepta un link fabricado. Ninguna de estas pruebas manda mails.
test('el aviso automático a la lista no se puede disparar sin el secreto', async ({ request }) => {
  const res = await request.get('/api/cron/lista-privada')
  expect(res.status()).toBe(401)
})

test('la baja rechaza un link con firma inválida', async ({ request }) => {
  const res = await request.post('/api/lista/baja?e=alguien%40ejemplo.com&t=firma-falsa')
  expect(res.status()).toBe(400)
})

test('/baja sin datos explica qué hacer', async ({ page }) => {
  const res = await page.goto('/baja')
  expect(res?.status()).toBe(200)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/no funcionó/i)
})

test('/ig: tienda, regalo y lista privada a un toque', async ({ page, guard }) => {
  await page.goto('/ig')
  const nav = page.getByRole('navigation', { name: 'Enlaces' })
  await expect(nav.getByRole('link', { name: /toda la tienda/i })).toBeVisible()
  await expect(nav.getByRole('link', { name: /tarjeta de regalo/i })).toBeVisible()
  await expect(nav.getByRole('link', { name: /lista privada/i })).toHaveAttribute('href', '/vip')
  expect(guard.pageErrors).toEqual([])
})

// Seguimiento de pedidos, /gracias y redirecciones (12/10/2026).
test('/pedido: sin código pide el código; con uno inexistente lo dice', async ({ page }) => {
  await page.goto('/pedido')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/seguí tu pedido/i)
  await page.getByLabel('Código de pedido').fill('PED-ZZZZZZ')
  await page.getByRole('button', { name: /ver estado/i }).click()
  await expect(page).toHaveURL(/codigo=PED-ZZZZZZ/)
  await expect(page.getByRole('status').filter({ hasText: /no encontramos|no pudimos buscar/i })).toBeVisible()
})

test('el pedido por WhatsApp lleva su código de seguimiento', async ({ page, guard }) => {
  await page.goto('/tienda/bandana')
  await page.getByRole('button', { name: /agregar al carrito/i }).first().click()
  await page.goto('/carrito')
  await page.locator('button[aria-label^="Coordinar pedido por WhatsApp"]:visible').first().click()
  await expect.poll(() => guard.whatsappUrl()).not.toBeNull()
  const text = new URL(guard.whatsappUrl()!).searchParams.get('text') ?? ''
  const m = text.match(/Código de pedido: (PED-[A-Z2-9]{6})/)
  expect(m).not.toBeNull()
  await expect.poll(() => guard.orders.length).toBe(1)
  expect(JSON.stringify(guard.orders[0])).toContain(m![1])
})

test('/gracias: nota, regalo aplicable, cuidados y lista', async ({ page, guard }) => {
  const res = await page.goto('/gracias')
  expect(res?.status()).toBe(200)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByRole('heading', { name: /para que te dure años/i })).toBeVisible()
  const usar = page.getByRole('button', { name: /usarlo ahora/i })
  if (await usar.count()) {
    await usar.click()
    await expect(page).toHaveURL(/\/tienda/)
    expect(await page.evaluate(() => sessionStorage.getItem('dahila_coupon_code'))).toBeTruthy()
  }
  expect(guard.pageErrors).toEqual([])
})

test('las URLs con error de tipeo redirigen a la nota correcta', async ({ request }) => {
  const r1 = await request.get('/blog/como-guardar-prendas-tejas', { maxRedirects: 0 })
  expect(r1.status()).toBe(308)
  expect(r1.headers()['location']).toContain('/blog/como-guardar-prendas-tejidas')
  const r2 = await request.get('/blog/el-crochet-se-hace-a-machine', { maxRedirects: 0 })
  expect(r2.headers()['location']).toContain('/blog/el-crochet-se-hace-a-maquina')
})
