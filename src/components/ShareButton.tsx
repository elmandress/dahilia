'use client'

import { useState } from 'react'
import { dahila, Icon } from './ui/Primitives'
import { track } from '@/lib/analytics'

// El link que se comparte lleva su propia marca de origen (14/09/2026): quien
// lo abre desde WhatsApp o un DM llega sin referrer y se contaba como
// "Directo". Con estos UTM, lib/attribution.ts lo guarda como "Link
// compartido" y el pedido que salga de ahí se ve así en /admin/pedidos: el
// boca a boca, medido. Se arma desde la ruta limpia (si quien comparte llegó
// con UTM de Instagram, no se lo pasa a quien recibe el link) y con
// utm_medium=referral para que GA4 lo cuente en "Referral", no en "Unassigned".
function shareUrl(): string {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}${window.location.pathname}?utm_source=compartido&utm_medium=referral`
}

/**
 * Share a product. On phones it uses the native share sheet (navigator.share),
 * which puts WhatsApp/Instagram one tap away — exactly how clients pass pieces
 * around. On desktop (no share API) it copies the link and shows "¡Copiado!".
 */
export function ShareButton({ title, text, itemId }: { title: string; text?: string; itemId?: string }) {
  const [copied, setCopied] = useState(false)

  // Evento recomendado `share` de GA4 (method, content_type, item_id).
  const measure = (method: 'nativo' | 'copiar') =>
    track('share', { method }, { params: { method, content_type: 'product', item_id: itemId } })

  const handleShare = async () => {
    const url = shareUrl()
    const shareData = { title, text: text || title, url }
    const nav = typeof navigator !== 'undefined' ? navigator : undefined
    try {
      if (nav?.share) {
        // Resuelve cuando la persona eligió a quién mandarlo (cancelar cae al catch).
        await nav.share(shareData)
        measure('nativo')
        return
      }
      if (nav?.clipboard) {
        await nav.clipboard.writeText(url)
        measure('copiar')
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
        return
      }
      // Fallback for browsers where clipboard API is unavailable (HTTP, old WebView)
      const ta = document.createElement('textarea')
      ta.value = url
      ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      measure('copiar')
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // User cancelled the share sheet, or clipboard blocked — ignore.
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="Compartir"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'transparent', border: `1px solid ${dahila.borderStrong}`,
        borderRadius: 999, padding: '7px 14px', cursor: 'pointer',
        fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink900,
        transition: `background 140ms ${dahila.ease}`,
      }}
    >
      <Icon name={copied ? 'check' : 'share-network'} size={15} color={dahila.ink700} />
      {copied ? '¡Copiado!' : 'Compartir'}
    </button>
  )
}
