// Las entradas que muestran prendas (WS4, 04/11/2026): la home sin prendas
// repetidas ni notas de Navidad, el estado del drop desde el servidor, /vip al
// día, /ig con h1 y precio tachado, la primera prenda a la vista en el celular
// y la búsqueda de "en stock". Igual que el resto: el guardián intercepta
// escrituras, fotos y WhatsApp; las prendas se leen con la clave pública.
import type { APIRequestContext, Page } from '@playwright/test'
import { test, expect, fetchProduct } from './support/guard'

const sinScripts = (html: string) => html.replace(/<script[\s\S]*?<\/script>/gi, '')
const celular = (name: string) => name.includes('celular')

/** ¿El drop ya abrió? /ig lo calcula en el servidor desde el 12/10/2026: sirve
 *  de referencia para la home y /vip. false también si el drop está apagado. */
async function dropAbierto(request: APIRequestContext): Promise<boolean> {
  return /Ya está online/.test(sinScripts(await (await request.get('/ig')).text()))
}

/** Piezas en stock según el menú ("En stock, sin espera (7)"). */
async function enStockDelMenu(request: APIRequestContext): Promise<number> {
  const texto = (await (await request.get('/tienda')).text()).replace(/<!-- -->/g, '').replace(/<[^>]+>/g, ' ')
  const m = /En stock, sin espera\s*\((\d+)\)/.exec(texto)
  return m ? Number(m[1]) : 0
}

/** Tope de un elemento en px desde el principio de la página, y el alto de la pantalla. */
async function tope(page: Page, selector: string) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel)
    return el ? { top: Math.round(el.getBoundingClientRect().top + window.scrollY), vh: window.innerHeight } : null
  }, selector)
}

test('home: ninguna prenda se repite entre las secciones', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-seccion="nuevo"]')).toHaveCount(1)
  // Por sección, cada prenda una vez (la tarjeta puede tener más de un link).
  const porSeccion = await page.locator('[data-seccion]').evaluateAll((secciones) =>
    secciones.map((s) => [...new Set(
      [...s.querySelectorAll('a[href^="/tienda/"]')]
        .map((a) => a.getAttribute('href') ?? '')
        .filter((h) => h.split('/').length === 3 && !h.includes('?')),
    )]),
  )
  const todas = porSeccion.flat()
  expect(todas.length).toBeGreaterThan(0)
  const repetidas = todas.filter((h, i) => todas.indexOf(h) !== i)
  expect(repetidas).toEqual([])
})

test('home: ninguna nota ni bloque de Navidad', async ({ request }) => {
  const html = sinScripts(await (await request.get('/')).text())
  expect(html.match(/.{0,60}navidad.{0,40}/gi) ?? []).toEqual([])
})

test('home: con el drop abierto, el HTML ya dice "Ya está online" y lo sigue diciendo al hidratar', async ({ page, request }) => {
  test.skip(!(await dropAbierto(request)), 'el drop no está abierto (o está apagado)')
  const html = sinScripts(await (await request.get('/')).text())
  expect(html.includes('Ya está online'), 'el HTML del servidor no dice "Ya está online"').toBe(true)
  expect(html.includes('Muy pronto'), 'el HTML del servidor dice "Muy pronto"').toBe(false)
  expect(html.includes('Verlo 24 h antes'), 'el HTML del servidor ofrece "Verlo 24 h antes"').toBe(false)

  await page.goto('/')
  await page.waitForLoadState('networkidle')
  // El reloj del bloque corre apenas monta: para acá ya hidrató.
  await page.waitForTimeout(300)
  const drop = page.locator('section[aria-label^="Ya está online"]')
  await expect(drop).toHaveCount(1)
  await expect(drop).toContainText('Ya está online')
  await expect(drop).not.toContainText('Muy pronto')
})

test('/vip no anuncia como futuro un drop que ya salió', async ({ request }) => {
  test.skip(!(await dropAbierto(request)), 'el drop no está abierto: "Sale el …" es correcto')
  const vip = sinScripts(await (await request.get('/vip')).text())
  const combina = /ya se está tejiendo/.test(vip) && /Sale el /.test(vip)
  expect(combina, (vip.match(/Sale el [^.<]*/) ?? [''])[0]).toBe(false)
})

test('/ig: un solo h1 y, si la tienda tiene descuentos, el precio tachado', async ({ page }) => {
  const tachados = (sel: string) => page.locator(sel).evaluateAll((els) =>
    els.filter((el) => getComputedStyle(el).textDecorationLine.includes('line-through')).length)
  await page.goto('/tienda')
  const enLaTienda = await tachados('.tienda-grid span')
  await page.goto('/ig')
  await expect(page.locator('h1')).toHaveCount(1)
  if (enLaTienda > 0) expect(await tachados('main span')).toBeGreaterThan(0)
})

test('celular: la primera prenda a la vista en la home y la colección, y el formulario de /encargo en la primera pantalla', async ({ page }, testInfo) => {
  test.skip(!celular(testInfo.project.name), 'solo celular')
  await page.goto('/')
  const home = await tope(page, '.seccion-nuevo a[href^="/tienda/"]')
  expect(home).not.toBeNull()
  expect(home!.top, `primera tarjeta en ${home!.top} px de ${home!.vh}`).toBeLessThan(1.3 * home!.vh)

  const res = await page.goto('/colecciones/sunset-26')
  if (res?.status() !== 404) {
    const col = await tope(page, '.tienda-grid a[href^="/tienda/"]')
    expect(col).not.toBeNull()
    expect(col!.top, `primera prenda en ${col!.top} px de ${col!.vh}`).toBeLessThan(0.75 * col!.vh)
  }

  await page.goto('/encargo')
  const campo = await tope(page, 'main form button, main form input')
  expect(campo).not.toBeNull()
  expect(campo!.top, `primer campo en ${campo!.top} px de ${campo!.vh}`).toBeLessThan(campo!.vh)
})

test('buscar "en stock" o "ya tejido" trae solo piezas en stock', async ({ request }) => {
  const enStock = await enStockDelMenu(request)
  for (const q of ['en stock', 'ya tejido']) {
    const { results } = (await (await request.get(`/api/search?q=${encodeURIComponent(q)}`)).json()) as { results: { slug: string }[] }
    if (enStock > 0) expect(results.length, `"${q}" sin resultados con ${enStock} piezas en stock`).toBeGreaterThan(0)
    for (const r of results) {
      const p = await fetchProduct({ slug: r.slug })
      expect(p?.status, `"${q}" → ${r.slug}`).toBe('active')
      expect(p?.lead_time_weeks_min, `"${q}" → ${r.slug}`).toBe(0)
    }
  }
})

test('celular: el bloque del drop de arriba está entero en reposo (no a medio aparecer)', async ({ page }, testInfo) => {
  test.skip(!celular(testInfo.project.name), 'solo celular')
  // La pantalla de un iPhone 13, donde se midió: el bloque arranca dentro del
  // primer pantallazo y la animación de entrada lo dejaba al 90 % (VIS-04).
  await page.setViewportSize({ width: 390, height: 664 })
  await page.goto('/')
  const drop = page.locator('section[aria-label*="drop" i], section[aria-label*="online" i]').first()
  test.skip((await drop.count()) === 0, 'sin bloque de drop')
  await page.waitForTimeout(300)
  expect(await drop.evaluate((el) => getComputedStyle(el).opacity)).toBe('1')
})
