// Guardián de las pruebas: el servidor local lee la base de PRODUCCIÓN, así que
// ninguna prueba puede escribir en ella. Todo lo que escribe se intercepta acá:
//
// - acciones del servidor (POST con header next-action): encargo, tejedoras,
//   lista VIP, estado del encargo. Se abortan salvo que la prueba diga otra cosa;
// - /api/cart (POST/PATCH/DELETE), /api/favorites, /api/orders: se simulan en
//   memoria con productos reales, leídos de Supabase con la clave pública;
// - /api/resenas: se simula (sin clave de Places en local);
// - terceros de medición (GA4, Clarity, Umami): se bloquean.
//
// Las lecturas (páginas, /api/search, /api/cart GET vacío) van al servidor real.
import { test as base, expect, type Page, type Route } from '@playwright/test'

export type ServerActionMode = 'abort' | 'error-500' | 'garbage' | 'slow-abort'

type Product = Record<string, unknown> & { id: string; slug: string; name: string }
type CartItem = { id: string; cart_id: string; product_id: string; size: string; qty: number; added_at: string; product: Product }

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const productCache = new Map<string, Product | null>()

/** Producto real por id o slug (solo lectura, clave pública, igual que el navegador). */
export async function fetchProduct(by: { id?: string; slug?: string }): Promise<Product | null> {
  const key = by.id ?? by.slug ?? ''
  if (productCache.has(key)) return productCache.get(key) ?? null
  if (!SUPABASE_URL || !SUPABASE_ANON) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY (se leen de .env.local)')
  const filter = by.id ? `id=eq.${by.id}` : `slug=eq.${by.slug}`
  const select = '*,category:categories(*),media:product_media(*),sizes:product_sizes(*)'
  const res = await fetch(`${SUPABASE_URL}/rest/v1/products?${filter}&select=${encodeURIComponent(select)}`, {
    headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
  })
  const rows = (await res.json()) as Product[]
  const product = Array.isArray(rows) && rows[0] ? rows[0] : null
  productCache.set(key, product)
  return product
}

export interface Guard {
  /** Cuerpos que el sitio mandó a /api/orders (el registro del pedido). */
  orders: unknown[]
  /** Cuántas acciones del servidor intentó mandar la página. */
  serverActions: () => number
  /** Cómo responder a las acciones del servidor en esta prueba. */
  setServerActionMode: (mode: ServerActionMode) => void
  /** Hace fallar /api/cart (para probar estados de error). */
  failCart: (on: boolean) => void
  /** URL de WhatsApp que la página intentó abrir (sin abrirla). */
  whatsappUrl: () => string | null
  /** Errores de JavaScript no atrapados en la página. */
  pageErrors: string[]
}

