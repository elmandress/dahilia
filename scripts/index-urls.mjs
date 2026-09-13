#!/usr/bin/env node
// scripts/index-urls.mjs — Google Indexing API client (zero external deps)
//
// Reads URLs from the live sitemap at ${SITE_URL}/sitemap.xml and submits them
// to Google's Indexing API via a Service Account JWT (RS256, native crypto).
//
// Usage:
//   npm run index-urls -- --dry-run              # list URLs, no API calls
//   npm run index-urls -- --status               # read-only: when Google last got a notice per URL
//   npm run index-urls -- --all                  # submit ALL sitemap URLs
//   npm run index-urls -- --filter=/blog         # only URLs containing "/blog"
//   npm run index-urls -- --limit=10             # cap at 10 submissions
//   npm run index-urls -- --type=URL_DELETED     # notify Google of removal
//   npm run index-urls -- --key=C:/keys/sa.json  # key stored outside the repo
//
// Credentials: .secrets/google-indexing-sa.json  (or GOOGLE_INDEXING_KEY_FILE / --key)
// Requires:    Node ≥ 18 (global fetch + native crypto)
//
// Quota (default, per Google Cloud project): 200 publish requests/day and
// 380 requests/min. The script waits between calls, retries transient errors
// (per-minute 429, 5xx) and stops at the first error that would repeat for
// every URL: API not enabled, service account not an Owner in Search
// Console, invalid token, or daily quota reached.
//
// Scope: Google documents this API only for pages with JobPosting or
// BroadcastEvent markup. For a blog or a shop a 200 means "notification
// received", not "indexed", and Google may revoke access if it's abused.
//
// Verified for dahila.uy on 13/09/2026: the 68 URLs sent on 11-12/09 all got a
// 200, and `--status` shows Google registered none of them ("Requested entity
// was not found."). For this shop the API does nothing. What works instead:
// the sitemap in Search Console (read by Google on 13/09, no errors), internal
// links, and "Request indexing" in Search Console's URL Inspection.

import { readFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { createPrivateKey, sign as cryptoSign } from 'node:crypto'
import path from 'node:path'

// ─── Config ───────────────────────────────────────────────────────────────────

// Same source as src/lib/env.ts: the env var if set, else the canonical domain.
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://dahila.uy').replace(/\/+$/, '')
const DEFAULT_KEY_PATH = '.secrets/google-indexing-sa.json'
const INDEXING_API = 'https://indexing.googleapis.com/v3/urlNotifications:publish'
const METADATA_API = 'https://indexing.googleapis.com/v3/urlNotifications/metadata'
const TOKEN_URI = 'https://oauth2.googleapis.com/token'
const SCOPE = 'https://www.googleapis.com/auth/indexing'
// 400 ms between calls ≈ 150 requests/min, well under the 380/min limit.
const DELAY_MS = 400
const STATUS_DELAY_MS = 1000
const MAX_RETRIES = 3

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

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
  if (!existsSync(keyPath)) return
  // A key outside the repo (the safest place for it) can't be committed.
  // `git check-ignore` fails on those paths, which used to abort the script.
  const rel = path.relative(process.cwd(), path.resolve(keyPath))
  if (rel.startsWith('..') || path.isAbsolute(rel)) return
  try {
    // Exit code 0 → the file IS ignored → safe.
    execFileSync('git', ['check-ignore', '-q', rel], { stdio: 'ignore' })
  } catch (err) {
    // Exit code 1 → NOT ignored → danger. Anything else (no git) can't be verified.
    if (err.status !== 1) return
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

/** One notification. Retries only transient errors, with growing waits. */
async function submitUrl(url, accessToken, type) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(INDEXING_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ url, type }),
    })
    const body = await res.json().catch(() => ({}))
    const message = body.error?.message || ''
    const dailyQuota = res.status === 429 && /per day/i.test(message)
    const transient = (res.status === 429 && !dailyQuota) || res.status >= 500
    if (transient && attempt < MAX_RETRIES) {
      const wait = 2000 * 2 ** attempt
      console.log(`   ⏳  ${res.status} — retrying in ${wait / 1000}s…`)
      await sleep(wait)
      continue
    }
    return { status: res.status, body, message, dailyQuota }
  }
}

/** Plain-language reason for the errors that would repeat for every URL. */
function stopReason({ status, message, dailyQuota }) {
  if (dailyQuota) return 'daily quota reached for this Google Cloud project (resets at midnight Pacific time).'
  if (/has not been used|is disabled|SERVICE_DISABLED/i.test(message)) {
    return 'the Web Search Indexing API is not enabled in the Google Cloud project.\n' +
      '   Enable it: Google Cloud Console → APIs & Services → Library → "Web Search Indexing API" → Enable.'
  }
  if (/ownership/i.test(message)) {
    return 'the service account is not an Owner of the property in Search Console.\n' +
      '   Search Console → Settings → Users and permissions → add it as Owner.'
  }
  if (status === 401) return 'invalid token — the key may have been deleted or rotated.'
  return 'permission denied.'
}

