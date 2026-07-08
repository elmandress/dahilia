// ============================================================
// Estrategia y crecimiento — contenido estructurado
// ============================================================
// Única fuente de verdad del conocimiento estratégico del negocio, consumida
// por /admin/estrategia. Deriva de la consultoría comercial de julio 2026
// (mercado UY relevado a mano, modelo Manos del Uruguay, benchmarks reales de
// WhatsApp/drops) y de las decisiones aprobadas por la dueña.
//
// Para actualizar la estrategia se edita ESTE archivo — la página se encarga
// del resto (los datos vivos: precios aplicados, postulaciones y suscriptoras
// se leen de la base en tiempo real).
// ============================================================

export const ULTIMA_REVISION = 'julio 2026'

export const NORTE =
  'Ser el mejor tejido a mano de Uruguay al precio más justo: un escalón por encima del emprendimiento informal, siempre por debajo del retail a máquina. Que cada clienta sienta que paga menos de lo que recibe.'

// ─── 1. Posicionamiento y mercado ────────────────────────────

export interface MarketBand {
  name: string
  detail: string
  min: number
  max: number
  /** Marca la banda propia. */
  self?: boolean
}

/** Bandas de precio del mercado (UYU, prendas tejidas). Escala log en el gráfico. */
export const MARKET_BANDS: MarketBand[] = [
  { name: 'Emprendimiento informal UY', detail: 'ferias, DM de Instagram, Mitienda', min: 350, max: 850 },
  { name: 'Dahila (precios nuevos)', detail: 'handmade con sitio, marca y seguimiento', min: 360, max: 1540, self: true },
  { name: 'Retail a máquina', detail: 'Indian $899–1.499 · Zara/Mango $1.500–3.500', min: 899, max: 3500 },
  { name: 'Handmade global (Etsy)', detail: 'tops/cardigans USD 30–100', min: 1200, max: 4000 },
  { name: 'Premium (Manos del Uruguay, MOMO NY)', detail: 'exportación, lujo', min: 4000, max: 14000 },
]

export interface MarketRef {
  name: string
  what: string
  price: string
  lesson: string
  url?: string
}

export const MARKET_REFS: MarketRef[] = [
  {
    name: 'Moda crochet by me',
    what: 'Emprendimiento UY en Mitienda — el "piso local"',
    price: 'Top $850 · carpetas $350–420',
    lesson: 'Dahila a 899 estaba pegada al piso informal pese a tener sitio, fotos y marca muy superiores.',
    url: 'https://www.mitienda.uy/moda-crochet-by-me',
  },
  {
    name: 'Indian (tejidos a máquina)',
    what: 'Retail masivo, tejido industrial',
    price: 'Poleras $899–1.499 · cardigan $1.399',
    lesson: 'Un cardigan tejido A MANO no puede costar menos que uno de máquina. Era la anomalía del catálogo.',
    url: 'https://www.indian.com.uy/tejidos',
  },
  {
    name: 'Mercado UY en general',
    what: 'Instagram, Facebook, ML, ferias',
    price: 'Casi nadie publica precios',
    lesson: 'Mercado opaco → el cliente no puede comparar → publicar precios claros es una ventaja competitiva, y hay margen para cobrar por valor.',
  },
  {
    name: 'Etsy (handmade global)',
    what: 'El techo del handmade online',
    price: 'Tops/cardigans $1.200–4.000 · bikini ~$3.700',
    lesson: 'Incluso con los precios a 12 meses, cada pieza Dahila queda a la mitad o menos que Etsy. La clienta sigue "robando".',
  },
  {
    name: 'Manos del Uruguay',
    what: 'Cooperativas desde 1968 — teje para Gabriela Hearst',
    price: '$4.000–10.000+',
    lesson: '"Hecho a mano en Uruguay" tiene prestigio internacional real. Y su modelo de tejedoras es el mapa para escalar.',
    url: 'https://manos.uy/artesanas',
  },
  {
    name: 'Clases de crochet UY',
    what: 'Superprof, Casa Dominga, lanerías',
    price: '$291–500/h particular · $1.500/mes grupal',
    lesson: 'La hora de esa habilidad vale 6–8× lo que hoy rinde tejiendo. Reordena todo (ver Clases).',
    url: 'https://www.superprof.uy/clases/crochet/montevideo/',
  },
]

