# Repo audit — Dahila Crochet

Fecha: 2026-08-17. Todo el contenido de este archivo es copia textual del código fuente del repo (`c:\Users\mati\Downloads\dahilia`), salvo donde se indica explícitamente "(paráfrasis)". Fuente = ruta de archivo entre paréntesis.

---

## 1. Copy real, textual

### Metadata global / SEO (src/app/layout.tsx)
- Title template: `%s | Dahila Crochet`
- Title default: **"Dahila Crochet — Ropa tejida a mano en Uruguay, a tu medida"**
- Description: **"Tops, cardigans y accesorios tejidos a crochet en Montevideo. Elegís el talle y los colores, y se teje especialmente para vos. Envío a todo Uruguay."**
- Keywords: crochet, ropa a medida, uruguay, tejido, handmade, slow fashion, dahila
- OG title: "Dahila Crochet — tejido a mano en Uruguay, a tu medida"
- OG description: "Cada prenda se teje especialmente para vos: tu talle, tus colores. Envío a todo Uruguay."
- JSON-LD Organization: `alternateName: ['Dahila', 'Dalia Crochet', 'Dahlia Crochet']`, description: "Prendas tejidas a crochet, hechas a mano y a medida, desde Montevideo, Uruguay.", `sameAs: ['https://www.instagram.com/dahila.crochet/']`, dirección Montevideo/UY, teléfono +598 99 850 073.
- Política de devolución declarada: `MerchantReturnNotPermitted` (piezas a medida no admiten cambios).

### Home (src/app/HomeClient.tsx + src/app/page.tsx)
- Hero eyebrow (default): **"Edición a medida"**
- Hero title (default): **"Tejido con tiempo."**
- Hero CTA (default): **"Ver tienda"**
- Trust bar (4 íconos, fijos en código):
  1. Hecho a mano — "Tejido pieza por pieza"
  2. A tu medida — "Ajustado a vos"
  3. Lana natural — "Materiales nobles"
  4. Envío a todo el país — "Coordinás por WhatsApp"
- Sección "Nuevo" → link "Ver toda la colección →"
- Proceso (3 pasos, default):
  1. **A medida** — "Cada pieza la trabajo con tu medida exacta y los colores que elegís vos."
  2. **Hecho a mano** — "Lana natural, sin prisa. El plazo lo charlamos según el modelo."
  3. **Envío incluido** — "A todo Uruguay. Internacionales bajo consulta."
- Empty-state de colección: "No hay piezas en la tienda por ahora." / "Estoy preparando la próxima edición. Mientras tanto podés pedir una prenda a medida." / CTA "Pedir a medida"
- About/split (default): eyebrow "Sobre nosotros", título "Detrás de cada hilo", body "En Dahila tejemos a crochet prendas únicas, sin apuro y con vos.", CTA "Conocé más" → /atelier. Alt de imagen: "Anush tejiendo".
- "Esta semana en el taller" — nota editable de Anush, humaniza la marca (bloque opcional).
- FAQ (5, default):
  1. "¿Cuánto tarda un encargo?" → "Depende del modelo. Te aviso cuando empiezo y cuando está lista."
  2. "¿Puedo elegir colores?" → "Sí. Después de confirmar el modelo te muestro las lanas reales que tengo y elegimos juntas."
  3. "¿Hacen envíos al exterior?" → "Bajo consulta. Trabajé con clientas en Argentina, Brasil y España — escribime y vemos costos."
  4. "¿Aceptan devoluciones?" → "Como cada pieza se hace a medida, no aceptamos cambios. Por eso te acompaño durante todo el proceso."
  5. "¿Dahila se escribe con H? ¿Es lo mismo que Dalia o Dahlia?" → "Sí — somos Dahila Crochet. Mucha gente nos busca como 'Dalia' o 'Dahlia' y llega igual: es la misma marca, hecha a mano en Montevideo."
- Lista VIP (Footer, componente `VipSignup`): "Cada colección sale en cantidades chicas — es tejido a mano. Anotate y comprá 24 horas antes que el resto." CTA: "Quiero acceso anticipado". Confirmación: "¡Lista! Vas a ver cada colección antes que nadie."

