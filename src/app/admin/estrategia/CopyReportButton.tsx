'use client'

import { useState } from 'react'

/** Copia un texto largo al portapapeles. Mismo patrón de fallback que ShareButton. */
export function CopyReportButton({ text, label = 'Copiar el informe completo' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard) {
        await navigator.clipboard.writeText(text)
      } else {
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0'
        document.body.appendChild(ta)
        ta.focus()
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      /* portapapeles bloqueado — no es crítico */
    }
  }

  return (
    <button type="button" onClick={handleCopy} className="admin-btn admin-btn-secondary admin-btn-sm">
      {copied ? '¡Copiado! Pegalo donde quieras' : label}
    </button>
  )
}
