// /regalo, "Otro monto" (QA-03, 04/11/2026): con parseInt, "2.000" le llegaba
// a Anush como "Monto: UYU 2". Ahora se lee como lo escribe una persona y se
// muestra lo que se va a pedir mientras se escribe.
import { test, expect } from './support/guard'

const textoWa = (href: string | null) => (href ? new URL(href).searchParams.get('text') ?? '' : '')

test('"2.000" se pide como UYU 2.000', async ({ page, guard }) => {
  await page.goto('/regalo')
  await page.getByLabel('Para', { exact: true }).fill('Lucía')
  await page.getByLabel('De parte de').fill('Mamá')
  await page.getByLabel('Otro monto').pressSequentially('2.000')
  await expect(page.getByText('Monto: UYU 2.000', { exact: true })).toBeVisible()
  const pedir = page.getByRole('link', { name: /pedir la tarjeta/i })
  await expect(pedir).toBeVisible()
  expect(textoWa(await pedir.getAttribute('href'))).toContain('Monto: UYU 2.000')
  expect(guard.pageErrors).toEqual([])
})

test('un monto con centavos no se manda: avisa cómo escribirlo y el botón queda deshabilitado', async ({ page }) => {
  await page.goto('/regalo')
  await page.getByLabel('Para', { exact: true }).fill('Lucía')
  await page.getByLabel('De parte de').fill('Mamá')
  await page.getByLabel('Otro monto').pressSequentially('1.500,50')
  await expect(page.getByText(/escribí el monto en pesos, sin centavos/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /pedir la tarjeta/i })).toBeDisabled()
  await expect(page.getByRole('link', { name: /pedir la tarjeta/i })).toHaveCount(0)
})
