// ============================================================
// Estrategia y crecimiento — contenido
// ============================================================
// La guía del negocio que Anush consulta cada semana. Se escribe PARA ELLA:
// lenguaje simple, cero jerga técnica, todo accionable.
//
// Para actualizar la estrategia se edita este archivo. Los datos vivos
// (precios aplicados, postulaciones, lista VIP, checklist) los lee la página
// de la base en tiempo real.
//
// Fuentes: mercado UY relevado a mano (jul 2026), Manos del Uruguay,
// Alabama Chanin, Krochet Kids, estándares Nest, benchmarks reales de
// WhatsApp. Los informes completos están en los ESTRATEGIA-*.md del repo.
// ============================================================

export const ULTIMA_REVISION = 'septiembre 2026'

export const NORTE =
  'El mejor tejido a mano de Uruguay al precio más justo: un escalón arriba del emprendimiento informal, siempre abajo de la ropa de máquina. Que cada clienta sienta que recibe más de lo que pagó.'

// ─── Mercado ─────────────────────────────────────────────────

export interface MarketBand {
  name: string
  detail: string
  min: number
  max: number
  self?: boolean
}

export const MARKET_BANDS: MarketBand[] = [
  { name: 'Emprendimientos informales', detail: 'ferias, DM de Instagram', min: 350, max: 850 },
  { name: 'Dahila', detail: 'a mano, con marca y a medida', min: 360, max: 1540, self: true },
  { name: 'Ropa de máquina', detail: 'Indian, Zara, Mango', min: 799, max: 3500 },
  { name: 'Handmade internacional', detail: 'Etsy', min: 1200, max: 4000 },
  { name: 'Lujo artesanal', detail: 'Manos del Uruguay', min: 4000, max: 14000 },
]

export interface MarketRef {
  name: string
  price: string
  lesson: string
}

export const MARKET_REFS: MarketRef[] = [
  {
    name: 'Moda crochet by me (Mitienda)',
    price: 'Top $850',
    lesson: 'Es el piso informal. Dahila estaba pegada a ese piso con un sitio, fotos y marca muy superiores.',
  },
  {
    name: 'Indian — tejido a máquina',
    price: 'Sweaters $799–1.199 (jul 2026)',
    lesson: 'Tu cardigan ($1.290) ya cuesta más que uno de máquina de Indian — y está perfecto: lo hecho a mano no compite contra la máquina. La anomalía de 2025 quedó corregida.',
  },
  {
    name: 'Marcas artesanales de la región',
    price: 'Top indie argentino ~$1.450 (Nacra)',
    lesson: 'Una marca chica argentina de crochet a mano cobra por un top lo que tu tabla recién alcanza a 12 meses. Brasil (Elo7, $600–1.100) es más barato porque sus sueldos lo son — no es tu referencia.',
  },
  {
    name: 'Etsy — handmade internacional',
    price: 'Tops $1.200–4.000',
    lesson: 'Incluso con los precios a 12 meses, cada pieza tuya cuesta la mitad o menos que allá.',
  },
  {
    name: 'Manos del Uruguay',
    price: '$4.000–10.000+',
    lesson: '"Hecho a mano en Uruguay" viste a marcas de lujo en Nueva York. El prestigio es real — usalo. Y entre la máquina y Manos hay un hueco de $1.500–4.000 donde hoy no hay nadie.',
  },
  {
    name: 'Shein, Temu y AliExpress',
    price: 'Pagan IVA del 22% desde el 1/5/2026',
    lesson: 'La ropa de crochet de fábrica que llega de China dejó de entrar libre de impuestos: desde mayo paga IVA al llegar, además del tope anual de US$ 800 por persona. Y todo lo que entra por franquicia es apenas el 8% del comercio online uruguayo (CEDU, a junio 2026). Tu competencia de verdad no es China: son las marcas y emprendimientos de acá.',
  },
  {
    name: 'El resto del mercado UY',
    price: 'No publica precios',
    lesson: 'Casi nadie muestra precios: se cotiza por mensaje. Que vos los publiques claros ya es una ventaja.',
  },
]

// ─── Precios ─────────────────────────────────────────────────

/** La explicación de fondo, en una frase. */
export const PRICING_WHY =
  'La regla es simple: mirá cuánto te queda por hora de trabajo en cada pieza (precio menos materiales, dividido las horas). Los bolsos te pagaban $67–104 la hora; los cardigans y sets, $34–44 — menos de un tercio del salario mínimo legal ($127). Por eso suben primero las piezas de muchas horas: no porque "afuera cueste más", sino porque eran las que peor te pagaban a VOS.'

export const PRICING_RULES = [
  {
    title: 'El techo sube con la marca',
    body: 'Ya no es Indian (sus sweaters de máquina bajaron a $799–1.199 y no compiten con lo tuyo). El techo de esta etapa es el knitwear de marca ($1.500–3.500). Entre eso y Manos ($4.000+) no hay NADIE tejiendo a mano con marca: ese hueco es tu espacio para crecer.',
  },
  {
    title: 'Todo aumento llega con una mejora',
    body: 'Packaging nuevo, fotos nuevas o colección nueva. Nunca se anuncia "subimos precios" — se anuncia algo mejor.',
  },
  {
    title: 'Más horas = más precio',
    body: 'Un poncho de 19 horas no puede costar casi lo mismo que un top de 13. La escalera de precios sigue a las horas.',
  },
  {
    title: 'La lista de espera manda',
    body: 'Si una pieza junta más de un mes de cola, su precio de encargo sube al siguiente escalón (columna 12m) sin esperar la fecha del plan. La cola es la prueba de que el precio quedó corto — y una venta que igual no podías tejer no es una venta perdida.',
  },
  {
    title: 'La entrada queda barata a propósito',
    body: 'Bandana y mini bufandas no se tocan: son la puerta de entrada para probar la marca y hacer regalos.',
  },
]

/** Referencias del valor de una hora de trabajo en Uruguay (para decidir con contexto). */
export const HOUR_REFS = [
  { value: '$127', label: 'salario mínimo por hora en Uruguay', sub: 'desde julio 2026 ($25.383/mes ÷ 200 h). Es el piso legal — no una meta' },
  { value: '~$200', label: 'gana por hora la mitad de los uruguayos que trabajan', sub: 'ingreso mediano ~$40.000/mes (INE). Tu vara real de comparación' },
  { value: '$150–250', label: 'tarifa razonable para pagarle a una tejedora', sub: 'por hora estándar del modelo, según nivel — nunca menos que el mínimo' },
  { value: '$291–500', label: 'lo que vale una hora de clase de crochet', sub: 'precios reales publicados en Uruguay' },
]

export type PricePriority = 'urgente' | 'alta' | 'media' | 'baja' | 'hold'

export interface PriceRow {
  slug: string
  name: string
  before: number
  /** Precio aprobado (jul 2026). null = no se toca. */
  today: number | null
  /** A dónde llegar en 12 meses. */
  target: number | null
  hours: number | null
  materials: number | null
  priority: PricePriority
  note?: string
}

/** Tabla aprobada (julio 2026). Ya aplicada en la tienda — el semáforo lo verifica en vivo. */
export const PRICE_TABLE: PriceRow[] = [
  { slug: 'set-brisa', name: 'Set BRISA (3 piezas)', before: 690, today: 890, target: 1090, hours: 16, materials: 350, priority: 'urgente', note: 'Era la pieza más regalada del catálogo' },
  { slug: 'cardigan-3-4', name: 'Cardigan 3/4', before: 1100, today: 1290, target: 1490, hours: 22, materials: 480, priority: 'urgente', note: 'Costaba menos que uno de máquina' },
  { slug: 'cardigan-cruzado', name: 'Cardigan CRUZADO', before: 1100, today: 1290, target: 1490, hours: 22, materials: 480, priority: 'urgente' },
  { slug: 'poncho', name: 'Poncho', before: 1100, today: 1290, target: 1450, hours: 19, materials: 450, priority: 'urgente' },
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
  { slug: 'cowl-neck-top', name: 'COWL NECK top', before: 560, today: 620, target: 720, hours: 8, materials: 200, priority: 'media', note: 'El top más accesible: sirve para la primera compra' },
  { slug: 'bolso-de-estudiante', name: 'Bolso de estudiante', before: 650, today: 720, target: 790, hours: 7, materials: 250, priority: 'baja' },
  { slug: 'tote-bag-de-playa', name: 'Tote bag de playa', before: 670, today: 720, target: 790, hours: 7, materials: 250, priority: 'baja' },
  { slug: 'donut-bag', name: 'DONUT bag', before: 650, today: 720, target: 790, hours: 6, materials: 220, priority: 'baja' },
  { slug: 'bolso-a-cuadros', name: 'Bolso a cuadros', before: 950, today: 1050, target: 1150, hours: 8, materials: 300, priority: 'baja' },
  { slug: 'mini-tote-bag', name: 'Mini tote bag', before: 590, today: 650, target: 690, hours: 5, materials: 180, priority: 'baja' },
  { slug: 'bolso-lola', name: 'Bolso LOLA', before: 1300, today: 1390, target: 1490, hours: 10, materials: 350, priority: 'baja' },
  { slug: 'bufanda-sophie', name: 'Bufanda SOPHIE', before: 550, today: 590, target: 620, hours: 5, materials: 180, priority: 'baja' },
  { slug: 'calentadores', name: 'Calentadores', before: 550, today: 590, target: 620, hours: 5, materials: 180, priority: 'baja' },
  { slug: 'bandana', name: 'Bandana', before: 500, today: null, target: 550, hours: 4, materials: 150, priority: 'hold', note: 'Puerta de entrada — no tocar este año' },
  { slug: 'mini-bufandas', name: 'Mini BUFANDAS', before: 360, today: null, target: 390, hours: 3, materials: 100, priority: 'hold', note: 'Compra impulso y regalo — no tocar' },
  { slug: 'box-de-regalo', name: 'Box de regalo', before: 650, today: null, target: null, hours: null, materials: null, priority: 'hold', note: 'Mejor: que el buen packaging sea estándar y retirarlo como producto' },
]

/** Contribución por hora: (precio − materiales) / horas. */
export function contribPerHour(row: PriceRow, price: number | null): number | null {
  if (price == null || row.hours == null || row.materials == null || row.hours <= 0) return null
  return Math.round((price - row.materials) / row.hours)
}

// ─── Comparables de mercado (auditoría 03/09/2026) ─────────────
// Fuente completa, con cada precio trazado a una URL y fecha de consulta:
// research/auditoria-mercado-producto-2026-09.md, sección 2. No inventar
// precios de competencia nuevos acá — si hace falta un dato que no está,
// hay que volver a investigar, no estimarlo.

export interface MarketComparable {
  label: string
  price: string
  url?: string
}

export interface ProductMarketNote {
  comparables: MarketComparable[]
  recommendation: string
}

export const MARKET_FX_NOTE = 'Conversión con USD/UYU 40,24 (cierre BCU, 02/09/2026). Detalle completo y todas las fuentes: research/auditoria-mercado-producto-2026-09.md'

/** Por slug de producto — comparables encontrados + una recomendación en
 * lenguaje simple. Cubre los 32 productos de PRICE_TABLE (`chaleco` incluido,
 * como caso de higiene de datos) más los 4 productos nuevos sin fila propia
 * (ver ORPHAN_PRODUCTS). */
export const MARKET_COMPARABLES: Record<string, ProductMarketNote> = {
  'cowl-neck-top': {
    comparables: [
      { label: 'Moda crochet by me (UY)', price: '~$850 (jul-2026, sin reverificar)' },
      { label: 'Etsy, tops simples', price: 'US$8,90–57,40 en el extremo bajo', url: 'https://www.etsy.com/market/crochet_tops' },
    ],
    recommendation: 'Puerta de entrada — no tocar. Ya está bien por debajo de todo comparable.',
  },
  'top-halter': {
    comparables: [{ label: 'Etsy, tops en general', price: 'Rango amplio, sin un dato puntual confiable' }],
    recommendation: 'Sin cambios que ameriten revisión ahora.',
  },
  'top-duna': {
    comparables: [{ label: 'Etsy, tops en general', price: 'Rango amplio, sin un dato puntual confiable' }],
    recommendation: 'Sin cambios que ameriten revisión ahora.',
  },
  'top-race': {
    comparables: [
      { label: 'Nacra (AR, indie)', price: 'ARS 54.000 ≈ $1.416 / US$35,2', url: 'https://www.shopnacra.com.ar/productos/top-ada-tejido-puro-hilo-de-algodon/' },
      { label: 'Etsy, crop-tops', price: 'US$8,90–146,25 (grueso en US$40–90)' },
    ],
    recommendation: '30% más barato en dólares que Nacra por una pieza de la misma familia. Hay margen, pero no es la urgencia del catálogo — primero las piezas de más horas.',
  },
  'top-maresia': {
    comparables: [
      { label: 'Nacra (AR, indie)', price: 'ARS 54.000 ≈ $1.416 / US$35,2', url: 'https://www.shopnacra.com.ar/productos/top-ada-tejido-puro-hilo-de-algodon/' },
      { label: 'Etsy, crop-tops', price: 'US$8,90–146,25 (grueso en US$40–90)' },
    ],
    recommendation: '30% más barato en dólares que Nacra por una pieza de la misma familia. Hay margen, pero no es la urgencia del catálogo — primero las piezas de más horas.',
  },
  'top-lagom': {
    comparables: [
      { label: 'Nacra (AR, indie)', price: 'ARS 54.000 ≈ $1.416 / US$35,2', url: 'https://www.shopnacra.com.ar/productos/top-ada-tejido-puro-hilo-de-algodon/' },
      { label: 'Etsy, crop-tops', price: 'US$8,90–146,25 (grueso en US$40–90)' },
    ],
    recommendation: '30% más barato en dólares que Nacra por una pieza de la misma familia. Hay margen, pero no es la urgencia del catálogo — primero las piezas de más horas.',
  },
  'top-amelie': {
    comparables: [
      { label: 'Nacra (AR, indie)', price: 'US$35,2 — Amélie hoy es 44% más caro' },
      { label: 'Etsy, tops trabajados', price: 'US$40–90 (Amélie, a US$50,9, cae adentro)' },
    ],
    recommendation: 'Subió 107% (de $990 a $2.050) el 27/08 sin quedar documentado en ningún lado. En dólares no es un precio disparatado — cae dentro del rango de un top elaborado en Etsy — pero nadie lo decidió a propósito. Confirmá que se sigue vendiendo bien antes de asumirlo como el nuevo estándar.',
  },
  'top-higgie': {
    comparables: [],
    recommendation: 'Sin comparable de mercado encontrado. Sin cambios, sin señal nueva.',
  },
  'top-cherry': {
    comparables: [{ label: 'Etsy, tops trabajados', price: 'US$40–90 (tramo medio)' }],
    recommendation: 'Sin cambios.',
  },
  'top-summer': {
    comparables: [{ label: 'Etsy, tops trabajados', price: 'US$40–90 (tramo medio)' }],
    recommendation: 'Sin cambios.',
  },
  'falda-serenada': {
    comparables: [{ label: 'Etsy, tops trabajados', price: 'US$40–90 (tramo medio)' }],
    recommendation: 'Mismo precio y horas que Top CHERRY/SUMMER, así que comparte su posicionamiento. Nota aparte: hoy no tiene categoría asignada en la base — no aparece en /tienda/tops. Revisalo en el editor de este producto.',
  },
  'top-flower': {
    comparables: [{ label: 'Etsy, tops trabajados', price: 'US$40–90 (Flower, a US$49,7, cae adentro)' }],
    recommendation: 'Subió 60% (de $1.250 a $1.999) el 23/08 sin quedar documentado. El resultado interno es excelente (segundo mejor $/h del catálogo de prendas) — pero por casualidad, no por decisión. Igual que Amélie: confirmá que se sigue vendiendo bien.',
  },
  'poncho': {
    comparables: [
      { label: 'Natalia Otero Deco (AR, indie)', price: 'ARS 48.000 con 20% off ≈ $1.258 / US$31,3', url: 'https://nataliaoterodeco.mitiendanube.com/productos/poncho-tejido-al-crochet/' },
      { label: 'Manos del Uruguay (techo, lujo)', price: 'US$280–310' },
    ],
    recommendation: 'Empata casi exacto en dólares con una marca indie argentina real, y paga la hora peor que casi cualquier top del catálogo. Es la pieza que tu propia regla "más horas = más precio" usa de ejemplo — hoy no lo refleja. Candidato directo a subir.',
  },
  'sweater-senda': {
    comparables: [{ label: 'Etsy, tops/cardigans trabajados', price: 'US$40–90 (Senda, a US$48,7, cae adentro)' }],
    recommendation: 'No tiene fila en tu tabla de precios ni horas/materiales cargados. El precio en dólares no parece disparatado — falta estimar las horas para poder aplicar el mismo criterio que al resto del catálogo.',
  },
  'cardigan-3-4': {
    comparables: [{ label: 'Indian (UY, retail a máquina)', price: '$999–1.499 lista, ~$849–1.274 con descuento', url: 'https://www.indian.com.uy/vestimenta/sacos-y-cardigans' }],
    recommendation: 'Ya está dentro del rango de lista de Indian, pero paga entre las peores horas de todo el catálogo. La demanda de Cardigan amour sugiere que no hace falta esperar a feb-mar 2027 para subirlo.',
  },
  'cardigan-cruzado': {
    comparables: [{ label: 'Indian (UY, retail a máquina)', price: '$999–1.499 lista — hoy quedaste por debajo de este piso' }],
    recommendation: '⚠️ Bajó de $1.290 a $1.189 el 23/08 sin explicación — la única baja de todo el catálogo, y quedó con el peor $/h de todas las prendas, por debajo incluso de la ropa a máquina. Candidato más urgente a revertir de todo el análisis.',
  },
  'set-brisa': {
    comparables: [{ label: 'Etsy, sets de 3 piezas', price: 'US$65–135', url: 'https://www.etsy.com/listing/1893697835/3-piece-handmade-crochet-set' }],
    recommendation: 'Muy por debajo del piso de Etsy y con uno de los peores $/h del catálogo, pese a ser (según tu propia nota) "la pieza más regalada". Prioridad real de aumento.',
  },
  'set-de-bufanda-y-guantes': {
    comparables: [],
    recommendation: 'Subió de $790 a $980 (superando incluso tu meta a 12 meses) sin quedar documentado — pero el resultado es bueno: queda entre los mejores $/h de la categoría. Formalizalo como decisión, no hace falta revertirlo.',
  },
  'set-lueur': {
    comparables: [{ label: 'Etsy, sets de 3 piezas', price: 'US$65–135' }],
    recommendation: 'Igual que Set BRISA: por debajo del piso de Etsy y con $/h débil. Sin cambios desde julio.',
  },
  'set-lurex': {
    comparables: [{ label: 'Etsy, sets de 3 piezas', price: 'US$65–135 (Lurex, a US$49,7, todavía por debajo)' }],
    recommendation: 'Subió de $1.250 a $1.999 el 02/09 sin documentar. El $/h casi se duplicó — buen resultado, formalizalo.',
  },
  'beach-set': {
    comparables: [{ label: 'Etsy, sets de 3 piezas', price: 'US$65–135 (Beach set, a US$59,6, cerca del piso)' }],
    recommendation: 'Subió de $1.490 a $2.400 el 02/09 sin documentar. Es el mejor $/h de todo el catálogo de prendas — formalizalo, no hace falta revertirlo.',
  },
  'bandana': {
    comparables: [{ label: 'Isadora/Todomoda (AR, fábrica, poliéster)', price: '$103–328 UYU equiv. — no comparable en calidad, solo marca un piso' }],
    recommendation: 'No tocar — HOLD a propósito. La demanda de carrito (4 unidades, top-5 del catálogo) confirma que funciona como puerta de entrada.',
  },
  'mini-bufandas': {
    comparables: [{ label: 'Mercado Libre UY, "bufanda lana"', price: 'Cae en el primer tercio de precio del mercado local', url: 'https://listado.mercadolibre.com.uy/bufanda-lana' }],
    recommendation: 'No tocar — HOLD a propósito, compra de impulso y regalo.',
  },
  'bufanda-sophie': {
    comparables: [
      { label: 'Mercado Libre UY (fábrica, "Atrix")', price: '$284,76 en oferta — solo marca un piso, no es artesanal' },
      { label: 'Etsy, bufandas handmade', price: 'US$18,75–90 (por debajo incluso del piso, pero Etsy es otro costo de vida)' },
    ],
    recommendation: 'Dentro del rango sano de la categoría. Sin evidencia local de que esté subvaluada.',
  },
  'calentadores': {
    comparables: [],
    recommendation: '⚠️ Subió 69% (de $590 a $1.000) sin quedar documentado, y no encontré NINGÚN comparable de mercado (ni local ni regional) que lo respalde — el resultado queda muy por fuera de lo normal para esta categoría. Confirmá si fue una decisión consciente o un error de carga antes de sacar cualquier conclusión.',
  },
  'mini-tote-bag': {
    comparables: [{ label: 'Ceará Feito à Mão (BR, artesanal)', price: 'R$89,90 ≈ $698 / US$17,3 — casi idéntico', url: 'https://www.cearafeitoamao.com.br/bolsas-de-croche/bolsas-de-croche' }],
    recommendation: 'Mantener. Cerca del techo de la categoría; el comparable regional es casi calcado.',
  },
  'tote-bag-de-playa': {
    comparables: [{ label: 'Mercado Libre Argentina, bolsos de algodón artesanales', price: '$35.000–45.000 ARS ≈ $919–1.182 / US$22,8–29,3', url: 'https://articulo.mercadolibre.com.ar/MLA-1590879332-bolso-artesanal-tejido-crochet-hilo-de-algodon-_JM' }],
    recommendation: 'Único caso de accesorios donde el mercado regional y tu $/h apuntan en la misma dirección: hay margen moderado. Coincide con el ajuste a $790 que ya tenés planeado para nov-2026 — no urge adelantarlo.',
  },
  'bolso-de-estudiante': {
    comparables: [{ label: 'Mercado Libre Argentina, bolsos de algodón artesanales', price: '$919–1.182 UYU equiv. — el precio en vivo cae justo adentro' }],
    recommendation: 'Subió de $720 a $990 (+37,5%) sin documentar, pero el resultado alinea con el único comparable regional sólido que encontré — no parece un error. Confirmá igual, sin alarma.',
  },
  'donut-bag': {
    comparables: [{ label: 'Mercado Libre Argentina, bolsos de algodón artesanales', price: '$919–1.182 UYU equiv. — dentro del rango en pesos' }],
    recommendation: 'Subió de $720 a $990 (+37,5%) sin documentar. Ya es el techo de $/h de la categoría — no urge subirlo más, sí confirmar que fue intencional.',
  },
  'bolso-a-cuadros': {
    comparables: [{ label: 'Mercado Libre Argentina, bolsos de algodón artesanales', price: 'Medio del rango, $919–1.182 UYU equiv.' }],
    recommendation: 'Mantener. Bien ubicado tanto en $/h como frente al comparable regional.',
  },
  'bolso-lola': {
    comparables: [{ label: 'Mercado Libre Argentina (referencia de bolsos más chicos)', price: 'Por encima de $919–1.182 UYU — razonable, es la pieza de más horas de la categoría' }],
    recommendation: 'Mantener. Ya captura el techo de contribución por hora de toda la categoría accesorios.',
  },
  'box-de-regalo': {
    comparables: [
      { label: 'Packaging genérico al por menor (UY)', price: '$11–65 — caro si es solo el envoltorio', url: 'https://packaging.uy/categoria-producto/regalos/' },
      { label: 'Universo Regalos (UY), boxes curados con contenido', price: '$2.590–4.390 — pero estos SÍ incluyen el regalo adentro', url: 'https://universoregalos.com.uy/' },
    ],
    recommendation: 'No es una prenda, es un servicio de curaduría + presentación. Antes de fijarle precio en serio: ¿el cargo de $650 incluye una pieza o es solo el packaging? La comparación cambia mucho según la respuesta.',
  },
  'chaleco': {
    comparables: [],
    recommendation: 'Este producto no existe hoy en tu catálogo (tampoco hace 12 días) pero sigue en esta tabla. Google le sigue mostrando esa página a gente que busca "chaleco" (65 impresiones reales) — decidí si lo relanzás o si preferís que retiremos la fila y redirijamos esa URL a Cardigans.',
  },
}

