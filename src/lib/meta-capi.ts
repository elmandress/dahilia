// API de conversiones de Meta, del lado del servidor (ver src/lib/meta-pixel.ts).
//
// Inerte hasta que existan en Netlify NEXT_PUBLIC_META_PIXEL_ID y
// META_CAPI_TOKEN (Administrador de eventos → el píxel → Configuración →
// "Generar token de acceso"). META_TEST_EVENT_CODE, opcional, manda los
// eventos a la pestaña "Probar eventos" en vez de a las estadísticas.
//
// Lo que NO va a hashear Meta acá (IP, navegador, _fbp, _fbc) viaja tal cual,
// como pide la documentación; no se manda ningún dato personal escrito por la
// clienta.
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID
const TOKEN = process.env.META_CAPI_TOKEN
const TEST_CODE = process.env.META_TEST_EVENT_CODE
const GRAPH = 'https://graph.facebook.com/v24.0'

export const META_CAPI_ENABLED = Boolean(PIXEL_ID && TOKEN)

export interface MetaUserData {
  client_ip_address?: string | null
  client_user_agent?: string | null
  fbp?: string | null
  fbc?: string | null
}

export interface MetaServerEvent {
  event_name: string
  event_id: string
  event_time?: number
  event_source_url?: string
  action_source?: 'website'
  user_data: MetaUserData
  custom_data?: Record<string, unknown>
}

function clean(u: MetaUserData): MetaUserData {
  const out: MetaUserData = {}
  for (const [k, v] of Object.entries(u)) if (v && v !== 'unknown') out[k as keyof MetaUserData] = v
  return out
}

/** Manda eventos a Meta. Nunca tira: medir no puede romper una venta. */
export async function sendMetaEvents(events: MetaServerEvent[]): Promise<boolean> {
  if (!META_CAPI_ENABLED || events.length === 0) return false
  const data = events.map((e) => ({
    ...e,
    event_time: e.event_time ?? Math.floor(Date.now() / 1000),
    action_source: e.action_source ?? 'website',
    user_data: clean(e.user_data),
  }))
  try {
    const res = await fetch(`${GRAPH}/${PIXEL_ID}/events?access_token=${encodeURIComponent(TOKEN!)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_CODE ? { data, test_event_code: TEST_CODE } : { data }),
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) console.error('Meta CAPI', res.status, (await res.text()).slice(0, 300))
    return res.ok
  } catch (e) {
    console.error('Meta CAPI', e)
    return false
  }
}
