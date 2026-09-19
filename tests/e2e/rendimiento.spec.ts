// Presupuestos de rendimiento que no dependen de la velocidad de la máquina:
// cuánto JavaScript baja cada página (comprimido) y cuánto se mueve el diseño
// mientras carga (CLS). Lighthouse se corre aparte (scores dependen del
// entorno); esto frena regresiones grandes en el código.
import { test, expect } from './support/guard'

// Medido el 19/09/2026 en el build local: ~186 KB gzip de JS que corre en la
// home y ~195 KB en la ficha (sin contar polyfills noModule). El margen deja
// crecer un poco sin que cada cambio chico rompa la prueba.
const JS_MAX_KB = 240

for (const ruta of ['/', '/tienda', '/tienda/spring-cardigan', '/encargo']) {
  test(`JS comprimido por debajo de ${JS_MAX_KB} KB en ${ruta}`, async ({ page }) => {
    let bytes = 0
    page.on('requestfinished', async (req) => {
      if (req.resourceType() !== 'script' || !req.url().includes('/_next/static/')) return
      const sizes = await req.sizes().catch(() => null)
      if (sizes) bytes += sizes.responseBodySize
    })
    await page.goto(ruta, { waitUntil: 'networkidle' })
    const kb = Math.round(bytes / 1024)
    test.info().annotations.push({ type: 'js-kb', description: String(kb) })
    expect(kb).toBeLessThan(JS_MAX_KB)
  })

  test(`CLS por debajo de 0,1 en ${ruta}`, async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __cls: number }
      w.__cls = 0
      new PerformanceObserver((list) => {
        for (const e of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
          if (!e.hadRecentInput) w.__cls += e.value
        }
      }).observe({ type: 'layout-shift', buffered: true })
    })
    await page.goto(ruta, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)
    const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls)
    test.info().annotations.push({ type: 'cls', description: cls.toFixed(3) })
    expect(cls).toBeLessThan(0.1)
  })
}