async function installGuard(page: Page): Promise<Guard> {
  let actionMode: ServerActionMode = 'abort'
  let actions = 0
  let cartFails = false
  let cart: CartItem[] = []
  let waUrl: string | null = null
  const orders: unknown[] = []
  const pageErrors: string[] = []
  page.on('pageerror', (e) => pageErrors.push(e.message))
  page.on('popup', async (popup) => { waUrl = waUrl ?? popup.url(); await popup.close().catch(() => {}) })

  const ctx = page.context()
  await ctx.route(/googletagmanager|google-analytics|clarity\.ms|cloud\.umami|\/stats\//, (r) => r.abort())
  await ctx.route(/wa\.me|api\.whatsapp\.com/, (r) => { waUrl = r.request().url(); return r.fulfill({ body: 'ok' }) })

  // Acciones del servidor: nunca pasan.
  await ctx.route('**/*', async (route: Route) => {
    const req = route.request()
    if (req.method() === 'POST' && req.headers()['next-action']) {
      actions++
      if (actionMode === 'error-500') return route.fulfill({ status: 500, body: 'Internal Server Error' })
      if (actionMode === 'garbage') return route.fulfill({ status: 200, contentType: 'text/x-component', body: 'respuesta rota' })
      if (actionMode === 'slow-abort') { await new Promise((r) => setTimeout(r, 2500)); return route.abort('timedout') }
      return route.abort('internetdisconnected')
    }
    return route.fallback()
  })

  await ctx.route('**/api/cart**', async (route) => {
    const req = route.request()
    if (cartFails) return route.fulfill({ status: 500, json: { error: 'falla simulada' } })
    const method = req.method()
    if (method === 'GET') return route.fulfill({ json: { cartId: 'e2e', items: cart } })
    if (method === 'POST') {
      const body = JSON.parse(req.postData() || '{}') as { productId: string; size: string; qty?: number }
      const product = await fetchProduct({ id: body.productId })
      if (!product) return route.fulfill({ status: 409, json: { error: 'El producto no está disponible.' } })
      const existing = cart.find((i) => i.product_id === body.productId && i.size === body.size)
      if (existing) existing.qty += body.qty ?? 1
      else cart = [...cart, { id: `00000000-0000-4000-8000-${String(cart.length + 1).padStart(12, '0')}`, cart_id: 'e2e', product_id: body.productId, size: body.size, qty: body.qty ?? 1, added_at: new Date().toISOString(), product }]
      return route.fulfill({ json: { cartId: 'e2e', items: cart } })
    }
    if (method === 'PATCH') {
      const body = JSON.parse(req.postData() || '{}') as { itemId: string; qty: number }
      cart = body.qty <= 0 ? cart.filter((i) => i.id !== body.itemId) : cart.map((i) => (i.id === body.itemId ? { ...i, qty: body.qty } : i))
      return route.fulfill({ json: { cartId: 'e2e', items: cart } })
    }
    if (method === 'DELETE') {
      const id = new URL(req.url()).searchParams.get('itemId')
      cart = cart.filter((i) => i.id !== id)
      return route.fulfill({ json: { cartId: 'e2e', items: cart } })
    }
    return route.abort()
  })
  await ctx.route('**/api/favorites**', (route) => route.fulfill({ json: { favId: 'e2e', items: [] } }))
  await ctx.route('**/api/orders', (route) => { orders.push(JSON.parse(route.request().postData() || 'null')); return route.fulfill({ json: { ok: true } }) })
  await ctx.route('**/api/resenas', (route) => route.fulfill({ json: {
    ok: true, rating: 5, total: 9, mapsUri: 'https://maps.google.com/?cid=1',
    reviews: [
      { author: 'Lucía', photo: null, rating: 5, when: 'hace 2 semanas', uri: 'https://maps.google.com/?r=1', text: 'Me encantó mi cardigan, llegó rapidísimo. ' },
      { author: 'Camila', photo: null, rating: 5, when: 'hace 3 semanas', uri: null, text: 'Hermoso todo.' },
      { author: 'Sofía', photo: null, rating: 5, when: 'hace un mes', uri: null, text: 'Pedí un top a medida y quedó perfecto.' },
    ],
  } }))

  return {
    orders,
    serverActions: () => actions,
    setServerActionMode: (m) => { actionMode = m },
    failCart: (on) => { cartFails = on },
    whatsappUrl: () => waUrl,
    pageErrors,
  }
}

// auto: se instala en TODAS las pruebas, la pidan o no. Una prueba que se
// olvidara de pedirlo quedaría sin protección de escritura.
export const test = base.extend<{ guard: Guard }>({
  guard: [async ({ page }, provide) => {
    const guard = await installGuard(page)
    await provide(guard)
  }, { auto: true }],
})
export { expect }

/** Baja hasta el final (dispara lo que carga al entrar en pantalla) y vuelve arriba. */
export async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 60))
    }
    window.scrollTo(0, 0)
  })
}

/** IP de prueba distinta por llamada, para no compartir los baldes del límite de frecuencia. */
export function testIp(): string {
  return `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`
}
