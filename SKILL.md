---
name: dahila-crochet-design
description: Use this skill to generate well-branded interfaces and assets for Dahila Crochet — a Uruguayan handmade crochet fashion brand — either for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, real product photography, and a UI kit you can compose into landing pages, lookbooks, encargos forms, and Instagram-feed assets.
user-invocable: true
---

# Dahila Crochet — design skill

Read `README.md` for the full brand context (voice, visual foundations, iconography, logo rules). Then explore:

- `colors_and_type.css` — drop-in tokens (white canvas, cream surfaces, pink details, ink type)
- `assets/` — logos (`isotype-color.png` principal, `isotype-black.png` monocromo) + real product photography in `assets/photos/`
- `ui_kits/web/` — component recreations of the marketing + shop surface (React + Babel)
- `prints/` — folletos imprimibles + posts para redes (A4, IG square, IG story, A6 flyer)
- `preview/` — atomic design-system cards (colors, type, components, brand)
- `CLAUDE_CODE.md` — handoff document with DB schema and stack for converting this into a working store

## When generating artifacts

- **White is the canvas.** Cream (`--cream-100`, `#FAF1DF`) is only for cards / chips / recuadros. Pink (`--rose-300`, `#E693A7`) only for micro-details — never a section fill.
- **Type is light.** Fraunces 300 for display, Inter 300 for body. UPPERCASE only for the wordmark and a few labels.
- **Voice is Anush's.** First-person Rioplatense Spanish, voseo, no business-speak, sparing use of emoji (🪡 ✨ 😉), no hype, no urgency.
- **Photography is real.** Pull from `assets/photos/` (12 real product/atelier shots). Don't generate placeholder gradients when real photos exist.
- **Mobile matters.** 90% of customers shop on phones. Two-column grids on mobile, one-column on narrow.
- **Subtle, never loud.** Anush's words: "que se vea chill, joven, tranqui — con paciencia y detalle". Never infantile, never abuelita.

If asked to mock or design something from scratch, copy the assets you need into a new HTML file and link `colors_and_type.css`. For production code, lift the tokens and the JSX components from `ui_kits/web/`.

If invoked with no further guidance, ask the user what they want to build (landing page, product card, Instagram carousel, encargo form, etc.), confirm whether they want one option or a few variations, and act as the in-house designer for Dahila.
