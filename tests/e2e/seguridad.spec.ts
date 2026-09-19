// Seguridad defensiva: las APIs públicas rechazan basura sin tocar la base, el
// límite de frecuencia no se saltea cambiando headers, el panel pide sesión y
// las cabeceras de seguridad están. Ningún pedido de acá escribe: los ids son
// inválidos y se cortan antes de cualquier consulta.
import { test, expect, testIp } from './support/guard'

test('ids inválidos → 400, sin llegar a la base', async ({ request }) => {
  const headers = { 'content-type': 'application/json', 'x-nf-client-connection-ip': testIp() }
  expect((await request.delete('/api/cart?itemId=abc', { headers })).status()).toBe(400)
  expect((await request.patch('/api/cart', { headers, data: { itemId: "1' or '1'='1", qty: 2 } })).status()).toBe(400)
  expect((await request.post('/api/cart', { headers, data: { productId: 'no-uuid', size: 'M' } })).status()).toBe(400)
  expect((await request.post('/api/favorites', { headers, data: { productId: { $ne: null } } })).status()).toBe(400)
  expect((await request.post('/api/orders', { headers, data: { items: [] } })).status()).toBe(400)
  expect((await request.post('/api/cart', { headers: { 'x-nf-client-connection-ip': testIp() }, data: '{roto' })).status()).toBe(400)
})

test('el límite de frecuencia no se saltea falseando x-forwarded-for', async ({ request }) => {
  const ip = testIp()
  const codes: number[] = []
  for (let i = 0; i < 41; i++) codes.push((await request.delete('/api/cart?itemId=abc', { headers: { 'x-nf-client-connection-ip': ip } })).status())
  expect(codes.slice(0, 40).every((c) => c === 400)).toBe(true)
  expect(codes[40]).toBe(429)
  const spoof = await request.delete('/api/cart?itemId=abc', { headers: { 'x-nf-client-connection-ip': ip, 'x-forwarded-for': '1.2.3.4' } })
  expect(spoof.status()).toBe(429)
})

test('métodos no permitidos → 405', async ({ request }) => {
  expect((await request.post('/api/search')).status()).toBe(405)
  expect((await request.get('/api/orders')).status()).toBe(405)
  expect((await request.get('/api/coupon')).status()).toBe(405)
})

test('el panel y las rutas internas piden credencial', async ({ request }) => {
  const admin = await request.get('/admin/pedidos', { maxRedirects: 0 })
  expect([302, 303, 307, 308]).toContain(admin.status())
  expect(admin.headers()['location'] ?? '').toMatch(/login/)
  expect((await request.post('/api/seo/reindex', { data: {} })).status()).toBeGreaterThanOrEqual(401)
  expect([401, 403]).toContain((await request.get('/api/cron/daily-summary', { headers: { authorization: 'Bearer adivinanza' } })).status())
})

test('nada inyectado por la URL vuelve como HTML', async ({ request }) => {
  const xss = '<script>alert(1)</script>'
  for (const ruta of [`/tienda?q=${encodeURIComponent(xss)}`, `/tienda/spring-cardigan?talle=${encodeURIComponent(xss)}`, `/encargo/estado?codigo=${encodeURIComponent(xss)}`]) {
    const r = await request.get(ruta)
    expect(r.status(), ruta).toBe(200)
    expect(await r.text(), ruta).not.toContain(xss)
  }
})

test('cabeceras de seguridad', async ({ request }) => {
  const h = (await request.get('/')).headers()
  expect(h['x-frame-options']).toBe('DENY')
  expect(h['x-content-type-options']).toBe('nosniff')
  expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin')
  const csp = h['content-security-policy'] ?? ''
  for (const d of ["frame-ancestors 'none'", "object-src 'none'", "base-uri 'self'", "form-action 'self'"]) expect(csp).toContain(d)
})

test('las respuestas de error no filtran detalles internos', async ({ request }) => {
  const r = await request.post('/api/coupon', { headers: { 'content-type': 'application/json', 'x-nf-client-connection-ip': testIp() }, data: '{{{' })
  expect(r.status()).toBeLessThan(500)
  expect(await r.text()).not.toMatch(/(at \w+ \(|node_modules|PGRST|supabase\.co|stack)/i)
})