// ─── 2. Precios ──────────────────────────────────────────────

export const PRICING_RULES = [
  {
    title: 'Nunca la marca cara',
    body: 'El techo es el retail a máquina; jamás la banda Etsy. El posicionamiento es "handmade a precio de casi-máquina" — la mejor relación calidad-precio del país.',
  },
  {
    title: 'Todo aumento con una razón',
    body: 'Ningún aumento sin mejora visible (packaging, fotos, descripciones) y sin narrativa ("colección nueva", "lana premium"). Nunca se anuncia "subimos precios".',
  },
  {
    title: 'La escalera refleja horas',
    body: 'Un poncho de 19 horas no puede costar casi lo mismo que un top de 13. La contribución por hora ($/h) es el criterio que ordena la tabla — no el promedio del mercado.',
  },
  {
    title: 'La entrada no se toca',
    body: 'Bandana y mini bufandas quedan baratas a propósito: son el gancho de prueba y regalo que sostiene la percepción de "mejor valor" en todo el catálogo.',
  },
]

export type PricePriority = 'urgente' | 'alta' | 'media' | 'baja' | 'hold'

export interface PriceRow {
  /** Slug del producto en la tienda (para chequear en vivo si el precio ya se aplicó). */
  slug: string
  name: string
  /** Precio anterior (antes de julio 2026). */
  before: number
  /** Precio HOY aprobado. null = HOLD (no tocar). */
  today: number | null
  /** Target a 12 meses. */
  target: number | null
  hours: number | null
  /** Materiales estimados UYU (la dueña debe ajustar con costos reales). */
  materials: number | null
  priority: PricePriority
  note?: string
}

