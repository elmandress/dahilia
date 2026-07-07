// ─── Brevo adapter (FUTURE — marketing / lifecycle / cart recovery) ──────────
//
// Resend (client.ts) handles TRANSACTIONAL email today. Brevo is the planned
// home for MARKETING: newsletter, seasonal campaigns, VIP, birthdays, review
// requests and — most importantly — automated ABANDONED-CART recovery driven by
// e-commerce events.
//
// This file is intentionally INERT: every function no-ops until BREVO_API_KEY is
// set, so nothing here requires an account or key to ship. When you're ready:
//
//   1. Create a free Brevo account (~9.000 emails/mes) → Settings → SMTP & API →
//      generate an API key. Add BREVO_API_KEY to the environment.
//   2. Create a contact list + the automation ("Abandoned cart") in Brevo's UI.
//   3. Fill in the fetch() calls below against https://api.brevo.com/v3.
//   4. Call `upsertContact()` from the newsletter form and `trackEvent('cart_updated', …)`
//      from the cart, and Brevo's automation does the rest.
//
// The interface mirrors exactly what the storefront will need, so going live is
// a one-file change with no refactor of the calling code.

const BREVO_BASE = 'https://api.brevo.com/v3'

export interface BrevoContact {
  email: string
  attributes?: Record<string, string | number>
  listIds?: number[]
}

export interface BrevoResult {
  ok: boolean
  skipped?: boolean
  error?: string
}

export function brevoConfigured(): boolean {
  return Boolean(process.env.BREVO_API_KEY)
}

/** Create/update a marketing contact (newsletter signup, customer, VIP…). */
export async function upsertContact(contact: BrevoContact): Promise<BrevoResult> {
  const key = process.env.BREVO_API_KEY
  if (!key) return { ok: false, skipped: true }
  try {
    const res = await fetch(`${BREVO_BASE}/contacts`, {
      method: 'POST',
      headers: { 'api-key': key, 'Content-Type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        email: contact.email,
        attributes: contact.attributes,
        listIds: contact.listIds,
        updateEnabled: true,
      }),
    })
    if (!res.ok && res.status !== 204) {
      return { ok: false, error: `HTTP ${res.status}` }
    }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'unknown' }
  }
}

/**
 * Track an e-commerce event that Brevo automations can react to — notably
 * `cart_updated` (for abandoned-cart recovery) and `order_completed`.
 * See https://developers.brevo.com/reference/createevent.
 */
export async function trackEvent(
  event: string,
  email: string,
  properties?: Record<string, unknown>
): Promise<BrevoResult> {
  const key = process.env.BREVO_API_KEY
  if (!key) return { ok: false, skipped: true }
  try {
    const res = await fetch(`${BREVO_BASE}/events`, {
      method: 'POST',
      headers: { 'api-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_name: event, identifiers: { email_id: email }, event_properties: properties }),
    })
    if (!res.ok && res.status !== 204) return { ok: false, error: `HTTP ${res.status}` }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'unknown' }
  }
}