export interface OrphanProduct {
  slug: string
  name: string
  category: string
}

/** Productos EN VIVO sin ninguna fila en PRICE_TABLE — sin horas/materiales
 * cargados, así que hoy no se les puede calcular $/h. */
export const ORPHAN_PRODUCTS: OrphanProduct[] = [
  { slug: 'cardigan-amour', name: 'Cardigan amour', category: 'Cardigans' },
  { slug: 'spring-cardigan', name: 'Spring cardigan', category: 'Cardigans' },
  { slug: 'granny-s-cardigan', name: 'Granny’s cardigan', category: 'Cardigans' },
  { slug: 'sweater-senda', name: 'Sweater Senda', category: 'Tops' },
]

MARKET_COMPARABLES['cardigan-amour'] = {
  comparables: [
    { label: 'Etsy, cardigans oversized/statement', price: 'US$125–249 — hoy estás a menos de la mitad del piso', url: 'https://www.etsy.com/listing/4392770470/handmade-purple-crochet-cardigan-xxl' },
  ],
  recommendation: '★ El hallazgo más importante de toda la auditoría: es el producto #1 en carritos reales de toda tu tienda (10 unidades) y el mercado internacional paga entre el doble y el cuádruple por algo comparable. Pero como no tenés horas ni materiales cargados para esta pieza, no hay forma de saber si subir el precio te pagaría bien la hora. Cronometrá esta pieza (medí cuánto tarda de verdad) antes de tocar el precio de nuevo.',
}
MARKET_COMPARABLES['spring-cardigan'] = {
  comparables: [{ label: 'Etsy, cardigans oversized/statement', price: 'US$125–249 (hoy estás a US$69,6, más cerca del piso que Amour)' }],
  recommendation: 'Sin fila de precio y sin señal de demanda fuerte reportada (a diferencia de Amour y Granny’s). Antes de tocarlo: mirá cuántas veces se agregó al carrito y cuánto tráfico recibe, y cronometrá las horas si hay tracción real.',
}
MARKET_COMPARABLES['granny-s-cardigan'] = {
  comparables: [{ label: 'Etsy, cardigans oversized/statement', price: 'US$125–249 (hoy estás a US$82,0, por debajo incluso del piso)' }],
  recommendation: 'Es el producto más nuevo y más caro de todo tu catálogo, y ya tiene 23 visitas directas a su ficha en 11 días — probablemente lo compartiste o lo compartieron en redes. Cronometralo pronto, antes de que se te forme una lista de espera como pasó con Amour.',
}

export const PRICING_PHASES = [
  {
    when: 'Hecho (jul 2026)',
    title: 'Primer paso aplicado',
    body: 'Todo el catálogo subió al precio aprobado, salvo bandana, mini bufandas y box.',
    done: true,
  },
  {
    when: 'Nov 2026',
    title: 'Segundo paso, con el drop de verano',
    body: 'Tops y bolsos suben hacia la meta de 12 meses. La colección nueva es la razón del precio nuevo. Para las piezas que YA juntan lista de espera de un mes o más, este paso se adelanta: la cola es evidencia suficiente, no hace falta esperar la fecha.',
    done: false,
  },
  {
    when: 'Feb–Mar 2027',
    title: 'Cardigans, ponchos y sets a la meta',
    body: 'Las piezas de más horas llegan a su precio justo. Recién acá se mueven los best-sellers.',
    done: false,
  },
  {
    when: 'May–Jun 2027',
    title: 'Cierre',
    body: 'Todo el catálogo en la meta de 12 meses. Bandana a $550, mini bufandas a $390.',
    done: false,
  },
]

/** Mejoras que acompañan cada aumento (suben el valor percibido casi sin costo). */
export interface ActionItem {
  id: string
  label: string
  detail: string
}

export const VALUE_ACTIONS: ActionItem[] = [
  { id: 'vp-regalo', label: 'Envolver cada pieza como un regalo', detail: 'Papel de seda + bolsa kraft + sticker con el logo. Costo mínimo, efecto enorme.' },
  { id: 'vp-tarjeta', label: 'Tarjeta escrita a mano, con el nombre de la clienta', detail: 'Firmada por vos. Es lo que ninguna marca de máquina puede copiar.' },
  { id: 'vp-cuidado', label: 'Tarjeta de cuidado', detail: 'Cómo lavar y guardar la prenda. Dice "esto es de calidad" sin decirlo.' },
  { id: 'vp-ajuste', label: 'Prometer "si no te queda, lo ajustamos"', detail: 'Al tejer a medida te cuesta poco — y mata el miedo #1 de comprar ropa online.' },
  { id: 'vp-edicion', label: 'Numerar a mano las piezas grandes', detail: '"Pieza única N.º 3". La escasez es real: mostrala.' },
  { id: 'vp-etiqueta', label: 'Etiqueta "Dahila" cosida', detail: 'La marca viaja con la prenda para siempre.' },
  { id: 'vp-qr', label: 'QR a un video del tejido en el packaging', detail: '30 segundos de esa pieza naciendo. La historia sube lo que la gente paga con gusto.' },
  { id: 'vp-sorpresa', label: 'Regalito sorpresa en pedidos grandes', detail: 'Un mini accesorio → fotos espontáneas en redes → boca a boca gratis.' },
  { id: 'vp-bundle', label: 'Combos "completá el look" + envío gratis desde $1.600', detail: 'Sube el ticket sin bajar el precio de nada. El umbral está calculado para que una prenda + un accesorio lo crucen (y el accesorio paga el envío solo). Se prende en Configuración → "Envío gratis desde"; subirlo a $2.000 recién cuando los precios lleguen a la columna 12m.' },
]

// ─── Tejedoras ───────────────────────────────────────────────

export interface WeaverModel {
  name: string
  where: string
  how: string
  takeaway: string
}

/** Modelos reales estudiados — no copiamos uno: armamos el de Dahila con lo mejor de cada uno. */
export const WEAVER_MODELS: WeaverModel[] = [
  {
    name: 'Manos del Uruguay',
    where: 'Uruguay, desde 1968',
    how: 'Cooperativas de artesanas que cobran por hora y por prenda terminada. Cada modelo tiene un patrón de referencia aprobado y una clasificación por horas (15/20/30 h).',
    takeaway: 'Tomamos: la ficha por modelo con horas estándar y el control de calidad central antes de vender.',
  },
  {
    name: 'Alabama Chanin',
    where: 'Estados Unidos',
    how: 'Las artesanas son micro-emprendimientos independientes: toman un proyecto con precio pactado de antemano, reciben el kit de materiales, cosen en su casa y entregan. Si la pieza llega tarde o no pasa la calidad, se paga menos, según reglas acordadas antes.',
    takeaway: 'Tomamos: precio cerrado ANTES de tejer (nada de sorpresas) y reglas claras y escritas para cuando algo sale mal.',
  },
  {
    name: 'Krochet Kids',
    where: 'Uganda y Perú',
    how: 'Forman a sus tejedoras con un programa de 3 años con mentoría y pagan por encima del salario justo local.',
    takeaway: 'Tomamos: formar gente es parte del negocio — tus clases son la escuela de tus futuras tejedoras.',
  },
  {
    name: 'Estándares Nest',
    where: 'Global (trabajo artesanal en casa)',
    how: 'La organización que escribió las reglas del trabajo artesanal domiciliario: la consistencia no sale del talento individual sino de estándares documentados, muestras de "aceptable / no aceptable" y revisión antes de enviar.',
    takeaway: 'Tomamos: documentar todo. La calidad la pone tu estándar escrito y tu revisión final, no la suerte.',
  },
  {
    name: 'The Citizenry',
    where: 'EE. UU. + talleres en 20 países',
    how: 'Marca de deco premium que produce todo con talleres artesanos: paga el doble del salario justo certificado, co-diseña cada colección con el taller y lo audita la World Fair Trade Organization. Vende caro justamente PORQUE puede contar todo eso.',
    takeaway: 'Tomamos: pagar bien no es un costo, es el argumento de venta. "Quién la tejió y en cuántas horas" es parte del valor de la pieza — contalo.',
  },
  {
    name: 'SOKO',
    where: 'Kenia',
    how: 'Miles de artesanas independientes coordinadas por celular (su "fábrica virtual"): cada una produce en su casa, los pedidos se asignan según reputación y cumplimiento, y cobran 25–35% del precio final de venta (la industria tradicional paga 2–3%).',
    takeaway: 'Tomamos: el historial manda — a la tejedora constante se le asigna más y mejor trabajo. Y no hace falta software: tu WhatsApp es tu fábrica virtual.',
  },
]

export const WEAVER_PIPELINE = [
  { step: 'Postulación', detail: 'Llega desde /tejedoras. Mirá primero las fotos: tensión pareja y terminaciones prolijas.' },
  { step: 'Charla', detail: 'Por WhatsApp. Conocela y contale cómo trabajás.' },
  { step: 'Muestra pagada', detail: 'Una pieza de prueba contra ficha técnica. Se paga siempre, quede o no — es tu mejor filtro y tu carta de seriedad.' },
  { step: 'Primeros encargos', detail: 'Piezas simples y repetibles: bolsos, accesorios. Precio por pieza pactado antes de empezar.' },
  { step: 'Crecimiento', detail: 'Con constancia: más volumen, piezas más complejas y mejor tarifa.' },
]

export const WEAVER_SYSTEM = [
  {
    title: 'Cuánto y cómo pagar',
    body: 'Precio por pieza = horas estándar de la ficha × tarifa según nivel: aprendiz $150/h, asociada $180/h, senior $210–250/h (el mínimo legal es $127/h — nunca menos, ni en la muestra). Se pacta ANTES de tejer y se paga al aprobar la pieza. La lana la ponés vos: controlás calidad y color.',
  },
  {
    title: 'Los números, honestos (y la cuenta que decide)',
    body: 'La cuenta antes de delegar cualquier modelo: horas medidas × tarifa + lana ≤ 70% del precio de venta — el 30% restante paga tu control de calidad, el diseño y la marca. Ojo: con las horas de la tabla, hoy casi ninguna pieza pasa esa cuenta, ni siquiera a precios de 12 meses. Pero las horas de la tabla son TUS horas, que incluyen diseñar y resolver: una tejedora repitiendo el mismo modelo con ficha tarda bastante menos (un bolso "de 7 h" puede ser 4 en producción pura). Por eso la muestra pagada SE CRONOMETRA: además de filtro de calidad es tu dato real de costos. Delegá solo modelos donde la cuenta cierre con horas medidas; si no cierra, o el precio de esa pieza está corto o ese modelo todavía no es delegable.',
  },
  {
    title: 'Control de calidad, sin excepciones',
    body: 'Cada pieza pasa por tus manos antes de llegar a una clienta: medidas, tensión, terminaciones, costuras. Una sola pieza floja daña la marca más que diez perfectas la construyen.',
  },
  {
    title: 'La ficha técnica es la clave',
    body: 'Por cada modelo: lana, aguja, medidas por talle, y fotos de "así sí / así no". Dos tejedoras con la misma ficha tejen igual. Sin ficha, cada una teje a su manera.',
  },
  {
    title: 'La etiqueta dice Dahila',
    body: 'Todas las piezas — las tejas vos o la red — llevan la etiqueta Dahila y salen con el mismo estándar. La clienta compra la marca; la consistencia y el control de calidad son lo que la protege.',
  },
  {
    title: 'Errores y ritmos',
    body: 'Primer error: se corrige juntas con la ficha. Si se repite: piezas más simples por un tiempo. La primera pieza de un modelo nuevo paga 1–2 horas extra — aprender la ficha también es trabajo. ¿Prolija pero lenta? Dale modelos cortos, no la apures. ¿Rápida y prolija? Dale más y mejor: al pagar por pieza, su velocidad es su premio.',
  },
  {
    title: 'Empezá con UNA',
    body: 'Una sola tejedora, arrancando por bolsos y accesorios (los modelos donde la cuenta cierra antes). Vos seguís con las piezas grandes. Sumás la segunda recién cuando la primera es constante Y tenés cola de pedidos que no llegás a tejer — la demanda contrata, no el entusiasmo.',
  },
  {
    title: 'Postulante menor de 18: se puede, con INAU',
    body: 'En Uruguay se puede trabajar desde los 15 años, pero SIEMPRE con el carné laboral adolescente de INAU (gratis, en las direcciones departamentales) más autorización firmada de madre/padre, carné de salud vigente y constancia de estudios. Tope legal: 6 horas por día y 36 semanales, sin interferir con el liceo. Para la postulante de 15: la charla inicial es con ella Y una persona adulta responsable; después la muestra pagada de una pieza chica (bandana o mini tote, cronometrada como siempre); si aprueba, el carné de INAU se tramita ANTES de encargarle trabajo regular. Y paga lo mismo por pieza que cualquier tejedora — la edad no descuenta tarifa. Tener los papeles en regla no es burocracia: protege a la marca y la protege a ella. Que su primera experiencia laboral sea contigo puede ser lo mejor que le pase — hacelo bien.',
  },
  {
    title: 'El control final, en 4 puntos',
    body: 'Antes de enviar, cada pieza pasa por: (1) medidas contra la ficha (±1,5 cm), (2) tensión comparada con tu muestra maestra, (3) terminaciones y costuras miradas del revés, (4) etiqueta Dahila cosida + tarjeta de cuidado. Cuatro minutos por pieza que protegen todo lo demás.',
  },
  {
    title: 'Cuando sean tres o más: la referente',
    body: 'El modelo de los grandes (Manos, SOKO): tu tejedora más constante pasa a ser la "referente" — recibe las piezas de las demás, hace el primer control contra la ficha y a vos solo llega lo dudoso. Se le paga ese rol (por pieza revisada o tarifa senior). Es el único camino para que el control de calidad no seas siempre vos.',
  },
]

// ─── Cómo crecer: comparación de caminos (03/09/2026) ─────────
// Pedido puntual: comparar varias formas de crecer (no solo "subir precio o
// no") con la cuenta real de cada una, y decir cuál conviene y por qué.

export const GROWTH_INTRO =
  'Dijiste algo importante: cobrás precio medio/bajo, pero no tenés tejedoras como para vender más — y no te da el tiempo ni te queda tanta plata como para pagar publicidad a lo loco. Antes de elegir un camino, un dato que ya tenías escrito desde julio y todavía no se probó: nunca se hizo el video pidiendo tejedoras, y nunca se dio la primera clase piloto. Las dos cuestan tu tiempo, no plata — y las dos siguen sin marcarse en tu lista de "para hacer". Eso cambia la cuenta de todo lo de abajo.'

export type GrowthVerdict = 'recomendado' | 'con-condicion' | 'no-recomendado'

export interface GrowthStrategy {
  id: string
  name: string
  what: string
  pros: string[]
  cons: string[]
  verdict: GrowthVerdict
  verdictNote: string
}

