// Accesibilidad: axe (WCAG 2.0/2.1/2.2 A y AA) en las plantillas principales, y
// lo que axe no ve: teclado, trampas de foco y devolución del foco.
// Que axe dé cero no significa "accesible": el lector de pantalla real y el
// zoom al 200% siguen siendo revisión manual (ver research/…§19).
import AxeBuilder from '@axe-core/playwright'
import { test, expect, scrollThrough } from './support/guard'

const PAGINAS = ['/', '/tienda', '/tienda/cardigans', '/tienda/spring-cardigan', '/carrito', '/encargo', '/encargo/estado', '/atelier', '/blog', '/blog/regalos-tejidos-a-mano', '/info', '/contacto', '/tejedoras', '/tienda/no-existe']

for (const ruta of PAGINAS) {
  test(`axe sin violaciones en ${ruta}`, async ({ page }) => {
    test.setTimeout(120_000)
    await page.goto(ruta)
    await scrollThrough(page)
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze()
    const resumen = violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)
    expect(resumen).toEqual([])
  })
}

test('teclado: "saltar al contenido" es lo primero y lleva al contenido', async ({ page, browserName }, testInfo) => {
  test.skip(testInfo.project.name.includes('celular'), 'teclado físico: se prueba en escritorio')
  void browserName
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.locator(':focus')).toHaveText(/saltar al contenido/i)
  await page.keyboard.press('Enter')
  await page.keyboard.press('Tab')
  expect(await page.evaluate(() => !!document.activeElement?.closest('main'))).toBe(true)
})

test('menú del celular: el foco entra, no se escapa y vuelve al cerrar', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('celular'), 'el menú hamburguesa es del celular')
  await page.goto('/')
  const boton = page.getByRole('button', { name: 'Menú', exact: true })
  await boton.focus()
  await page.keyboard.press('Enter')
  await expect.poll(() => page.evaluate(() => !!document.activeElement?.closest('#mobile-menu'))).toBe(true)
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press('Tab')
    expect(await page.evaluate(() => !!document.activeElement?.closest('#mobile-menu'))).toBe(true)
  }
  await page.keyboard.press('Escape')
  await expect(boton).toBeFocused()
})

test('buscador: Escape cierra y el foco vuelve al botón Buscar', async ({ page }) => {
  await page.goto('/')
  const buscar = page.getByRole('button', { name: 'Buscar' })
  await buscar.click()
  await expect(page.getByRole('textbox', { name: /buscar prendas/i })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Buscar' })).toBeFocused()
})

test('carrito lateral: el foco entra, Escape cierra y el foco vuelve', async ({ page }) => {
  await page.goto('/tienda/bandana')
  const agregar = page.getByRole('button', { name: /agregar al carrito/i }).first()
  await agregar.click()
  // Cerrado, el panel queda en el DOM fuera de pantalla con inert: por eso se
  // mira inert y no la visibilidad (para Playwright, fuera de pantalla es visible).
  const panel = page.locator('[role="dialog"][aria-modal="true"]').first()
  await expect(panel).toHaveJSProperty('inert', false)
  await expect(page.getByRole('button', { name: 'Cerrar carrito' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(panel).toHaveJSProperty('inert', true)
  await expect(agregar).toBeFocused()
})