// ─── Status (read-only) ──────────────────────────────────────────────────────

/**
 * --status: for each URL, when Google last received a notification (Indexing
 * API metadata). Confirms that the API and the credentials work WITHOUT
 * sending anything (re-sending unchanged URLs is against the project rules).
 * It does NOT say whether a page is indexed: that's the URL Inspection check
 * in scripts/seo-report.mjs.
 */
async function printStatus(urls, accessToken) {
  console.log(`🔎  Checking notification status for ${urls.length} URLs (read-only)...\n`)
  let notified = 0
  let never = 0
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]
    const res = await fetch(`${METADATA_API}?url=${encodeURIComponent(url)}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const body = await res.json().catch(() => ({}))
    if (res.ok) {
      notified++
      const when = body.latestUpdate?.notifyTime ?? body.latestRemove?.notifyTime ?? '?'
      console.log(`   ✅  ${String(when).slice(0, 16).replace('T', ' ')}  ${url}`)
    } else if (res.status === 404) {
      never++
      // First 404: show Google's exact message once, so it can be quoted.
      const note = never === 1 && body.error?.message ? `  (Google: "${body.error.message}")` : ''
      console.log(`   ·   never notified    ${url}${note}`)
    } else {
      const message = body.error?.message || ''
      console.log(`   ❌  ${res.status}  ${url} → ${message}`)
      if (res.status === 401 || res.status === 403) {
        console.log(`\n🛑  Stopped: ${stopReason({ status: res.status, message, dailyQuota: false })}`)
        process.exitCode = 1
        return
      }
    }
    // The read quota per minute is lower than the publish one: at 400 ms the
    // 72-URL sitemap hit 429 near the end. 1 s per read stays under it.
    if (i < urls.length - 1) await sleep(STATUS_DELAY_MS)
  }
  console.log(`\n📊  ${notified} notified at least once · ${never} never notified.`)
  console.log('   This only says Google got the notice. Whether a URL is indexed: npm run seo-report.')
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv)
  const dryRun = Boolean(args['dry-run'])
  const status = Boolean(args['status'])
  const all = Boolean(args['all'])
  const filter = typeof args['filter'] === 'string' ? args['filter'] : null
  const limit = typeof args['limit'] === 'string' ? parseInt(args['limit'], 10) : Infinity
  const type = typeof args['type'] === 'string' ? args['type'] : 'URL_UPDATED'

  if (Number.isNaN(limit) || limit < 1) {
    console.error('❌  --limit must be a whole number, 1 or more.')
    process.exit(1)
  }
  if (!['URL_UPDATED', 'URL_DELETED'].includes(type)) {
    console.error('❌  --type must be URL_UPDATED or URL_DELETED.')
    process.exit(1)
  }

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
  if (!all && !filter && !dryRun && !status && !Number.isFinite(limit)) {
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

  // 5. Get OAuth2 access token
  const accessToken = await getAccessToken(sa)

  // --status: read-only, nothing is sent.
  if (status) {
    await printStatus(urls, accessToken)
    return
  }

  console.log(`📤  Submitting ${urls.length} URLs (type: ${type})...\n`)

  // 6. Submit each URL, one at a time, with a pause between calls.
  let ok = 0
  let fail = 0
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]
    const result = await submitUrl(url, accessToken, type)
    if (result.status === 200) {
      ok++
      const when = result.body.urlNotificationMetadata?.latestUpdate?.notifyTime
      console.log(`   ✅  200  ${url}${when ? `  (notifyTime ${when})` : ''}`)
    } else {
      fail++
      console.log(`   ❌  ${result.status}  ${url} → ${result.message || JSON.stringify(result.body)}`)
    }

    // Errors that repeat for every URL: stop instead of burning quota.
    if (result.dailyQuota || result.status === 401 || result.status === 403) {
      const pending = urls.length - i - 1
      fail += pending
      console.log(`\n🛑  Stopped: ${stopReason(result)}`)
      if (pending > 0) console.log(`   ${pending} URL(s) not sent.`)
      break
    }
    if (i < urls.length - 1) await sleep(DELAY_MS)
  }

  console.log(`\n📊  Results: ${ok} succeeded, ${fail} failed out of ${urls.length} total.`)
  if (ok > 0) console.log('   A 200 means Google received the notification — not that the page is indexed.')
  if (fail > 0) process.exitCode = 1
}

main().catch((err) => {
  console.error(`\n💥  Fatal error: ${err.message}`)
  process.exit(1)
})