export const GROWTH_STRATEGIES: GrowthStrategy[] = [
  {
    id: 'solo-precio',
    name: 'Subir precio, seguir tejiendo sola',
    what: 'No sumás a nadie. Seguís vos tejiendo todo, y subís precio en las piezas que lo necesitan.',
    pros: [
      'Ya está pasando: 8 productos subieron de precio en agosto/septiembre sin que nadie lo planeara, y en 6 de los 8 casos el resultado quedó bien.',
      'No gastás nada — es una decisión de precio, no de gente.',
    ],
    cons: [
      'No resuelve "no me da el tiempo": por más que subas precio, seguís topeada en tus horas disponibles.',
      'Ya hay demanda que hoy no llegás a atender (lista de espera, Cardigan amour a tope de carritos) — subir precio sin sumar manos deja esa venta arriba de la mesa.',
    ],
    verdict: 'con-condicion',
    verdictNote: 'Seguí subiendo donde la cuenta de $/hora lo pide (ver pestaña Precios) — pero sola tenés un techo de facturación que no se mueve por más que subas precio.',
  },
  {
    id: 'publicidad-tejedoras',
    name: 'Pagar publicidad para conseguir tejedoras ya',
    what: 'Subís precio Y pagás anuncios pidiendo tejedoras, para que Anush se quede con lo lindo/caro y otras tejan lo simple.',
    pros: [
      'En teoría es más rápido que esperar a que alguien se postule sola.',
    ],
    cons: [
      'Nunca probaste el camino gratis: el video/story pidiendo tejedoras + el link a /tejedoras en la bio siguen sin hacerse desde julio. Gastar plata en algo que nunca probaste gratis es un salto al vacío.',
      'Sin cronometrar una pieza real con una tejedora (no con vos), no sabés a qué tarifa por pieza le podés ofrecer trabajo — podrías atraer gente y no tener con qué pagarle bien.',
    ],
    verdict: 'no-recomendado',
    verdictNote: 'Todavía no — probá el video gratis y cronometrá una pieza antes de gastar un peso acá.',
  },
  {
    id: 'volumen-mismo-precio',
    name: 'Cobrar lo mismo, conseguir tejedoras, vender más cantidad',
    what: 'No tocás precio, sumás tejedoras, apuntás a vender más unidades de lo mismo.',
    pros: [],
    cons: [
      'Con los precios de julio, pagarle a una tejedora ya daba pérdida en casi todo el catálogo (un top de 13 horas: $150/h de tejedora + lana costaba más de lo que la prenda cobraba).',
      'Justo mejoraste tu pago por hora en varias piezas sin querer (ver pestaña Precios) — bajar precio ahora para vender más cantidad sería deshacer lo que ya te funcionó.',
    ],
    verdict: 'no-recomendado',
    verdictNote: 'Es la opción que peor cierra con tus propios números: vender más de algo que paga mal la hora agranda el problema, no lo resuelve.',
  },
  {
    id: 'clases-primero',
    name: 'Clases primero, tejedoras como consecuencia',
    what: 'Das el ciclo piloto de clases que ya tenés planeado (pestaña Clases). Cobrás por enseñar — tu mejor uso de una hora — y tus mejores alumnas del Nivel 3 (las que terminan una pieza a tu estándar) son candidatas ya probadas para tejer con vos.',
    pros: [
      'Una hora enseñando vale $291–500. Tejiendo, esa misma hora te deja $34–58. Es tu mejor negocio por hora, sin comparación.',
      'Resuelve las dos quejas juntas: entra plata mejor pagada YA, y arma un canal de tejedoras que ya demostraron que saben seguir tu ficha — mucho mejor filtro que alguien que solo respondió un aviso.',
      'No cuesta plata para arrancar: la clase piloto es con 3-4 conocidas, a precio amigo.',
    ],
    cons: [
      'No es instantáneo: tarda meses en convertirse en tejedoras produciendo de verdad.',
    ],
    verdict: 'recomendado',
    verdictNote: 'Es el camino con menos riesgo y doble beneficio. Además ya está escrito paso a paso en la pestaña Clases — solo falta empezarlo.',
  },
  {
    id: 'separar-catalogo',
    name: 'Separar el catálogo: piezas tuyas vs. piezas delegables',
    what: 'En vez de pensar "todo o nada", dividís: las piezas caras y con cola (Cardigan amour, Granny’s, etc.) quedan siempre tuyas y subís su precio sin miedo — afuera se pagan 2 a 4 veces más. Los bolsos y accesorios (ya tu mejor pago por hora) son los primeros candidatos reales a delegar, porque ahí la cuenta ya casi cierra.',
    pros: [
      'No tenés que apostar todo el catálogo a una sola decisión — cada parte sigue el camino que ya le conviene según sus propios números.',
      'Te da un orden claro de por dónde empezar a delegar (accesorios primero, nunca las piezas firma).',
    ],
    cons: [],
    verdict: 'recomendado',
    verdictNote: 'No es una alternativa a las otras — es el marco para aplicar cualquiera de las de arriba sin mezclar todo el catálogo en una sola regla.',
  },
]

export const GROWTH_RECOMMENDATION = {
  title: 'En una frase',
  body:
    'No es elegir una sola opción de la lista — es un orden: primero lo gratis que nunca se probó (el video pidiendo tejedoras + la primera clase piloto), después medir con datos reales (cronometrar una pieza con una tejedora de verdad, no con vos), y recién con esos dos datos en la mano decidís si hace falta gastar en publicidad de reclutamiento. Pagar publicidad sin haber probado el camino gratis es la única forma segura de gastar de más.',
  steps: [
    { step: 'Esta semana', detail: 'Grabá el video/story de "buscamos tejedoras" y poné el link a /tejedoras en la bio de Instagram. Costo: cero. Te dice si el reclutamiento gratis alcanza antes de gastar nada.' },
    { step: 'Este mes', detail: 'Dá la clase piloto (3-4 conocidas, 4 encuentros, precio amigo). Es tu mejor $/hora y el filtro natural de futuras tejedoras.' },
    { step: 'En paralelo', detail: 'Cronometrá una pieza real con la primera tejedora candidata (Cardigan amour o un bolso simple), contra una ficha técnica. Ese número solo, decide si delegar ya cierra o si hace falta subir precio primero.' },
    { step: 'Recién ahí', detail: 'Si el video + la clase no te dan suficientes tejedoras candidatas, evaluá pagar publicidad de reclutamiento — con el dato del cronometraje ya en mano para saber qué tarifa por pieza podés ofrecer.' },
  ],
}

// ─── Clases ──────────────────────────────────────────────────

export const CLASSES_INTRO =
  'Una hora tuya tejiendo deja $34–58. Una hora enseñando vale $291–500 — y encima te fabrica futuras tejedoras, comunidad y contenido. Es el mejor negocio de tu tiempo.'

export const CLASSES_START = [
  { step: 'Piloto', detail: 'Un ciclo de 4 encuentros con 3–4 conocidas o clientas fieles, a precio amigo o gratis. Objetivo: aprender a enseñar y juntar fotos y testimonios.' },
  { step: 'Ajustar', detail: 'Después del piloto: ¿qué proyecto funcionó? ¿alcanzaron 2 horas? ¿qué preguntaron más? Ajustá el formato antes de cobrar precio pleno.' },
  { step: 'Publicar', detail: 'Anunciá el primer ciclo pago en Instagram y a la lista VIP. Cupos chicos (4–6) — que se agote es parte del atractivo.' },
  { step: 'Ritmo', detail: 'Un ciclo por mes es suficiente. No es tu negocio principal: es el multiplicador del resto.' },
]

export const CLASSES_PRICING = {
  title: 'Cuánto cobrar (referencias reales, a validar)',
  refs: [
    'Casa Dominga (Montevideo): $1.500 por mes, 8 encuentros grupales, materiales incluidos.',
    'Clases particulares en Superprof Uruguay: $291–500 la hora. OJO: es un sitio de avisos, mayormente gente sin marca — es el PISO del mercado, no la referencia.',
    'LaVidaLalala (Montevideo, relevado ago 2026): $4.300 por mes por 4 clases de 1 h 30 en grupos de hasta 3 → unos $717 la hora. Y la clase suelta de prueba: $1.800 (~$1.200 la hora).',
  ],
  suggestion:
    'Sugerencia: ciclo mensual de 4 encuentros de 2 h en grupo de 4–6, entre $1.600 y $2.200 por persona con materiales incluidos. Un grupo de 5 deja $8.000–11.000 por mes por 8 horas de trabajo — mejor que cualquier prenda. Validalo con tus costos de lana antes de publicar.',
  anchor:
    'Dónde pararte: el mercado tiene dos pisos muy separados. El de los avisos ($300–500/h) es gente sin marca; el boutique ($700–1.200/h) es taller con nombre propio. Vos tenés 5.100 seguidoras, marca y obra que mostrar — estás en el segundo, no en el primero. La sugerencia de arriba ($200–275/h en grupo de 5) es prudente para arrancar y aprender a enseñar, pero es la mitad del tramo boutique: subila en cuanto el primer ciclo se llene.',
}

export const CLASSES_LEVELS = [
  { level: 'Nivel 1 — Tu primer accesorio', detail: 'De cero. En 4 encuentros cada alumna se va con una bandana o mini bufanda hecha por ella. Proyecto concreto, no "puntos sueltos": la gente vuelve cuando termina algo.' },
  { level: 'Nivel 2 — Tu primer top', detail: 'Para las que ya tejen. Un top simple con medidas de verdad: acá se aprende tensión pareja y talles — justo lo que necesita una futura tejedora.' },
  { level: 'Nivel 3 — Nivel Dahila', detail: 'Tejer una pieza del catálogo real con su ficha técnica. Es un curso Y una prueba: quien lo termina bien ya sabe trabajar a tu estándar.' },
]

/** Cómo se vende cada ciclo (repetible, sin inventar nada). */
export const CLASSES_SELLING = [
  'Anunciá el ciclo 2 semanas antes: fecha, cupos (4–6), qué se lleva puesta la alumna al terminar y precio claro. Primero a la lista VIP y al grupo de alumnas; al otro día, Instagram.',
  'Mostrá resultados, no promesas: fotos de lo que tejieron las alumnas del ciclo anterior valen más que cualquier texto.',
  '"Quedan 2 lugares" solo cuando es verdad — con cupos de 4–6 casi siempre lo es. La escasez honesta también vende clases.',
  'Cerrá la inscripción con seña por Mercado Pago o transferencia: quien señó, va. Sin seña, la mitad no aparece.',
  'Última semana: un video corto tuyo tejiendo el proyecto del ciclo. Es el anuncio y el contenido de la semana a la vez.',
]

/** Guion de un encuentro de 2 horas (para que enseñar no sea improvisar). */
export const CLASSES_SESSION = [
  { time: '0:00–0:15', what: 'Ronda de avances: cada una muestra lo que trajo. Se corrigen errores comunes para todas a la vez.' },
  { time: '0:15–1:30', what: 'El paso nuevo del proyecto: lo mostrás lento, tejen con vos, pasás banco por banco. Una sola técnica nueva por encuentro.' },
  { time: '1:30–1:50', what: 'Práctica libre con mate: vos corregís una por una. Acá se arma la comunidad — no lo apures.' },
  { time: '1:50–2:00', what: 'La "tarea" hasta el próximo encuentro + foto grupal del avance (contenido listo para Instagram).' },
]

/** Cómo escala sin quemar a la dueña. */
export const CLASSES_SCALE = [
  {
    title: 'Más grupos, mismo guion',
    body: 'El ciclo documentado (proyecto + guion por encuentro) se repite sin re-inventarlo. Dos grupos por mes duplican el ingreso con el mismo material.',
  },
  {
    title: 'Las avanzadas ayudan',
    body: 'Una alumna de Nivel 3 puede asistirte en los grupos de Nivel 1 (a cambio de su ciclo gratis o una tarifa). Es su primer paso como parte de Dahila — y tu primera delegación.',
  },
  {
    title: 'El tope lo pone tu agenda',
    body: 'Clases = tu mejor $/hora, pero siguen consumiendo tus horas. El máximo sano: 2 ciclos en paralelo. Si hay más demanda, subí el precio antes que sumar horas.',
  },
]

export const CLASSES_COMMUNITY = [
  'Grupo de WhatsApp de alumnas: dudas entre encuentros, fotos de avances, y tu canal directo para anunciar los próximos ciclos y drops.',
  'Descuento de alumna en lana y productos: la clase te convierte en SU marca de crochet.',
  'Las clases son contenido: fotos y videos de cada encuentro alimentan Instagram toda la semana.',
  'Cada alumna que termina algo lo muestra — y etiqueta. Es publicidad que encima te pagó.',
]

export const CLASSES_FLYWHEEL =
  'El círculo completo: las clases pagan tu hora mejor que tejer → las mejores alumnas del Nivel 3 pasan a la muestra pagada → las que aprueban tejen para la marca → vos tejés menos y diseñás más → hay más piezas para los drops → los drops traen más clientas y más alumnas. Cada vuelta empuja la siguiente.'

/** De dónde salen las alumnas — el embudo, con lo que ya existe. */
export const CLASSES_FUNNEL = [
  {
    step: 'De clienta a alumna',
    detail: 'El mensaje del día 7 ("¿cómo te quedó?") es también la invitación natural: "¿sabías que enseño a tejer? El próximo ciclo arranca tal fecha". Quien ya ama su prenda quiere saber hacerla.',
  },
  {
    step: 'De Instagram a la lista de espera',
    detail: 'Cada video de proceso termina igual: "¿querés aprender? Anotate en la lista de espera de clases". La lista junta interesadas todo el año — cuando abrís ciclo, ya tenés a quién avisarle primero.',
  },
  {
    step: 'De alumna a alumna que trae',
    detail: '"Anotate con una amiga: $200 de descuento cada una." En grupos de 4–6, una amiga llena la mitad del cupo — y de paso aprenden juntas, que es la mitad del encanto.',
  },
  {
    step: 'De alumna a tejedora',
    detail: 'El Nivel 3 ES tu selección: quien termina una pieza del catálogo con su ficha ya demostró tensión, medidas y prolijidad. A las mejores les ofrecés la muestra pagada — el pipeline de tejedoras se alimenta solo.',
  },
]

// ─── Drops ───────────────────────────────────────────────────

export interface DropEvent {
  name: string
  month: number
  monthLabel: string
  hook: string
}

export const DROP_CALENDAR: DropEvent[] = [
  { name: 'Día de la Madre', month: 5, monthLabel: 'mayo', hook: 'Regalos: bolsos, bufandas, box' },
  { name: 'Invierno', month: 6, monthLabel: 'junio', hook: 'Cardigans, ponchos, calentadores' },
  { name: "Verano '26", month: 11, monthLabel: 'noviembre', hook: 'Bikinis, salidas de playa, tops — el grande del año' },
  { name: 'CyberLunes y Black Friday', month: 11, monthLabel: 'noviembre', hook: 'CyberLunes a principios de mes (en 2025 fue del 3 al 5) y Black Friday el viernes 27. No rebajes el catálogo: el segundo paso de precios es este mismo mes. Si participás, que sea con lo ya tejido (en stock), tope 15% y un porqué: "hacemos lugar para el verano".' },
  { name: 'Navidad', month: 12, monthLabel: 'diciembre', hook: 'Regalos + box' },
]

export interface DropStage {
  stage: string
  when: string
  items: string[]
}

export const DROP_STAGES: DropStage[] = [
  {
    stage: 'Antes',
    when: '3 semanas de expectativa',
    items: [
      'Semanas 1 y 2: mostrá que algo se viene sin mostrarlo — fotos borrosas, el detalle de un punto, vos tejiendo. Invitá a la lista VIP: "lo ves y comprás 24 horas antes".',
      'Semana 3: un adelanto por día en Stories con cuenta regresiva. Un video del proceso. La lista VIP ve piezas que el resto no.',
      'Dejá pronto: fotos de todas las piezas, la colección cargada en el panel (oculta), el mensaje de difusión escrito y el cupón del drop creado.',
    ],
  },
  {
    stage: 'Durante',
    when: 'el día del lanzamiento',
    items: [
      'La lista VIP compra primero: mandales el link por email y difusión de WhatsApp 24 horas antes de publicarlo.',
      'Al otro día, público general: "ya está online" en Stories + post + difusión.',
      'A las pocas horas: "esto es lo que queda" — la escasez es real porque es a mano, mostrala sin vergüenza.',
    ],
  },
  {
    stage: 'Después',
    when: 'la semana siguiente',
    items: [
      'Recap: "se agotó tal pieza en X horas". Lo que quedó, se muestra como última oportunidad.',
      'Lo agotado se puede encargar a medida con más plazo — la venta no se pierde, la escasez tampoco.',
      'Quien compró entra a la lista de clientas: el próximo drop lo ve primero. Anotá qué se agotó y qué no — eso decide la próxima colección.',
    ],
  },
]

export const DROP_BENCHMARKS = [
  { value: '90%+', label: 'de la gente LEE una difusión de WhatsApp', sub: 'el email ronda el 20% de apertura' },
  { value: '4–7%', label: 'compra desde una difusión bien hecha', sub: 'hasta 15–20% si la lista es de clientas' },
  { value: '4–6', label: 'difusiones por mes, máximo', sub: 'más que eso quema la lista; separá 3+ días' },
]

/** La maquinaria del sitio para cada drop (existe desde jul 2026 — solo hay que usarla). */
export const DROP_SITE_TOOLS = [
  {
    step: 'Prender el teaser',
    detail: '3 semanas antes: Configuración → "Próximo drop" (nombre, fecha, texto y foto). El home muestra la cuenta regresiva y junta emails para la lista VIP solo.',
  },
  {
    step: 'Colección en "Próximamente"',
    detail: 'Creá la colección con su portada y dejala en estado Próximamente: aparece en /colecciones como adelanto, sin que se pueda entrar todavía.',
  },
  {
    step: '24 h antes: "Solo con link"',
    detail: 'Cambiá el estado a Solo con link y mandá el link a la lista VIP (email) y a la difusión de clientas. Ellas ven y compran primero; el resto todavía no la encuentra.',
  },
  {
    step: 'Día D: Publicada',
    detail: 'Estado Publicada + anuncio en Instagram. El bloque del home pasa solo a "Ya está online" con botón directo a la colección.',
  },
  {
    step: 'Después',
    detail: 'Apagá el teaser (o dejalo mientras quede stock), cerrá el cupón del drop y anotá qué se agotó y qué no — eso decide la próxima colección.',
  },
]

// ─── Canales ─────────────────────────────────────────────────

export interface Channel {
  rank: number
  channel: string
  role: string
  why: string
  action: string
}

export const CHANNELS: Channel[] = [
  {
    rank: 1,
    channel: 'Instagram',
    role: 'Donde te descubren',
    why: 'Es tu única fuente de tráfico hoy y donde vive tu categoría: el crochet se vende por los ojos. Todo lo demás depende de que acá entre gente. En Uruguay llega a 2,5 millones de personas y el 54% son mujeres (DataReportal, octubre 2025): es la red donde más está tu clienta.',
    action: 'Link en bio a /tienda · Highlights que respondan precio, envío y cómo encargar · 1 video de proceso por semana (es el contenido que más vende en tejido).',
  },
  {
    rank: 2,
    channel: 'WhatsApp',
    role: 'Donde se cierra la venta',
    why: 'El 90%+ lee los mensajes y el checkout ya vive acá. Nada convierte mejor — pero necesita que Instagram le traiga gente.',
    action: 'Catálogo con precios en WhatsApp Business · respuestas rápidas para las 5 preguntas de siempre · lista de difusión de clientas para los drops.',
  },
  {
    rank: 3,
    channel: 'Lista VIP (email)',
    role: 'Tu audiencia propia',
    why: 'Instagram te alquila su audiencia; la lista es tuya para siempre. Es lo que hace posible el "acceso anticipado" de los drops.',
    action: 'Crece sola desde el footer. Antes de cada drop: descargar el CSV y mandar el acceso anticipado.',
  },
  {
    rank: 4,
    channel: 'TikTok',
    role: 'Descubrimiento que ya arrancó',
    why: 'Dejó de ser una apuesta: 4 videos en menos de una semana juntaron ~1.800 likes y ~650 seguidores (agosto 2026). Eso es tracción real y temprana — la cuenta está en la ventana en la que el algoritmo prueba tu contenido con desconocidos. Subió de puesto por mérito propio: Pinterest y Google tienen más potencial de fondo, pero todavía no arrancaron. Un dato para no marearse con los likes: en Uruguay TikTok llega a 2,36 millones de adultos, pero el 55% son hombres (DataReportal, octubre 2025). Parte del alcance cae en gente que no es tu clienta: medilo por visitas al sitio (el link con UTM de la lista de tareas), no por likes.',
    action: 'Grabá PARA TikTok, no repostees con la marca de agua de Instagram (los reposts marcados pierden alcance en las dos plataformas). Mismo esfuerzo: grabá una vez sin marca y subí el archivo a las dos. Repetí el formato del video que mejor anduvo antes de inventar uno nuevo.',
  },
  {
    rank: 5,
    channel: 'Pinterest',
    role: 'Tráfico que no caduca',
    why: 'La gente busca "top crochet" con ganas de comprar, y un pin trabaja meses (un reel, horas). Para crochet es oro y casi nadie lo usa en Uruguay.',
    action: 'Un pin por producto apuntando a su ficha — el sitio ya tiene un botón "Guardar" en cada producto que arma el pin solo. Una hora por semana alcanza.',
  },
  {
    rank: 6,
    channel: 'Google',
    role: 'Confianza y búsqueda local',
    why: '"Crochet Montevideo" te tiene que encontrar. Además el perfil de negocio da confianza cuando pedís seña por WhatsApp.',
    action: 'Crear el Perfil de Negocio de Google (gratis, 1 hora). Las descripciones de producto hacen el resto — el sitio ya está preparado.',
  },
  {
    rank: 7,
    channel: 'Facebook',
    role: 'Presencia mínima',
    why: 'El público de regalo (madres, señoras) todavía está ahí, pero el retorno por hora invertida es el más bajo de la lista.',
    action: 'Página espejo de Instagram (se comparte solo). Nada más.',
  },
]

