// Formularios bajo condiciones malas: vacíos, inválidos, sin conexión, servidor
// caído, respuesta rota y doble clic. Ninguna acción del servidor sale del
// navegador (ver support/guard.ts).
import { test, expect, type ServerActionMode } from './support/guard'

test.describe('encargo', () => {
  test('valida sin mandar nada al servidor', async ({ page, guard }) => {
    await page.goto('/encargo')
    const enviar = page.getByRole('main').locator('form button[type="submit"]')
    await enviar.click()
    await expect(page.getByRole('main').getByRole('alert')).toContainText(/llamás/i)
    await page.getByRole('textbox', { name: /tu nombre/i }).fill('   ')
    await enviar.click()
    await expect(page.getByRole('main').getByRole('alert')).toContainText(/llamás/i)
    await page.getByRole('textbox', { name: /tu nombre/i }).fill('Ana 🧶')
    await enviar.click()
    await expect(page.getByRole('main').getByRole('alert')).toContainText(/whatsapp|email/i)
    await page.getByRole('textbox', { name: /^mail/i }).fill('ana@@correo')
    await enviar.click()
    await expect(page.getByRole('main').getByRole('alert')).toContainText(/email|mail/i)
    expect(guard.serverActions()).toBe(0)
  })

  test('los campos ayudan en el celular: teclado, autocompletado y topes', async ({ page }) => {
    await page.goto('/encargo')
    const nombre = page.getByRole('textbox', { name: /tu nombre/i })
    const wa = page.getByRole('textbox', { name: /^whatsapp/i })
    const mail = page.getByRole('textbox', { name: /^mail/i })
    await expect(nombre).toHaveAttribute('autocomplete', 'name')
    await expect(nombre).toHaveAttribute('maxlength', '80')
    await expect(wa).toHaveAttribute('type', 'tel')
    await expect(wa).toHaveAttribute('autocomplete', 'tel')
    await expect(mail).toHaveAttribute('autocomplete', 'email')
  })

  const fallas: [ServerActionMode, string][] = [
    ['abort', 'sin conexión'],
    ['error-500', 'el servidor responde 500'],
    ['garbage', 'la respuesta llega rota'],
  ]
  for (const [modo, desc] of fallas) {
    test(`${desc}: avisa y no pierde lo escrito`, async ({ page, guard }) => {
      guard.setServerActionMode(modo)
      await page.goto('/encargo')
      await page.getByRole('textbox', { name: /tu nombre/i }).fill('Prueba QA')
      await page.getByRole('textbox', { name: /^whatsapp/i }).fill('099123456')
      await page.locator('form textarea').first().fill('Un cardigan verde, talle M')
      await page.getByRole('main').locator('form button[type="submit"]').click()
      await expect(page.getByRole('main').getByRole('alert')).toContainText(/no se pudo/i)
      await expect(page.getByText(/no cargó/i)).toHaveCount(0)
      await expect(page.getByRole('textbox', { name: /tu nombre/i })).toHaveValue('Prueba QA')
      await expect(page.locator('form textarea').first()).toHaveValue(/cardigan verde/)
      await expect(page.getByRole('main').locator('form button[type="submit"]')).toBeEnabled()
    })
  }

  test('tres clics con la red lenta mandan un solo encargo', async ({ page, guard }) => {
    guard.setServerActionMode('slow-abort')
    await page.goto('/encargo')
    await page.getByRole('textbox', { name: /tu nombre/i }).fill('Prueba QA')
    await page.getByRole('textbox', { name: /^whatsapp/i }).fill('099123456')
    const enviar = page.getByRole('main').locator('form button[type="submit"]')
    await enviar.click()
    await enviar.click({ force: true }).catch(() => {})
    await enviar.click({ force: true }).catch(() => {})
    await expect(enviar).toBeDisabled()
    await expect(page.getByRole('main').getByRole('alert')).toContainText(/no se pudo/i, { timeout: 8000 })
    expect(guard.serverActions()).toBe(1)
  })
})

test('estado del encargo sin conexión: avisa y no rompe la página', async ({ page, guard }) => {
  guard.setServerActionMode('abort')
  await page.goto('/encargo/estado')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/estado de tu encargo/i)
  await page.getByRole('textbox', { name: /código/i }).fill('DAH-ZZZZZZ')
  await page.getByRole('button', { name: /buscar/i }).last().click()
  await expect(page.getByRole('main').getByRole('alert')).toContainText(/conexión/i)
  await expect(page.getByText(/no cargó/i)).toHaveCount(0)
})

test('lista VIP del pie sin conexión: no dice que se anotó', async ({ page, guard }) => {
  guard.setServerActionMode('abort')
  await page.goto('/')
  const footer = page.locator('footer')
  const input = footer.locator('input[type="email"]').first()
  await input.scrollIntoViewIfNeeded()
  await input.fill('qa@ejemplo.com')
  await footer.locator('form button[type="submit"]').first().click()
  await expect(footer).toContainText(/no pudimos anotarte/i)
  await expect(footer).not.toContainText(/¡lista!/i)
  await expect(page.getByText(/no cargó/i)).toHaveCount(0)
})

test('tejedoras: el formulario vacío avisa sin enviar', async ({ page, guard }) => {
  await page.goto('/tejedoras')
  const enviar = page.getByRole('main').locator('form button[type="submit"]')
  await enviar.scrollIntoViewIfNeeded()
  await enviar.click()
  await expect(page.getByRole('main').getByRole('alert').first()).toBeVisible()
  expect(guard.serverActions()).toBe(0)
})
