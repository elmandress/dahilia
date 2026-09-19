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

Rules:
- Never patch over a failing check (no `// @ts-ignore`, no skipping lint).
- If you changed pricing, cart, discounts, or checkout, manually re-verify the
  number shown equals `getFinalPrice(...)`.
- Do not commit, and never push, unless the user asked. Local commits only when
  instructed.
