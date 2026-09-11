#!/usr/bin/env node
// scripts/index-urls.mjs — Google Indexing API client (zero external deps)
//
// Reads URLs from the live sitemap at ${SITE_URL}/sitemap.xml and submits them
// to Google's Indexing API via a Service Account JWT (RS256, native crypto).
//
// Usage:
//   npm run index-urls -- --dry-run           # list URLs, no API calls
//   npm run index-urls -- --all               # submit ALL sitemap URLs
//   npm run index-urls -- --filter=/blog      # only URLs containing "/blog"
//   npm run index-urls -- --limit=10          # cap at 10 submissions
//   npm run index-urls -- --type=URL_DELETED  # notify Google of removal
//
// Credentials: .secrets/google-indexing-sa.json  (or GOOGLE_INDEXING_KEY_FILE)
// Requires:    Node ≥ 18 (crypto.subtle, global fetch)

import { readFileSync, existsSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { createPrivateKey, sign as cryptoSign } from 'node:crypto'

// ─── Config ───────────────────────────────────────────────────────────────────

const SITE_URL = 'https://dahila.uy'
const DEFAULT_KEY_PATH = '.secrets/google-indexing-sa.json'
const INDEXING_API = 'https://indexing.googleapis.com/v3/urlNotifications:publish'
const TOKEN_URI = 'https://oauth2.googleapis.com/token'
const SCOPE = 'https://www.googleapis.com/auth/indexing'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Base64url encode (no padding, URL-safe alphabet). */
function b64url(input) {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf8') : input
  return buf.toString('base64url')
}

/** Parse CLI args into a simple map. Supports --key=value and --flag forms. */
function parseArgs(argv) {
  const args = {}
  for (const arg of argv.slice(2)) {
    const m = arg.match(/^--([a-z-]+)(?:=(.+))?$/i)
    if (m) args[m[1]] = m[2] ?? true
  }
  return args
}

// ─── Security: abort if key file could be committed ───────────────────────────

function assertKeyProtected(keyPath) {
  // Only check if we're inside a git repo and the key file exists on disk.
  if (!existsSync(keyPath)) return
  try {
    const result = execSync(
      `git check-ignore -q "${keyPath}"`,
      { stdio: ['pipe', 'pipe', 'pipe'] },
    )
    // Exit code 0 → file IS ignored → safe.
    void result
  } catch {
    // Exit code 1 → file is NOT ignored → DANGER.
    console.error(
      '\n🛑  ABORTING: the key file is NOT covered by .gitignore.\n' +
      `   Path: ${keyPath}\n` +
      '   Add the following lines to .gitignore BEFORE running this script:\n' +
      '     .secrets/\n' +
      '     *service-account*.json\n',
    )
    process.exit(1)
  }
}

// ─── JWT (RS256) via Node native crypto ───────────────────────────────────────

/**
 * Build a signed JWT for the Google OAuth2 token endpoint.
 * Uses Node's native `crypto.sign` (available since Node 12) with RS256.
 */
function createSignedJwt(sa) {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const payload = {
    iss: sa.client_email,
    scope: SCOPE,
    aud: TOKEN_URI,
    iat: now,
    exp: now + 3600,
  }

  const segments = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`

  const key = createPrivateKey({
    key: sa.private_key,
    format: 'pem',
  })

  // Node ≥ 12: crypto.sign returns a Buffer.
  const signature = cryptoSign('RSA-SHA256', Buffer.from(segments, 'utf8'), key)

  return `${segments}.${b64url(signature)}`
}

// ─── Google OAuth2 token exchange ─────────────────────────────────────────────

async function getAccessToken(sa) {
  const jwt = createSignedJwt(sa)
  const res = await fetch(TOKEN_URI, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Token exchange failed (${res.status}): ${text}`)
  }
  const data = await res.json()
  return data.access_token
}

// ─── Sitemap parsing ─────────────────────────────────────────────────────────