// ─── Instagram: el playbook del momento ──────────────────────
// Contexto (jul 2026): reels de 19–20.000 reproducciones con ~2.900 seguidores,
// ~900 likes, ~60 comentarios y ~1.000 seguidoras nuevas en 2 días — y ya es el
// tercer video arriba de 20.000. Fuentes: señales de ranking confirmadas por
// Instagram (watch time, envíos por DM, likes por alcance — Mosseri 2025/26),
// guías 2026 de Buffer/Hootsuite/Later y benchmarks de comment-to-DM.

export const IG_WHY_WORKING = [
  {
    title: 'El algoritmo te está eligiendo — entendé por qué',
    body: 'Un reel de 19.000 vistas con 2.900 seguidores significa que ~6 de cada 7 personas que lo vieron NO te seguían: Instagram lo mostró a desconocidas y la respuesta fue tan buena que lo siguió empujando. Las 3 señales que más pesan: cuánto tiempo miran (sobre todo los primeros 3 segundos), cuántas lo ENVÍAN por DM a una amiga (vale 3–5 veces más que un like) y likes por alcance. Tus videos de proceso retienen — eso es lo que está funcionando.',
  },
  {
    title: 'Las cuentas chicas tienen ventaja — usala ahora',
    body: 'Instagram le da a las cuentas de menos de 10.000 seguidores un techo de descubrimiento MÁS alto (prueba el contenido con no-seguidores para compensar la falta de historial). Esta ventana es ahora: 3–4 reels por semana mientras dura la racha, siempre contenido original grabado para Instagram (los reposts con marca de agua pierden 40–60% de distribución). Repetí el FORMATO de los videos que explotaron con otra pieza — el formato ganador es un molde, no una casualidad.',
  },
  {
    title: '1.000 seguidoras nuevas de un reel es tasa de elite',
    body: 'Convertir ~5% de las vistas en seguidores (lo típico es 1–2%) confirma que el perfil también está haciendo su trabajo: quien llega, se queda. Cuidá esa primera impresión: bio con link directo a la tienda, highlights que respondan Precios / Envíos / Cómo encargar, y los mejores reels fijados arriba.',
  },
  {
    title: 'El KPI de negocio no son las vistas',
    body: 'La única métrica que paga cuentas: cuántas personas escriben por WhatsApp cada semana y cuántas compran. Anotalo todas las semanas junto a las vistas — si las vistas suben y los chats no, el problema está en el puente (bio, CTA, highlights), no en el contenido.',
  },
]

/** Qué hacer en las primeras 24 h de cada reel que despega (checklist). */
export const IG_VIRAL_CHECKLIST = [
  'Fijá un comentario tuyo con el link directo a la pieza del video ("La tenés acá → dahila.uy/tienda/..."). El caption no permite links; los comentarios sí — y el fijado es lo primero que se lee.',
  'Respondé TODOS los comentarios el primer día. Cada respuesta es una señal de conversación para el algoritmo y duplica los comentarios del reel. Con ~60 se responde a mano; si pasás de 200 por reel, recién ahí mirá ManyChat (automatiza el "te lo mando por DM").',
  'Invitá al DM: "¿La querés en tu talle? Comentá LINK y te lo mando". El link por DM convierte más que el link en bio (un paso en vez de tres) — y los envíos por DM son la señal que más empuja el reel.',
  'Subilo a Stories con sticker de link a la pieza. Historias y reel se retroalimentan las primeras horas.',
  'Guardá en una nota el gancho, la duración y la pieza del video: ese formato se repite con otra prenda en 1–2 semanas.',
  'Aprovechá la ola: al día siguiente publicá el "detrás" del mismo video (la pieza terminada, cómo se encarga, la lana). Quien llegó ayer todavía está caliente.',
]

/** La rutina semanal de medición (15 minutos, gratis). */
export const IG_WEEKLY = [
  'Meta Business Suite (gratis, es la fuente oficial): por cada reel mirá la RETENCIÓN al segundo 3 (si se caen ahí, el gancho falló), % promedio visto, envíos, visitas al perfil que generó y seguidores nuevos. Compará entre tus propios videos, no contra nadie más.',
  'Anotá en una planilla simple: reel, vistas, envíos, seguidores nuevos, chats de WhatsApp de la semana, ventas. Cuatro semanas de eso valen más que cualquier herramienta paga.',
  'Metricool (plan gratis, 1 marca): sirve para programar posts y ver el mejor horario. Suficiente y de sobra para esta etapa.',
  'Not Just Analytics / Buffer / otras: no hacen falta hoy — miden lo mismo que Meta Business Suite con menos detalle o pagando. La plata de herramientas está mejor en lana y packaging.',
]

// ─── Google Merchant Center ────────────────────────────────────
// Investigado jul 2026: Uruguay es uno de los 58 países con Google Shopping
// habilitado. Es gratis, complementa el canal "Google" de arriba y el sitio
// ya cumple todo lo técnico que pide (precio, stock, marca, fotos en el
// Product schema) — falta solo el paso de cuenta. Fuentes: Google Merchant
// Center Help ("Free listings for products", "Benefits of free local
// listings") y Search Central.

export const MERCHANT_WHY =
  'Antes que nada (verificado el 12/09/2026): Uruguay no figura en la documentación oficial de Google sobre los países con listados gratuitos. Al crear la cuenta, fijate si te deja elegir Uruguay como país de venta; si no aparece, este canal hoy no aplica y no hace falta seguir con los pasos. Si aparece: es gratis y usa lo que el sitio ya tiene: aparecer con foto y precio en la pestaña Shopping de Google, en Google Imágenes y en Maps (si está atado al Perfil de Negocio) — más lugares donde te encuentra alguien que ya está por comprar. No reemplaza a Instagram ni es un chorro de ventas garantizado: es un canal extra, gratis, que se prepara una vez y queda funcionando solo. Google también tiene un sello "Pequeña empresa" que ayuda a diferenciarte de las tiendas grandes. Y si algún día se quiere invertir en Google Ads/Shopping, Merchant Center es el paso obligatorio previo — armarlo ahora no se pierde.'

export const MERCHANT_STEPS = [
  { step: 'Verificar el sitio en Search Console', detail: 'Si ya se hizo como parte de la migración a dahila.uy, este paso ya está — confirmar en search.google.com/search-console que la propiedad "Dominio: dahila.uy" existe y está verificada.' },
  { step: 'Crear la cuenta en Merchant Center', detail: 'Gratis, en business.google.com/merchant. Usar la misma cuenta de Google que Search Console.' },
  { step: 'Vincular Merchant Center con Search Console', detail: 'Se hace desde Configuración → Herramientas empresariales, en un par de clics una vez que ambas cuentas existen.' },
  { step: 'Activar "usar datos estructurados del sitio"', detail: 'En vez de subir un archivo de productos a mano, Merchant Center puede leer directo el precio/stock/marca que el sitio ya publica en cada ficha (Product schema) — cero trabajo técnico extra.' },
  { step: 'Activar "Listados gratuitos" para Uruguay', detail: 'Dentro de Merchant Center, en el programa de listados gratuitos, elegir Uruguay como país de venta. Si Uruguay no aparece como opción, frená acá: los demás pasos no sirven sin esto.' },
  { step: 'Activar el atributo "Pequeña empresa"', detail: 'Si aparece disponible para la cuenta — es el sello que ayuda a diferenciarse de las tiendas grandes en los resultados.' },
  { step: 'Revisar el Diagnóstico a los pocos días', detail: 'Merchant Center avisa si algún producto tiene un error (precio que no coincide, falta imagen, etc.) antes de que eso baje la visibilidad del resto.' },
]

// ─── Clientas: recompra, referidos y fidelización ────────────
// Fuentes: benchmarks 2026 de repeat purchase (Finsi/Rivo), programas de
// referidos double-sided (Voucherify/Extole/impact.com) y campañas de
// cumpleaños (Experian/Drip). Diseñado sobre lo que YA existe: WhatsApp
// Business, el módulo Cupones y la lista VIP — nada que instalar.

export const LOYALTY_INTRO =
  'Conseguir una clienta nueva cuesta caro: contenido, alcance, tiempo. Que una que ya te ama vuelva o traiga una amiga cuesta un mensaje. Una tienda online promedio hace el 25–30% de sus ventas con clientas que repiten — y las tuyas, que recibieron una pieza con su nombre escrito a mano, tienen más razones que nadie para volver. Todo este sistema se opera con etiquetas de WhatsApp Business y el módulo de Cupones.'

export const LOYALTY_BENCHMARKS = [
  { value: '25–30%', label: 'de las ventas de una tienda promedio son recompra', sub: 'las mejores pasan el 40%. Hoy no lo medimos — el registro de ventas es el paso 1' },
  { value: '2,3×', label: 'más se comparte un código cuando ganan las DOS', sub: 'beneficio doble (clienta + amiga) vs. beneficio para una sola, medido en miles de tiendas' },
  { value: '+19%', label: 'más recompra tienen las clientas que llegaron referidas', sub: 'benchmark de marcas de ropa: la amiga de una clienta es tu mejor clienta nueva' },
  { value: '342%', label: 'más ingresos genera un mensaje de cumpleaños', sub: 'vs. una promo normal (Experian). Y el 45% compra en su mes si recibe el saludo' },
]

/** La escalera: qué pasa con una clienta después de cada compra. */
export const LOYALTY_LADDER = [
  {
    step: 'Primera compra',
    detail: 'El packaging de regalo y la tarjeta a mano hacen el trabajo. Antes de despedirte: "¿te sumo a la lista de clientas? Los drops los ves 24 h antes" — y pedile solo el MES de cumpleaños.',
  },
  {
    step: 'A los 7 días',
    detail: '"¿Cómo te quedó?" por WhatsApp + pedile una foto con la prenda puesta. Esa foto es tu prueba social de la ficha del producto y su momento de sentirse parte.',
  },
  {
    step: 'A los 30 días',
    detail: 'Mandale su cupón AMIGA-(su nombre): 15% para REGALAR. No es un descuento para ella — es un regalo que ella le hace a una amiga. Por eso se comparte.',
  },
  {
    step: 'Segunda compra',
    detail: 'Ya es clienta frecuente: etiqueta "frecuente" en WhatsApp Business y entra a la difusión que ve los drops antes. El beneficio es acceso, no descuento.',
  },
  {
    step: 'Tercera compra o dos amigas traídas',
    detail: 'VIP de verdad: un mini accesorio sorpresa en su próximo pedido (¡sin avisarle antes!) y primer lugar cuando hay lista de espera. A esta altura no compra prendas: defiende la marca.',
  },
]

/** El programa AMIGA — referidos con el motor de cupones existente. */
export const REFERRAL_RULES = [
  {
    title: 'El código lleva su nombre',
    body: 'AMIGA-SOFI, AMIGA-CARLA… Se crea en Cupones: 15%, tope 3 usos, 1 por clienta. Un código con tu nombre se regala con orgullo; un "REFERIDO10" genérico no lo comparte nadie.',
  },
  {
    title: 'Ganan las dos',
    body: 'La amiga estrena su 15% en la primera compra; cuando el código se usa, la que lo regaló gana un mini accesorio o $200 en su próximo pedido. El beneficio doble duplica lo compartido (2,3× según datos de miles de tiendas).',
  },
  {
    title: 'Los usos se ven en el panel',
    body: 'En Cupones cada código muestra sus canjes: ahí ves quién trajo amigas, sin planillas. Cuando un AMIGA- llega al tope, avisale y dale su premio — ese mensaje ES el momento de fidelización.',
  },
  {
    title: 'Regalo antes que porcentaje',
    body: 'El premio de la que refiere es un accesorio tejido, no plata: te cuesta 3–5 horas de tejido por cada ~3 clientas nuevas y refuerza justo lo que vendés. El descuento se lo lleva la amiga, que todavía no conocía la marca.',
  },
  {
    title: 'Cumpleaños: solo el mes',
    body: 'Pedir el día completo es más dato del que necesitás. Con el mes alcanza: etiqueta "cumple-marzo" en WhatsApp Business y el 1° de cada mes mandás el saludo + CUMPLE-(nombre) (15%, vence a fin de mes). Es el mensaje con mejor retorno que existe.',
  },
  {
    title: 'Nada de esto necesita software nuevo',
    body: 'Etiquetas de WhatsApp Business + Cupones + la lista VIP del footer. Probalo a mano con 10 clientas contentas; se automatiza el día que el volumen lo pida, no antes.',
  },
]

/** Recetario de cupones — cada campaña con su receta exacta en /admin/cupones. */
export interface CouponRecipe {
  name: string
  when: string
  how: string
}

export const COUPON_RECIPES: CouponRecipe[] = [
  {
    name: 'BIENVENIDA10',
    when: 'En el mensaje de bienvenida a la lista VIP',
    how: '10% · 1 uso por clienta · sin vencimiento · todo el catálogo. Es la razón concreta para anotarse a la lista.',
  },
  {
    name: 'AMIGA-(NOMBRE)',
    when: 'Se lo regalás a cada clienta ~30 días después de su compra',
    how: '15% · tope 3 usos en total · 1 por clienta. Cuando se agota, la que lo regaló gana su premio (accesorio o $200).',
  },
  {
    name: 'GRACIAS-(NOMBRE)',
    when: 'Para reactivar a una clienta que hace meses no compra',
    how: '$200 fijos · 1 uso · vence en 60 días. El monto fijo se siente regalo; el porcentaje se siente promoción.',
  },
  {
    name: 'CUMPLE-(NOMBRE)',
    when: 'El 1° del mes, a las etiquetadas con ese mes',
    how: '15% · 1 uso · vence a fin de mes. El vencimiento corto es la urgencia honesta.',
  },
  {
    name: 'VERANO26 (el del drop)',
    when: 'Solo durante las primeras 48 h del lanzamiento',
    how: '10% · vence a las 48 h · alcance: los productos de la colección (se tildan al crear el cupón). Premia a las que llegan temprano sin rebajar el resto del catálogo.',
  },
  {
    name: 'MAMA27 / NAVIDAD26',
    when: 'Las fechas de regalo del calendario de drops',
    how: 'Monto fijo o % chico · con inicio y fin · tope de usos total. Mejor sobre accesorios: son el regalo típico y el margen aguanta.',
  },
]

export const COUPON_PRINCIPLES = [
  {
    title: 'El techo es 15%',
    body: 'Tu margen es tejido a mano: 20–30% de descuento es regalar horas de trabajo. Si con 15% algo no se mueve, el problema no es el precio — es la foto, el texto o la pieza.',
  },
  {
    title: 'Nunca encimado con ofertas',
    body: 'El cupón se aplica sobre el precio final, descuentos de la tienda incluidos — se suman. Regla simple: cuando hay ofertas activas, no repartas cupones de %. Una herramienta por vez.',
  },
  {
    title: 'Todo cupón tiene un porqué decible en voz alta',
    body: '"Porque es tu cumpleaños", "porque trajiste una amiga", "porque llegaste temprano al drop". Un descuento sin razón le enseña a la gente que el precio de lista es mentira.',
  },
  {
    title: '"1 por clienta" es por dispositivo',
    body: 'Sin cuentas de usuario, el tope por clienta se controla por el navegador. Para códigos nominales alcanza de sobra; no es una caja fuerte y no hace falta que lo sea.',
  },
]

// ─── Para hacer (checklist persistente) ──────────────────────

export type ActionHorizon = 'ya' | 'mes' | 'trimestre'

export interface TodoAction extends ActionItem {
  horizon: ActionHorizon
}