### /ig — link-in-bio (src/app/ig/page.tsx)
- Título de marca: "DAHILA"
- Subtítulo: **"Tejido a mano en Uruguay, a tu medida."**
- Bloque drop: eyebrow "Próximo drop"
- Sección "Lo nuevo"
- Enlaces: "Ver toda la tienda", "Pedir una prenda a medida", "Tejé con Dahila", "Escribime por WhatsApp"
- Pie: "Cada colección sale en cantidades chicas — la lista VIP la ve 24 horas antes. Anotate al pie de la página."

### /tienda (catálogo)
- Title: "Ropa de crochet hecha a mano en Uruguay"
- Description: "Tops, cardigans, bolsos y sets tejidos a mano en Montevideo, con precios claros. Cada pieza se puede pedir en tu talle y tus colores. Envío a todo Uruguay."
- OG description: misma, colección description: "Colección actual de prendas tejidas a crochet — tops, cardigans, accesorios y sets."
- Alt de foto de producto en `ProductCard`: el **nombre del producto** (no hay alt-text descriptivo separado, es literal `product.name`).

### /atelier — "quiénes estamos detrás" (src/app/atelier/page.tsx)
- Title: "Quién teje tus prendas — el taller"
- Description: "Conocé a Anush y el taller de Montevideo donde nace cada pieza: lana elegida a mano, tu medida real y tejido sin apuro. Así se hace lo que ninguna máquina puede."
- Eyebrow default: "Sobre nosotros"
- H1 default: "Quiénes estamos detrás de cada pieza."
- Body default: "En Dahila tejemos a crochet desde hace años. Hacemos prendas únicas, pensadas con vos: trabajamos con lanas y algodones naturales, sin prisa, paso a paso. Cada pieza la pensamos con la persona que la va a usar — conversamos, vemos colores, ajustamos medidas, y tejemos."
- Valores (3, default):
  1. **Hecho a mano** — "Cada prenda se teje pieza por pieza, sin máquinas."
  2. **A tu medida** — "Ajustamos talle y colores a lo que vos querés."
  3. **Materiales nobles** — "Lana y algodón natural, elegidos con cuidado."
- JSON-LD Person: Anush, "Tejedora y fundadora", "Artesana de crochet. Teje a mano, a medida, cada pieza de Dahila Crochet desde Montevideo, Uruguay."
- Fotos del strip (rutas): `/photos/detalle-tejido.jpg`, `/photos/atelier-escritorio.png`, `/photos/bufanda-verde.png`.

### /info (envíos, pagos, cuidados)
- H1: "Todo lo que necesitás saber."
- **Envíos**: "Hacemos envíos a todo Uruguay. El costo y el plazo los coordinamos por WhatsApp según dónde estés. Para envíos al exterior, escribinos y vemos juntas."
- **Cómo encargar a medida**: "Contanos qué tenés en mente desde la sección 'A medida' o por WhatsApp. Te respondemos con opciones de modelo, materiales y presupuesto. Cuando confirmás, empezamos a tejer."
- **Formas de pago**: "Coordinamos el pago por WhatsApp: transferencia o el medio que te quede cómodo."
- **Cambios y devoluciones**: "Como cada prenda se hace a mano y muchas veces a medida, no hacemos cambios por talle. Por eso te acompañamos durante todo el proceso para que quede perfecta. Si llega algo mal, escribinos y lo resolvemos."
- **Cuidados de las prendas**: "Lavá a mano con agua fría y jabón neutro. Secá en horizontal, a la sombra, sin colgar. No uses secarropas. Así tu prenda dura años." ← dato directamente útil para el carrusel de cuidado.

### /encargo (pedido a medida)
- Title: "Encargá tu prenda de crochet a medida"
- Description: "Contanos qué tenés en mente: Anush te responde con opciones, materiales y presupuesto, sin compromiso. Tu talle exacto, tus colores — tejido a mano en Montevideo."
- Nota de copy interna (comentario del dev, refleja decisión de marca): "Sin la promesa '48hs' que el formulario no hace — el gancho es el proceso sin riesgo: contás la idea y recibís propuesta y presupuesto sin comprometerte."

