// Borrador de descripción de producto a partir de DATOS REALES únicamente.
//
// Reglas estrictas (pedido explícito del dueño): no inventar materiales,
// horas, medidas ni procesos. Solo se usa lo que el producto ya declara:
// nombre, categoría, si se teje a pedido, si tiene talles y colores a
// elección. El resultado es un punto de partida honesto que Anush edita
// desde el admin — el piso, no el techo (mismo criterio que
// database/descripciones-productos-2026-07.sql).
//
// La variación entre productos es determinística (hash del nombre): dos
// clics sobre el mismo producto dan el mismo borrador, pero el catálogo
// entero no repite la misma frase (thin/duplicate content).

interface DraftInput {
  name: string
  categorySlug?: string | null
  hasSizes: boolean
  hasColors: boolean
  isCustomOnly: boolean
}

function hash(text: string): number {
  let h = 0
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0
  return h
}

const pick = <T,>(options: T[], seed: number): T => options[seed % options.length]

// Aperturas por categoría — hablan del USO de la pieza, nunca de su
// composición (que no conocemos).
const OPENERS: Record<string, string[]> = {
  tops: [
    '{name} es un top tejido a crochet, con la textura que ninguna prenda de máquina tiene.',
    'Un top de crochet hecho a mano: {name} suma textura y carácter a cualquier look simple.',
    '{name}: crochet tejido a mano, pensado para acompañarte igual de bien de día que de noche.',
  ],
  cardigans: [
    '{name} es una pieza de abrigo tejida a crochet, punto por punto, especialmente para vos.',
    'Un abrigo hecho a mano no pasa de moda: {name} acompaña cualquier look del entretiempo al invierno.',
  ],
  sets: [
    '{name} reúne piezas tejidas a crochet pensadas para combinarse entre sí — los tonos y el punto conversan de fábrica.',
    'Con {name} el conjunto llega resuelto: piezas hechas a mano que funcionan juntas o por separado.',
  ],
  bolsos: [
    '{name} está tejido a crochet a mano — un accesorio que aguanta el uso diario y levanta cualquier look básico.',
    'Un bolso hecho a mano tiene algo que ningún bolso de fábrica: {name} se teje punto por punto para vos.',
  ],
  faldas: [
    '{name} lleva el crochet hecho a mano a tu vestidor: caída, textura y una prenda que no vas a ver repetida.',
    'Una falda tejida a mano: {name} funciona sola o combinada, con la textura única del punto artesanal.',
  ],
  accesorios: [
    '{name} es la manera más fácil de sumar tejido a mano a tu día a día — o de regalarlo.',
    'Tejido a crochet a mano, {name} es de esas compras chicas que terminás usando más que ninguna.',
  ],
}

const FALLBACK_OPENERS = [
  '{name} se teje a crochet, a mano, especialmente para vos.',
  'Cada {name} nace en el taller: tejido a mano, punto por punto.',
]

export function draftDescription({ name, categorySlug, hasSizes, hasColors, isCustomOnly }: DraftInput): string {
  const cleanName = name.trim()
  if (!cleanName) return ''
  const seed = hash(cleanName)

  const opener = pick(OPENERS[categorySlug ?? ''] ?? FALLBACK_OPENERS, seed).replace('{name}', cleanName)

  // La frase "a pedido" se arma solo con lo que el producto declara.
  const choices = [hasSizes ? 'tu talle' : '', hasColors ? 'los colores que elijas' : ''].filter(Boolean)
  const madeToOrder = isCustomOnly
    ? `Se hace a pedido${choices.length ? `, en ${choices.join(' y ')}` : ''} — contanos qué tenés en mente y lo armamos juntas.`
    : choices.length
      ? `Al encargarla elegís ${choices.join(' y ')}, y se teje especialmente para vos.`
      : 'Se teje a mano cuando la encargás.'

  const uniqueness = pick([
    'Como toda pieza tejida a mano, no existe otra igual.',
    'No hay dos iguales — es lo que tiene lo hecho a mano.',
  ], seed >> 3)

  return `${opener} ${madeToOrder} ${uniqueness} Envío a todo Uruguay.`
}
