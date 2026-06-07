'use client'

import { useState } from 'react'
import { dahila, Icon } from './ui/Primitives'

/**
 * Share a product. On phones it uses the native share sheet (navigator.share),
 * which puts WhatsApp/Instagram one tap away — exactly how clients pass pieces
 * around. On desktop (no share API) it copies the link and shows "¡Copiado!".
 */
export function ShareButton({ title, text }: { title: string; text?: string }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const shareData = { title, text: text || title, url }
    const nav = typeof navigator !== 'undefined' ? navigator : undefined
    try {
      if (nav?.share) {
        await nav.share(shareData)
        return
      }
      if (nav?.clipboard) {
        await nav.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      }
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
