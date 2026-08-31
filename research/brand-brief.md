# Brand brief — Dahila Crochet

Fecha: 2026-08-17. Síntesis de `research/repo-audit.md` + `research/instagram-audit.md`. Regla dura aplicada: ningún color o tipografía nuevo — todo sale de lo que ya existe en el código.

---

## Paleta real

| Rol en el sistema | Token | Hex | % de uso aproximado (inferido del propio código) |
|---|---|---|---|
| Base / fondo dominante | `white` | `#FFFFFF` | ~55% — "White-led" es literal en un comentario del código fuente |
| Fondo secundario (cards, secciones de contraste suave) | `cream100` | `#FAF1DF` | ~20% — proceso, empty states, banners, atelier note |
| Fondo secundario más claro | `cream50` | `#FFFBF2` | ~5% — background_color del manifest, fondos muy sutiles |
| Texto principal | `ink900` | `#1F1A1B` | headlines y body fuerte — negro cálido, nunca negro puro |
| Texto secundario | `ink700` | `#4A4143` | body copy, la mayoría del texto de párrafo |
| Texto terciario / labels | `ink500` | `#8C8285` | eyebrows, subtítulos, metadatos |
| **Acento de marca** | `wine600` | `#8F3B53` | ~3-5%, **siempre puntual**: íconos, links activos, un detalle — nunca fondo completo |
| Acento oscuro (hover/estado) | `wine700` | `#6E2B40` | uso mínimo |
| Rosa clarísimo (respaldo del wine) | `rose100`/`rose200` | `#F8DDE3` / `#ECC0CB` | uso puntual, casi decorativo |
| Bordes | `border` / `borderStrong` | `rgba(31,26,27,0.08)` / `rgba(31,26,27,0.18)` | separadores finos, nunca gruesos |

**Regla dura confirmada por el propio código** (comentario textual en `Primitives.tsx`): *"White-led. Cream only on cards. Pink only on micro-details."* Esto define el método de los prompts de imagen de la Fase 5: fondo blanco o cream, wine/rosa como el ÚNICO acento y siempre en un detalle chico (un hilo, un borde, un ícono), jamás como wash de color de fondo. No hay paleta violeta/degradé/pastel genérico en ningún lado del sistema real — evitarlo activamente.

No definido en código: un color "secundario" de marca más allá del wine (verde musgo y tan aparecen en la paleta pero sin uso documentado visible en las páginas auditadas) → tratarlos como acentos de reserva, no protagonistas.

## Tipografías reales

| Rol | Familia | Fallback | Peso típico | Notas |
|---|---|---|---|---|
| Display (títulos grandes, H1/H2) | **Fraunces** | Cormorant Garamond, Georgia, serif | 300 (light) | Serif editorial con eje óptico variable, sensación cálida/hecha a mano, nunca bold |
| Serif itálica (quotes, taglines) | **Fraunces** (misma familia, uso itálico) | Georgia, serif | 300 italic | Usada para "Esta semana en el taller", el tagline del footer, pull-quotes de /atelier |
| Cuerpo / labels / botones | **Inter** | system sans | 300 (body), 400 (nav/labels), 500 (botones/énfasis) | Sans neutro, legible, minúscula en body y mayúscula+tracking ancho en labels/eyebrows |

No hay una tercera familia dedicada a "labels" — los eyebrows son Inter en mayúsculas con `letter-spacing` de 0.2–0.22em. Esto es un patrón tipográfico repetible y reconocible: útil como "elemento que se repite en todas las diapositivas" en la Fase 5.

## Tono de voz (inferido de la copy real, no inventado)

