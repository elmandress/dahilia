---
name: quality-gate
description: >
  Quality gate for this repo. Use before considering ANY code change "done":
  run typecheck/lint then build, in order, and do not declare success if an
  earlier step fails. Inspired by spartan-ai-toolkit's typecheck→lint→test→review
  sequence, adapted to this project's scripts.
---

# Quality gate

Before saying a change is finished, run these in order and stop at the first failure:

1. `npm run lint` — must be **0 errors and 0 warnings**. Warnings are not
   acceptable here; the repo has been kept clean. Fix the root cause, don't
   silence with broad disables. A scoped `// eslint-disable-next-line <rule>`
   with a one-line reason is allowed only for the documented load-once admin
   effect pattern.
2. `npm run build` — must compile and type-check with no errors. TypeScript is
   strict; never use `any` to get past an error — type it properly
   (`Partial<Product>`, generated row types, etc.).
3. `npm run test:e2e` (Playwright + axe, against the production build on port 3100; see README → Tests). All green, or explain each failure. The tests never write to the production DB: every write goes through tests/e2e/support/guard.ts, so any new test that submits something must use it.
4. Smoke-test the affected routes on the dev server (curl for HTTP 200 + grep
   the dev log for `error`/`⨯`) when the change is user-facing.
5. For anything touching a money-flow page (PDP, /carrito, /encargo, the
   WhatsApp checkout button) or any layout/CSS change: an HTTP 200 does not
   prove the page is usable — a green build cannot see a button that's
   covered by another element. Actually look at it, at the mobile width real
   customers use (most of this site's traffic is mobile), before calling it
   done. Use a browser tool (Playwright MCP or equivalent) to screenshot the
   affected page at ~390px width if one is available; if not, say explicitly
   that the change is unverified visually rather than claiming it's checked.
6. Before a deploy: `node scripts/snapshot-edad.mjs` must exit 0. If it fails,
   regenerate the catalog snapshot (see "Antes de cada deploy" below).

Rules:
- Never patch over a failing check (no `// @ts-ignore`, no skipping lint).
- If you changed pricing, cart, discounts, or checkout, manually re-verify the
  number shown equals `getFinalPrice(...)`.
- Do not commit, and never push, unless the user asked. Local commits only when
  instructed.

## Nunca gastar el egress de Supabase en pruebas

Las fotos del sitio viven en Supabase Storage y el plan es gratis: 5 GB de
"Cached Egress" por mes. El optimizador de Next descarga el ORIGINAL en cada
variante que no tenga cacheada, y `npm run build` borra ese caché
(`.next/cache/images`). Correr la suite varias veces después de varios builds
hizo ~17.000 descargas y agotó la cuota: el 20/09/2026 Supabase restringió el
proyecto (402) y **el carrito dejó de andar para las clientas** hasta el
reinicio del ciclo.

Reglas:
- `tests/e2e/support/guard.ts` ya responde con un pixel a `/_next/image` y a
  `supabase.co/storage/`: no lo saques.
- Cualquier script propio con navegador (Playwright en scratchpad) tiene que
  hacer lo mismo antes de navegar:
  `await ctx.route(/\/_next\/image|supabase\.co\/storage\//, (r) => r.fulfill({ status: 200, contentType: 'image/gif', body: PIXEL }))`
- No encadenar builds "por las dudas": cada build tira a la basura el caché de
  imágenes. Compilar una vez al final.

## Las fotos no salen de Supabase (blindaje del 13/11/2026)

El 12/11/2026 la cuota se agotó por tercera vez, ya con las reglas de arriba:
cada foto que Netlify no tenía en caché bajaba el original de Supabase (40–70
descargas por visitante). Desde el 13/11 la tienda pide las fotos a
`/media/<ruta del storage>` del propio sitio:

- `src/components/ui/Foto.tsx` es el `next/image` de la tienda. **Nunca
  importar `next/image` directo fuera del admin**: `npm run test:unit` falla
  (tests/unit/fotos-locales.test.mjs).
- Para URLs que van a bots (OG, JSON-LD, sitemap, feed): `botImageUrl`.
- `public/media` son las copias. `npm run build` las trae solo dentro de
  Netlify (desde el sitio publicado, no desde Supabase). Lo que falte lo sirve
  `src/app/media/[...path]/route.ts`, una descarga por foto y por deploy.
- **Antes de cada deploy**: `npm run fotos` y commitear `public/media`. Es el
  respaldo de las fotos fuera de Supabase; el 12/11 no existía y no hubo de
  dónde recuperarlas.

## Antes de cada deploy: el respaldo del catálogo

Con la base caída (la cuota de Supabase, un error), la tienda muestra
`src/lib/catalog-snapshot.json`: precios, prendas y textos del día en que se
generó. El del 05/10/2026 seguía desplegado en noviembre, con 32 precios viejos
y sin el drop Sunset ’26.

1. `node scripts/snapshot-edad.mjs` — sale con 1 si el respaldo tiene más de
   14 días.
2. Si falla: `node --env-file=.env.local scripts/snapshot-catalog.mjs` (solo
   lectura con la clave pública; no baja fotos) y commitear
   `src/lib/catalog-snapshot.json` y `src/lib/catalog-snapshot-meta.json` con
   el deploy.

Va acá y no en una GitHub Action: las Actions fallaban siempre (los relojes se
mudaron a Netlify el 27/10/2026) y un PR automático igual dependía de que
alguien lo mergeara. /admin muestra el mismo aviso en "Falta terminar de
configurar".
