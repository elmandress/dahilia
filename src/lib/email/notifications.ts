// High-level notification orchestration. Storefront/admin code should call these
// domain functions — never the transport directly — so wiring stays declarative
// and every send gets consistent failure handling.

import { sendEmail, type SendEmailResult } from './client'
import {
  ownerNewEncargo,
  ownerNewOrder,
  ownerNewWeaverApplication,
  ownerStatusChange,
  ownerSystemError,
  ownerEmailFailure,
  ownerDailySummary,
  customerEncargoConfirmation,
  customerOrderConfirmation,
  customerStatusEmail,
  type EncargoEmailData,
  type OrderEmailData,
  type WeaverApplicationEmailData,
  type CustomerState,
  type DailySummaryData,
  type RenderedEmail,
} from './templates'

function ownerAddress(): string | undefined {
  return process.env.OWNER_NOTIFICATION_EMAIL || undefined
}

/**
 * Send an email and, if it hard-fails (not a config skip), alert the owner —
 * unless this send *is* an owner/system alert (avoids infinite loops).
 */
async function dispatch(
  kind: 'owner' | 'customer' | 'system',
  to: string | undefined,
  mail: RenderedEmail,
  replyTo?: string
): Promise<SendEmailResult> {
  if (!to) return { sent: false, skipped: true }
  const res = await sendEmail({ to, subject: mail.subject, html: mail.html, replyTo })
  if (!res.sent && !res.skipped && kind !== 'system') {
    // Best-effort failure alert to the owner; swallow anything it throws.
    try {
      const owner = ownerAddress()
      if (owner) {
        const alert = ownerEmailFailure(kind, String(to), res.error || 'unknown')
        await sendEmail({ to: owner, subject: alert.subject, html: alert.html })
      }
    } catch {
      /* nothing else we can do */
    }
  }
  return res
}

// DB status (custom_orders.status) → customer-facing state. `null` = no email.
const STATUS_TO_STATE: Record<string, CustomerState | null> = {
  new: 'received',
  replied: 'replied',
  in_progress: 'in_progress',
  done: 'ready',
  cancelled: 'cancelled',
}

/** New custom order: notify the owner and (if we have an email) confirm to the customer. */
export async function notifyNewEncargo(d: EncargoEmailData): Promise<void> {
  await Promise.allSettled([
    dispatch('owner', ownerAddress(), ownerNewEncargo(d), d.email || undefined),
    d.email ? dispatch('customer', d.email, customerEncargoConfirmation(d), ownerAddress()) : Promise.resolve(),
  ])
}

/** Status change: email the customer the matching state (owner copy stays in the panel). */
export async function notifyEncargoStatusChange(d: EncargoEmailData, dbStatus: string): Promise<void> {
  const state = STATUS_TO_STATE[dbStatus]
  if (state && d.email) {
    await dispatch('customer', d.email, customerStatusEmail(state, d), ownerAddress())
  }
}

/** New weaver application from /tejedoras: notify the owner. */
export async function notifyWeaverApplication(d: WeaverApplicationEmailData): Promise<void> {
  await dispatch('owner', ownerAddress(), ownerNewWeaverApplication(d))
}

/** New storefront order (ready for when order-capture is added — see AUDITORIA). */
export async function notifyNewOrder(d: OrderEmailData): Promise<void> {
  await Promise.allSettled([
    dispatch('owner', ownerAddress(), ownerNewOrder(d)),
    d.email ? dispatch('customer', d.email, customerOrderConfirmation(d), ownerAddress()) : Promise.resolve(),
  ])
}

/** Owner-facing manual status notice (optional companion to notifyEncargoStatusChange). */
export async function notifyOwnerStatusChange(d: EncargoEmailData, dbStatus: string): Promise<void> {
  await dispatch('system', ownerAddress(), ownerStatusChange(d, dbStatus))
}

/** Alert the owner about an important system error. Never throws. */
export async function reportSystemError(context: string, error: unknown): Promise<void> {
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
  try {
    await dispatch('system', ownerAddress(), ownerSystemError(context, message))
  } catch {
    /* logging already happened at the call site */
  }
}

/** Daily digest to the owner. Triggered by the /api/cron/daily-summary endpoint. */
export async function sendDailySummary(stats: DailySummaryData): Promise<SendEmailResult> {
  return dispatch('system', ownerAddress(), ownerDailySummary(stats))
}