async function fetchSitemapUrls() {
  const sitemapUrl = `${SITE_URL}/sitemap.xml`
  console.log(`📡  Fetching sitemap: ${sitemapUrl}`)
  const res = await fetch(sitemapUrl)
  if (!res.ok) throw new Error(`Sitemap fetch failed: ${res.status} ${res.statusText}`)
  const xml = await res.text()

  // Extract all <loc>…</loc> values. Simple regex — the sitemap is flat (no
  // sitemap-index), and we only care about the URL strings.
  const urls = []
  const re = /<loc>\s*(https?:\/\/[^<]+?)\s*<\/loc>/gi
  let match
  while ((match = re.exec(xml)) !== null) {
    urls.push(match[1])
  }
  console.log(`   Found ${urls.length} URLs in sitemap.\n`)
  return urls
}

// ─── Indexing API submission ─────────────────────────────────────────────────

async function submitUrl(url, accessToken, type) {
  const res = await fetch(INDEXING_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ url, type }),
  })
  const body = await res.json().catch(() => ({}))
  return { status: res.status, body }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv)
  const dryRun = Boolean(args['dry-run'])
  const all = Boolean(args['all'])
  const filter = typeof args['filter'] === 'string' ? args['filter'] : null
  const limit = typeof args['limit'] === 'string' ? parseInt(args['limit'], 10) : Infinity
  const type = typeof args['type'] === 'string' ? args['type'] : 'URL_UPDATED'

  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║  Dahila — Google Indexing API                           ║')
  console.log('╚══════════════════════════════════════════════════════════╝')
  console.log()

  // 1. Fetch all URLs from the live sitemap
  let urls = await fetchSitemapUrls()

  // 2. Apply filters
  if (filter) {
    urls = urls.filter((u) => u.includes(filter))
    console.log(`🔍  Filter "${filter}" → ${urls.length} matching URLs.`)
  }
  if (!all && !filter && !dryRun && !Number.isFinite(limit)) {
    console.error(
      '⚠️  Safety: pass --all to submit every URL, or --filter=<path> to narrow scope, or --limit=N.\n' +
      '   Use --dry-run to preview without submitting.',
    )
    process.exit(1)
  }
  if (limit < urls.length) {
    urls = urls.slice(0, limit)
    console.log(`✂️  Limited to ${limit} URLs.`)
  }

  // 3. Dry run: just list
  if (dryRun) {
    console.log(`\n🏜️  DRY RUN — ${urls.length} URLs would be submitted (type: ${type}):\n`)
    for (const url of urls) console.log(`   ${url}`)
    console.log('\n✅  Done (no API calls made).')
    return
  }

  // 4. Load credentials
  const keyPath = typeof args['key'] === 'string' ? args['key']
    : process.env.GOOGLE_INDEXING_KEY_FILE ?? DEFAULT_KEY_PATH

  assertKeyProtected(keyPath)

  if (!existsSync(keyPath)) {
    console.error(
      `\n❌  Credential file not found: ${keyPath}\n` +
      '   Place your Service Account JSON at .secrets/google-indexing-sa.json\n' +
      '   or set GOOGLE_INDEXING_KEY_FILE=/path/to/key.json\n',
    )
    process.exit(1)
  }

  const rawKey = readFileSync(keyPath, 'utf8').replace(/^\uFEFF/, '')
  const sa = JSON.parse(rawKey)
  if (!sa.client_email || !sa.private_key) {
    console.error('❌  Invalid service account JSON: missing client_email or private_key.')
    process.exit(1)
  }

  console.log(`🔑  Using service account: ${sa.client_email}`)
  console.log(`📤  Submitting ${urls.length} URLs (type: ${type})...\n`)

  // 5. Get OAuth2 access token
  const accessToken = await getAccessToken(sa)

  // 6. Submit each URL (sequential to respect rate limits — 200/min)
  let ok = 0
  let fail = 0
  for (const url of urls) {
    const result = await submitUrl(url, accessToken, type)
    if (result.status === 200) {
      ok++
      console.log(`   ✅  ${url}`)
    } else {
      fail++
      console.log(`   ❌  ${url} → ${result.status}: ${JSON.stringify(result.body)}`)
    }
  }

  console.log(`\n📊  Results: ${ok} succeeded, ${fail} failed out of ${urls.length} total.`)
}

main().catch((err) => {
  console.error(`\n💥  Fatal error: ${err.message}`)
  process.exit(1)
})