### /tejedoras (red de tejedoras — reclutamiento, NO cliente final)
- Title: "Tejé con Dahila — red de tejedoras"
- Description: "Sumate a la red de tejedoras de Dahila Crochet. Trabajá desde casa, a tu ritmo, con pago por pieza aprobada y materiales incluidos. Postulate hoy."
- Pasos (4): "Postulás" → "Nos contás tu experiencia y nos mostrás 2 o 3 trabajos tuyos. Las fotos son lo primero que miramos." / "Charlamos" → WhatsApp / "Muestra pagada" → "Tejés una pieza de prueba contra una ficha técnica (lana, aguja, medidas). La pagamos siempre, quede o no." / "Primeros encargos" → "Arrancás con piezas simples, con precio pactado antes de empezar, y vas subiendo a tu ritmo."
- Qué valoran: "Tensión pareja y puntos prolijos", "Medidas exactas según la ficha de cada modelo", "Terminaciones y costuras cuidadas", "Cumplir los tiempos que acordamos juntas".
- Confirmación: "¡Gracias por querer tejer con nosotras!" / "Vamos a mirar tus trabajos con calma. Si tu estilo encaja con lo que buscamos, te escribimos para coordinar una muestra pagada."
- **Nota de marca (de AGENTS.md, confirmada)**: las prendas tejidas por la red de tejedoras llevan la etiqueta DAHILA, nunca el nombre de la tejedora individual — irrelevante para carruseles de venta al cliente final, pero importante para no mostrar "tejedoras" como firma personal en contenido promocional.

### Footer (src/components/Footer.tsx)
- Tagline default: "Prendas tejidas a mano, a tu medida, desde Montevideo."
- Columna Contacto: "@dahila.crochet" (Instagram), "WhatsApp · 99 850 073"
- Copyright: "© {año} Dahila Crochet — hecho a mano en Uruguay" / "Montevideo · Uruguay"

---

## 2. Tokens de diseño reales

### Paleta (src/components/ui/Primitives.tsx, objeto `dahila`)
| Token | Hex | Uso aparente |
|---|---|---|
| `white` | `#FFFFFF` | Fondo base, "White-led" (comentario en código: "White-led. Cream only on cards. Pink only on micro-details.") |
| `cream50` | `#FFFBF2` | Fondo alterno muy sutil, background_color del manifest |
| `cream100` | `#FAF1DF` | Fondo de cards, secciones "proceso", banners, empty states |
| `cream200` | `#F1E3C8` | Variante más oscura de cream |
| `rose50` | `#FDF2F4` | Rosa muy claro (uso puntual) |
| `rose100` | `#F8DDE3` | Rosa claro |
| `rose200` | `#ECC0CB` | Rosa medio |
| `rose300` | `#E693A7` | Rosa más saturado |
| `wine600` | `#8F3B53` | **Acento principal** — íconos de la trust bar, links activos, detalles puntuales |
| `wine700` | `#6E2B40` | Wine oscuro (hover/estados) |
| `tan500` | `#A37B53` | Tono tierra, uso puntual |
| `moss500` | `#6A8456` | Verde musgo, uso puntual |
| `ink900` | `#1F1A1B` | Texto principal, casi-negro cálido (no negro puro) |
| `ink700` | `#4A4143` | Texto secundario/body |
| `ink500` | `#8C8285` | Texto terciario, labels, subtítulos |
| `ink300` | `#C9C2C4` | Texto deshabilitado / detalles muy sutiles |
| `ink100` | `#EDE9EA` | Fondo muy claro |
| `border` | `rgba(31,26,27,0.08)` | Bordes sutiles |
| `borderStrong` | `rgba(31,26,27,0.18)` | Bordes marcados |

**Regla de uso explícita en el propio código** (comentario en Primitives.tsx): *"White-led. Cream only on cards. Pink only on micro-details."* — esto es clave para el método de la Fase 5: el rosa/wine NUNCA es wash de fondo, siempre es un detalle puntual. Confirma la regla dura de "un solo acento, de forma puntual" que ya se pedía en el brief.

