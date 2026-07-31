import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production'

// CSP — production drops 'unsafe-eval'. Inline styles ('unsafe-inline') are
// retained because Next renders style attributes that nonces don't cover.
// Fonts are self-hosted by next/font and icons are inline SVG, so we no longer
// need fonts.googleapis.com, fonts.gstatic.com or cdn.jsdelivr.net in the CSP.
// Analytics: los hosts de Umami (AnalyticsScript) y Clarity (ClarityScript)
// entran a la CSP AUTOMÁTICAMENTE cuando sus env vars existen en el build —
// setear la variable en Netlify y redeployar alcanza; sin variable, la CSP
// queda igual de cerrada que siempre.
const umamiOrigin = (() => {
  try {
    return process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL
      ? new URL(process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL).origin
      : ''
  } catch {
    return ''
  }
})()
const clarityEnabled = Boolean(process.env.NEXT_PUBLIC_CLARITY_ID)
const analyticsScriptSrc = [umamiOrigin, clarityEnabled ? 'https://www.clarity.ms' : '']
  .filter(Boolean).join(' ')
const analyticsConnectSrc = [umamiOrigin, clarityEnabled ? 'https://*.clarity.ms https://c.bing.com' : '']
  .filter(Boolean).join(' ')
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isProd ? '' : " 'unsafe-eval'"}${analyticsScriptSrc ? ' ' + analyticsScriptSrc : ''};
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://*.supabase.co;
  font-src 'self' data:;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co${analyticsConnectSrc ? ' ' + analyticsConnectSrc : ''};
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Tree-shake large packages so only the modules we use are bundled.
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js', '@supabase/ssr'],
  },
  images: {
    // TTL del optimizador de imágenes. Next 16 usa el MAYOR entre esto y el
    // Cache-Control del origen (docs: image#minimumcachettl) — así que esto
    // es un piso: aunque una foto vieja en Supabase Storage todavía tenga el
    // cache-control corto de 1 hora con el que se subió (antes de media.ts),
    // el optimizador de Netlify no vuelve a pedirle el original a Supabase
    // por un año. Mismo valor que STORAGE_CACHE_SECONDS en lib/media.ts.
    // Seguro por construcción: los objetos son inmutables (sufijo aleatorio +
    // upsert:false), así que nunca hay que invalidar una URL ya cacheada.
    // Esto es la causa más probable del reventón de Cached Egress de jul/2026:
    // 8 deviceSizes × 5 imageSizes × 2 formatos por foto, cada variante
    // re-descargando el original completo de Supabase cada vez que el caché
    // (antes: 4h por default de Next 16, o 1h si el objeto lo pedía) vencía.
    minimumCacheTTL: 31536000,
    // Allowlisted quality levels (Next 16 requires this when using the
    // `quality` prop). 82 cards · 90 detail · 95 hero · 100 lightbox.
    qualities: [82, 90, 95, 100],
    // Prefer modern formats; AVIF first, WebP fallback.
    formats: ['image/avif', 'image/webp'],
    // Match the breakpoints we actually render at, so the optimizer doesn't
    // ship oversized variants.
    deviceSizes: [375, 420, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [90, 160, 200, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, '').replace(/\s{2,}/g, ' ').trim(),
          },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          ...(isProd
            ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
            : []),
        ],
      },
    ]
  },
};

export default nextConfig;
