// La ficha honesta (WS3, 04/11/2026): ningún talle aparece elegido si la
// clienta no lo eligió, el botón lo dice y no agrega; ?talle= sigue valiendo;
// Pulseras Terra dice "Modelo"; en el celular queda un solo fijo tocable (la
// barra, con "sin pagar ahora" y WhatsApp), y la burbuja escondida no se roba
// toques. Igual que el resto: el guardián intercepta escrituras, fotos y
// WhatsApp; las prendas se leen con la clave pública.
import type { Page } from '@playwright/test'
import { test, expect, fetchProduct } from './support/guard'

type Talle = { size: string; available?: boolean | null }
const disponibles = (p: Record<string, unknown> | null) =>
  ((p?.sizes as Talle[] | undefined) ?? []).filter((s) => s.available !== false)
const cta = (page: Page) => page.locator('[data-pdp-cta]')
const celular = (name: string) => name.includes('celular')

test('ficha con 2 o más talles: nada elegido, el botón pide elegir y no agrega', async ({ page, guard }) => {
  const spring = await fetchProduct({ slug: 'spring-cardigan' })
  test.skip(!spring || spring.status !== 'active' || disponibles(spring).length < 2, 'spring-cardigan no tiene 2 talles disponibles')
  let posts = 0
  page.on('request', (r) => { if (r.method() === 'POST' && new URL(r.url()).pathname === '/api/cart') posts++ })

  await page.goto('/tienda/spring-cardigan')
  await expect(page.locator('.pdp-sizes button').first()).toBeVisible()
  await expect(page.locator('.pdp-sizes button[aria-pressed="true"]')).toHaveCount(0)
  await expect(cta(page)).toHaveText(/elegí tu talle/i)

  // Tocarlo no agrega: avisa debajo de los talles.
  await cta(page).click()
  await expect(page.getByRole('alert').filter({ hasText: /elegí un talle/i })).toBeVisible()
  await page.waitForTimeout(400)
  expect(posts).toBe(0)

  // Elegir el primero disponible y agregar: ese talle llega al cajón.
  const primero = page.locator('.pdp-sizes button:not([disabled])').first()
  const talle = (await primero.innerText()).trim()
  await primero.click()
  await expect(primero).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('alert').filter({ hasText: /elegí un talle/i })).toHaveCount(0)
  await expect(cta(page)).toHaveText(/agregar al carrito/i)
  await cta(page).click()
  const cajon = page.locator('aside.cart-drawer')
  await expect(cajon).toHaveJSProperty('inert', false)
  await expect(cajon).toContainText(`Talle: ${talle}`)
  expect(posts).toBe(1)
  expect(guard.pageErrors).toEqual([])
})

test('?talle=M deja M elegido (las variantes de Merchant abren ya elegidas)', async ({ page }) => {
  const spring = await fetchProduct({ slug: 'spring-cardigan' })
  test.skip(!disponibles(spring).some((s) => s.size === 'M'), 'spring-cardigan no tiene M disponible')
  await page.goto('/tienda/spring-cardigan?talle=M')
  await expect(page.locator('.pdp-sizes button[aria-pressed="true"]')).toHaveText(/^M$/)
  await expect(cta(page)).toHaveText(/agregar al carrito/i)
})

test('vista rápida de /tienda: nada elegido y el botón pide elegir', async ({ page }) => {
  await page.goto('/tienda')
  const hrefs = await page.locator('.tienda-grid a[href^="/tienda/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href') ?? ''))
  let slug: string | null = null
  for (const h of hrefs.slice(0, 12)) {
    const p = await fetchProduct({ slug: h.replace('/tienda/', '') })
    if (p && p.status === 'active' && !p.is_custom_only && disponibles(p).length >= 2) { slug = p.slug; break }
  }
  test.skip(!slug, 'ninguna de las primeras tarjetas tiene 2 talles disponibles')

  const tarjeta = page.locator(`.tienda-grid a[href="/tienda/${slug}"]`).first()
  await tarjeta.scrollIntoViewIfNeeded()
  await tarjeta.hover().catch(() => {})
  await tarjeta.locator('.card-action').click()
  const modal = page.getByRole('dialog', { name: /vista rápida/i })
  await expect(modal).toBeVisible()
  await expect(modal.locator('button[aria-pressed]').first()).toBeVisible()
  await expect(modal.locator('button[aria-pressed="true"]')).toHaveCount(0)
  await expect(modal.getByRole('button', { name: /elegí tu talle|elegí el modelo/i })).toBeVisible()
})

test('Pulseras Terra: dice "Modelo" y no ofrece guía de talles', async ({ page }) => {
  const p = await fetchProduct({ slug: 'pulseras-terra' })
  test.skip(!p || p.status !== 'active', 'pulseras-terra no está activa')
  await page.goto('/tienda/pulseras-terra')
  await expect(page.locator('.pdp-sizes')).toHaveAttribute('data-rotulo', 'modelo')
  await expect(page.locator('.producto-detail').getByText('Modelo', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: /qué talle soy/i })).toHaveCount(0)
  await expect(page.getByText(/dudas con el talle/i)).toHaveCount(0)
  if (disponibles(p).length >= 2) await expect(cta(page)).toHaveText(/elegí el modelo/i)
})

