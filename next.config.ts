import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production'

// CSP — production drops 'unsafe-eval'. Inline styles ('unsafe-inline') are
// retained because Next renders style attributes that nonces don't cover.
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isProd ? '' : " 'unsafe-eval'"};
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net;
  img-src 'self' blob: data: https://*.supabase.co https://images.unsplash.com;
  font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co;
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
    // Allowlisted quality levels (Next 16 requires this when using the
    // `quality` prop). We use 90 for hero/detail, 82 for cards.
    qualities: [82, 90, 100],
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