/** Tabla aprobada por la dueña (columna HOY de la estrategia definitiva, jul 2026). */
export const PRICE_TABLE: PriceRow[] = [
  { slug: 'set-brisa', name: 'Set BRISA (3 piezas)', before: 690, today: 890, target: 1090, hours: 16, materials: 350, priority: 'urgente', note: '3 piezas con bikini — era la pieza más subvaluada del catálogo' },
  { slug: 'cardigan-3-4', name: 'Cardigan 3/4', before: 1100, today: 1290, target: 1490, hours: 22, materials: 480, priority: 'urgente', note: 'Costaba menos que un cardigan de máquina ($1.399)' },
  { slug: 'cardigan-cruzado', name: 'Cardigan CRUZADO', before: 1100, today: 1290, target: 1490, hours: 22, materials: 480, priority: 'urgente' },
  { slug: 'poncho', name: 'Poncho', before: 1100, today: 1290, target: 1450, hours: 19, materials: 450, priority: 'urgente', note: 'En Etsy un poncho similar ronda $8.000' },
  { slug: 'set-lueur', name: 'Set LUEUR (3 piezas)', before: 999, today: 1150, target: 1290, hours: 18, materials: 380, priority: 'urgente' },
  { slug: 'chaleco', name: 'Chaleco', before: 1000, today: 1190, target: 1350, hours: 16, materials: 350, priority: 'alta' },
  { slug: 'set-lurex', name: 'Set LUREX', before: 1100, today: 1250, target: 1390, hours: 17, materials: 400, priority: 'alta' },
  { slug: 'beach-set', name: 'BEACH set', before: 1300, today: 1490, target: 1690, hours: 20, materials: 450, priority: 'alta' },
  { slug: 'top-flower', name: 'Top FLOWER', before: 1100, today: 1250, target: 1390, hours: 16, materials: 320, priority: 'alta' },
  { slug: 'top-cherry', name: 'Top CHERRY', before: 990, today: 1090, target: 1190, hours: 14, materials: 300, priority: 'alta' },
  { slug: 'top-summer', name: 'Top SUMMER', before: 990, today: 1090, target: 1190, hours: 14, materials: 300, priority: 'alta' },
  { slug: 'falda-serenada', name: 'Falda SERENADA', before: 990, today: 1090, target: 1190, hours: 14, materials: 300, priority: 'alta' },
  { slug: 'top-higgie', name: 'Top HIGGIE', before: 950, today: 1050, target: 1150, hours: 13, materials: 280, priority: 'media' },
  { slug: 'top-race', name: 'Top RACE', before: 899, today: 990, target: 1090, hours: 13, materials: 280, priority: 'media' },
  { slug: 'top-maresia', name: 'Top MARESIA', before: 899, today: 990, target: 1090, hours: 13, materials: 280, priority: 'media' },
  { slug: 'top-lagom', name: 'Top LAGOM', before: 899, today: 990, target: 1090, hours: 13, materials: 280, priority: 'media' },
  { slug: 'top-amelie', name: 'Top AMÉLIE', before: 899, today: 990, target: 1090, hours: 13, materials: 280, priority: 'media' },
  { slug: 'top-halter', name: 'Top HALTER', before: 780, today: 890, target: 990, hours: 11, materials: 250, priority: 'media' },
  { slug: 'top-duna', name: 'Top DUNA', before: 780, today: 890, target: 990, hours: 11, materials: 250, priority: 'media' },
  { slug: 'set-de-bufanda-y-guantes', name: 'Set bufanda y guantes', before: 700, today: 790, target: 890, hours: 9, materials: 220, priority: 'media' },
  { slug: 'cowl-neck-top', name: 'COWL NECK top', before: 560, today: 620, target: 720, hours: 8, materials: 200, priority: 'media', note: 'El top más accesible — sirve para captar primera compra' },
  { slug: 'bolso-de-estudiante', name: 'Bolso de estudiante', before: 650, today: 720, target: 790, hours: 7, materials: 250, priority: 'baja' },
  { slug: 'tote-bag-de-playa', name: 'Tote bag de playa', before: 670, today: 720, target: 790, hours: 7, materials: 250, priority: 'baja' },
  { slug: 'donut-bag', name: 'DONUT bag', before: 650, today: 720, target: 790, hours: 6, materials: 220, priority: 'baja' },
  { slug: 'bolso-a-cuadros', name: 'Bolso a cuadros', before: 950, today: 1050, target: 1150, hours: 8, materials: 300, priority: 'baja' },
  { slug: 'mini-tote-bag', name: 'Mini tote bag', before: 590, today: 650, target: 690, hours: 5, materials: 180, priority: 'baja' },
  { slug: 'bolso-lola', name: 'Bolso LOLA', before: 1300, today: 1390, target: 1490, hours: 10, materials: 350, priority: 'baja' },
  { slug: 'bufanda-sophie', name: 'Bufanda SOPHIE', before: 550, today: 590, target: 620, hours: 5, materials: 180, priority: 'baja' },
  { slug: 'calentadores', name: 'Calentadores', before: 550, today: 590, target: 620, hours: 5, materials: 180, priority: 'baja' },
  { slug: 'bandana', name: 'Bandana', before: 500, today: null, target: 550, hours: 4, materials: 150, priority: 'hold', note: 'Gancho de entrada — no tocar este año' },
  { slug: 'mini-bufandas', name: 'Mini BUFANDAS', before: 360, today: null, target: 390, hours: 3, materials: 100, priority: 'hold', note: 'Producto de prueba/impulso — no tocar' },
  { slug: 'box-de-regalo', name: 'Box de regalo', before: 650, today: null, target: null, hours: null, materials: null, priority: 'hold', note: '¿Producto o packaging? Recomendado: volver el buen packaging estándar y retirarlo como producto' },
]

/** Contribución por hora a un precio dado (precio − materiales) / horas. */
export function contribPerHour(row: PriceRow, price: number | null): number | null {
  if (price == null || row.hours == null || row.materials == null || row.hours <= 0) return null
  return Math.round((price - row.materials) / row.hours)
}

export const PRICING_PHASES = [
  {
    when: 'Ahora (jul 2026)',
    title: 'Fase 1 — aplicar la columna HOY',
    body: 'Todo el catálogo salvo los HOLD. Acompañar con descripciones nuevas y packaging tipo regalo — el aumento siempre llega junto a una mejora visible.',
  },
  {
    when: 'Mes 4–5 (nov)',
    title: 'Fase 2 — segundo paso en tops y bolsos',
    body: 'Hacia el target de 12 meses, lanzado junto al drop "Verano \'26": la colección nueva es la razón del precio nuevo.',
  },
  {
    when: 'Mes 7–8',
    title: 'Fase 3 — cerrar statement y sets',
    body: 'Statement y sets llegan al target. Empezar a mover los best-sellers (recién acá: primero se re-ancla el resto del catálogo).',
  },
  {
    when: 'Mes 10–11',
    title: 'Fase 4 — cierre y redondeos',
    body: 'Tops y bolsos al target. Redondeo simbólico en la entrada (bandana a 550, mini bufandas a 390).',
  },
]

