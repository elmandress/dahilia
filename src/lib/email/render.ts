import { SITE_URL } from '@/lib/env'

// Shared, table-based email shell. Table layout + inline styles are what render
// reliably across Gmail / Apple Mail / Outlook. Colours mirror the Dahila
// storefront (cream + ink + wine) so transactional mail feels on-brand.
const C = {
  bg: '#F4ECDD',
  card: '#FFFFFF',
  ink: '#1F1A1B',
  body: '#4A4143',
  muted: '#8C8285',
  wine: '#8F3B53',
  border: '#E7DED0',
  rule: '#EFE7DA',
}

export function escapeHtml(s: unknown): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export interface EmailButton {
  label: string
  url: string
}

export interface RenderOptions {
  /** Hidden inbox-preview line. */
  preheader?: string
  heading: string
  /** Lead paragraph (already-safe HTML or plain text — escaped by caller if needed). */
  intro?: string
  /** Main body — safe HTML built with the helpers below. */
  bodyHtml?: string
  button?: EmailButton
  footerNote?: string
}

export function renderEmail(opts: RenderOptions): string {
  const { preheader = '', heading, intro = '', bodyHtml = '', button, footerNote } = opts
  const host = SITE_URL.replace(/^https?:\/\//, '')
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background:${C.bg};-webkit-text-size-adjust:100%;">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.bg};">${escapeHtml(preheader)}</div>` : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.bg};padding:32px 16px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
      <tr><td style="padding:4px 8px 20px;text-align:center;">
        <span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;letter-spacing:0.28em;color:${C.ink};">DAHILA</span>
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:0.24em;color:${C.muted};text-transform:uppercase;margin-top:5px;">Crochet · Montevideo</div>
      </td></tr>
      <tr><td style="background:${C.card};border:1px solid ${C.border};border-radius:16px;padding:36px 32px;">
        <h1 style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:24px;line-height:1.25;color:${C.ink};">${escapeHtml(heading)}</h1>
        ${intro ? `<p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:${C.body};">${intro}</p>` : ''}
        ${bodyHtml}
        ${
          button
            ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0 4px;"><tr><td style="border-radius:10px;background:${C.ink};">
                 <a href="${escapeHtml(button.url)}" style="display:inline-block;padding:13px 28px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;letter-spacing:0.04em;color:#ffffff;text-decoration:none;border-radius:10px;">${escapeHtml(button.label)}</a>
               </td></tr></table>`
            : ''
        }
      </td></tr>
      <tr><td style="padding:22px 8px;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:${C.muted};">
        ${footerNote ? `<p style="margin:0 0 8px;">${footerNote}</p>` : ''}
        <p style="margin:0;">Dahila Crochet · Hecho a mano en Montevideo, Uruguay<br>
        <a href="${SITE_URL}" style="color:${C.wine};text-decoration:none;">${escapeHtml(host)}</a> ·
        <a href="https://www.instagram.com/dahila.crochet/" style="color:${C.wine};text-decoration:none;">@dahila.crochet</a> ·
        <a href="https://wa.me/59899850073" style="color:${C.wine};text-decoration:none;">WhatsApp</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`
}

/** A definition-list style key/value block. Keys and values are both escaped. */
export function infoTable(rows: Array<[string, string]>): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;margin:8px 0;">
    ${rows
      .map(
        ([k, v]) => `<tr>
      <td style="padding:8px 14px 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:${C.muted};vertical-align:top;white-space:nowrap;">${escapeHtml(k)}</td>
      <td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${C.ink};border-bottom:1px solid ${C.rule};">${escapeHtml(v)}</td>
    </tr>`
      )
      .join('')}
  </table>`
}

/** A soft highlighted callout (e.g. tracking code). */
export function callout(label: string, value: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:18px 0;"><tr>
    <td style="background:${C.bg};border:1px solid ${C.border};border-radius:12px;padding:16px 18px;text-align:center;">
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:0.14em;color:${C.muted};margin-bottom:6px;">${escapeHtml(label)}</div>
      <div style="font-family:'Courier New',monospace;font-size:22px;letter-spacing:0.12em;color:${C.ink};">${escapeHtml(value)}</div>
    </td>
  </tr></table>`
}

/** A plain paragraph helper (escaped). */
export function paragraph(text: string): string {
  return `<p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:${C.body};">${escapeHtml(text)}</p>`
}

/** A small uppercase section label (e.g. "Cómo sigue"). */
export function sectionLabel(text: string): string {
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:${C.muted};margin:24px 0 10px;">${escapeHtml(text)}</div>`
}

/** A numbered "how it works" list. Each item escaped. */
export function steps(items: string[]): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;margin:4px 0;">
    ${items
      .map(
        (t, i) => `<tr>
      <td style="width:28px;vertical-align:top;padding:7px 12px 7px 0;">
        <div style="width:24px;height:24px;border-radius:999px;background:${C.ink};color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:24px;text-align:center;">${i + 1}</div>
      </td>
      <td style="padding:7px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.55;color:${C.body};">${escapeHtml(t)}</td>
    </tr>`
      )
      .join('')}
  </table>`
}