test.describe('celular a 360 px', () => {
  test.use({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true })

  test('un solo fijo en la ficha: barra opaca con "sin pagar ahora" y WhatsApp de 44 px', async ({ page }, testInfo) => {
    test.skip(!celular(testInfo.project.name), 'la barra fija existe solo en el celular')
    await page.goto('/tienda/poncho-ete')
    // Pasar el botón principal (está justo debajo de los talles).
    await page.locator('.pdp-sizes, [data-pdp-cta]').first().scrollIntoViewIfNeeded()
    await page.mouse.wheel(0, 1600)
    const bar = page.locator('.pdp-sticky-bar')
    await expect(bar).toHaveClass(/is-visible/)
    await expect(bar).toContainText(/sin pagar ahora/i)
    const wa = bar.getByRole('link', { name: /whatsapp/i })
    const caja = await wa.boundingBox()
    expect(caja!.width).toBeGreaterThanOrEqual(44)
    expect(caja!.height).toBeGreaterThanOrEqual(44)
    expect(await bar.evaluate((el) => el.getBoundingClientRect().height)).toBeLessThanOrEqual(84)
    expect(await bar.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(255, 255, 255)')
    // La burbuja y "volver arriba" no se apilan encima.
    for (const sel of ['.whatsapp-float', '.back-to-top']) {
      for (const el of await page.locator(sel).all()) {
        expect(await el.evaluate((n) => getComputedStyle(n).display), sel).toBe('none')
      }
    }
  })

  test('la burbuja escondida no se roba toques, y en /regalo no está', async ({ page }, testInfo) => {
    test.skip(!celular(testInfo.project.name), 'se prueba en el celular')
    await page.goto('/tienda')
    const fab = page.locator('.whatsapp-float')
    test.skip((await fab.count()) === 0, 'la burbuja está apagada en Configuración')
    // ¿Lo que hay en el centro de la burbuja es la burbuja? (donde estaría
    // visible: el escondite la corre 80 px hacia abajo).
    const tocaBurbuja = () => fab.evaluate((el) => {
      const x = window.innerWidth - 24 - 26
      const y = window.innerHeight - 28 - 26
      const hit = document.elementFromPoint(x, y)
      return !!hit && (hit === el || el.contains(hit))
    })
    const escondida = () => fab.evaluate((el) => {
      const cs = getComputedStyle(el)
      return cs.visibility === 'hidden' && cs.pointerEvents === 'none' && el.getAttribute('aria-hidden') === 'true'
    })

    // En la tienda arranca escondida: no tapa el primer pantallazo.
    await expect.poll(escondida).toBe(true)
    expect(await tocaBurbuja()).toBe(false)

    // Bajando: escondida y sin interceptar toques.
    await page.mouse.wheel(0, 2200)
    await page.waitForTimeout(600)
    await expect.poll(escondida).toBe(true)
    expect(await tocaBurbuja()).toBe(false)

    // Subiendo un poco, ya lejos del principio: aparece.
    await page.mouse.wheel(0, -300)
    await expect.poll(escondida).toBe(false)

    await page.goto('/regalo')
    await expect(page.locator('.whatsapp-float')).toHaveCount(0)
  })
})

// Mismo ancho que vis-checks (VIS-07b): iPhone 13.
test.describe('celular a 390 px', () => {
  test.use({ viewport: { width: 390, height: 664 }, isMobile: true, hasTouch: true })

  test('tarjeta de /tienda: la info debajo de la foto mide 80 px o menos', async ({ page }, testInfo) => {
    test.skip(!celular(testInfo.project.name), 'la tarjeta compacta es del celular')
    await page.goto('/tienda')
    await expect(page.locator('.tienda-grid a[href^="/tienda/"]').first()).toBeVisible()
    // La primera tarjeta con el nombre en un renglón (uno largo suma 19 px y no
    // es lo que se mide), hasta el último bloque visible: la grilla estira cada
    // fila a la tarjeta más alta.
    const info = await page.locator('.tienda-grid a[href^="/tienda/"]').evaluateAll((cards) => {
      for (const card of cards.slice(0, 8)) {
        const nombre = card.children[1]?.firstElementChild
        if (!nombre) continue
        const lh = parseFloat(getComputedStyle(nombre).lineHeight) || 19
        if (nombre.getBoundingClientRect().height > lh * 1.5) continue
        const foto = card.firstElementChild!.getBoundingClientRect()
        const abajo = Math.max(...[...card.children].slice(1)
          .filter((c) => getComputedStyle(c).display !== 'none' && c.getBoundingClientRect().height > 0)
          .map((c) => c.getBoundingClientRect().bottom))
        return Math.round(abajo - foto.bottom)
      }
      return null
    })
    test.skip(info === null, 'ninguna de las primeras tarjetas tiene el nombre en un renglón')
    expect(info).toBeLessThanOrEqual(80)
  })
})

test('botón ocupado: dice "Agregando…" con aria-busy mientras guarda', async ({ page }) => {
  await page.route('**/api/cart', async (route) => {
    if (route.request().method() === 'POST') await new Promise((r) => setTimeout(r, 1200))
    return route.fallback()
  })
  await page.goto('/tienda/bandana')
  const boton = cta(page)
  await expect(boton).toHaveText(/agregar al carrito/i)
  await boton.click()
  await expect(boton).toHaveAttribute('aria-busy', 'true')
  await expect(boton).toHaveText(/agregando/i)
  // Termina: vuelve a estar libre.
  await expect(boton).toHaveAttribute('aria-busy', 'false', { timeout: 8000 })
})

test('el HTML trae data-scroll-behavior="smooth" (Next apaga el scroll suave al navegar)', async ({ request }) => {
  const html = await (await request.get('/')).text()
  expect(html).toMatch(/<html[^>]*\sdata-scroll-behavior="smooth"/)
})
