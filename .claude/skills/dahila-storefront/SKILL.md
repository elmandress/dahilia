---
name: dahila-storefront
description: >
  Design system, e-commerce UX conventions and performance rules for the Dahila
  Crochet storefront (Next.js 16 + React 19 + Supabase). Use this whenever
  building or editing storefront UI, product pages, the cart, the admin CMS, or
  touching images/fonts/SEO/pricing in this repo. Encodes Baymard/CRO research
  and Next 16 specifics so the work stays consistent and conversion-oriented.
---

# Dahila Crochet — Storefront skill

Brand: **Dahila Crochet** (the brand). The artisan/person is **Anush** — never
call the person "Dahila". Uruguayan, handmade crochet, made-to-measure. Tone:
warm, calm, boutique, not corporate. Spanish (es-UY), sentence-case headings.

## Design tokens (use these, don't invent values)
- Source of truth: `src/components/ui/Primitives.tsx` (`dahila` object) and
  `src/app/globals.css` (CSS variables).
- Ink (text): `ink900` #1F1A1B, `ink700`, `ink500`, `ink300`. Cream surfaces:
  `cream50/100/200`. Wine accent: `wine600` #8F3B53. Sale/alert red: `#B6314A`.
- Fonts via `next/font` only (Fraunces display + Inter sans). Never `@import`
  Google Fonts in CSS (double-fetch). Headings = Fraunces light (300).
- Reuse `Button`, `Chip`, `Eyebrow`, `Badge`, `Icon`, `Field` from Primitives
  instead of hand-rolling. Icons are Phosphor via CDN, kebab-case names.

## Images (Next 16 — IMPORTANT)
- `priority` is DEPRECATED in Next 16. For the LCP image use
  `fetchPriority="high" loading="eager"`. Everything else lazy-loads by default.
- Always pass `sizes`. Use `placeholder="blur" blurDataURL={BLUR_DATA_URL}`
  (exported from `src/lib/types.ts`) on hero, PDP main image and cards.
- Quality: cards `quality={82}`, hero/PDP `quality={90}`, lightbox `quality={100}`.
  Allowed qualities are declared in `next.config.ts` (`images.qualities`).
- Supabase Storage URLs are whitelisted in `next.config.ts remotePatterns`.
- Products with no media must use `PHOTO_PLACEHOLDER`, never another product's photo.

## Pricing & discounts
- List price: `getEffectivePrice(product, size)`. Final price (after discount):
  `getFinalPrice(product, size, discounts?)`. Discount %: `resolveDiscountPercent`.
- Two discount sources: per-product (`discount_percent` + `discount_active`) and
  batch rules in the `discounts` table (scope 'all' | 'category'). Best wins.
- When discounted: show final price in `#B6314A`, list price struck-through, and
  a `−N%` badge. Keep this consistent across card / PDP / cart.
- JSON-LD offer price must use the discounted price and an absolute image URL.

## E-commerce UX rules (Baymard / CRO research)
- Header is store-grade: logo left, 5–7 horizontal category links, icons
  (search, cart with count badge) right. Sticky. Announcement/benefits bar above.
- Trust signals belong near the top (F-pattern) and beside the CTA: hecho a mano,
  a medida, lana natural, envío, atención por WhatsApp.
- Variant selectors are visible buttons (talles), never hidden dropdowns. Min 44px
  touch targets. Unavailable sizes struck-through + disabled.
- PDP: gallery with clickable thumbnails + zoom lightbox; scannable highlights;
  sticky add-to-cart on mobile; related products (cross-sell, same category).
- Cart total uses final (discounted) price. Checkout is WhatsApp for now: build a
  structured message (item · talle · qty · subtotal · link, then total) and open
  `wa.me/<number>?text=`. The number comes from `site_settings.contact_whatsapp_url`.
- Empty/loading states are elegant (skeletons `sk-shimmer`, branded empty copy),
  never raw spinners or fake data.

## Content is CMS-driven
- Hero, about, FAQ, process strip, contact info live in `site_settings` and are
  edited from `/admin/configuracion`. Read with sensible code fallbacks; don't
  hard-code copy that the owner should control.

## Performance & quality gates
- Server Components for data fetching; Client Components only for interactivity.
- No `setState` in effects except the documented load-once admin pattern.
- Run `npm run lint` (0 warnings) and `npm run build` before considering done.
- CSP lives in `next.config.ts`; if you add a CDN, allowlist it there.

## Accessibility
- Every interactive control needs an accessible name (`aria-label` on icon-only
  buttons). Use `aria-expanded`/`aria-controls` on disclosures and menus.
- Images: meaningful `alt`, or `alt=""` if decorative. Maintain heading order.
- Respect `prefers-reduced-motion` for non-essential animation.

## Don'ts
- Don't reintroduce mock/preview product data or localStorage "saved" lies.
- Don't add a public email (use Instagram + WhatsApp).
- Don't use the word "atelier" heavily; prefer "taller"/"estudio"/"espacio".
- Don't push to git unless explicitly asked.
