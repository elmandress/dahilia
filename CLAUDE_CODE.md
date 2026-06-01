# Handoff a Claude Code — Dahila Crochet

Este documento es para Claude Code (o cualquier dev) que tome este sistema de diseño y lo convierta en una tienda web funcional. Está en español porque el dominio de negocio lo está.

## Qué hay acá ya hecho

Este repo tiene los **bloques estáticos** del producto. No tiene base de datos, ni checkout, ni panel admin — eso lo construís vos. Lo que sí está pronto:

- **`colors_and_type.css`** — todos los tokens del sistema (colores, tipografía, espaciado, sombras, motion). Pegalo en tu app, listo.
- **`assets/`** — logos (PNG transparente, color + negro) e isotipo. **`assets/photos/`** tiene 12 fotos reales de productos y atelier; en producción reemplazás por imágenes servidas desde tu CDN.
- **`ui_kits/web/`** — recreación React-en-Babel de toda la interfaz pública. Estos componentes son **referencia visual**, no producción. Los usás como blueprint, no los importás.
- **`preview/*.html`** — cards atómicas del sistema de diseño (botones, badges, paleta, type, etc). Útiles para confirmar que tu implementación calza pixel-perfect.
- **`prints/*.html`** — folletos imprimibles y posts para redes. Usá Cmd/Ctrl+P → "Guardar como PDF".

## Stack recomendado

La instrucción de la dueña es **"vincular vía DB para todo lo que son productos"**. La elección concreta:

- **Framework:** Next.js 15 (App Router) o SvelteKit. Server Components manejan el catálogo desde la DB sin client-side hydration extra.
- **Base de datos:** PostgreSQL (Neon o Supabase). Modelo abajo.
- **Storage de imágenes:** Cloudinary o Supabase Storage. Tienen transformación on-the-fly y CDN.
- **Auth admin:** un solo usuario (Anush). Clerk free tier o NextAuth con magic link al mail.
- **Pagos:** Mercado Pago Checkout Pro (lo estándar en UY).
- **Mail transaccional:** Resend.
- **Hosting:** Vercel o Cloudflare Pages.

No es tienda Shopify. Es código propio.

## Modelo de datos mínimo

```sql
-- Productos
CREATE TABLE products (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text UNIQUE NOT NULL,        -- 'top-lourdes'
  name         text NOT NULL,                -- 'Top Lourdes'
  description  text,                          -- markdown OK
  price_uyu    integer NOT NULL,             -- guardar en centavos o enteros, no float
  category     text NOT NULL,                 -- 'tops' | 'cardigans' | 'accesorios' | 'sets'
  badge        text,                          -- 'Nuevo' | 'A medida' | 'Edición limitada' | null
  status       text NOT NULL DEFAULT 'active', -- 'active' | 'soldout' | 'draft'
  sort_order   integer DEFAULT 0,
  lead_time_weeks_min integer DEFAULT 4,
  lead_time_weeks_max integer DEFAULT 6,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

CREATE TABLE product_photos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         text NOT NULL,                 -- absolute URL on Cloudinary
  alt         text,
  position    integer NOT NULL DEFAULT 0,
  is_primary  boolean DEFAULT false
);

CREATE TABLE product_sizes (
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size        text NOT NULL,                 -- 'XS' | 'S' | 'M' | 'L' | 'XL' | 'custom'
  available   boolean DEFAULT true,
  PRIMARY KEY (product_id, size)
);

-- Encargos a medida (custom orders)
CREATE TABLE custom_orders (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  whatsapp      text,
  garment_type  text NOT NULL,                -- 'Cardigan' | 'Top' | 'Set' | 'Otro'
  size          text,
  measurements  jsonb,                         -- { busto, cintura, largo }
  palette_idx   integer,
  message       text,
  status        text DEFAULT 'new',            -- 'new' | 'replied' | 'in_progress' | 'done'
  created_at    timestamptz DEFAULT now()
);

-- Carrito (server-side, persistencia simple)
CREATE TABLE cart_items (
  cart_id     uuid NOT NULL,                  -- cookie, server-issued
  product_id  uuid NOT NULL REFERENCES products(id),
  size        text NOT NULL,
  qty         integer NOT NULL DEFAULT 1,
  added_at    timestamptz DEFAULT now(),
  PRIMARY KEY (cart_id, product_id, size)
);
```

