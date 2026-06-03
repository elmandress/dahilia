// Centralised environment-variable access. Throws a clear, actionable error at
// import time if a required variable is missing — much better than `!` assertions
// scattered across the codebase that fail with "Invalid URL" or "Invalid JWT" later.

function required(name: string, value: string | undefined): string {
  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `Set it in .env.local (development) or your hosting provider's dashboard (production).`
    )
  }
  return value
}

export const SUPABASE_URL = required(
  'NEXT_PUBLIC_SUPABASE_URL',
  process.env.NEXT_PUBLIC_SUPABASE_URL
)
export const SUPABASE_ANON_KEY = required(
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dahila-crochet.netlify.app'

// Studio / agency credit — surfaced in the footer and meta tags.
export const STUDIO_NAME = 'SIAR'
export const STUDIO_URL = 'https://siaruy.netlify.app'
export const STUDIO_INSTAGRAM = 'https://instagram.com/siar.uy'