Otros colores puntuales fuera del objeto `dahila`: WhatsApp verde `#25D366` (usado en botones de WhatsApp, no es color de marca).

- `theme_color` (manifest / viewport): `#FFFFFF`
- `background_color` (manifest): `#FFFBF2`

### Tipografías (src/app/layout.tsx + globals.css)
- **Display / serif editorial**: `Fraunces` (Google Font, variable `--font-display` y `--font-serif` apuntan ambas a Fraunces — mismo font para display grande y para las citas/pull-quotes en itálica). Fallback: `'Cormorant Garamond', Georgia, serif`. Solo se usa el eje óptico (`opsz`), sin SOFT ni WONK. Peso usado en el código: **300 (light)** casi exclusivamente para títulos y bloques display; itálica (`fontStyle: italic`) para quotes/tagline.
- **Sans / cuerpo**: `Inter` (Google Font, variable `--font-sans`). Pesos usados: 300 (body/párrafos), 400 (labels, nav), 500 (botones, énfasis).
- No hay una tercera familia "de labels" separada — los labels/eyebrows usan Inter en mayúsculas con `letter-spacing` amplio (0.2em–0.22em), no una fuente distinta.

### Otros tokens
- `shadowSm`: `0 4px 14px -8px rgba(31,26,27,0.08)`
- `shadowMd`: `0 14px 30px -18px rgba(31,26,27,0.12)`
- `ease` (transición): `cubic-bezier(0.22,0.61,0.36,1)`
- Border-radius típico visto en el código: 12–20px (cards 16px, botones 8–10px, banners 20px) — esquinas redondeadas suaves, no rectas ni muy circulares.

---

## 3. Imágenes/fotos reales en el repo

Todas en `public/photos/`:
| Ruta | Uso en el código | Qué muestra (según alt/contexto) |
|---|---|---|
| `/photos/top-lace-parque.jpg` | Hero de home (default) | Prenda tejida (top), foto en exterior/parque |
| `/photos/atelier-escritorio.png` | About/split en home + atelier photo strip | Escritorio del taller |
| `/photos/atelier-tejiendo.jpg` | Hero de /atelier (default) | Manos tejiendo, "quiénes estamos detrás" |
| `/photos/detalle-tejido.jpg` | Atelier photo strip | Detalle de textura de tejido |
| `/photos/bufanda-verde.png` | Atelier photo strip | Bufanda verde |

Otras imágenes de marca en `public/`:
- `isotype-color.png` — isotipo/ícono de marca a color (usado en header, footer, /ig, JSON-LD `logo`, 512×512)
- `logo-full.jpg` — logo completo, usado como `image` en JSON-LD (1200×630)
- `logo-full-transparent.png` — variante transparente del logo
- `placeholder-product.svg` — placeholder cuando un producto no tiene foto
- Favicons/manifest: `favicon.ico`, `favicon.svg`, `favicon-96x96.png`, `apple-touch-icon.png`, `web-app-manifest-192x192.png`, `web-app-manifest-512x512.png`

Las fotos de producto reales viven en Supabase Storage (tabla `product_media`), no en el repo — no se pueden auditar por código, pero sí sabemos que las tarjetas usan `aspectRatio: '3/4'` o `'4/5'` y `objectFit: cover`.

---

## 4. Archivos de marca existentes

- `public/site.webmanifest`: name "Dahila Crochet", short_name "Dahila", description "Prendas únicas tejidas a crochet en Uruguay. Hechas a mano, a tu medida.", `background_color: #FFFBF2`, `theme_color: #FFFFFF`, `lang: es-UY`, categories `["shopping", "lifestyle"]`.
- No existe un archivo de brand guidelines dedicado (ni PDF ni .md) — el "brand book" de facto es el objeto `dahila` en Primitives.tsx + el comentario "White-led. Cream only on cards. Pink only on micro-details."
- `ESTRATEGIA-DEFINITIVA.md` / `src/app/admin/estrategia/data.ts` funcionan como el documento de estrategia de negocio vivo (ver sección 5).

---

## 5. Estructura de productos/catálogo