// ─── 3. La economía de la hora (el hallazgo que ordena todo) ─

export const HOUR_ECONOMICS = {
  headline: 'La hora de Anush vale 6–8 veces más enseñando que tejiendo',
  stats: [
    { value: '$21–34', label: 'por hora tejiendo un Set BRISA', sub: 'contribución antes → después del aumento' },
    { value: '$110', label: 'salario mínimo UY aprox. por hora', sub: 'referencia de piso' },
    { value: '$291–500', label: 'por hora dando clase de crochet', sub: 'mercado real UY (Superprof)' },
  ],
  implications: [
    'A los precios viejos, pagarle a otra tejedora un sueldo justo daba PÉRDIDA en casi todo el catálogo (solo cerraban los bolsos). Los aumentos no son solo margen: son lo que habilita escalar con tejedoras.',
    'Precios, clases y red de tejedoras son el mismo proyecto, no tres ideas sueltas: los precios pagan la mano de obra, las clases monetizan la hora escasa y forman a las futuras tejedoras.',
  ],
}

// ─── 4. Red de tejedoras ─────────────────────────────────────

export const WEAVER_PIPELINE = [
  { step: 'Postulación', detail: 'Formulario público en /tejedoras. El filtro rápido son las fotos: tensión pareja y terminación prolija.' },
  { step: 'Charla', detail: 'WhatsApp. Conocerla, contarle cómo se trabaja, acordar expectativas.' },
  { step: 'Muestra pagada', detail: 'Una pieza contra ficha técnica (lana, aguja, medidas, fotos de aceptable/no aceptable). Se paga siempre, quede o no.' },
  { step: 'Aprendiz', detail: 'Primeros encargos simples y repetibles: accesorios, bolsos, tops básicos.' },
  { step: 'Asociada → Senior', detail: 'Con consistencia sube el tier: más volumen y piezas más complejas.' },
]

export const WEAVER_SYSTEM = [
  {
    title: 'Cómo se paga',
    body: 'Pago por pieza = horas estándar del modelo × tarifa/hora acordada, abonado al aprobar la pieza. La lana la provee Dahila (controla calidad y color). La tarifa arranca donde el precio lo permite y sube con cada fase de precios.',
  },
  {
    title: 'Control de calidad',
    body: 'Ficha técnica idéntica por modelo + QC pieza por pieza antes de entregar (medidas, tensión, terminación, costuras, cierres). Nunca sale una pieza sin QC: esa barrera protege la marca.',
  },
  {
    title: 'El nombre en la prenda',
    body: 'Cada pieza lleva el nombre de quien la tejió, como hace Manos del Uruguay. Orgullo + responsabilidad + historia que la clienta valora.',
  },
  {
    title: 'Errores y ritmos',
    body: 'Primer error: se corrige y se explica con la ficha. Reincidencia: baja de tier o pausa. ¿Consistente pero lenta? Modelos más simples, no castigo. ¿Rápida y prolija? Más y mejores encargos.',
  },
  {
    title: 'Por dónde empezar',
    body: 'Con UNA tejedora, para bolsos y accesorios (donde la economía ya cierra). La dueña conserva las piezas statement hasta que la red madure. Se suma otra recién cuando la primera es consistente.',
  },
  {
    title: 'La consistencia no es magia',
    body: 'La ponen las fichas técnicas idénticas + la misma lana provista + el QC centralizado. No depende del talento individual: depende del estándar documentado.',
  },
]

// ─── 5. Clases ───────────────────────────────────────────────