export const NEXT_ACTIONS: TodoAction[] = [
  { id: 'descripciones', label: 'Escribir las descripciones de los productos', detail: 'Material, medidas, horas de tejido, cuidado. Las horas ya las tenés: están en la tabla de precios de acá al lado (columna horas) — no hace falta cronometrar de nuevo, alcanza con pasarlas al texto. Por qué importa de verdad: ver "22 horas" en vez de "hecho con amor" está probado que hace pagar más — el porqué está en la pestaña Novedades.', horizon: 'ya' },
  { id: 'disponible-ahora', label: 'Nuevo (22/08): marcar piezas "Disponible ahora"', detail: 'En Productos → editar una pieza que ya está tejida y lista (sin la espera habitual): poné el "Tiempo mínimo (semanas)" en 0. Aparece sola en una sección nueva del home y en un filtro de la tienda — nadie tiene que tocar código para usarla, es completar ese campo. Sirve para vender lo que ya tenés hecho sin que compita con lo que se hace a pedido.', horizon: 'ya' },
  { id: 'packaging', label: 'Armar el packaging tipo regalo', detail: 'Papel de seda, bolsa kraft, tarjeta a mano. El aumento de precios ya está — esta es la mejora visible que lo acompaña.', horizon: 'ya' },
  { id: 'clase-piloto', label: 'Hacer la clase piloto', detail: '3–4 conocidas, 4 encuentros. El plan completo está en la pestaña Clases.', horizon: 'mes' },
  { id: 'difusion-wa', label: 'Armar la lista de difusión de WhatsApp', detail: 'Con clientas que ya compraron. Es el canal #1 para vender los drops — el paso a paso (los 3 puntitos, "Difusión nueva") está en la pestaña Novedades.', horizon: 'mes' },
  { id: 'anunciar-tejedoras', label: 'Contar que buscás tejedoras', detail: 'Story fijada + link en bio a /tejedoras. La página y el aviso al mail ya funcionan solos.', horizon: 'mes' },
  { id: 'gbp', label: 'Crear el Perfil de Negocio de Google', detail: 'Gratis, ~1 hora. Confianza + aparecer en "crochet Montevideo".', horizon: 'mes' },
  { id: 'mercadopago', label: 'Usar links de pago de Mercado Pago con cuotas', detail: 'Se arma en 2 minutos al cerrar cada venta por WhatsApp. Las cuotas hacen fácil el precio nuevo.', horizon: 'mes' },
  { id: 'cupon-vip', label: 'Crear el primer cupón para la lista VIP', detail: 'Un código de bienvenida chico (ej. 10%) da una razón concreta para anotarse. Se crea en Cupones.', horizon: 'mes' },
  { id: 'drop-verano', label: "Preparar el drop Verano '26", detail: 'Fotos, colección, cupón y el paso a paso de la pestaña Drops. Lanzamiento: noviembre.', horizon: 'trimestre' },
  { id: 'primera-postulante', label: 'Responder a la primera postulante (15 años) — con INAU', detail: 'El paso a paso está en Tejedoras → "Postulante menor de 18": charla con ella Y una persona adulta responsable, muestra pagada cronometrada (bandana o mini tote), y carné laboral de INAU tramitado ANTES del trabajo regular. La ternura y los papeles en regla no se pelean: van juntas.', horizon: 'ya' },
  { id: 'lista-espera', label: 'Escribir el aviso de lista de espera', detail: 'En Configuración → "Lista de espera": ej. "Los pedidos nuevos entran a producción en agosto". La clienta lo ve en cada producto y en el carrito ANTES de escribirte — saberlo antes genera confianza, descubrirlo en el chat la rompe. Actualizalo cuando cambie la cola.', horizon: 'ya' },
  { id: 'mayorista', label: 'Cotizar el pedido mayorista de bolsos con cabeza fría', detail: 'Los bolsos a precio de lista ya son de tus mejores $/hora — el descuento mayorista máximo es 10%, con seña del 50% y entrega escalonada (20 bolsos ≈ 140 horas ≈ 5 semanas de una persona). Si piden mitad de precio, la respuesta es "no": cada hora tejiendo bolsos baratos es una hora que no teje pedidos que pagan más. Bonus: 20 piezas idénticas y simples son el encargo perfecto para estrenar la red de tejedoras — con la cuenta de la pestaña Tejedoras hecha antes.', horizon: 'ya' },
  { id: 'numero-nuevo', label: 'Propagar el número nuevo (099 850 073) fuera del sitio', detail: 'La web ya lo usa. Falta donde el sitio no llega: la app de WhatsApp Business (transferir el número), el link de la bio de Instagram, Google Business Profile, y tarjetas o packaging impresos con el número viejo.', horizon: 'ya' },
  { id: 'precios-cola-12m', label: 'Aplicar YA la columna 12m a las piezas con cola', detail: 'La regla ya estaba escrita: pieza con más de un mes de lista de espera sube al precio de 12 meses sin esperar noviembre. Con pedidos hasta agosto, esa condición se cumple HOY para todo lo que tiene cola. Subilo desde Productos y acompañalo con la mejora visible (packaging). Una venta que igual no podías tejer no es una venta perdida.', horizon: 'ya' },
  { id: 'medicion-on', label: '(Mati) GA4: marcar los 2 eventos clave y vincular Search Console', detail: 'Después del deploy, GA4 empieza a recibir begin_checkout (pedido por WhatsApp) y generate_lead (encargo). Cuando aparezcan (hasta 24 h), en GA4 → Administrar → Eventos, prendé "Marcar como evento clave" en los dos: así GA4 cuenta conversiones (hoy muestra 0). De paso, en Administrar → Vinculaciones de productos → Search Console, vinculalo para ver las búsquedas de Google adentro de GA4. Y en Administrar → Definiciones personalizadas, creá la dimensión "search_results" si querés ver en GA4 qué se buscó sin resultados (en Umami se ve sin hacer nada).', horizon: 'ya' },
  { id: 'tiktok-utm', label: 'Poner el link de TikTok con UTM', detail: 'TikTok ya trae visitas (9 en la última semana, según GA4 al 14/09). Para que GA4 y Umami las cuenten como TikTok y no se mezclen con las directas, el link de la bio de TikTok tiene que ser: dahila.uy/?utm_source=tiktok&utm_medium=social', horizon: 'ya' },
  { id: 'ig-checklist-viral', label: 'Usar el checklist de reel viral en el próximo que despegue', detail: 'Comentario fijado con el link a la pieza, responder todos los comentarios el primer día, "comentá LINK y te lo mando por DM", y anotar el formato ganador. El playbook completo está en la pestaña Canales.', horizon: 'ya' },
  { id: 'precios-fase2', label: 'Segundo paso de precios', detail: 'Con el drop de verano, tops y bolsos suben hacia la meta de 12 meses (columna "12m" de la tabla).', horizon: 'trimestre' },
  { id: 'merchant-center', label: 'Activar Google Merchant Center', detail: 'Gratis, ~30 minutos, pero primero confirmá que Merchant Center deje elegir Uruguay para listados gratuitos (al 12/09/2026 no figura en la documentación oficial). El paso a paso está en la pestaña Canales, debajo de "Google".', horizon: 'mes' },
  { id: 'bing-webmaster', label: 'Registrar el sitio en Bing Webmaster Tools', detail: 'Gratis, ~15 minutos (bing.com/webmasters, se puede importar directo desde Search Console). Importa más de lo que suena: ChatGPT busca con el índice de Bing — estar bien indexada ahí es la vía más directa a que la IA recomiende Dahila.', horizon: 'mes' },
  { id: 'etiquetas-clientas', label: 'Etiquetar a las clientas en WhatsApp Business', detail: 'Dos etiquetas por clienta: "frecuente" (2+ compras) y su mes de cumpleaños. Son la base de los referidos, el cumple y el acceso anticipado — 2 minutos por clienta. El sistema completo está en la pestaña Clientas.', horizon: 'mes' },
  { id: 'cupon-amiga', label: 'Crear los primeros cupones AMIGA-(nombre)', detail: 'Elegí 5 clientas contentas y mandale a cada una su código para regalar (15%, 3 usos). La receta exacta está en la pestaña Clientas.', horizon: 'mes' },
  { id: 'drop-site', label: 'Probar la maquinaria de drops del sitio', detail: 'Antes del drop de verano: Configuración → "Próximo drop" (countdown + captura VIP en el home) y una colección en estado "Próximamente". El paso a paso está en la pestaña Drops.', horizon: 'trimestre' },
  { id: 'gbp-completo', label: 'Completar el Perfil de Google (ya existe)', detail: 'Categoría, zonas de servicio, productos con foto y precio, "Encargos a medida" como servicio, fotos y una publicación por semana. El paso a paso está en Novedades → "Plan para que te encuentren Google y las IAs".', horizon: 'ya' },
  { id: 'resenas-en-la-home', label: '(Mati) Prender la sección de reseñas de Google en la home', detail: 'La sección ya está hecha: muestra la puntuación, cuántas opiniones hay y las 3 últimas reseñas reales, con el nombre y la foto de cada clienta y un link para abrirlas en Google. Le falta la llave: en Google Cloud (el mismo proyecto de Search Console), activá "Places API (New)", creá una clave de API con facturación activada y ponela en Netlify como GOOGLE_PLACES_API_KEY. Después, en Netlify → Deploys → Trigger deploy: una variable nueva no llega al sitio hasta la próxima publicación (y la seguridad del sitio recién ahí habilita las fotos de las autoras). Al 19/09 la sección no aparece en producción: /api/resenas responde {"ok":false}. Sin la clave, la sección no aparece (no muestra nada inventado). Las reseñas se piden en el momento, no se guardan: Google no permite guardarlas. Con el tráfico de hoy entra en el tramo gratis de 1.000 llamadas por mes.', horizon: 'ya' },
  { id: 'places-tope', label: '(Mati) Ponerle tope a la API de Places para que no pueda cobrar', detail: 'La SKU que trae las reseñas ("Place Details Enterprise + Atmosphere") tiene 1.000 llamadas gratis por mes, y lo que pasa de ahí se cobra solo (USD 25 cada 1.000). Con el tráfico de hoy no se llega ni cerca, pero para dormir tranquilo: Google Cloud → APIs y servicios → Places API (New) → Cuotas → poné un tope diario de 30 solicitudes (no 100, como decía antes: 100 por día son hasta 3.000 por mes y la capa gratis es de 1.000). Con 30 por día el máximo son ~900 por mes: siempre gratis. Si algún día se llega al tope, deja de responder y la sección de reseñas no se muestra. Nunca una factura sorpresa.', horizon: 'ya' },
  { id: 'ga4-acceso', label: '(Mati) Darle acceso de lectura a Analytics a la cuenta de servicio', detail: 'Con esto dejo de depender de que me mandes capturas de GA4: puedo leer los números y cruzarlos con Search Console. Dos pasos: (1) Google Cloud, mismo proyecto → habilitar "Google Analytics Data API" y "Google Analytics Admin API"; (2) GA4 → Administrar → Gestión de accesos a la propiedad → "+" → agregar el mail de la cuenta de servicio (el que está en .secrets, lo imprime el script si falta) con rol "Lector". Después: npm run ga. Es gratis: la API de Analytics no cobra, solo limita consultas por hora.', horizon: 'ya' },
  { id: 'perfiles-sql', label: 'Hecho (19/09): SQL de perfiles (TikTok y Perfil de Google)', detail: 'database/perfiles-2026-09.sql, en el SQL Editor de Supabase. Carga el TikTok y el Perfil de Google que pasaste, para que el sitio los declare como cuentas oficiales. Falta uno que no puedo completar yo: el link para DEJAR reseña (Perfil de Google → "Pedir reseñas", queda como g.page/r/.../review); está comentado al final del archivo. Ese activa dahila.uy/resena.', horizon: 'ya' },
  { id: 'links-perfiles', label: 'Cargar los links de tus perfiles en Configuración → Contacto', detail: 'Perfil de Google, link para reseñas, YouTube, TikTok, Facebook y Pinterest. El sitio se los declara a Google y a las IAs como tus cuentas oficiales, y el de reseñas activa dahila.uy/resena. Al 15/09 no hay ninguno cargado (solo Instagram y WhatsApp), y al buscar la marca Google todavía sugiere "Quizás quisiste decir: Dahlia Crochet". Declarar el Perfil de Google y TikTok como cuentas oficiales es una de las señales con que Google entiende que Dahila es una marca.', horizon: 'ya' },
  { id: 'resenas', label: 'Pedir reseñas a las clientas con dahila.uy/resena', detail: 'A todas, unos días después de recibir, SIN descuento ni regalo a cambio. Google lo prohíbe expresamente (también pedírselas solo a las clientas contentas) y borra las reseñas que detecta así. Al 15/09 ya hay 9 de 5 estrellas: de acá en más, sin incentivo. Para que dahila.uy/resena funcione, primero cargá el link para reseñas en Configuración → Contacto. El texto listo para copiar está en Novedades.', horizon: 'ya' },
  { id: 'brave-submit', label: 'Pedirle a Brave que lea el sitio', detail: 'search.brave.com/submit-url → la home, /tienda, /encargo y /blog. Hoy Brave no tiene ninguna página tuya, y Claude busca ahí.', horizon: 'ya' },
  { id: 'gsc-api', label: '(Mati) Habilitar la API de Search Console', detail: 'Un clic en Google Cloud, en el mismo proyecto de la API de indexación. Después, npm run seo-report saca el informe del mes solo.', horizon: 'ya' },
  { id: 'otros-mapas', label: 'Estar en Bing Places, Apple Business y Foursquare', detail: 'Con el mismo nombre, teléfono y link que en Google. Bing se importa desde Google en minutos. Son los mapas de los que sacan datos ChatGPT, Copilot y Siri.', horizon: 'mes' },
  { id: 'youtube', label: 'Crear el canal de YouTube y subir los reels que ya funcionaron', detail: 'Como Shorts primero; después, un video largo por mes. Títulos y descripciones con la plantilla de Novedades.', horizon: 'mes' },
  { id: 'medicion-mensual', label: 'Medir el primer lunes de cada mes', detail: 'Informe automático (npm run seo-report), informe de IA de Search Console y las tres preguntas a ChatGPT, Gemini y Claude. Anotar si aparecés.', horizon: 'mes' },
  // ── Auditoría total del 12/09/2026 (detalle en research/auditoria-total-2026-09-12.md) ──
  { id: 'envio-montos', label: 'Nuevo (12/09): poner cuánto sale el envío', detail: 'En Configuración → "Envío — línea corta", escribí los montos que cobrás de verdad (por ejemplo "Montevideo $… · Interior por agencia $…"). Desde ahora el carrito muestra ese texto al lado del total, antes de que la clienta te escriba. Si el texto no tiene números, el carrito sigue diciendo que el costo se lo pasás por WhatsApp. No saber cuánto sale el envío es la duda que más frena una compra.', horizon: 'ya' },
  { id: 'cola-al-dia', label: 'Mantener al día el aviso de lista de espera', detail: 'Hoy dice "los pedidos estarán listos a finales de septiembre". Ahora también se ve en la home, en la tienda y en la vista rápida, así que cuando cambie la fecha, cambialo en Configuración → "Lista de espera" (si queda vencido, se nota en todas partes). Las piezas en stock ya no lo muestran: dicen "En stock".', horizon: 'ya' },
  { id: 'descripciones-top', label: 'Completar las descripciones de Spring, Amour y Granny\'s', detail: 'Son las tres fichas con más visitas y tienen la descripción más genérica ("no hay dos iguales"). Sumales las horas de tejido, si el calce es ajustado o suelto, el largo y cuándo te la pondrías: el mismo nivel que ya tienen la bandana o los calentadores. Set Brisa y Set Lueur también: hoy solo dicen qué incluyen.', horizon: 'ya' },
  { id: 'bio-anush', label: 'Escribir 2 o 3 líneas sobre vos para las fichas', detail: 'Configuración → "Hecho por" (texto y foto). El bloque "Hecho por Anush" ya está armado en cada ficha, pero no aparece porque el texto está vacío. En tu voz: quién teje, desde cuándo, qué te gusta tejer.', horizon: 'mes' },
  { id: 'texto-lana', label: 'Revisar "Lana natural" en los textos de la home', detail: 'El paso 2 del proceso (Configuración) dice "Lana natural, sin prisa", pero la mayoría de las piezas son de algodón y hay acrílico, lurex y trapillo. La tira de arriba de la home ya se corrigió; este texto es tuyo y lo cambiás vos (hay una versión sugerida en database/textos-configuracion-2026-09.sql).', horizon: 'ya' },
  { id: 'wa-respuestas-rapidas', label: 'Dejar listas las respuestas rápidas de WhatsApp', detail: 'El mensaje que arma el carrito ahora termina preguntando por el plazo, el costo de envío a su zona y la forma de pago. Guardá esas tres respuestas como respuestas rápidas en WhatsApp Business (Herramientas para la empresa → Respuestas rápidas) y activá un mensaje de bienvenida para cuando no podés contestar al toque. Responder rápido y claro es lo que convierte un carrito en venta.', horizon: 'ya' },
  { id: 'orden-categorias', label: 'Correr el SQL de orden y palabras (5 minutos)', detail: 'Está listo en database/orden-y-palabras-2026-09.sql. Pone Cardigans primero (lo que más se agrega al carrito), después Tops, Accesorios, Sets y Sweaters (se termina el invierno), y suma "tops de hilo", "sets de crochet" y "bolsa dona" a las descripciones, que es como busca la gente. Se corre en Supabase → SQL Editor; después todo se puede cambiar desde el admin.', horizon: 'ya' },
  { id: 'tejedoras-menores', label: 'Definir el aviso para postulantes menores de 18', detail: 'La página de tejedoras no dice nada sobre el carné de trabajo del INAU. Pasale a Mati el texto que quieras mostrar antes del formulario (por ejemplo: "Si tenés menos de 18, contanos tu edad al escribirnos: para trabajar hace falta el carné del INAU").', horizon: 'mes' },
  { id: 'colores-catalogo', label: 'Cargar los colores (si querés mostrarlos)', detail: 'Ningún producto tiene colores cargados, así que el selector de colores no aparece en ninguna ficha. Se cargan en Colores y después en cada producto. No es urgente: sin colores, la ficha igual invita a elegirlos por WhatsApp.', horizon: 'trimestre' },
  { id: 'ig-whatsapp', label: '(Mati) Probar el botón de WhatsApp desde Instagram', detail: 'Abrí dahila.uy desde el link de la bio de Instagram, en un iPhone y en un Android, agregá algo al carrito y tocá "Coordinar por WhatsApp". Si en alguno no se abre la app, probá el aviso "¿No se abrió WhatsApp?" que aparece debajo del botón ("Abrir de nuevo" y "Copiar mi pedido") y contá qué pasó.', horizon: 'ya' },
  { id: 'signup-supabase', label: '(Mati) Cerrar el registro de cuentas y correr el SQL de seguridad', detail: 'Verificado el 14/09: cualquiera puede crearse una cuenta en Supabase y, con los permisos de hoy, cualquier cuenta puede editar productos y leer datos de clientas. Dos pasos: (1) Supabase → Authentication → Sign In / Providers → apagar "Allow new users to sign up". (2) Supabase → SQL Editor → pegar database/seguridad-2026-09.sql, poner tu mail donde dice PONE_TU_MAIL_ACA y tocar Run. Te anota como admin y deja que solo las cuentas admin editen; si no encuentra tu cuenta, frena sin cambiar nada. Termina con una tabla: si no dice "OK", pasale lo que dice a Claude. Hacelo antes del próximo deploy: desde ese deploy, el panel solo deja entrar a cuentas admin.', horizon: 'ya' },
  { id: 'clarity-grabando', label: '(Mati) Confirmar que Clarity vuelve a grabar', detail: 'La seguridad del sitio (CSP) bloqueaba el script de Clarity: no grabó sesiones en las últimas semanas. Queda arreglado con el próximo deploy; a los 2-3 días, revisar en Clarity que aparezcan grabaciones nuevas. Hasta entonces, no tomar decisiones con grabaciones "recientes".', horizon: 'ya' },
  { id: 'sitemap-xlm', label: '(Mati) Quitar el sitemap mal escrito de Search Console', detail: 'En Search Console → Sitemaps figura "sitemap.xlm" (enviado el 09/07, con un error). Tocalo → los tres puntos → Quitar sitemap. El bueno, sitemap.xml, está bien: Google lo leyó el 13/09 sin errores.', horizon: 'ya' },
  { id: 'pedir-indexacion', label: '(Anush) Editar Sweater Cherry, Top Race y Spring para que Google vuelva', detail: 'Actualizado el 19/09: pedir la indexación muchas veces no sirve. El sitemap le dice a Google cuándo cambió cada ficha por última vez (la fecha de la última edición en el admin): Sweater Cherry dice 11/09, Top Race 23/08 y Spring 26/08. Google pasó por Sweater Cherry el 14/09 (vio el 404), así que para él no cambió nada desde entonces y no tiene apuro. Al guardar un cambio real en la ficha (por ejemplo, completar la descripción, que en Sweater Cherry y Spring está pendiente), la fecha se actualiza y Google la vuelve a priorizar. No hace falta más de un pedido de indexación por ficha. Lo de antes: Al 15/09 las notas del blog y /tienda/sweaters ya entraron. Quedan /tienda/sweater-cherry y /tienda/top-race: Search Console → Inspección de URLs → pegá cada una → "Probar URL publicada" → "Solicitar indexación". A Sweater cherry Google la vio con error 404 el 14/09, por una falla que se arregla con el próximo deploy (la copia de respaldo del catálogo no la tenía); hoy da bien. No uses npm run index-urls: Google acepta el aviso pero no lo registra (esa API es solo para avisos de empleo y transmisiones en vivo).', horizon: 'ya' },
  { id: 'palabras-busqueda', label: 'Escribir las descripciones con las palabras de la gente', detail: 'Las tres más claras ya están en el SQL de orden y palabras. Cuando escribas una descripción nueva, usá las palabras con que busca la gente en Google, si son ciertas para la pieza: "top de hilo", "tops tejidos", "bolso de playa", "chaleco tejido".', horizon: 'mes' },
  { id: 'medir-titulo-cuidados', label: '(Mati) El 11/10, medir los títulos nuevos del blog', detail: 'Desde el 13/09 tienen título nuevo: cuidados (90 impresiones y 0 clics), regalos (117 y 2,6%) y comprar crochet en Uruguay (46 y 4,3%). Correr npm run seo-report -- --detalle y comparar su CTR en research/mediciones/. Mirar también si las 6 notas nuevas ya tienen impresiones.', horizon: 'mes' },
  { id: 'link-bio-ig', label: '(Mati) Confirmar que la bio de Instagram lleva a dahila.uy/ig', detail: 'Esa página existe para la bio: el sitio registra solo que la visita vino de Instagram, sin agregar nada al link. Si la bio lleva a dahila.uy directo, esas visitas se mezclan con las de Google y no se puede saber qué vende Instagram. Se cambia en Instagram → Editar perfil → Enlaces.', horizon: 'ya' },
  { id: 'dahila-en-posts', label: 'Cerrar cada posteo con "dahila.uy"', detail: 'Escrito así, con el ".uy". Google corrige "dahila" por "dahlia", y la dirección completa evita que se pierda quien busca la marca después de ver un post. Las búsquedas de la marca son las que más clics traen: la home se llevó 78 de los 122 clics de Google en 28 días.', horizon: 'ya' },
  { id: 'medir-velocidad', label: '(Mati) Medir la velocidad en el celular después del deploy', detail: 'Ahora se mide sola: npm run seo-report -- --velocidad deja el puntaje de celular de la home y de /tienda dentro del informe. Necesita una clave gratuita de PageSpeed (Google Cloud → "PageSpeed Insights API" → crear clave; NO pide tarjeta) puesta como PAGESPEED_API_KEY; sin clave, algunos días dice "sin cupo". A mano es igual de válido: en pagespeed.web.dev, poné dahila.uy y mirá la pestaña "Celular". El 12/09 daba 46 de 100, con 5,5 s hasta ver la foto principal. Los cambios del 13/09 (página que ya no llega escondida, Analytics y Clarity diferidos, íconos livianos) deberían subirlo. Pasá el número: si mejora poco, lo que sigue es rehacer la home para que se arme en el servidor.', horizon: 'ya' },
  // ── Mercado y catálogo, 19/09/2026 (detalle en research/auditoria-total-2026-09-12.md §17) ──
  { id: 'pago-tarjeta', label: 'Nuevo (19/09): ¿aceptás tarjeta de crédito? Decilo', detail: 'De lo que se paga online con tarjeta o dinero electrónico en Uruguay, el 69% va con tarjeta de crédito (CEDU, fin de 2025; ese informe no mide transferencias). El sitio hoy dice "transferencia o Mercado Pago" y nunca dice "tarjeta". Si cobrás con links de Mercado Pago, la clienta puede pagar con tarjeta: pasale a Mati si aceptás tarjeta y si hay cuotas (y quién paga el recargo), y se agrega en la ficha, el carrito y la página de info. Si no aceptás, está bien: no se cambia nada. Antes de decidir, leé el riesgo "Vender sin estar formalizada": cobrar por Mercado Pago deja cada venta registrada.', horizon: 'ya' },
  { id: 'sin-categoria', label: 'Nuevo (19/09): darle categoría a Box de regalo y Falda Serenada', detail: 'Son los únicos 2 productos sin categoría: no aparecen en ninguna página de categoría ni en el menú, solo en /tienda y en la búsqueda. La box podría ir en Accesorios; la falda, donde vos veas (o crear una categoría si van a venir más faldas). Se cambia en Productos → editar.', horizon: 'ya' },
  { id: 'fotos-una-sola', label: 'Sumar fotos a Bolso a cuadros y Set Lurex', detail: 'Tienen una sola foto cada uno; el resto del catálogo tiene 2 o 3. Con la prenda puesta, un detalle del punto y la espalda alcanza. El paso a paso de luz está en la pestaña Fotos.', horizon: 'mes' },
  { id: 'fichas-cortas', label: 'Completar las 10 fichas con menos de 250 letras', detail: 'Set Lueur (44 letras) y Set Brisa (47) casi no tienen texto; les siguen Sweater Senda, Sweater Cherry, Granny\'s, Cardigan Amour, Bufanda Sophie, Box de regalo, Spring y Set Lurex. Por qué importa: con un par de líneas, la ficha tiene muy pocas palabras con las que Google la pueda asociar a una búsqueda ("cardigan con flores tejido a mano"), y quien llega no tiene con qué decidir sin escribirte. Ojo: que las fichas estén en el puesto 20 a 40 se explica sobre todo porque aparecen para búsquedas genéricas como "cardigan", donde compiten las tiendas grandes; el texto solo no las va a subir a la primera página. Qué poner: material, horas de tejido (están en la tabla de precios), calce, largo y cuándo te la pondrías. Nada inventado: si no sabés un dato, mejor no ponerlo.', horizon: 'ya' },
  { id: 'orden-verano', label: 'A mediados de octubre: Tops y Sets primero', detail: 'El orden sugerido el 12/09 (SQL de orden y palabras) pone Cardigans primero porque en invierno era lo que más se agregaba al carrito. Con el calor, lo que se busca y se regala cambia a tops, sets de playa y bolsos. Cambiá el orden en Categorías; lleva un minuto y se puede volver atrás.', horizon: 'mes' },
]

