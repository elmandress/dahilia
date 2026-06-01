# Dahila Crochet — Web UI Kit

Hi-fi clickable recreation of the Dahila Crochet marketing + small-commerce surface.

This is a **recreation, not production code**. The brand has no existing codebase to import — this kit interprets the brief, the founder's voice, and the brand mark into a complete cream-and-wine experience that subsequent designs can pull from.

## Screens (click-through)
1. **Home** — sticky glass header, full-bleed hero with isotype watermark, "Hecho a mano" badge, featured pieces, founder note, encargo CTA.
2. **Colección** — filter chips, photo-led product grid, soft staggered reveal.
3. **Producto** — full-bleed garment frame, talle selector, encargo configurator, materials.
4. **Encargo** — multi-step custom-order form (qué prenda → tu medida → tus colores → contame).
5. **Atelier** — about / founder story / press.

## Components (small, neat JSX modules)
- `Header.jsx` — sticky glass nav with mark + cart count
- `Hero.jsx` — full-bleed home hero
- `ProductCard.jsx` — grid card with hover lift + "Hecho a mano" badge
- `ProductDetail.jsx` — single-product layout
- `EncargoForm.jsx` — multi-step custom-order form
- `FounderNote.jsx` — italic editorial pull-quote with isotype watermark
- `Footer.jsx` — wordmark, IG link, atelier address
- `chrome.jsx` — Button, Chip, Badge, Field primitives that consume tokens

Open `index.html` to see them in action.
