// Public surface of the email system. Import domain notifications from here:
//
//   import { notifyNewEncargo, notifyEncargoStatusChange } from '@/lib/email'
//
// Transport (Resend) lives in ./client, branded HTML in ./render + ./templates,
// orchestration in ./notifications, and the future marketing adapter in ./brevo.

export { sendEmail, emailConfigured } from './client'
export type { SendEmailInput, SendEmailResult } from './client'

export {
  notifyNewEncargo,
  notifyEncargoStatusChange,
  notifyOwnerStatusChange,
  notifyNewOrder,
  notifyWeaverApplication,
  reportSystemError,
  sendDailySummary,
} from './notifications'

export type {
  EncargoEmailData,
  OrderEmailData,
  WeaverApplicationEmailData,
  CustomerState,
  DailySummaryData,
} from './templates'

// Future marketing/automation (inert until BREVO_API_KEY is set).
export { upsertContact, trackEvent, brevoConfigured } from './brevo'
export type { BrevoContact, BrevoResult } from './brevo'