// ─── Riesgos ─────────────────────────────────────────────────

export interface Risk {
  title: string
  severity: 'alta' | 'media'
  detail: string
  mitigation: string
}

export const RISKS: Risk[] = [
  {
    title: 'Todo depende de vos',
    severity: 'alta',
    detail: 'Tejés, vendés, respondés y enviás. Una gripe frena el negocio; crecer te ahoga.',
    mitigation: 'La red de tejedoras y las clases existen para esto: delegar producción y monetizar tu hora sin tejer.',
  },
  {
    title: 'Vivir del algoritmo de Instagram',
    severity: 'alta',
    detail: 'Si Instagram baja tu alcance o te bloquea la cuenta, las ventas se apagan de un día para el otro.',
    mitigation: 'Lista VIP, difusión de WhatsApp y Pinterest: audiencias que son tuyas.',
  },
  {
    title: 'Cobrar de menos y quemarte',
    severity: 'alta',
    detail: 'Trabajar a $34 la hora no financia crecimiento y agota. Era el riesgo #1 y ya empezó a corregirse.',
    mitigation: 'Precios nuevos aplicados + mirar la columna $/h antes de aceptar cualquier encargo especial.',
  },
  {
    title: 'Una pieza floja de otra tejedora',
    severity: 'media',
    detail: 'La primera prenda mal terminada que llegue a una clienta se lleva puesta la reputación de la marca.',
    mitigation: 'Muestra pagada + ficha técnica + revisar TODO antes de enviar. Nunca sale nada sin pasar por tus manos.',
  },
  {
    title: 'Decir que sí a todo por miedo',
    severity: 'media',
    detail: 'Con la demanda creciendo van a llegar pedidos grandes, apurados o con descuento exigido. Aceptarlos a cualquier precio vuelve a comprar trabajo a pérdida.',
    mitigation: 'Toda propuesta pasa por la calculadora antes de responder: si no paga tu hora mejor que el promedio, se cotiza más caro o se dice que no. La lista de espera te da el poder de elegir.',
  },
  {
    title: 'Vender sin estar formalizada',
    severity: 'media',
    detail: 'Hoy Dahila no está formalizada. Cada cobro por Mercado Pago queda registrado, y la DGI anunció que desde el último trimestre de 2026 los vendedores particulares con ventas frecuentes pueden quedar alcanzados por retenciones sobre los medios de pago digitales (Ámbito, 14/06/2026; todavía sin porcentajes ni montos mínimos publicados). Aceptar tarjeta por un link de Mercado Pago no crea el problema, pero lo hace más visible a medida que crecen las ventas.',
    mitigation: 'Una consulta con un contador antes de fin de año. Tres opciones para preguntar: el monotributo (la lista oficial del BPS incluye "Textiles: tejidos, telares, confección de mantas, frazadas, ponchos"; falta confirmar si cubre vender por internet, porque las guías privadas no se ponen de acuerdo), el Monotributo Social MIDES (solo si el hogar cumple las condiciones sociales) o una unipersonal en el régimen de IVA mínimo (literal E), que según una guía de 2026 ronda los $9.200 por mes el primer año. Con RUT se puede abrir, además, la cuenta vendedor de Mercado Pago.',
  },
]

// ─── Novedades y descubrimientos ──────────────────────────────
// Agosto 2026: investigación externa (estudios de psicología de compra,
// Baymard, y qué funciona hoy para vender online) leída y traducida a
// lenguaje simple. No repite lo que ya está en las otras pestañas —
// completa lo que faltaba. Fuentes completas (con links a los papers y
// estudios) están guardadas en la memoria de Claude Code de este proyecto,
// por si en algún momento se quieren revisar en detalle.

export const NOVEDADES_INTRO =
  'Un par de sesiones se fueron en leer qué dice la evidencia real (estudios de universidades, no blogs de marketing) sobre por qué la gente paga más por algo hecho a mano, y qué funciona hoy para que te encuentren. Esto es el resumen, en criollo — con qué hacer en cada caso.'

export const NOVEDADES_ARTESANAL = [
  {
    title: 'No pagan más porque "es mejor calidad" — pagan más porque sintieron que alguien lo hizo PARA ellas',
    body: 'Hay un estudio (Fuchs, Schreier & van Osselaer, 2015) que midió esto con plata real, no encuestas: decir que algo es hecho a mano lo hace más deseable, y el motivo no es la calidad — es que la persona siente que el objeto "tiene amor adentro". Por eso el ángulo de venta que más rinde no es "es mejor que lo de fábrica" (se puede discutir), es "alguien lo hizo pensando en vos" (no se puede discutir).',
  },
  {
    title: 'Contar las horas reales hace que la pieza valga más — está medido, y con el auge de la IA vale MÁS que antes',
    body: 'Cuando la gente sabe cuánto trabajo llevó algo, lo valora más, aunque el objeto sea idéntico (Kruger et al., 2004). Y en 2025-2026 esto se volvió más fuerte, no más débil: hay tanto contenido hecho por IA dando vueltas que mostrar el trabajo humano real se nota más. Las horas ya las tenés en la tabla de precios — no hay que cronometrar de nuevo, alcanza con escribirlas en la descripción de cada prenda.',
  },
  {
    title: 'Lo que más convence, en orden: un video del proceso > documentar el tiempo > explicarlo con palabras > > > las imperfecciones (esto casi no suma)',
    body: 'Un estudio reciente que comparó señales de esfuerzo encontró que un video corto mostrando el trabajo es lo que más mueve la aguja, bastante más que un texto. Y algo importante: frases tipo "cada pieza tiene sus pequeñas imperfecciones que la hacen única" fueron la señal MÁS débil de todas — se lee como excusa, no como valor. Mejor sacarlas del todo.',
  },
  {
    title: 'Regla de oro para el texto: nunca digas "artesanal", "auténtico", "con amor" o "con pasión"',
    body: 'Hay un fenómeno estudiado (Södergren, 2021): cuando una marca reclama su propia autenticidad en voz alta, genera sospecha, no confianza — es "protestar demasiado". Y esas palabras ya están gastadas de tanto usarlas marcas grandes que no son artesanales de verdad. El truco simple: si una fábrica grande podría copiar la frase sin mentir demasiado, no sirve. "Tejido a mano" pasa el test. "Con amor" no. En cambio "37 horas, lana X, medido para vos" no lo puede copiar nadie más — y por eso convence.',
  },
  {
    title: 'La historia de "una persona contra la ropa en serie" funciona — pero como orgullo, nunca como pedido de lástima',
    body: 'Está medido (Paharia et al., 2011): las marcas con una historia de desventaja + determinación generan más identificación y más ventas — pero SOLO cuando se cuenta como "esto es lo que hago y así lo hago", nunca como "ayudame a". Uruguay además es un lugar donde esa historia del que rema solo cae particularmente bien. Es un activo, no algo para esconder.',
  },
  {
    title: '"A medida" vende por el resultado (le queda a SU cuerpo), no por el proceso de elegir',
    body: 'La investigación sobre productos a medida encuentra que lo que hace pagar más no es "tenés más opciones" — es sentir que el resultado es solo tuyo. El ángulo más fuerte para Dahila: ropa que le queda al cuerpo real de la persona, no al talle estándar que traen las tiendas importadas.',
  },
  {
    title: 'Crecés sumando compradoras nuevas, no exprimiendo a las que ya te compraron',
    body: 'Es el hallazgo más repetido en marketing (formalizado hace 35 años y confirmado una y otra vez desde entonces): las marcas chicas no crecen fidelizando más fuerte, crecen llegando a gente nueva. Nada de programas de puntos ni "cuantas más compres, más descuento". El programa AMIGA que ya tenés (pestaña Clientas) va en la dirección correcta porque trae GENTE NUEVA, no porque premia comprar más.',
  },
  {
    title: 'Usá siempre las mismas fotos/colores/logo — no rediseñes cada temporada',
    body: 'Parece obvio pero es de lo más comprobado que hay: una marca que se ve igual a sí misma con el tiempo se reconoce más rápido y se recuerda mejor. No hace falta "renovar la imagen" en cada drop — al contrario, cambiar mucho reinicia el reconocimiento que ya construiste.',
  },
  {
    title: 'Vos no sos la protagonista de la página de un producto — la clienta sí',
    body: 'Un framework clásico de copy dice: el cliente es el héroe de la historia, la marca es quien lo ayuda a lograr lo que quiere. Aplicado acá: la ficha de un producto no habla de "cuánto amor le puso Dahila" — habla de lo que ELLA va a tener puesto, cómo le va a quedar, para qué ocasión. Vos aparecés como quien lo hace posible, no como el tema central.',
  },
  {
    title: 'Un compromiso caro de cumplir vale más que diez adjetivos lindos',
    body: 'La publicidad y las promesas funcionan en parte porque son caras de fingir — por eso son creíbles. Una marca chanta no se puede dar el lujo de prometer "si no te queda, lo ajustamos" o poner una fecha de entrega con nombre y apellido atrás. Cada promesa concreta y sostenible que hacés (aunque no cueste plata, cuesta compromiso) vale como prueba de que el negocio es real y va en serio.',
  },
]

/** SEO en profundidad: qué cambió con la IA y qué ya está resuelto. */
export const NOVEDADES_SEO_IA = [
  {
    title: 'Los resúmenes de IA en Google (AI Overviews) te afectan poco — y hay un dato concreto de por qué',
    body: 'Un estudio grande (Pew Research, 2025) midió que esos resúmenes aparecen mucho en búsquedas largas o en forma de pregunta (más de la mitad de las veces), pero casi nunca en búsquedas cortas de 1 o 2 palabras (menos de 1 de cada 10). Las búsquedas que te importan a vos —"dahila", "poncho crochet montevideo"— son justo las cortas. Por eso no tiene sentido armar un blog de "tips de tejido" esperando tráfico: ese es el contenido largo que la IA sí se come.',
  },
  {
    title: 'Nadie necesita "optimizar para la IA" con trucos técnicos — Google lo dice explícitamente',
    body: 'Si alguna vez alguien te ofrece "posicionamiento para IA" o "GEO" como servicio aparte del SEO normal, es un cuento: Google publicó que no hace falta ningún archivo especial ni marcado técnico extra para aparecer en sus resúmenes de IA. Es la misma base de siempre (contenido claro, datos reales, que el sitio cargue bien) — no un curso nuevo que comprar.',
  },
  {
    title: 'Lo que sí importa: que se note quién sos, de verdad',
    body: 'Google evalúa (y la gente también) si un sitio tiene una autora real detrás: cara, nombre, ubicación, hace cuánto hace esto, forma de contactar. Es literalmente lo mismo que resuelve la desconfianza antes de escribir por WhatsApp — la misma info sirve para las dos cosas a la vez.',
  },
  {
    title: 'Las compras hechas por IA todavía no llegan a Uruguay — y el sitio igual está listo',
    body: 'Existen sistemas donde una IA compra por vos (en ChatGPT y en Google), pero a septiembre de 2026 son solo para tiendas de Estados Unidos, y ChatGPT incluso cerró la compra dentro del chat en marzo porque vendía menos que mandar a la gente al sitio de la tienda. Para Uruguay no hay nada que hacer todavía. Lo que sí sirve desde ya es que precio, stock y descripción estén en un formato que una máquina lee sin adivinar, y el sitio lo tiene desde antes.',
  },
  {
    title: 'Cada IA busca en un lugar distinto — no alcanza con Google',
    body: 'ChatGPT busca sobre todo en Bing (y también en Google), Copilot en Bing, Claude en Brave, y Gemini y el Modo IA en Google. Hoy, si alguien le pregunta a una IA por "Dahila Crochet", lo más probable es que no te encuentre: buscando ese nombre en Brave aparecen patrones de la flor dalia y ni una página tuya (probado el 12/09/2026). Dar de alta el sitio en Bing Webmaster Tools es gratis, se importa desde Search Console en un par de clics y trae un informe que muestra cuándo Copilot cita tus páginas.',
  },
  {
    title: 'Lo que más te hace aparecer en las IAs está fuera de tu sitio',
    body: 'Un estudio de Ahrefs sobre 75.000 marcas (mayo de 2026) midió qué se asocia más con que una IA nombre una marca: primero las menciones en YouTube, después que otros sitios la nombren; los links quedan bastante atrás. Es una correlación medida en marcas grandes, no una receta, pero la dirección es clara: videos en YouTube, notas de prensa, directorios y ferias que digan "Dahila" pesan más que cualquier ajuste del sitio. Hoy, buscando la marca, no aparece ningún otro sitio que hable de Dahila.',
  },
  {
    title: 'Desde junio, Google te muestra cuánto aparecés en sus respuestas de IA',
    body: 'Search Console sumó un informe de IA generativa: cuántas veces aparecieron tus páginas en los resúmenes de IA y en el Modo IA de Google (solo apariciones: los clics todavía no los separa). Está para todos los sitios desde el 31 de agosto de 2026, aunque solo se muestra cuando el sitio junta suficientes apariciones. Entrá una vez por mes y anotá el número: es la única forma de saber si todo esto funciona.',
  },
  {
    title: 'Tus posts de Instagram ya aparecen en Google',
    body: 'Desde el 10 de julio de 2025, Google y Bing indexan fotos, carruseles y reels de las cuentas profesionales públicas, y leen el texto del post, el texto alternativo y la ubicación. Para un catálogo que vive en Instagram, esto cambia cómo escribir: "cardigan de crochet tejido a mano en Montevideo, a medida" encuentra gente; "nueva 🌸" no. Revisá también que en la configuración de privacidad de la cuenta esté activada la opción de aparecer en buscadores.',
  },
  {
    title: 'Google Maps ahora recomienda con IA — con tu perfil y tus reseñas',
    body: 'En marzo de 2026 Google sumó a Maps preguntas en lenguaje natural ("¿dónde encargo un saco tejido a medida?") que responde Gemini a partir del Perfil de Negocio y las reseñas; en agosto lo extendió a más de 150 países, primero en inglés. Sin Perfil de Negocio no existís ahí, y las reseñas son lo que la IA lee para recomendar.',
  },
  {
    title: 'Lo que más se busca en Uruguay con "crochet" es aprender',
    body: 'El autocompletado de Google para Uruguay (12/09/2026) lo muestra claro: "crochet paso a paso", "crochet para principiantes", "clases crochet montevideo", "taller crochet montevideo", "curso crochet uruguay". Si arrancás las clases (pestaña Clases), esa demanda ya existe y es local, justo donde un Perfil de Negocio y una página propia juegan a favor de alguien de acá. Y un video largo en YouTube enseñando algo básico es de lo que más citan las IAs cuando alguien pregunta cómo hacer algo.',
  },
]

// ─── Plan SEO + IA (investigado 12/09/2026) ───────────────────
// Orden por lo que más rinde para una marca chica de Montevideo. Detalle,
// datos y fuentes: research/seo-ia-2026-09.md.
export const SEO_IA_PLAN = [
  { step: 'Completar el Perfil de Negocio de Google', detail: 'Ya existe: ahora hay que llenarlo. Categoría principal "Tienda de ropa" (y alguna secundaria que te describa sin inventar), hasta 20 zonas de servicio (barrios de Montevideo y los departamentos a los que llegás), cada producto con foto, precio y link, "Encargos a medida" como servicio, fotos reales y una publicación por semana. Google sacó las preguntas y respuestas del perfil (noviembre 2025): ahora Gemini responde con lo que dicen tu perfil, tu sitio y tus reseñas. Pegá el link del perfil en Configuración → Contacto.' },
  { step: 'La ubicación: qué marcar y qué no', detail: 'Si no recibís clientas en tu casa, Google pide ocultar la dirección y marcar zonas de servicio: es lo correcto, y lo que compensa es un perfil completo y con reseñas. Si sí recibís gente (por ejemplo, para tomar medidas), podés mostrarla, pero Google pide un cartel fijo con el nombre y tu dirección queda pública. Nunca uses una dirección prestada, de oficina virtual o de otro local: es causa de suspensión.' },
  { step: 'Pedir reseñas con dahila.uy/resena', detail: 'En el Perfil, "Pedir reseñas" te da un link: pegalo en Configuración → Contacto y desde ese momento dahila.uy/resena lleva directo a dejar la reseña. Mandalo a todas las clientas unos días después de recibir (no solo a las contentas: Google prohíbe elegir) y nunca a cambio de un descuento. Respondé cada reseña: la IA lee cuántas hay, qué tan recientes son y qué dicen.' },
  { step: 'Estar en los otros mapas: Bing, Apple y Foursquare', detail: 'ChatGPT y Copilot arman sus respuestas locales con Bing y otros directorios, no con Google. Bing Places se importa desde tu Perfil de Google en minutos y deja ocultar la dirección. Apple Business está disponible en Uruguay y alimenta Apple Maps y Siri (ojo: Apple no deja ocultar una dirección si la cargás). Foursquare es gratis y varios estudios lo encontraron entre las fuentes locales de ChatGPT (otros lo discuten; son 10 minutos). Mismo nombre, teléfono y link en los cuatro.' },
  { step: 'Pedirle a Brave que lea el sitio', detail: 'Hoy Brave no tiene ninguna página de dahila.uy (probado el 12/09/2026) y Claude busca ahí. En search.brave.com/submit-url mandá la home, /tienda, /encargo y /blog. No hay panel ni garantía: es un pedido de lectura, y las menciones en otros sitios también lo ayudan a encontrarte.' },
  { step: 'Mirar Bing Webmaster Tools', detail: 'Si el sitio ya está dado de alta, entrá al informe "AI Performance": muestra cuándo Copilot cita tus páginas y con qué búsquedas. Si no está, se importa desde Search Console en 5 minutos. Es el índice del que se alimentan ChatGPT y Copilot.' },
  { step: 'Canal de YouTube: primero lo que ya tenés', detail: 'Creá el canal "Dahila Crochet" y subí como Shorts los reels que ya funcionaron. Después, un video largo por mes sobre algo que te preguntan siempre. Título con lo que la gente busca primero y la marca al final; descripción que empiece respondiendo, con el link al sitio y "Montevideo"; capítulos con nombre (Google los muestra como momentos clave). Pegá el link del canal en Configuración → Contacto.' },
  { step: 'Escribir los posts de Instagram para que Google los encuentre', detail: 'Primera línea con qué es y dónde ("Top de crochet tejido a mano, Montevideo"), texto alternativo de la foto completo y la ubicación puesta. Confirmá que la cuenta sea profesional y pública.' },
  { step: 'Que te nombren en otros sitios', detail: 'Ferias, directorios y prensa local que digan "Dahila Crochet, Montevideo" con link: por ejemplo el directorio Uruguay Emprendedor, la feria "Mujeres que emprenden" de la Intendencia o una nota en un medio que cubra emprendimientos de tejido. Siempre el mismo nombre, así las IAs no te confunden con la flor dalia.' },
  { step: 'Medir una vez por mes (15 minutos)', detail: 'El primer lunes de cada mes: Mati corre npm run seo-report (clics, búsquedas con la marca y cuántas páginas indexó Google, sin entrar al panel) y vos mirás el informe de IA de Search Console y hacés las tres preguntas en ChatGPT, Gemini y Claude: "¿dónde compro ropa de crochet tejida a mano en Montevideo?", "¿quién hace sacos tejidos a medida en Uruguay?" y "¿qué es Dahila Crochet?". Anotá si aparecés. Los pedidos que llegan desde una IA ya se marcan solos en el admin.' },
]