- **Voseo uruguayo, cercano, en primera persona/plural mezclada** ("te acompaño", "trabajamos", "vos elegís") — nunca "usted" ni tono corporativo.
- **Honesto sobre los límites del negocio**: "no aceptamos cambios" se explica con la razón (hecho a medida) en vez de esconderse. "Depende del modelo. Te aviso cuando empiezo y cuando está lista" — no promete plazos que no puede cumplir (hay un comentario de dev explícito: *"Sin la promesa '48hs' que el formulario no hace"*).
- **Calidez sin exageración**: nada de "¡SUPER OFERTA!" ni superlativos de venta agresiva. El gancho más fuerte encontrado es "Tejido con tiempo." — cinco palabras, sin signo de exclamación.
- **Proceso como argumento de valor**, repetido en casi cada página: "sin apuro", "sin prisa", "paso a paso", "pieza por pieza" — la lentitud se nombra como virtud, no se disculpa.
- **Frases cortas, puntuación simple**, oraciones que suenan habladas ("Contanos qué tenés en mente", "Charlamos", "Coordinás por WhatsApp").
- Nivel de personalización real: Anush es una persona nombrada y visible (no "el equipo" ni "nosotros" anónimo), pero el "nosotras/nosotros" también aparece cuando incluye a la red de tejedoras — mezcla intencional de voz personal + colectiva.

## Propuesta de valor tal como la comunica el sitio hoy

Condensada de title/description de metadata + hero + trust bar:

> **Ropa y accesorios tejidos a mano en Uruguay, a la medida exacta de quien los usa — talle y colores elegidos por la clienta, con lana natural, sin apuro, y envío a todo el país.**

Los cuatro pilares que el propio sitio repite en la trust bar de home (literal, no interpretado): **Hecho a mano · A tu medida · Lana natural · Envío a todo el país.** Estos cuatro son el "menú" de propuestas de valor disponibles para carruseles — cualquier ángulo que se elija debería anclar en al menos uno de estos cuatro, no inventar un quinto.

## Público objetivo (inferido de catálogo + Instagram, no de research externo genérico)

- Catálogo = indumentaria y accesorios de moda (tops, cardigans, chalecos, ponchos, sets, bolsos, bufandas) en el rango de precio $360–$1.490 (columna "hoy" de `PRICE_TABLE`) — **no** amigurumis ni decoración de hogar. Esto ubica al público en "moda/estilo personal", no en "regalos artesanales genéricos" ni "hobbistas del crochet".
- Perfil de Instagram con 4.114 seguidores / 38 posts (ver `instagram-audit.md`) — cuenta chica y activa, en etapa de crecimiento, no una marca masiva. El contenido tiene que poder sostenerse con recursos reales (fotos de producto propias, no producción de estudio).
- El sitio ofrece envío internacional "bajo consulta" con casos reales mencionados (Argentina, Brasil, España) → hay clientas fuera de Uruguay, aunque el foco declarado es Uruguay/Montevideo.
- `MARKET_BANDS` interno (de `admin/estrategia/data.ts`) ubica a Dahila entre el emprendimiento informal de feria/DM y la ropa de marca de máquina (Zara/Mango) — el público valora diseño y hecho-a-mano pero compara mentalmente contra precios de moda accesible, no contra artesanía de lujo. Esto importa para el carrusel de valor: el argumento tiene que anclar contra "ropa de máquina", no contra "arte artesanal caro", porque así es como la propia marca se posiciona internamente.

## No definido — marcado explícitamente (regla dura del pedido)

- **Bio completa de Instagram, hashtags reales usados, tono exacto de las captions**: no accesible (ver instagram-audit.md). No se inventan; el copy sugerido de los carruseles se basa en el tono ya confirmado por la copy del sitio, que es la misma marca.
- **Un segundo color de acento "oficial"** más allá de wine/rosa: no hay evidencia de uso real de `moss500` o `tan500` en ninguna página auditada — quedan disponibles pero no se recomiendan como protagonistas.
- **Naming de la persona detrás de cuentas o dueña en Instagram**: se asume que es Anush (coincide con /atelier), pero no se pudo confirmar contra la bio real de Instagram.
