'use client'

// Avisale al servidor que una o más URLs públicas cambiaron: invalida su
// HTML cacheado (si no, hasta 1h desfasado) y de paso avisa a Bing/Yandex.
// Fire-and-forget: el guardado en el CMS nunca debe esperar ni fallar por esto.
export function notifyReindex(paths: string[]): void {
  fetch('/api/seo/reindex', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paths }),
  }).catch(() => {})
}

// Para cambios transversales que no son "una URL" (site_settings, discounts):
// invalida TODAS las páginas públicas de una sola vez, en vez de listar cada
// ruta que podría mostrar ese dato.
export function notifySiteWideChange(): void {
  fetch('/api/seo/reindex', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ layout: true }),
  }).catch(() => {})
}