export const CLASSES_VERDICT = {
  decision: 'SÍ — y liderar con clases',
  reasons: [
    'Es el mejor uso posible de la hora escasa de la dueña: $291–500/h enseñando vs. $21–58/h de contribución tejiendo, sin costo de materiales.',
    'Las mejores alumnas son las futuras tejedoras, ya formadas al estándar Dahila — resuelve calidad y consistencia de raíz (modelo Nest / Manos).',
    'Genera comunidad, contenido para redes y lista de emails para los drops. Cada clase alimenta el resto del sistema.',
    'Facturación inmediata mientras la red de tejedoras madura (esa tarda 6–12 meses en producir).',
  ],
  comparison: [
    { option: 'Solo reclutar', pros: 'Alivia el cuello de botella en 1–2 meses', cons: 'A precios viejos daba pérdida; el skill es escaso en UY; sin pipeline propio' },
    { option: 'Solo clases', pros: 'Máxima rentabilidad por hora, comunidad, pipeline', cons: 'Lento para producir (6–12 meses hasta que una alumna teje para la marca)' },
    { option: 'Ambas (elegida)', pros: 'Clases monetizan YA + 1 tejedora selectiva donde la economía cierra', cons: 'Requiere disciplina para no dispersarse' },
  ],
  format: {
    title: 'Formato sugerido (a validar con costos reales)',
    body: 'Grupal de 3–5 alumnas, ciclo mensual de 4 encuentros de 2 h. Referencias de mercado: Casa Dominga cobra $1.500/mes con materiales; una particular vale $291–500/h. Arrancar con un ciclo piloto con 3–4 personas de confianza antes de publicar precio.',
  },
}

// ─── 6. Drops ────────────────────────────────────────────────

export interface DropEvent {
  name: string
  month: number // 1-12
  monthLabel: string
  hook: string
}

export const DROP_CALENDAR: DropEvent[] = [
  { name: 'Día de la Madre', month: 5, monthLabel: 'mayo', hook: 'Regalos: bolsos, bufandas, box' },
  { name: 'Invierno', month: 6, monthLabel: 'junio', hook: 'Cardigans, ponchos, cuellos, calentadores' },
  { name: "Verano '26", month: 11, monthLabel: 'noviembre', hook: 'Bikinis, salidas de playa, tops — el drop grande del año' },
  { name: 'Navidad', month: 12, monthLabel: 'diciembre', hook: 'Regalos + box + gift cards artesanales' },
]

export const DROP_PLAYBOOK = [
  {
    phase: 'Semanas −3 y −2 · Expectativa',
    actions: 'Fotos borrosas, macro de un punto, behind-the-scenes del tejido. Abrir lista VIP (footer + difusión WA) con la promesa concreta: "lo ves y comprás 24 h antes".',
  },
  {
    phase: 'Semana −1 · Reveal',
    actions: 'Un "first look" por día en Stories con countdown sticker. 1 reel de proceso. La lista VIP recibe sneak peeks exclusivos que el feed no ve.',
  },
  {
    phase: 'Día 0 · Lanzamiento',
    actions: 'La lista VIP compra 24 h antes que el público. Después: "live now" en Stories + difusión de WhatsApp con el link + email a la lista.',
  },
  {
    phase: 'Post · Escasez y recap',
    actions: 'A las horas: "lo que queda". Después: recap ("se agotó X"). Reposición solo por encargo a medida con plazo mayor — la escasez se mantiene porque es real.',
  },
]

export const DROP_BENCHMARKS = [
  { value: '90%+', label: 'tasa de lectura de una difusión de WhatsApp', sub: 'vs ~20% de apertura de email' },
  { value: '4–7%', label: 'compra en difusiones de WhatsApp bien hechas', sub: '15–20% si la lista está segmentada' },
  { value: '4–6/mes', label: 'máximo de difusiones sin quemar la lista', sub: 'mínimo 3 días entre envíos' },
]

export const DROP_RULES = [
  'La escasez es honesta o no es: cantidades realmente limitadas (es a mano), "edición [temporada]", número de pieza escrito a mano.',
  'Cada drop es el marco perfecto para introducir la siguiente fase de precios: "colección nueva" es la razón.',
  'Quien compra un drop entra a la lista "clientas" que ve el siguiente primero: cada lanzamiento alimenta al próximo.',
  'Premiar participación, no solo compra: estar en la lista, compartir una foto o asistir a un live también da acceso.',
]

// ─── 7. Marketing y canales ──────────────────────────────────

