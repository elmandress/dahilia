// La línea de envío que ven la ficha, el carrito y el cajón (10/11/2026).
// Antes era solo texto libre ("Envío — línea corta"). Ahora, si en
// Configuración se cargan los montos de Montevideo y del interior, la línea se
// arma sola con esos montos; si no hay ningún monto, vuelve el texto libre.
// Nunca se muestra un monto que no cargó la dueña.
//
// Puro (sin JSX ni next/*): lo usan el layout y la ficha, y lo prueban las
// unitarias (tests/unit/envio.test.mjs).
import { parseMoneyUYU } from './parse-money'
import { formatPrice } from './types'

export function lineaEnvio(settings: Record<string, string | undefined>): string | null {
  // 0 o vacío = sin dato (un "UYU 0" se leería como envío gratis, y eso se
  // configura aparte, con "Envío gratis desde").
  const monto = (v: string | undefined) => {
    const n = parseMoneyUYU(v ?? '')
    return n != null && n > 0 ? n : null
  }
  const mvd = monto(settings.envio_montevideo)
  const interior = monto(settings.envio_interior)
  const retiro = (settings.envio_retiro ?? '').trim()
  const partes: string[] = []
  if (mvd != null && interior != null) {
    partes.push(`Envío: Montevideo ${formatPrice(mvd)} · interior ${formatPrice(interior)}`)
  } else if (mvd != null) {
    partes.push(`Envío a Montevideo ${formatPrice(mvd)} · interior a coordinar`)
  } else if (interior != null) {
    partes.push(`Envío al interior ${formatPrice(interior)} · Montevideo a coordinar`)
  }
  if (partes.length === 0) return null
  if (retiro) partes.push(`o retiro en ${retiro}`)
  return partes.join(' · ')
}
