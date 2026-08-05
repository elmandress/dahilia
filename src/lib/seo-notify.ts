'use client'

// Avisale al admin que una o más URLs públicas cambiaron. Fire-and-forget:
// el guardado en el CMS nunca debe esperar ni fallar por esto.
export function notifyReindex(paths: string[]): void {
  fetch('/api/seo/reindex', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paths }),
  }).catch(() => {})
}