export const CHANNELS = [
  { channel: 'Instagram', role: 'Canal #1 — descubrimiento', action: 'Bio → /tienda · shopping tags · Highlights que respondan precio/envío/cómo encargar · 1 reel de proceso por semana (el contenido que más convierte en esta categoría).' },
  { channel: 'WhatsApp', role: 'Cierre de venta + recompra', action: 'Catálogo con precios en WhatsApp Business · respuestas rápidas · lista de difusión para drops (máx 4–6/mes).' },
  { channel: 'Pinterest', role: 'Tráfico evergreen', action: 'Un pin por producto → ficha. Los pines viven meses (un reel vive horas). El canal más subestimado para crochet.' },
  { channel: 'Google + IA', role: 'Confianza y búsqueda local', action: 'Google Business Profile ("crochet Montevideo") + descripciones ricas en las fichas: las IAs citan texto estructurado, y el sitio ya tiene el schema listo.' },
  { channel: 'Lista VIP (email)', role: 'El activo de los drops', action: 'Crece sola desde el footer. Antes de cada drop: exportar CSV y mandar el acceso anticipado.' },
  { channel: 'TikTok', role: 'Apuesta asimétrica', action: 'Reutilizar los reels de proceso tal cual. Costo marginal cero, upside nacional.' },
]

// ─── 8. Objetivos accionables (checklist persistente) ────────

export type ActionHorizon = 'ya' | 'mes' | 'trimestre'

export interface ActionItem {
  id: string
  label: string
  detail: string
  horizon: ActionHorizon
}

export const NEXT_ACTIONS: ActionItem[] = [
  { id: 'run-precios', label: 'Aplicar los precios nuevos en la base', detail: 'Ejecutar database/precios-2026-07.sql en el SQL Editor de Supabase (1 minuto). El semáforo de la tabla de abajo se pone verde solo.', horizon: 'ya' },
  { id: 'run-schemas', label: 'Activar tejedoras y lista VIP', detail: 'Ejecutar database/schema-tejedoras.sql y database/schema-suscriptores.sql en Supabase. Habilita las postulaciones y la captura de emails del footer.', horizon: 'ya' },
  { id: 'descripciones', label: 'Escribir las descripciones de los 32 productos', detail: 'Material, medidas por talle, horas de tejido, cuidado, "queda bien con…". Es el multiplicador de conversión + SEO + IA más grande del proyecto.', horizon: 'ya' },
  { id: 'packaging', label: 'Packaging tipo regalo', detail: 'Papel de seda + bolsa kraft + tarjeta escrita a mano + tarjeta de cuidado. El aumento de precio llega junto a esta mejora visible.', horizon: 'ya' },
  { id: 'clase-piloto', label: 'Primera clase piloto', detail: '3–4 alumnas de confianza, un ciclo de 4 encuentros de 2 h. Validar formato y precio antes de publicarlo.', horizon: 'mes' },
  { id: 'difusion-wa', label: 'Lista de difusión en WhatsApp Business', detail: 'Con clientas que ya compraron + catálogo con precios + respuestas rápidas. Es el canal de mejor conversión para los drops.', horizon: 'mes' },
  { id: 'anunciar-tejedoras', label: 'Difundir /tejedoras', detail: 'Story fijada + link en bio + contárselo a alumnas y conocidas. Objetivo: 1 tejedora aprobada para bolsos.', horizon: 'mes' },
  { id: 'gbp', label: 'Google Business Profile', detail: 'Perfil de negocio con área de servicio (Montevideo). Gratis: confianza + SEO local + citación por IAs.', horizon: 'mes' },
  { id: 'mercadopago', label: 'Link de pago Mercado Pago con cuotas', detail: 'Manual, por WhatsApp, al cerrar cada venta. Las cuotas hacen indoloro el precio nuevo.', horizon: 'mes' },
  { id: 'drop-verano', label: 'Preparar el drop "Verano \'26"', detail: 'Sesión de fotos, colección con nombre en el panel, playbook de 4 semanas (ver Drops). Lanzamiento: noviembre.', horizon: 'trimestre' },
  { id: 'dominio', label: 'Dominio propio dahila.uy', detail: 'Comprar, setear NEXT_PUBLIC_SITE_URL, 301 desde Netlify, Search Console, y enviar emails desde el dominio propio (arregla el spam).', horizon: 'trimestre' },
  { id: 'precios-fase2', label: 'Fase 2 de precios (con el drop)', detail: 'Segundo paso en tops y bolsos hacia el target 12m, lanzado junto a la colección de verano.', horizon: 'trimestre' },
]