## Rutas a construir

| Ruta | Qué hace |
|---|---|
| `/`            | Home — hero + NEW IN (`products WHERE badge='Nuevo' OR created_at > now()-30d ORDER BY sort_order LIMIT 4`) + accesorios + atelier strip + FAQ |
| `/tienda`      | Listado completo con filtro por `category`. Mobile: 2 columnas |
| `/tienda/:slug`| Detalle del producto + galería + select de talle + "Añadir al carrito" + "Reservar a medida" |
| `/encargo`     | Form que inserta una fila en `custom_orders` + manda mail con Resend |
| `/atelier`     | Estática, copy del repo |
| `/contacto`    | Estática, links a IG / WhatsApp / mail |
| `/carrito`     | Vista del carrito server-side por cookie |
| `/checkout`    | Iniciar pago Mercado Pago |
| `/admin`       | (autenticado) CRUD de productos, fotos, ver encargos |

## Implementación de los componentes

Los `.jsx` en `ui_kits/web/` corresponden 1-a-1 con los componentes que querrás crear. Mapeo:

| Archivo de referencia | Componente nuevo |
|---|---|
| `chrome.jsx`        | `<Button>`, `<Chip>`, `<Badge>`, `<Field>`, `<TextInput>`, `<Icon>` (Phosphor Light) |
| `Header.jsx`        | `<SiteHeader>` — sticky, cart count desde DB |
| `Footer.jsx`        | `<SiteFooter>` — sin "Tecnología de Shopify" |
| `ProductCard.jsx`   | `<ProductCard product={...}>` — recibe row de DB |
| `HomeScreen.jsx`    | `app/page.tsx` (server component, fetch productos) |
| `ShopScreens.jsx`   | `app/tienda/page.tsx` + `app/tienda/[slug]/page.tsx` |
| `EncargoAtelier.jsx`| `app/encargo/page.tsx`, `app/atelier/page.tsx`, `app/contacto/page.tsx` |

**No copies el código JSX literal — recrealo en TS con server components, ESM modules, y `next/image`. Esos archivos son blueprint visual, no producción.**

## Decisiones tomadas (no las cambies sin avisar)

1. **White-led, no cream-led.** El fondo de la página es blanco puro. Crema solo dentro de cards/recuadros.
2. **Rosa solo en detalles.** Nunca un section fill, nunca un botón primario.
3. **Botón primario = `var(--ink-900)`** (negro), no rosa, no vino.
4. **Tipografía liviana.** Fraunces 300 / Inter 300 por defecto. 400/500 solo en UI elements que necesitan peso (precio, label de botón primario).
5. **Mobile-first 2-col grid.** 90% del tráfico es mobile.
6. **Voz en primera persona, voseo, sin business-speak.** Ver README.md → Content Fundamentals.
7. **No hay tecnología de Shopify visible.** Es código propio.

## Cosas concretas que YO no pude hacer

- **Comprimir las fotos.** Las JPG/PNG en `assets/photos/` son los originales del teléfono. En producción corré las por `next/image` o Cloudinary con `q_auto,f_auto`.
- **SVG del logo.** Recibí el logo en PNG 512×512 con transparencia (rosa+vino) y 1024×1024 monocromo negro. **No tengo SVG**. Pedile a Anush el AI/SVG original si lo quiere para silkscreen / vinilo / bordados.
- **Sistema de talles.** Los talles XS-XL son los estándar de la industria; podés mantener o reemplazar por su tabla real.
- **Precios.** Los `UYU 3.450` etc. son inventados. Cargá los reales desde la DB.

## Contacto productivo

- Dueña: Anush — Instagram `@dahila.crochet` · WhatsApp `+598 94 605 015`
- Atelier: Montevideo, Uruguay

---

Cuando termines la primera versión, pegale el link a este repo y volvemos a iterar el sistema basado en lo que funcionó/no funcionó en la implementación.
