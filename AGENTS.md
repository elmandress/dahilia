<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Mapa del proyecto (lo que es verdad en toda sesión)

- **Qué es**: tienda e-commerce de Dahila Crochet (Next.js 16 + React 19 + Supabase + Netlify). Checkout por WhatsApp; no hay tabla de pedidos. Dominio canónico: `https://dahila.uy` (`SITE_URL` en `src/lib/env.ts` — TODAS las URLs absolutas derivan de ahí).
- **DB**: los cambios de base se entregan como SQL idempotente en `database/` y se corren en el SQL Editor de Supabase. El proyecto Supabase visible por MCP es OTRO proyecto — no usarlo para la tienda.
- **Precios**: nunca inventar precios. La tabla aprobada vive en `src/app/admin/estrategia/data.ts` (`PRICE_TABLE`) y en `ESTRATEGIA-DEFINITIVA.md`.
- **Marca**: la persona es **Anush**; la marca es **Dahila** (con i). Las prendas de la red de tejedoras llevan la etiqueta DAHILA, nunca el nombre de la tejedora. Voz: es-UY (voseo), cálida, sin jerga corporativa.
- **Conocimiento del negocio**: vive en `/admin/estrategia` (`data.ts`), no en documentos nuevos. Los `.md` de la raíz son informes archivados de consultoría.

# Skills del repo (usarlas, no re-derivar)

- `dahila-storefront` — design tokens, reglas de UX/CRO, imágenes Next 16. Leerla ANTES de tocar UI.
- `quality-gate` — typecheck → lint → build, en orden, antes de dar nada por terminado.
- `ui-review` — checklist de accesibilidad/consistencia al cambiar UI.
