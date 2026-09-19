// Recorridos principales de una persona que no conoce Dahila: llega, entiende
// qué es, explora, elige, coordina por WhatsApp y el pedido queda registrado.
import { test, expect } from './support/guard'

test('llega al sitio y entiende qué es y qué puede hacer', async ({ page, guard }) => {
  const res = await page.goto('/')
  expect(res?.status()).toBe(200)
  const h1 = page.getByRole('heading', { level: 1 })
  await expect(h1).toHaveCount(1)
  await expect(h1).not.toBeEmpty()
  // Un camino claro a la tienda, sin tener que bajar.
  const cta = page.getByRole('main').getByRole('link', { name: /tienda|colecci|ver (las )?prendas/i }).first()
  await expect(cta).toBeVisible()
  expect(guard.pageErrors).toEqual([])
})

test('explora la tienda y abre una ficha con precio', async ({ page }) => {
  await page.goto('/tienda')
  const cards = page.locator('main a[href^="/tienda/"]')
  expect(await cards.count()).toBeGreaterThan(6)
  await page.goto('/tienda/spring-cardigan')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/spring cardigan/i)
  await expect(page.getByText(/UYU\s?\d/).first()).toBeVisible()
})

test('agrega al carrito y coordina por WhatsApp con el pedido completo', async ({ page, guard }) => {
  await page.goto('/tienda/spring-cardigan')
  await page.getByRole('button', { name: /agregar al carrito/i }).first().click()
  // El carrito lateral confirma lo que se agregó.
  await expect(page.getByText(/tu carrito/i).first()).toBeVisible()
  await page.goto('/carrito')
  await expect(page.getByText('Spring cardigan').first()).toBeVisible()
  await page.locator('button[aria-label^="Coordinar pedido por WhatsApp"]:visible').first().click()
  await expect.poll(() => guard.whatsappUrl()).not.toBeNull()
  const text = new URL(guard.whatsappUrl()!).searchParams.get('text') ?? ''
  expect(text).toMatch(/Spring cardigan/)
  expect(text).toMatch(/Talle: \w+/)
  expect(text).toMatch(/Total: UYU/)
  expect(text).toMatch(/dahila\.uy\/tienda\/spring-cardigan/)
  // El pedido quedó registrado (en la prueba, capturado sin escribir en la base).
  await expect.poll(() => guard.orders.length).toBe(1)
  expect(JSON.stringify(guard.orders[0])).toMatch(/spring-cardigan/)
  expect(guard.pageErrors).toEqual([])
})

test('doble clic en WhatsApp registra un solo pedido', async ({ page, guard }) => {
  await page.goto('/tienda/bandana')
  await page.getByRole('button', { name: /agregar al carrito/i }).first().click()
  await page.goto('/carrito')
  const boton = page.locator('button[aria-label^="Coordinar pedido por WhatsApp"]:visible').first()
  await boton.dblclick()
  await page.waitForTimeout(1500)
  expect(guard.orders.length).toBe(1)
})

test('un producto que no existe da 404 con salida útil', async ({ page }) => {
  const res = await page.goto('/tienda/producto-que-no-existe')
  expect(res?.status()).toBe(404)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByRole('main').getByRole('link', { name: /tienda|colecci/i }).first()).toBeVisible()
})

test('atrás, adelante y recargar no rompen nada', async ({ page, guard }) => {
  await page.goto('/')
  await page.goto('/tienda')
  await page.goto('/tienda/bandana')
  await page.goBack()
  await expect(page).toHaveURL(/\/tienda$/)
  await page.goForward()
  await expect(page).toHaveURL(/\/tienda\/bandana$/)
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/bandana/i)
  expect(guard.pageErrors).toEqual([])
})

test('si el carrito no responde, lo dice en vez de fingir que agregó', async ({ page, guard }) => {
  await page.goto('/tienda/bandana')
  guard.failCart(true)
  await page.getByRole('button', { name: /agregar al carrito/i }).first().click()
  await page.waitForTimeout(1200)
  // No debe aparecer la confirmación de agregado.
  await expect(page.getByText(/✓ agregado/i)).toHaveCount(0)
  expect(guard.pageErrors).toEqual([])
})
