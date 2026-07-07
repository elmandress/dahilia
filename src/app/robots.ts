import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/env'

export default function robots(): MetadataRoute.Robots {
  // Pages we don't want indexed (/carrito, /favoritos, /encargo/estado) are kept
  // OUT of `disallow` on purpose: each one ships a `noindex` meta tag, and a
  // crawler must be ALLOWED to fetch the page to actually see that tag. Only the
  // truly private areas (/admin, /api) are blocked outright.
  const disallow = ['/admin', '/admin/', '/api/']

  // Answer engines are already covered by '*', but we welcome them explicitly so
  // there's zero ambiguity for AI Overviews, ChatGPT, Claude, Perplexity, Gemini
  // and Apple. (Perplexity, for one, respects per-agent rules.)
  const aiBots = [
    'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
    'ClaudeBot', 'Claude-Web', 'anthropic-ai',
    'PerplexityBot', 'Perplexity-User',
    'Google-Extended', 'Applebot-Extended',
  ]

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow },
      { userAgent: aiBots, allow: '/', disallow },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
