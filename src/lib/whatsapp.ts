// Links de WhatsApp armados en un solo lugar (QA-15, 04/11/2026). El link del
// sitio sale de Configuración (contact_whatsapp_url) y cada botón le pegaba
// "?text=" a mano: 'wa.me/598…' sin https terminaba en una página 404 del
// sitio (justo el checkout), y 'https://api.whatsapp.com/send?phone=…' quedaba
// con dos '?' y el texto se perdía. Puro: lo prueban las unitarias.

/** El número de Dahila, por si el link de Configuración no es de WhatsApp. */
export const WHATSAPP_DEFAULT = 'https://wa.me/59899850073'

/**
 * Link de WhatsApp listo para abrir, con el texto ya escrito. Acepta
 * 'wa.me/<número>' (con o sin https y barra final) y
 * 'api.whatsapp.com/send?phone=<número>'. Devuelve null si no es un link de
 * WhatsApp: quien llama decide la salida (en general, WHATSAPP_DEFAULT).
 *
 * El texto va con encodeURIComponent (espacios como %20), igual que siempre:
 * URLSearchParams los escribe como '+', y no hay garantía de que la app de
 * WhatsApp los lea como espacios.
 */
export function waLink(base: string | null | undefined, text?: string): string | null {
  let s = (base ?? '').trim()
  if (!s) return null
  if (!/^https?:\/\//i.test(s)) s = `https://${s.replace(/^\/+/, '')}`
  let url: URL
  try {
    url = new URL(s)
  } catch {
    return null
  }
  const host = url.hostname.toLowerCase().replace(/^www\./, '')
  let head: string
  const keep = new URLSearchParams()
  if (host === 'wa.me') {
    const phone = soloDigitos(url.pathname.replace(/^\/+|\/+$/g, ''))
    if (!phone) return null
    head = `https://wa.me/${phone}`
  } else if (host === 'api.whatsapp.com' && url.pathname.replace(/\/+$/, '') === '/send') {
    const phone = soloDigitos(url.searchParams.get('phone') ?? '')
    if (!phone) return null
    head = 'https://api.whatsapp.com/send'
    keep.set('phone', phone)
  } else {
    return null
  }
  const query = [keep.toString(), text ? `text=${encodeURIComponent(text)}` : ''].filter(Boolean).join('&')
  return query ? `${head}?${query}` : head
}

/**
 * El link del número sin texto, siempre como 'https://wa.me/<número>' (COR-03).
 * Es lo que guarda Configuración: varias páginas (encargo, /pedido, /gracias,
 * tejedoras) todavía le pegan "?text=" a mano al link guardado, y con
 * 'https://api.whatsapp.com/send?phone=…' quedaban dos '?' y el chat se abría
 * con el número roto y sin el texto. null si no es un link de WhatsApp.
 */
export function waBase(base: string | null | undefined): string | null {
  const link = waLink(base)
  if (!link) return null
  const url = new URL(link)
  const phone = url.hostname === 'wa.me' ? url.pathname.slice(1) : url.searchParams.get('phone')
  return phone ? `https://wa.me/${phone}` : null
}

/** '+598 99 850 073' → '59899850073'; null si no parece un número de teléfono. */
function soloDigitos(raw: string): string | null {
  const s = decodeURIComponentSafe(raw).trim()
  if (!/^\+?[\d\s().-]{6,24}$/.test(s)) return null
  const digits = s.replace(/\D/g, '')
  return digits.length >= 6 && digits.length <= 15 ? digits : null
}

function decodeURIComponentSafe(s: string): string {
  try {
    return decodeURIComponent(s)
  } catch {
    return s
  }
}

/** "A", "A y B", "A, B y C". */
function enumerar(nombres: string[]): string {
  if (nombres.length <= 1) return nombres[0] ?? ''
  return `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}`
}

/**
 * Para el carrito que quedó entero sin nada que pedir (QA-05): en vez de un
 * botón mudo, la clienta le pregunta a Anush si se puede volver a tejer.
 */
export function mensajeVolverATejer(nombres: string[]): string {
  const unicos = [...new Set(nombres.map((n) => n.trim()).filter(Boolean))]
  const varias = unicos.length > 1
  return `Hola! Quería pedir ${enumerar(unicos)} pero en la web ${varias ? 'figuran como no disponibles' : 'figura como no disponible'}. ¿${varias ? 'Se pueden' : 'Se puede'} volver a tejer? 🧶`
}
