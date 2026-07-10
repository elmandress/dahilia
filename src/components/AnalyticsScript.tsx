'use client'

import Script from 'next/script'
import { ANALYTICS_ENABLED, ANALYTICS_SCRIPT_URL, ANALYTICS_WEBSITE_ID } from '@/lib/analytics'

// Renders nothing until NEXT_PUBLIC_UMAMI_WEBSITE_ID/SCRIPT_URL exist — see
// src/lib/analytics.ts. Activar analytics es solo setear esas 2 env vars en
// Netlify, no requiere tocar código.
export function AnalyticsScript() {
  if (!ANALYTICS_ENABLED) return null
  return (
    <Script
      src={ANALYTICS_SCRIPT_URL}
      data-website-id={ANALYTICS_WEBSITE_ID}
      strategy="afterInteractive"
    />
  )
}
