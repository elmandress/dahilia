// Pruebas de punta a punta (tests/e2e). Corren contra el build de producción
// local: `npm run build` y después `npm run test:e2e` (levanta `next start` en
// el puerto 3100 si no hay uno andando).
//
// El servidor local lee la base de PRODUCCIÓN. Por eso toda escritura se
// intercepta en tests/e2e/support/guard.ts: ninguna prueba escribe datos.
import { defineConfig, devices } from '@playwright/test'

// Las claves públicas de Supabase (las mismas que ve el navegador) para que el
// carrito simulado use productos reales.
try { process.loadEnvFile('.env.local') } catch { /* sin .env.local: las pruebas del carrito fallan con un mensaje claro */ }

const PORT = Number(process.env.E2E_PORT ?? 3100)

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  workers: process.env.CI ? 2 : 3,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`,
    locale: 'es-UY',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    // La mayoría del tráfico real es del celular: es el proyecto principal.
    { name: 'celular', use: { ...devices['Pixel 7'] } },
    { name: 'escritorio', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } }, testIgnore: /movil\.spec/ },
  ],
  webServer: process.env.E2E_BASE_URL ? undefined : {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 60_000,
    // Sin clave de Places: la sección de reseñas se simula en las pruebas.
    env: { GOOGLE_PLACES_API_KEY: 'clave-de-prueba' },
  },
})