// Textos listos para copiar (con {llaves} para completar con lo real).
export const SEO_IA_TEMPLATES = [
  {
    title: 'Mensaje para pedir la reseña (WhatsApp)',
    text: '¡Hola {nombre}! ¿Cómo te está quedando {la prenda}? Si tenés un minuto, me ayudaría muchísimo que cuentes cómo te fue en Google: dahila.uy/resena\nAsí otras personas encuentran Dahila. ¡Gracias por elegirme! 🧶',
    note: 'A todas las clientas, unos días después de recibir. Sin descuento a cambio: Google lo prohíbe.',
  },
  {
    title: 'Descripción del Perfil de Google',
    text: 'Dahila Crochet teje a mano, a crochet, prendas y accesorios en Montevideo: tops, cardigans, sweaters, bolsos y sets. Cada pieza se hace en tu talle y tus colores, a pedido o a medida, con el plazo confirmado antes de empezar. Coordinás todo por WhatsApp y enviamos a todo Uruguay. También hay piezas ya tejidas, listas para entregar.',
    note: 'Hasta 750 caracteres. Sin links ni promociones: Google no los permite en la descripción.',
  },
  {
    title: 'Primera línea de un post de Instagram',
    text: '{Qué es} de crochet tejido a mano en Montevideo. {Un dato concreto: la fibra, las horas o "en tu talle"}.\nEj.: Cardigan de crochet tejido a mano en Montevideo. Lo tejo en tu talle y en el color que elijas.',
    note: 'La primera línea es la que leen Google e Instagram para entender el post. Completá también el texto alternativo de la foto y la ubicación.',
  },
  {
    title: 'Título y descripción de un video de YouTube',
    text: 'Título: {lo que la gente busca} | Dahila Crochet\nEj.: Cómo lavar una prenda tejida a mano sin que se deforme | Dahila Crochet\n\nDescripción:\n{La respuesta en una o dos frases}. Tejido a mano en Montevideo, Uruguay.\nPrendas y encargos a medida: dahila.uy\n\n00:00 {Primer capítulo}\n01:30 {Segundo capítulo}',
    note: 'La búsqueda al principio del título, la respuesta en las primeras líneas de la descripción y capítulos con nombre.',
  },
]

/** Canales que faltaban en la pestaña Canales — no reemplazan el orden de ahí. */
export const NOVEDADES_CANALES_EXTRA = [
  {
    title: 'Reddit — no para vender, para que la IA te "conozca"',
    body: 'Reddit está entre las fuentes que más citan las IAs cuando alguien pregunta algo: en los resúmenes de IA de Google es la primera, con cerca de 1 de cada 5 citas (en el total de asistentes, YouTube la pasó en 2026). La lógica es al revés que en Instagram: no se trata de promocionarte, se trata de responder preguntas reales de forma útil en r/crochet o comunidades de Uruguay (sin mencionarte casi nunca) durante un par de semanas antes de aportar algo propio. Una respuesta genuinamente buena sobre cómo se toman medidas para una prenda a medida vale más que cualquier link que pongas.',
  },
  {
    title: 'Un solo email automático, no un newsletter',
    body: 'Con el checkout por WhatsApp, el email no es prioridad — pero hay UNO que vale la pena: un aviso automático a la lista VIP cuando se abre la cola de producción de nuevo. Es el único tipo de email que la gente realmente quiere recibir (le avisa algo que le interesa, en el momento justo) y no depende de que alguien se siente a escribir un newsletter todos los meses.',
  },
]

export const NOVEDADES_URUGUAY =
  'Un dato para quedarte tranquila con la decisión de vender por WhatsApp: el comercio online uruguayo cerró 2025 en $104.830 millones, un 34% más que en 2024, y 7 de cada 10 adultos compraron algo por internet (CEDU y Exante). 9 de cada 10 personas que compran por internet intentaron hacerlo desde el celular, así que lo único no negociable es que todo se vea perfecto ahí. Dos datos más que importan para tu tienda. Uno: de lo que se paga online con tarjeta o dinero electrónico, el 69% va con tarjeta de crédito. Ese informe no mide las transferencias, así que no dice cuánta gente prefiere transferir; sí dice que la tarjeta de crédito es el medio electrónico que más se usa. Si aceptás tarjeta, decilo. Dos: el ticket promedio ronda los $1.200, justo donde están tus tops.'

// ─── Fotos de producto (investigado agosto 2026) ──────────────
// La palanca de conversión más grande que queda sin usar, y la única que se
// puede mover sin comprar nada: se hace con el teléfono y una ventana.

export const FOTOS_INTRO =
  'Vender ropa online es vender una foto. Y en crochet hay un problema puntual: lo que justifica el precio es la TEXTURA — el relieve del punto — y la textura es exactamente lo que desaparece si la luz está mal. Esto no necesita comprar nada: se resuelve con el teléfono, una ventana y saber de qué lado pararse.'

export const FOTOS_LUZ = [
  {
    title: '⚠️ Ojo con las guías de internet: acá la ventana buena es la del SUR',
    body: 'Todas las guías de fotografía dicen "usá la ventana que da al norte". Están escritas en el hemisferio norte. Acá es al revés: en Montevideo el sol pasa por el norte, así que la ventana norte te da sol directo (dura, quema el brillo de la lana) y la que da luz pareja todo el día es la SUR. Si tu taller solo tiene ventana al norte, colgá una cortina fina o una sábana blanca y listo — eso difunde el sol y queda igual de bien.',
  },
  {
    title: 'La regla que hace toda la diferencia: la luz tiene que venir de costado',
    body: 'Poné la prenda AL LADO de la ventana, no de frente. Cuando la luz cruza en diagonal (más o menos a 45°), cada punto proyecta su micro-sombra y el relieve aparece. De frente, o peor con flash, el tejido se aplana y parece estampado. Es el mismo principio que usan en los museos para leer el relieve de una superficie. Si de todo esto hacés una sola cosa, que sea esta.',
  },
  {
    title: 'Tres fotos distintas del mismo lugar, girando la prenda',
    body: 'Sin mover nada: de espaldas a la ventana sale la foto de color fiel; con la prenda al costado sale la de textura; a contraluz sale la de clima (linda, pero pierde detalle). Mejor momento: primera hora de la mañana, última de la tarde, o cualquier día nublado — el nublado es un difusor gratis del tamaño del cielo.',
  },
  {
    title: 'El color mal sacado es el error más caro que existe en tu negocio',
    body: 'Casi la mitad de las devoluciones del comercio online son por talle, calce o color. Vos no tenés devoluciones fáciles: una prenda a medida en el color equivocado son semanas de trabajo perdidas. Dos reglas duras: nunca mezcles luz de ventana con lámpara amarilla en la misma foto (queda un tono imposible de corregir), y no le subas la saturación a la lana al editar.',
  },
]

export const FOTOS_ORDEN = [
  { step: 'La principal: puesta, cuerpo entero', detail: 'Es la miniatura que se ve en la grilla y en Google. La prenda en un cuerpo real le gana al flat-lay y al maniquí — el maniquí es lo peor de los dos mundos: ni muestra la caída real ni transmite calidez. Si no hay modelo, vos con trípode y temporizador: cámara un poquito arriba de los ojos, hombros abajo, y algo en las manos (un mate, un ovillo) para no quedar tiesa.' },
  { step: 'El detalle del punto, con luz de costado', detail: 'Cerca, bien cerca. Esta es la foto que justifica el precio y la que nadie más está haciendo bien en Uruguay.' },
  { step: 'La espalda', detail: 'La pregunta silenciosa de toda compra de ropa online.' },
  { step: 'En uso, contexto real', detail: 'Con qué se combina, en qué momento se usa. Es la que ayuda a imaginársela puesta.' },
  { step: 'Referencia de tamaño o medidas', detail: 'Un objeto conocido al lado, o la foto de la tabla de medidas. Cierra la duda del talle antes de que tenga que preguntarla.' },
]

export const FOTOS_ERRORES = [
  'Flash directo: aplana el punto y quema el brillo de la fibra. Nunca.',
  'La prenda hecha un bollo o doblada sobre sí misma: escondés tu propio trabajo.',
  'Fondo con textura o estampado: compite con el tejido y gana el fondo. Pared lisa clara o tela lisa.',
  'Mezclar luz de ventana con lámpara: el tono queda irrecuperable.',
  'Sobreeditar: filtros, viñetas y saturación de más. Además de falsear el color, es una de las señales que hacen que un sitio parezca genérico.',
]

export const FOTOS_VIDEO =
  'Cinco segundos girando sobre el eje contestan la pregunta que ninguna foto contesta: ¿pesa? ¿pica? ¿cae bien o queda tieso? Ese mismo clip te sirve dos veces — va en la ficha del producto Y es el arranque del reel. Se filma una vez.'

export const FOTOS_EDICION =
  'Con Snapseed (gratis, sin anuncios ni compras) alcanza y sobra. Tres pasos y nada más: balance de blancos → exposición → un toque de nitidez solo en la zona del punto. El cuello de botella nunca es la app ni la cámara: es de qué lado entra la luz.'

/**
 * El informe completo, palabra por palabra, con todas las fuentes y los
 * avisos de ⚠️ (fuentes de agencia/vendor vs. papers revisados por pares).
 * Todo lo de arriba es la traducción en criollo de esto — este es el
 * original, para copiarlo y guardarlo o mandarlo a quien quieras.
 */