export const VALUE_ACTIONS: ActionItem[] = [
  { id: 'vp-regalo', label: 'Envolver cada pieza como un regalo', detail: 'Papel de seda + sticker con el logo. Costo mínimo, percepción máxima.', horizon: 'ya' },
  { id: 'vp-tarjeta', label: 'Tarjeta escrita a mano firmada por Anush', detail: 'Con el nombre de la clienta. El toque humano que nadie industrial puede copiar.', horizon: 'ya' },
  { id: 'vp-cuidado', label: 'Tarjeta de cuidado de la prenda', detail: 'Cómo lavar y guardar. Comunica calidad y alarga la vida de la pieza.', horizon: 'ya' },
  { id: 'vp-edicion', label: 'Número de edición a mano en piezas statement', detail: '"Pieza única N.º —". Escasez tangible y honesta.', horizon: 'mes' },
  { id: 'vp-etiqueta', label: 'Etiqueta "Dahila" cosida', detail: 'Marca permanente en la prenda. Profesionaliza y viaja con la pieza.', horizon: 'mes' },
  { id: 'vp-qr', label: 'QR a un reel del proceso en el packaging', detail: '30 segundos del tejido de ESA pieza o del taller. La narrativa sube la disposición a pagar.', horizon: 'mes' },
  { id: 'vp-ajuste', label: 'Comunicar "ajuste garantizado"', detail: 'Si no te queda bien, lo ajustamos. Al ser a medida cuesta casi nada y elimina el miedo #1 de comprar ropa online.', horizon: 'ya' },
  { id: 'vp-sorpresa', label: 'Regalito sorpresa en pedidos grandes', detail: 'Mini accesorio o muestra de lana → fotos espontáneas en redes → boca a boca.', horizon: 'mes' },
  { id: 'vp-bundle', label: 'Bundles "completá el look" + envío gratis desde $1.400', detail: 'Sube el ticket sin descontar el producto core.', horizon: 'trimestre' },
]

// ─── 9. Riesgos ──────────────────────────────────────────────

export interface Risk {
  title: string
  severity: 'alta' | 'media' | 'baja'
  detail: string
  mitigation: string
}

export const RISKS: Risk[] = [
  {
    title: 'Todo depende de una sola persona',
    severity: 'alta',
    detail: 'Anush teje, vende, responde y hace envíos. Una gripe frena el negocio; el crecimiento la ahoga.',
    mitigation: 'Red de tejedoras (delegar producción simple) + clases (monetizar la hora sin tejer) + este panel como memoria del negocio.',
  },
  {
    title: 'Audiencia alquilada al algoritmo',
    severity: 'alta',
    detail: 'El 100% del tráfico nace en Instagram. Un cambio de algoritmo o un bloqueo de cuenta apaga las ventas.',
    mitigation: 'Lista VIP propia (footer), difusión de WhatsApp, Pinterest evergreen y SEO/IA. Activos propios, no alquilados.',
  },
  {
    title: 'Subvaluación crónica → burnout',
    severity: 'alta',
    detail: 'Trabajar a $21–58/h de contribución no es sostenible: agota y no financia crecimiento ni delegación.',
    mitigation: 'Aplicar la tabla de precios; medir $/h por pieza; decir no a encargos que no cierran.',
  },
  {
    title: 'Emails a spam (dominio nuevo sin DMARC)',
    severity: 'media',
    detail: 'send.farodigital.uy es nuevo y el nombre no coincide con la marca — los avisos pueden caer en spam.',
    mitigation: 'Registro DMARC en NetUY, marcar "no es spam" + contacto, y al comprar dahila.uy enviar desde el dominio propio.',
  },
  {
    title: 'Dominio propio pendiente',
    severity: 'media',
    detail: 'La marca vive en dahila-crochet.netlify.app: menos confianza y SEO que se pierde al migrar mal.',
    mitigation: 'Comprar dahila.uy → cambiar una sola variable (NEXT_PUBLIC_SITE_URL) + 301 + Search Console. El código ya quedó preparado.',
  },
  {
    title: 'Calidad inconsistente al delegar',
    severity: 'media',
    detail: 'La primera pieza floja de una tejedora que llega a una clienta daña la marca desproporcionadamente.',
    mitigation: 'Muestra pagada + ficha técnica + QC de cada pieza antes de enviar, sin excepciones. Nunca sale nada sin pasar por Anush.',
  },
]

