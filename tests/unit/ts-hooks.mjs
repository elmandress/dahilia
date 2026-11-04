// Referencia para tests/unit/ts-hooks.mjs (WS1). Probado con Node 24.16 el 04/11/2026:
// importa src/lib/{types,addons,env,drop-date,meta-pixel,vocabulario,product-selection,coupons,reels}.
// Uso: node --import ./tests/unit/ts-hooks.mjs --test "tests/unit/**/*.test.mjs"
// (un directorio suelto en --test NO anda en Node 24: hace falta el glob entre comillas).
//
// Carga módulos .ts de src/ en las pruebas unitarias (node:test) sin build:
// Node 24 quita los tipos solo; este hook resuelve el alias @/ y los imports
// relativos sin extensión, como hace Next. Solo para módulos puros: nada de
// JSX (.tsx), next/*, 'server-only' ni JSON. Los tipos se importan con `import type`.
import { registerHooks } from 'node:module'
import { statSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

// src/lib/env.ts exige estas dos al importarse; en las pruebas no hay .env.local.
process.env.NEXT_PUBLIC_SUPABASE_URL ||= 'https://ejemplo.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= 'clave-de-prueba'

const SRC = fileURLToPath(new URL('../../src/', import.meta.url))
const isFile = (p) => { try { return statSync(p).isFile() } catch { return false } }
const find = (base) => [base, `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts')].find(isFile)
const hit = (f) => ({ url: pathToFileURL(f).href, format: f.endsWith('.ts') ? 'module-typescript' : undefined, shortCircuit: true })

registerHooks({
  resolve(spec, ctx, next) {
    if (spec.startsWith('@/')) {
      const f = find(path.join(SRC, spec.slice(2)))
      if (f) return hit(f)
    }
    if (/^\.\.?\//.test(spec) && !path.extname(spec) && ctx.parentURL?.startsWith('file:')) {
      const f = find(path.resolve(path.dirname(fileURLToPath(ctx.parentURL)), spec))
      if (f) return hit(f)
    }
    return next(spec, ctx)
  },
})