export const NOVEDADES_INFORME_COMPLETO = `Segundo briefing de investigación — Dahila Crochet

Nota de método: marco con ⚠️ las fuentes que son blogs de agencia, vendors o encuestas de opinión con interés comercial en el dato. Las afirmaciones sin marca vienen de papers revisados por pares, documentación oficial de plataforma o datos primarios (SEC, Pew).

1. Libros y frameworks canónicos: qué sigue vigente en 2026

1.1 — Sharp/Ehrenberg-Bass sigue siendo el consenso empírico, pero sus leyes se derivaron de FMCG masivo y la crítica seria es justamente sobre negocios chicos.
La ley de Double Jeopardy (las marcas chicas tienen menos compradores y levemente menos lealtad) fue formalizada por Ehrenberg, Goodhardt y Barwise (1990) y replicada cientos de veces; una revisión de 2017 confirmó que el patrón sigue sosteniéndose empíricamente (Australasian Marketing Journal / ScienceDirect). La crítica más citada es la de Mark Ritson: las generalizaciones de Sharp asumen alcance masivo pagado, y no contemplan ni al emprendedor chico ni a categorías donde el consumidor prioriza exclusividad y artesanía (Marketing Week).
→ Dahila: el mecanismo es correcto (crecés sumando compradoras nuevas, no exprimiendo a las que ya te compraron: nada de programas de fidelidad), pero la receta de Sharp —"always-on reach"— no está disponible con presupuesto cero. Lo transportable son los distinctive assets y los CEPs (abajo), no la publicidad continua.

1.2 — La parte de Sharp que sí es gratis: Category Entry Points (Romaniuk & Sharp, How Brands Grow Part 2, 2015).
Los CEPs son las situaciones/necesidades que hacen que alguien piense en la categoría; la disponibilidad mental se construye vinculando la marca a la mayor cantidad posible de esas señales. El framework operativo son las 7W: Why, When, Where, While, With whom, With what, How feeling (Jenni Romaniuk, Ehrenberg-Bass).
→ Dahila: no pelear por "crochet". Ocupar momentos: regalo para alguien que ya tiene todo, algo para un casamiento de día, un abrigo que no va a tener nadie más, ropa para un cuerpo que no entra en S/M/L. Cada CEP es una colección, una URL y un ángulo de contenido. Es la intervención de branding más barata que existe.

1.3 — El debate Sharp vs. Binet & Field (60:40) es irrelevante para Dahila y conviene saberlo para no perder tiempo.
Sharp calificó la regla 60:40 de "terrible y engañosa" por basarse en data de premios; Binet & Field la derivaron del IPA Databank (Mi3, Marketing Week). Ambos lados discuten cómo repartir presupuesto publicitario.
→ Dahila: sin presupuesto no hay split que hacer. Ignorar el debate entero. Lo único utilizable de ese cuerpo de trabajo es "consistencia en el tiempo" — usar los mismos assets visuales siempre, no rediseñar cada temporada.

1.4 — Berger (STEPPS) sigue vigente, y su dato más útil es el menos citado: ~90% del boca a boca ocurre offline.
El framework de Contagious (2013) —Social Currency, Triggers, Emotion, Public, Practical Value, Stories— sigue siendo estándar (Jonah Berger, Knowledge@Wharton). El dato de que 9 de cada 10 conversaciones de marca son cara a cara o por teléfono viene de TalkTrack de Keller Fay (las cifras verificables son 90-91%, no el 93% que circula) ⚠️ limitación real: autorreporte a 24 horas.
→ Dahila: la prenda es el medio. La etiqueta DAHILA visible, la tarjeta en el paquete y —clave de "Social Currency"— darle a la compradora una frase que la haga quedar bien al repetirla ("me la hicieron a mi medida en Montevideo"). Eso es más rentable que cualquier táctica de shares.

1.5 — El hallazgo más accionable de todo el cuerpo de Berger no es Contagious sino su paper de lenguaje concreto.
Packard & Berger, "How Concrete Language Shapes Customer Satisfaction", Journal of Consumer Research 47(5), 2020 — cinco estudios, incluyendo análisis de texto de más de 1.000 interacciones reales cliente-empleado en dos contextos de campo. El lenguaje concreto (tangible, específico, imaginable) aumenta satisfacción, disposición a comprar y monto comprado (JCR, Penn Today).
→ Dahila: este es el antídoto directo contra el olor a plantilla. "Prendas únicas hechas con amor" → "37 horas de tejido, 640 g de lana merino, punto piña, medido sobre tu espalda". Es gratis y toca conversión, percepción de oficio y SEO al mismo tiempo.

1.6 — StoryBrand (Miller): útil como checklist de claridad, peligroso como plantilla de copy.
El SB7 sigue comercialmente vivo (edición 2.0, 2026), pero la crítica más consistente es que es formulaico por diseño y que aplicado literalmente produce sitios que suenan todos iguales; también se le señala que el libro funciona como embudo hacia sus propios productos (StoryBrand, reseña crítica ⚠️).
→ Dahila: quedate con la estructura (¿queda claro qué vendo, qué gana ella, cuáles son los 3 pasos?) y tirá el vocabulario. El "cliente-héroe / marca-guía" sí aplica y resuelve una tensión real: Anush no es la protagonista de la página de producto, es quien hace posible una prenda que no existe en ninguna vidriera. Si el sitio suena a SB7 aplicado al pie de la letra, cae exactamente en lo que querés evitar.

1.7 — Sutherland (Alchemy): úsalo como generador de hipótesis, no como evidencia. El concepto rescatable es señalización costosa.
Sutherland es ensayístico y anecdótico, no experimental — la crítica justa es esa. Pero su idea central es sólida y está bien fundada en teoría de señales: la publicidad funciona en parte porque es cara de fingir, y por lo tanto es garantía creíble de que la empresa cree en su propio futuro (EconTalk, síntesis sobre costly signalling ⚠️).
→ Dahila: un compromiso caro de falsificar vale más que diez adjetivos. Ejemplos concretos: una fecha de entrega comprometida por escrito, una garantía de arreglo de por vida, el video del proceso, la cara y el nombre de la persona. Todos son gratis en dinero y caros en compromiso — que es exactamente lo que los hace señales.

2. Por qué se paga premium por lo artesanal — y cómo decirlo sin sonar pretencioso

2.1 — El "handmade effect" está medido y su mecanismo NO es la calidad: es el amor percibido.
Fuchs, Schreier & van Osselaer, "The Handmade Effect: What's Love Got to Do with It?", Journal of Marketing 79(2), 2015, pp. 98-110 — cuatro estudios con medición de disposición a pagar incentivo-compatible. Declarar que un producto es hecho a mano aumenta su atractivo, y el efecto está mediado en buena parte por la percepción de que el producto "contiene amor" simbólicamente (Journal of Marketing, PDF del paper).
→ Dahila: el argumento ganador no es "es de mejor calidad que lo industrial" (discutible y fácil de refutar), es "alguien lo hizo para vos". También explica por qué regalo debería ser el CEP prioritario: es donde el mecanismo del paper opera con máxima fuerza.

2.2 — Effort heuristic: el mismo objeto vale más si se sabe cuánto costó hacerlo.
Kruger, Wirtz, Van Boven & Altermatt (Journal of Experimental Social Psychology, 2004): cuando se le dice a la gente que un ítem llevó más tiempo y trabajo, lo califica como de mayor calidad y le asigna mayor valor monetario, aunque el objeto sea idéntico (paper).
→ Dahila: publicar horas reales por prenda, sin redondear ni inflar. "37 h" es más creíble que "muchas horas de trabajo" — y por 1.5 se conecta con la satisfacción medida del lenguaje concreto.

2.3 — En 2025-2026 el effort heuristic se volvió más valioso, no menos, por contraste con lo generado por IA.
Un estudio sobre arte generado por IA concluye que la penalización de precio se explica principalmente por el heurístico de esfuerzo (esfuerzo de producción percibido como bajo), no por objeciones esencialistas sobre "el alma del arte" — y que revelar explícitamente el trabajo humano en el proceso reduce significativamente ese descuento (resumen del estudio). En paralelo, el trabajo creativo humano se está reposicionando como bien de lujo (The Conversation).
→ Dahila: el momento juega a favor. Cuanto más contenido genérico e industrial inunda todo, más rinde la prueba de mano humana. Pero tiene que ser prueba, no declaración.

2.4 — Qué señal de esfuerzo funciona mejor: video de proceso > tiempo documentado > explicación escrita >> imperfecciones.
Preprint "Struggle Premium: How Human Effort and Imperfection Drive Perceived Value in the Age of AI" (Sultana et al., 2026, arXiv): videos de proceso fueron la señal más influyente (23,1%), documentación de tiempo segunda (15,6%), explicación escrita tercera (15,0%), y las imperfecciones tuvieron impacto mínimo. ~73% dijo estar dispuesto a pagar premium por trabajo humano a calidad estética comparable.
⚠️ Advertencia fuerte: n=70 estudiantes universitarios de un solo país, preprint sin revisión por pares. Tomarlo como hipótesis, no como hecho. Dicho eso, el ordenamiento es consistente con la literatura de effort heuristic.
→ Dahila: priorizar video de proceso en la PDP sobre párrafos de storytelling. Y descartar "cada pieza es única, con sus pequeñas irregularidades" — es la señal más débil de todas y encima se lee como excusa preventiva por defectos, no como valor.

2.5 — La biografía de underdog funciona, y está medida — pero por identificación, no por lástima.
Paharia, Keinan, Avery & Schor, "The Underdog Effect: The Marketing of Disadvantage and Determination through Brand Biography", Journal of Consumer Research 37(5), 2011, pp. 775-790. Dos dimensiones necesarias: desventaja externa + pasión y determinación. Aumenta intención de compra, elección real y lealtad. Está mediado por la identificación del consumidor con la marca, es más fuerte en quienes se auto-perciben como underdogs, más fuerte cuando compran para sí mismos que para otros, y más fuerte en culturas donde la narrativa de underdog es parte de la identidad nacional (JCR, HBS).
→ Dahila: "una persona en Uruguay, tejiendo a mano, contra ropa importada en serie" es literalmente el arquetipo, y Uruguay es un mercado culturalmente receptivo a esa narrativa. La clave del paper es que opera por identificación, no por compasión: nunca "ayudame a", siempre "esto es lo que hago y así lo hago".

2.6 — El límite: la autenticidad reclamada activamente genera sospecha, y "artesanal" ya está diluido por craft-washing.
Södergren, "Brand authenticity: 25 years of research", International Journal of Consumer Studies, 2021 (Wiley): crear autenticidad es paradójico — cuando se la reclama explícitamente, aparece la sospecha inmediata. La confusión del término "craft" es la causa principal del craftwashing, perjudicial para artesanos y consumidores (The Conversation). En "purpose-washing", la información contradictoria dispara juicios morales severos porque se atribuyen motivos interesados.
→ Dahila: regla operativa concreta — si una marca industrial grande podría copiar la frase textual sin mentir demasiado, la frase no sirve. "Auténtico", "artesanal", "con amor", "hecho con pasión" fallan el test. "44 horas", "lana de X", "medido sobre tu espalda el 3 de agosto", "entrego el 12 de septiembre" lo pasan.

2.7 — "A medida" sube la disposición a pagar, pero por auto-expresión y unicidad, no por "más opciones".
La literatura de mass customization reporta ~73% dispuestos a pagar premium, promedio ~+29% (revisión), con las dimensiones de valor siendo utilitaria, diferenciación interpersonal y auto-expresión. Caveat importante y honesto: hay trabajo reciente que encuentra que la customización mejora la experiencia y la intención de recomendar pero no siempre la disposición a pagar (ScienceDirect, 2025).
→ Dahila: "a medida" hay que traducirlo en beneficios de ajuste y auto-expresión, no en un menú de opciones. El argumento más fuerte y más concreto es el ajuste al cuerpo real frente al talle estándar importado — y ese argumento tiene una audiencia específica y desatendida.

3. SEO en 2026: qué cambió con la IA y qué importa para un sitio chico

3.1 — El dato duro de la caída de clics, con fuente primaria.
Pew Research Center (julio 2025), 900 adultos de EE.UU. con actividad de navegación compartida, 68.879 búsquedas únicas en marzo 2025, 12.593 con AI summary: 8% de clics a resultados tradicionales cuando había resumen de IA vs. 15% cuando no; sólo 1% clickeó links dentro del resumen; 18% de las búsquedas generaron resumen; el usuario terminó la sesión en 26% de las páginas con resumen vs. 16% sin (Pew).

3.2 — El detalle de Pew que casi nadie cita y que cambia toda la estrategia para Dahila: los AI Overviews aparecen según el largo de la consulta.
En el mismo estudio: consultas de 10+ palabras dispararon resumen en 53% de los casos, preguntas en 60%, y consultas de 1-2 palabras sólo en 8%.
→ Dahila: las consultas que importan ("chaleco crochet uruguay", "dahila", "poncho tejido montevideo") son cortas y transaccionales — casi no disparan AI Overview. La sangría de tráfico por IA golpea al contenido informacional genérico. Consecuencia directa: no montar un blog de tips de crochet. Invertir en páginas de producto y de colección.

3.3 — La magnitud se confirma en 2026 con datos de industria, con direcciones consistentes.
Ahrefs (feb 2026) reporta -58% de CTR para el resultado #1 cuando hay AI Overview; Seer Interactive, sobre 53 marcas, 5,47M de consultas y 2,43 mil millones de impresiones (ene 2025 – feb 2026), midió CTR orgánico de 0,61% con AIO vs 1,62% sin (-61%); la tasa zero-click ronda 65% (Search Engine Journal, Search Engine Land) ⚠️ metodologías propietarias, pero coinciden en dirección y orden de magnitud con Pew.

3.4 — Google dice oficialmente que GEO/AEO no son disciplinas separadas. No contrates nada que te venda lo contrario.
Documentación oficial: "There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary" y "You don't need to create new machine readable files, AI text files, or markup to appear in these features" (Google Search Central). La guía nueva de Google llama a AEO y GEO "still SEO" (SEJ).
→ Dahila: cero llms.txt, cero schema "para IA", cero consultoría de GEO.

3.5 — El contrapunto académico sí tiene algo útil, y coincide con la sección 2.
"GEO: Generative Engine Optimization" (Aggarwal, Murahari, Rajpurohit, Kalyan, Narasimhan & Deshpande, ACM SIGKDD 2024, arXiv:2311.09735): sobre GEO-bench (~10.000 consultas, 9 datasets), ciertas ediciones de contenido aumentaron la visibilidad en respuestas generativas entre 22% y 41%. Las tácticas ganadoras fueron agregar estadísticas, agregar citas y mejorar fluidez — no keyword stuffing.
→ Dahila: escribir con datos verificables (horas, gramaje, medidas, plazos, origen del hilado) es simultáneamente lo que pide el effort heuristic, lo que mide Packard & Berger, y lo que hace un texto citable por sistemas generativos. Un solo cambio de copy sirve para tres cosas distintas.

3.6 — Las Quality Rater Guidelines vigentes: versión del 11 de septiembre de 2025, 182 páginas.
E-E-A-T con Trust como base; cambios de 2025: reglas sobre contenido IA, tres categorías de spam, y la ampliación de "YMYL Society" a "YMYL Government, Civics & Society" (análisis de las 182 páginas ⚠️). Importante: E-E-A-T no es un factor de ranking, es un marco de evaluación humana — no existe un "score de E-E-A-T".
→ Dahila: lo accionable es el who/how/why del contenido — autoría real, cara, nombre, ubicación, años de oficio, datos de contacto verificables. Esto le sirve al rater, a la conversión, y resuelve el problema ya identificado de "prueba de legitimidad antes de WhatsApp" desde otro ángulo: la legitimidad también tiene que ser legible para Google.

3.7 — Datos estructurados: no hacen falta para IA, sí para todo lo demás — y ahora también para la commerce agéntica.
Product + Offer con name, image, price, priceCurrency y availability siguen siendo requisito para merchant listings y rich results (Google Merchant Center Help). Y el contexto nuevo: OpenAI+Stripe lanzaron el Agentic Commerce Protocol y Google+Shopify respondieron con el Universal Commerce Protocol en enero de 2026 — ambos se alimentan de feeds de producto estructurados ⚠️ (resumen).
→ Dahila: Product/Offer bien puesto es barato, verificable en Rich Results Test, y es el mismo formato que van a consumir los agentes de compra. Es infraestructura, no táctica.

3.8 — SEO local: un negocio desde casa SÍ califica para Google Business Profile si hay contacto en persona.
Guía oficial: los negocios online-only sin contacto presencial no pueden crear perfil; un negocio desde casa sí puede, ocultando la dirección, si atiende clientes en su ubicación o viaja hacia ellos (Google Business Profile Help, Whitespark ⚠️). En la encuesta anual de factores locales, las señales de GBP pesan ~32% y la categoría primaria es el factor #1 del Local Pack ⚠️ (encuesta de opinión a SEOs, no evidencia causal).
→ Dahila: si Anush toma medidas en persona o entrega en mano en Montevideo, califica. GBP + reseñas es probablemente el activo de descubrimiento local más barato disponible, y ninguna competidora de nicho lo tiene bien hecho.

3.9 — Hay un hueco estructural en español rioplatense, tanto en búsqueda clásica como en respuestas de IA.
El español representa ~4,6% de las páginas web frente a 40,6% del inglés; los bots de indexación de OpenAI visitan las páginas en inglés con mucha más frecuencia que las variantes localizadas, sub-muestreando sistemáticamente el contenido en español; y las respuestas en español tienden a ensamblarse desde fuentes que no son locales — con precios de otro mercado y referencias de otro país (Search Engine Land, "el problema del español global" ⚠️ análisis de industria, pero con datos de corpus verificables).
→ Dahila: escribir en es-UY real (voseo, "buzo", "chaleco", "pollera", precios en pesos, referencias a barrios de Montevideo) es una ventaja de disponibilidad, no una decisión de marca. Hay poquísima competencia en ese corpus.

4. Llegar a la gente con presupuesto cero

4.1 — Pinterest: la plataforma está creciendo y funciona como buscador, no como red social. Datos primarios.
Comunicados oficiales: Q1 2026 — 631M de usuarios activos mensuales (+11% interanual), ingresos +18%; Q2 2026 — 640M MAU (+11%), ingresos +18% (Pinterest Q2 2026, Businesswire, Q1 2026, SEC). Los vendedores de handmade citan consistentemente a Pinterest como fuente principal de tráfico referido, y los pines siguen generando clics meses o años después de publicados ⚠️ (Craftybase). ⚠️ Las cifras de "5,6x purchase intent index" o "+67% revenue" vienen de material promocional — descartarlas.
→ Dahila: los 34 productos ya son contenido de Pinterest. Cada foto existente = un pin con link a la PDP. Costo de producción marginal cero, y vida útil de meses frente a las 48 horas de un post de Instagram. Es el mejor ratio esfuerzo/retorno de esta sección.

4.2 — Reddit importa por una razón nueva: es la fuente más citada por los sistemas de IA.
Análisis de decenas de millones de citas sitúan a Reddit como el dominio #1 citado en ChatGPT, Gemini, Perplexity y AI Overviews, con AI Overviews citándolo en ~21% de los resultados ⚠️ (fuentes de industria; direccionalmente muy consistente entre proveedores distintos). La regla operativa que se repite en todas las guías: ~90% valor / 10% promoción, 20-30 comentarios útiles antes de mencionar nada propio, 1-2 semanas de observación por comunidad (guía ⚠️).
→ Dahila: r/crochet y r/uruguay. No para vender: para existir en el corpus del que los LLM extraen respuestas. Una respuesta genuinamente útil sobre cómo se toman medidas para una prenda a medida vale más que cualquier link.

4.3 — WhatsApp ya no es sólo el checkout: es el canal propio con mejor read rate disponible, y es gratis hasta 256 contactos.
LatAm es el benchmark global de commerce por WhatsApp — Brasil, México, Colombia y Argentina lo hicieron años antes que Europa. Read rates medidos alrededor de 60-68% (Braze reporta 68% sobre su base) ⚠️, muy por encima de email. La app gratuita permite listas de difusión a hasta 256 contactos guardados. Distinción importante: Channels es un feed (sin opt-in, sin segmentación, sin respuesta 1:1); broadcasts es lo que convierte (benchmarks ⚠️, guía de límites ⚠️).
→ Dahila: ya tenés el número de teléfono de absolutamente todas las personas que compraron alguna vez, porque el checkout pasa por ahí. Ese es el activo más subexplotado del negocio y no cuesta nada activarlo.

4.4 — Email sigue siendo rentable, pero con dos correcciones honestas.
La cifra de $36-45 de retorno por $1 ⚠️ viene de encuestas de autorreporte tipo DMA/Litmus, sin grupo de control — es débil metodológicamente y hay que citarla con pinzas. Lo que sí está bien sostenido: los flujos automatizados generan mucho más que los envíos masivos, las marcas D2C en crecimiento reportan 25-40% de ingresos vía email, y las tasas de apertura están infladas 15-20% por Apple Mail Privacy Protection — hay que medir clics e ingresos, no aperturas (recopilación de datos ⚠️).
→ Dahila: con checkout por WhatsApp, email es secundario. Pero un solo flujo automatizado —aviso cuando se abre la cola de producción— vale más que un newsletter mensual que nadie va a escribir con constancia.

4.5 — Micro/nano influencers: los números están inflados por quien los publica, pero la lógica se sostiene.
Se reportan engagement de 4% en nano vs 1,3% en macro, conversión 7% vs 3%, y costo por interacción ~2,5x menor ⚠️ (todos estos datos vienen de plataformas de influencer marketing, con sesgo comercial evidente — tratarlos como orientativos, no como medición). El punto defendible con presupuesto cero no es el tier sino que el intercambio sea producto por contenido y que la persona ya sea usuaria real de la categoría.
→ Dahila: 5 mujeres reales en Montevideo con 2-10k seguidoras, cada una con una prenda medida a su cuerpo, documentando el proceso desde la toma de medidas. Resuelve dos cosas de una: alcance y el UGC que hoy falta en el sitio. (Nota del 22/08: con el orgánico actual funcionando tan bien, esto queda en pausa por ahora — ver más abajo.)

4.6 — Etsy: DESCARTADO por decisión del usuario (22/08) — ni siquiera como vidriera internacional secundaria.

4.7 — El recordatorio incómodo: ~90% del boca a boca de marca es offline.
TalkTrack de Keller Fay, sobre 32.000+ participantes: la enorme mayoría de la información sobre marcas llega por conversación cara a cara o telefónica ⚠️ (autorreporte a 24h).
→ Dahila: para un negocio local esto reordena prioridades enteras. Ferias, entrega en mano, la etiqueta cosida, la tarjeta en el paquete y la frase repetible pesan más, en volumen absoluto de conversaciones, que la estrategia de contenidos.

4.8 — El contexto uruguayo confirma que WhatsApp-first no es una limitación, es lo nativo.
CEDU: el e-commerce uruguayo superó los $100.000 millones en 2025 con 32% de crecimiento; la base de compradores llegó al 70% de la población (~1.890.000 personas); 64% del volumen viene de móvil; y comprar productos y servicios es el tercer uso más frecuente de internet entre uruguayos, detrás de WhatsApp y redes sociales (CEDU, informe e-País ICEX). Sólo 12% compra más de una vez por mes — el mercado tiene volumen pero baja frecuencia.
→ Dahila: el checkout por WhatsApp está alineado con el comportamiento real del mercado, no en contra. Lo no negociable es que el sitio sea impecable en móvil (64% del volumen) — y la baja frecuencia de compra refuerza el punto de Sharp: crecés sumando compradoras nuevas, no esperando recompra.

Top 5 priorizado (complementario a las 5 prioridades de la ronda anterior)

1. Reescribir todo el copy abstracto en números y sustantivos concretos.
2. Un video de proceso de 20-40 segundos por familia de producto, embebido en la PDP.
3. Definir 4-6 Category Entry Points y darle a cada uno su propia colección/URL en es-UY.
4. Convertir WhatsApp de checkout en audiencia, y abrir Google Business Profile.
5. Distribuir el catálogo existente en Pinterest.

Tres cosas a NO hacer, que la investigación desaconseja explícitamente:
- No montar un blog de tips de crochet esperando tráfico.
- No escribir nunca "auténtico", "artesanal", "con amor" ni "con pasión".
- No contratar nada que se venda como "GEO" o "AEO" ni instalar llms.txt.`

export const NOVEDADES_CEPS = [
  { title: 'Un regalo para alguien que ya tiene de todo', body: 'La persona difícil de regalarle. Nadie más le va a traer algo hecho a mano y a su medida.' },
  { title: 'Un look para un casamiento o evento de día', body: 'Buscan algo que nadie más tenga puesto — es el momento donde "pieza única" pesa más.' },
  { title: 'Una prenda que no va a tener nadie más', body: 'Para quien ya sabe que quiere algo distinto a lo que se compra en cadena.' },
  { title: 'Ropa para un cuerpo que no entra en el talle estándar', body: 'Las tiendas de S/M/L la dejan afuera. Es el público más desatendido de esta lista y el que más agradece que exista Dahila.' },
]

export const NOVEDADES_SEO = [
  {
    title: 'La gente busca el nombre mal escrito — ya está resuelto en el sitio',
    body: 'Dahila, Dahilia, Dalia, Dailhia… es normal que un nombre nuevo se busque con variantes. El sitio ya le decía a Google que "Dalia" y "Dahlia" son formas alternativas de la marca; el 22/08 sumamos también "Dahilia" y "Dailhia" a esa misma lista, así que si alguien busca cualquiera de esas variantes, ayuda a que igual aparezcas vos.',
  },
  {
    title: '¿Conviene meter palabras en inglés para que la IA te encuentre?',
    body: 'No como texto visible — escribir en "uruguayo" de verdad (voseo, precios en pesos, buzo/pollera/chaleco) es una ventaja: hay muy poco contenido así en español y eso te hace más fácil de encontrar, no más difícil. Lo que sí es útil y ya está: los datos técnicos de cada producto (precio, si hay stock) están en un formato que cualquier sistema — en cualquier idioma — puede leer sin que el texto esté en inglés. No hace falta traducir nada.',
  },
]

/** Cómo pasar el catálogo a Pinterest — paso a paso, para hacerlo una tarde. */
export const NOVEDADES_PINTEREST_HOWTO = [
  { step: 'Crear la cuenta', detail: 'pinterest.com/business/create — gratis, cuenta de negocio (no la personal).' },
  { step: 'Reclamar dahila.uy', detail: 'Configuración → "Reclamar sitio web". Pinterest da un código para pegar — pedíselo a Matías, es 5 minutos de su lado.' },
  { step: 'Crear 4-6 tableros', detail: 'Uno por tipo de momento, no por categoría de producto: "Regalos tejidos a mano", "Para el casamiento", "Piezas únicas", etc. — los mismos momentos de la sección de arriba.' },
  { step: 'Pinear el catálogo actual', detail: 'Ya no hace falta bajar y subir cada foto a mano: el sitio tiene un botón "Guardar en Pinterest" en cada producto (se agregó el 22/08) — con eso alcanza, un click por producto.' },
  { step: 'De acá en más', detail: 'Cada vez que subís un producto nuevo, ese botón ya está — pinealo esa misma semana, mientras la foto es nueva.' },
]

/** Difusión de WhatsApp — el paso a paso operativo (la app, no el sitio). */
export const NOVEDADES_WHATSAPP_HOWTO = [
  { step: 'Abrí WhatsApp Business en el celular', detail: 'Los 3 puntitos arriba a la derecha → "Difusión nueva" (algunos celulares la llaman "Lista de difusión").' },
  { step: 'Elegí los contactos', detail: 'Hasta 256. OJO: solo le llega a quien YA te tiene guardada en sus contactos — así funciona la difusión de WhatsApp, no hay forma de saltear eso.' },
  { step: 'Por eso, pedí que te guarden', detail: 'Al cerrar cada venta: "guardame el contacto así te aviso cuando abra la próxima tanda" — es el paso que hace que la lista sirva.' },
  { step: 'Mandá el mensaje cuando haya novedad', detail: 'Un drop, la cola que se abre de nuevo, una colección nueva. Cada persona lo recibe como un mensaje tuyo normal, no como un grupo — nadie ve a los demás destinatarios.' },
]

export const NOVEDADES_MOMENTUM =
  'Instagram y TikTok ya están funcionando mejor que el promedio — no hace falta salir a buscar quién te dé alcance todavía. Con eso funcionando, seguí haciendo más de lo mismo (mismo formato, mismo tipo de video) antes que sumar tácticas nuevas de alcance pago o colaboraciones. Cuando ese crecimiento orgánico se empiece a enfriar es el momento de mirar micro-influencers de nicho — no antes.'

export const NOVEDADES_BOCA_A_BOCA =
  'Casi todo lo que se dice de una marca (9 de cada 10 conversaciones, según la data disponible) pasa hablando, no en redes — y vos ya hacés lo más difícil de bien: packaging, tarjeta a mano, el programa AMIGA de la pestaña Clientas. Lo único que falta es una frase fácil de repetir: que la tarjeta o la etiqueta diga algo como "Tejido a mano para vos, en Montevideo — dahila.uy", no solo el logo. Así, cuando alguien le pregunta a tu clienta "¿de dónde es eso?", la respuesta ya está en la prenda y no depende de que ella se acuerde de recomendarte.'
