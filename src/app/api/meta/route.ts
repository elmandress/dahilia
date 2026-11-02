import { NextRequest, NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { META_CAPI_ENABLED, sendMetaEvents } from '@/lib/meta-capi'
import { SITE_URL } from '@/lib/env'

// Reenvío a la API de conversiones de los eventos que el navegador ya mandó
// por el píxel (mismo event_id: Meta cuenta uno solo). Llega por sendBeacon
// desde src/lib/meta-pixel.ts. Solo eventos estándar conocidos y solo URLs del
// sitio: nadie puede usar este endpoint para inventarle ventas a la cuenta.
const ALLOWED = new Set(['ViewContent', 'AddToCart', 'InitiateCheckout', 'Lead', 'CompleteRegistration', 'Search', 'Contact'])

export async function POST(req: NextRequest) {
  if (!META_CAPI_ENABLED) return new NextResponse(null, { status: 204 })
  const h = await headers()
  const ip = getClientIp(h)
  if (!checkRateLimit(`meta:${ip}`, { windowMs: 60_000, max: 60 })) return new NextResponse(null, { status: 429 })

  const body = await req.json().catch(() => null) as Record<string, unknown> | null
  const eventName = typeof body?.event_name === 'string' ? body.event_name : ''
  const eventId = typeof body?.event_id === 'string' ? body.event_id.slice(0, 64) : ''
  const url = typeof body?.event_source_url === 'string' ? body.event_source_url.slice(0, 500) : ''
  if (!ALLOWED.has(eventName) || !eventId || !url.startsWith(SITE_URL)) return new NextResponse(null, { status: 400 })

  const store = await cookies()
  const custom = body?.custom_data && typeof body.custom_data === 'object' ? body.custom_data as Record<string, unknown> : undefined
  await sendMetaEvents([{
    event_name: eventName,
    event_id: eventId,
    event_source_url: url,
    user_data: {
      client_ip_address: ip,
      client_user_agent: h.get('user-agent'),
      fbp: store.get('_fbp')?.value,
      fbc: store.get('_fbc')?.value,
    },
    custom_data: custom,
  }])
  return new NextResponse(null, { status: 204 })
}
