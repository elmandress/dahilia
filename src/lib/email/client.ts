// Low-level transactional email transport.
//
// Uses Resend's REST API directly (no SDK dependency) so there is nothing to
// install and the code ships whether or not a key is present. When
// RESEND_API_KEY + EMAIL_FROM are unset it NO-OPS (never throws), so every
// caller can `await` it safely.

export interface SendEmailInput {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}

export interface SendEmailResult {
  sent: boolean
  /** true when email isn't configured yet (missing env) — not an error. */
  skipped?: boolean
  error?: string
  id?: string
}

const RESEND_ENDPOINT = 'https://api.resend.com/emails'

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM)
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM

  if (!apiKey || !from) {
    if (process.env.NODE_ENV !== 'production') {
      console.info('[email] skipped — set RESEND_API_KEY and EMAIL_FROM to enable email.')
    }
    return { sent: false, skipped: true }
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: input.to,
        subject: input.subject,
        html: input.html,
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      }),
    })

    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      console.error('[email] send failed', res.status, detail)
      return { sent: false, error: `HTTP ${res.status}: ${detail.slice(0, 200)}` }
    }

    const data = (await res.json().catch(() => ({}))) as { id?: string }
    return { sent: true, id: data.id }
  } catch (e) {
    console.error('[email] send error', e)
    return { sent: false, error: e instanceof Error ? e.message : 'unknown' }
  }
}