// ─── 10. Decisiones y descartes ──────────────────────────────

export interface Decision {
  date: string
  title: string
  why: string
}

export const DECISIONS: Decision[] = [
  {
    date: 'jul 2026',
    title: 'Posicionamiento: el mejor handmade al precio más justo de Uruguay',
    why: 'Un escalón sobre el emprendimiento informal (lo justifica la presentación), siempre debajo del retail a máquina y lejísimos de Etsy. Todo cambio de precio se mide contra esta frase.',
  },
  {
    date: 'jul 2026',
    title: 'Aumentos moderados en dos pasos (HOY + 12 meses), ordenados por $/h',
    why: 'El criterio es la economía interna (contribución por hora), no el promedio del mercado. Statement y sets primero porque pagaban la mitad por hora que un bolso.',
  },
  {
    date: 'jul 2026',
    title: 'Liderar con clases; reclutar 1 tejedora en paralelo',
    why: 'La hora enseñando rinde 6–8× la hora tejiendo y las alumnas son el semillero de tejedoras formadas al estándar propio. Cambió la recomendación anterior ("reclutar primero") cuando la economía de la hora quedó sobre la mesa.',
  },
  {
    date: 'jul 2026',
    title: 'Drops 3–4 por año sobre la feature de colecciones',
    why: 'Colecciones estaba construida y vacía. El handmade es escaso de verdad: el modelo de lanzamientos limitados con lista VIP es el que más factura por pieza en marcas chicas.',
  },
  {
    date: 'jul 2026',
    title: 'El checkout sigue siendo WhatsApp',
    why: 'A esta escala convierte mejor que un checkout online (confianza + a medida + cuotas por link manual). Se revisa al llegar a ~40–50 pedidos/mes.',
  },
  {
    date: 'jul 2026',
    title: 'Corrección de benchmark de WhatsApp',
    why: 'Un informe anterior decía "40–60% de conversión" en difusiones: el dato real es 90%+ de LECTURA y 4–7% de compra (15–20% segmentado). Sigue siendo el mejor canal, pero planificamos con números honestos.',
  },
  {
    date: 'jul 2026',
    title: 'Captura de email en el footer + página /tejedoras públicas',
    why: 'Las dos piezas de infraestructura que faltaban para drops y para la red. Costo bajo, reutilizan patrones existentes (formularios, RLS, emails).',
  },
]

export interface DiscardedIdea {
  title: string
  why: string
  revisit?: string
}

export const DISCARDED: DiscardedIdea[] = [
  {
    title: 'Vender en Etsy / exportar ya',
    why: 'Envíos internacionales, comisiones y competir con miles de tiendas sin historial. El cachet "hecho en Uruguay" rinde más localmente hoy.',
    revisit: 'Cuando la red de tejedoras dé capacidad ociosa',
  },
  {
    title: 'Checkout online integrado (Mercado Pago)',
    why: 'No rinde hasta ~40–50 pedidos/mes y cambia un flujo que funciona. El link de pago manual con cuotas logra el 90% del beneficio hoy.',
    revisit: 'Al superar 40 pedidos/mes sostenidos',
  },
  {
    title: 'Publicidad paga (IG/Google Ads)',
    why: 'Pagar tráfico hacia fichas sin descripciones ni reseñas es tirar plata. Primero la ficha convierte, después se compra tráfico.',
    revisit: 'Con descripciones + reseñas en producción',
  },
  {
    title: 'Automatización de carrito abandonado (Brevo)',
    why: 'Requiere capturar contacto ANTES del salto a WhatsApp (pedido real). Esa pieza va primero; la automatización después.',
    revisit: 'Tras implementar captura de pedido',
  },
  {
    title: 'Subir precios a la banda Etsy',
    why: 'Rompería el posicionamiento aprobado ("nunca la marca cara") y el mercado UY opaco no lo convalida. La mejor relación calidad-precio ES la estrategia.',
  },
  {
    title: 'App móvil / multi-idioma / rediseño',
    why: 'Cero evidencia de demanda. El sitio ya es rápido, mobile-first y está por encima del estándar del rubro.',
  },
  {
    title: 'Programa de puntos formal',
    why: 'Complejidad alta de mantener. Una tarjeta "-10% en tu próxima compra" dentro del paquete logra el 80% del efecto con 2% del esfuerzo.',
  },
]
