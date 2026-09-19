// Responsive adversarial: nada se sale de la pantalla en anchos chicos, lo fijo
// no tapa lo importante y los controles táctiles tienen tamaño usable.
import { test, expect, scrollThrough } from './support/guard'

const RUTAS = ['/', '/tienda', '/tienda/cardigans', '/tienda/spring-cardigan', '/carrito', '/encargo', '/blog/regalos-tejidos-a-mano', '/info', '/tejedoras']

for (const ancho of [320, 360, 414]) {
  test.describe(`${ancho} px`, () => {
    test.use({ viewport: { width: ancho, height: 800 }, isMobile: true, hasTouch: true })
    for (const ruta of RUTAS) {
      test(`nada se sale de la pantalla en ${ruta}`, async ({ page }) => {
        await page.goto(ruta)
        await scrollThrough(page)
        const afuera = await page.evaluate(() => {
          const W = document.documentElement.clientWidth
          const recortado = (el: Element) => {
            for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
              const cs = getComputedStyle(p)
              if (/(auto|scroll|hidden|clip)/.test(cs.overflowX)) return true
            }
            return false
          }
          return [...document.querySelectorAll('body *')].filter((el) => {
            if (el.closest('[inert], [aria-hidden="true"]')) return false
            const cs = getComputedStyle(el)
            if (cs.display === 'none' || cs.visibility === 'hidden') return false
            const r = el.getBoundingClientRect()
            return r.width > 0 && r.height > 0 && (r.right > W + 1 || r.left < -1) && !recortado(el)
          }).slice(0, 5).map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 30)} ${el.textContent?.trim().slice(0, 30)}`)
        })
        expect(afuera).toEqual([])
        expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false)
      })
    }
  })
}

test.describe('controles táctiles', () => {
  test.use({ viewport: { width: 320, height: 760 }, isMobile: true, hasTouch: true })

  test('el carrito del header y "Filtrar" entran a 320 px', async ({ page }) => {
    await page.goto('/tienda/cardigans')
    const carrito = await page.getByRole('button', { name: /carrito/i }).first().boundingBox()
    expect(carrito!.x + carrito!.width).toBeLessThanOrEqual(320)
    const filtrar = await page.getByRole('button', { name: /filtrar/i }).boundingBox()
    expect(filtrar!.x + filtrar!.width).toBeLessThanOrEqual(320)
  })

  test('carruseles: puntitos de 24 px y flechas que no tapan el texto', async ({ page }) => {
    await page.goto('/')
    // Las reseñas se piden al entrar en pantalla: se baja de a poco hasta que
    // aparecen (un barrido rápido, con la máquina cargada, a veces no deja un
    // cuadro en el que el observador las vea pasar).
    const resenas = page.locator('section[aria-label="Reseñas en Google"]')
    for (let i = 0; i < 60 && (await resenas.count()) === 0; i++) {
      await page.mouse.wheel(0, 400)
      await page.waitForTimeout(150)
    }
    await resenas.scrollIntoViewIfNeeded()
    const punto = await resenas.locator('button.carousel-dot').first().boundingBox()
    expect(Math.round(punto!.width)).toBe(24)
    expect(Math.round(punto!.height)).toBe(24)
    const texto = await resenas.locator('article p').boundingBox()
    const flecha = await resenas.getByRole('button', { name: 'Reseña siguiente' }).boundingBox()
    expect(flecha!.y).toBeGreaterThan(texto!.y + texto!.height)
    await expect(resenas.locator('span[role="img"]').first().locator('polygon[fill="currentColor"]')).toHaveCount(5)
  })

  test('la barra fija de la ficha no tapa el botón de agregar al final', async ({ page }) => {
    await page.goto('/tienda/spring-cardigan')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(400)
    // El último link del pie tiene que poder tocarse (no quedar debajo de algo fijo).
    const ultimo = page.locator('footer a').last()
    await ultimo.scrollIntoViewIfNeeded()
    const box = await ultimo.boundingBox()
    const encima = await page.evaluate(({ x, y }) => {
      const el = document.elementFromPoint(x, y)
      return el?.closest('footer') ? null : (el?.className?.toString?.() ?? el?.tagName)
    }, { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 })
    expect(encima).toBeNull()
  })
})
