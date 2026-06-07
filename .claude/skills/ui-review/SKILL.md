---
name: ui-review
description: >
  Interface review checklist for this repo — accessibility, visual consistency,
  and "does this look hand-crafted vs. AI-generated" tells. Use when adding or
  changing any UI. Distilled from web-design-guidelines / frontend-design skills
  and Baymard e-commerce UX research, tuned to Dahila's design system.
---

# UI review checklist

Run this mentally (or literally) over any UI you add or touch.

## Accessibility (WCAG-leaning, the bits that matter most)
- Icon-only buttons/links have an `aria-label`. Decorative images use `alt=""`;
  meaningful images have real `alt`.
- Disclosures/menus/accordions set `aria-expanded` + `aria-controls`.
- Headings descend in order (one h1 per page, no skipping levels).
- Interactive targets ≥ 44px on touch.
- Visible keyboard focus: rely on the global `:focus-visible` ring in
  globals.css — never `outline: none` without a replacement.
- Body text contrast ≥ 4.5:1 (ink700 on white is fine; ink500 only for
  secondary/meta, never long body copy).
- Honor `prefers-reduced-motion` (global guard exists; don't override it).

## Visual consistency (use the system, don't improvise)
- Colors/spacing/radii/shadows come from the `dahila` tokens or CSS vars.
  No ad-hoc hex except the established sale red `#B6314A` / WhatsApp `#25D366`.
- Type: Fraunces (display, weight 300) for headings, Inter for UI/body.
  Reuse Primitives (`Button`, `Chip`, `Eyebrow`, `Badge`, `Field`, `Icon`).
- Consistent corner radii (8/12/16) and consistent gap rhythm.

## "Doesn't look vibecoded" tells — avoid these
- No generic copy ("game-changer", "unlock", "elevate your style"). Write like
  a person: specific, warm, Uruguayan, varied sentence length.
- Emojis: essentially none in UI chrome.
- No three-equal-columns-of-icons-with-lorem feel; every section earns its place.
- Real imagery with proper aspect ratios and blur placeholders, never stretched.
- Micro-interactions are subtle and purposeful (hover lift ≤ 2px, 140–220ms,
  the project easing), not bouncy or everywhere.
- Optical alignment over mathematical: prices right-aligned, baselines aligned,
  hairline borders (rgba ink at 0.08) instead of solid #ccc.

## E-commerce specifics
- Product price: discounted in red + struck list price + `−N%` badge, consistent
  across card / PDP / cart.
- Variant selectors are visible buttons. Sticky add-to-cart on mobile PDP.
- Trust cues near hero and CTA. Empty/loading states are branded skeletons.