Categorías reales (database/schema.sql, seed):
1. **Tops** (`tops`)
2. **Cardigans** (`cardigans`)
3. **Accesorios** (`accesorios`)

Del `PRICE_TABLE` real en `src/app/admin/estrategia/data.ts` (tabla de precios aprobada, jul 2026 — **fuente de verdad, no inventar precios**), el catálogo incluye estos tipos de pieza (nombre exacto, horas de trabajo declaradas, costo de materiales declarado):

| Pieza | Horas | Materiales (UYU) | Precio hoy (UYU) |
|---|---|---|---|
| Set BRISA (3 piezas) | 16 | 350 | 890 |
| Cardigan 3/4 | 22 | 480 | 1290 |
| Cardigan CRUZADO | 22 | 480 | 1290 |
| Poncho | 19 | 450 | 1290 |
| Set LUEUR (3 piezas) | 18 | 380 | 1150 |
| Chaleco | 16 | 350 | 1190 |
| Set LUREX | 17 | 400 | 1250 |
| BEACH set | 20 | 450 | 1490 |
| Top FLOWER | 16 | 320 | 1250 |
| Top CHERRY | 14 | 300 | 1090 |
| Top SUMMER | 14 | 300 | 1090 |
| Falda SERENADA | 14 | 300 | 1090 |
| Top HIGGIE | 13 | 280 | 1050 |
| Top RACE / MARESIA / LAGOM / AMÉLIE | 13 | 280 | 990–1050 |
| Top HALTER / DUNA | 11 | 250 | 890 |
| Set bufanda y guantes | 9 | 220 | 790 |
| COWL NECK top | 8 | 200 | 620 |
| Bolso de estudiante / Tote bag de playa | 7 | 250 | 720 |
| DONUT bag | 6 | 220 | 720 |
| Bolso a cuadros | 8 | 300 | 1050 |
| Mini tote bag | 5 | 180 | 650 |
| Bolso LOLA | 10 | 350 | 1390 |
| Bufanda SOPHIE / Calentadores | 5 | 180 | 590 |
| Bandana | 4 | 150 | 500 (precio congelado, "puerta de entrada") |
| Mini BUFANDAS | 3 | 100 | 360 (precio congelado, regalo/impulso) |

**Este dato es oro para el carrusel #2 (valor del crochet)**: son horas y costos de materiales reales y ya aprobados internamente, no hace falta salir a buscar "horas por pieza" genéricas en internet — el propio catálogo de Dahila ya lo mide pieza por pieza. Ver `PRICING_WHY` (misma fuente): *"La regla es simple: mirá cuánto te queda por hora de trabajo en cada pieza (precio menos materiales, dividido las horas). Los bolsos te pagaban $67–104 la hora; los cardigans y sets, $34–44 — menos de un tercio del salario mínimo legal ($127)."*

Tipos de pieza que vende Dahila, en resumen: **tops, cardigans, chalecos, ponchos, sets (2–3 piezas), faldas, bolsos/tote bags, bufandas, calentadores, bandanas**. No hay amigurumis ni decoración de hogar en el catálogo actual — es indumentaria y accesorios de moda, no juguetería ni decoración. Venta por catálogo fijo + por encargo a medida (formulario /encargo).

No hay tabla de pedidos (`orders` existe desde jul 2026 para captura interna, pero el checkout real es 100% por WhatsApp — ver AGENTS.md).

---

## 6. Otros datos de negocio relevantes (para no inventar en fases siguientes)

- Testimonios: existe tabla `testimonials` (author, quote, etc.) editable desde el admin, pero **no hay contenido de testimonio hardcodeado en el repo que se pueda citar** — cualquier testimonio en los carruseles debe ser genérico sin atribución, o dejarse en blanco para que Anush pegue uno real después (regla dura del brief, confirmada: no hay fuente real para citar).
- WhatsApp de contacto: `+598 99 850 073` / `https://wa.me/59899850073`.
- El negocio es de una sola persona detrás de la marca visible: **Anush**, "Tejedora y fundadora" (JSON-LD Person). La red de tejedoras delegadas nunca se nombra individualmente en contenido de marca (ver AGENTS.md + tejedoras-tejedoras memory).
