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

export const ULTIMA_REVISION = 'julio 2026'

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
  { name: 'Ropa de máquina', detail: 'Indian, Zara, Mango', min: 899, max: 3500 },
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
    price: 'Cardigan $1.399',
    lesson: 'Tu cardigan tejido a mano costaba MENOS que uno de máquina. Esa era la anomalía a corregir.',
  },
  {
    name: 'Etsy — handmade internacional',
    price: 'Tops $1.200–4.000',
    lesson: 'Incluso con los precios a 12 meses, cada pieza tuya cuesta la mitad o menos que allá.',
  },
  {
    name: 'Manos del Uruguay',
    price: '$4.000–10.000+',
    lesson: '"Hecho a mano en Uruguay" viste a marcas de lujo en Nueva York. El prestigio es real — usalo.',
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
  'La regla es simple: mirá cuánto te queda por hora de trabajo en cada pieza (precio menos materiales, dividido las horas). Los bolsos te pagaban $67–104 la hora; los cardigans y sets, $34–44 — la mitad. Por eso suben primero las piezas de muchas horas: no porque "afuera cueste más", sino porque eran las que peor te pagaban a VOS.'

export const PRICING_RULES = [
  {
    title: 'Nunca ser la marca cara',
    body: 'El techo es la ropa de máquina; jamás los precios de Etsy. Tu lugar: "hecho a mano al precio de casi-máquina".',
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
    title: 'La entrada queda barata a propósito',
    body: 'Bandana y mini bufandas no se tocan: son la puerta de entrada para probar la marca y hacer regalos.',
  },
]

/** Referencias del valor de una hora de trabajo en Uruguay (para decidir con contexto). */
export const HOUR_REFS = [
  { value: '$110', label: 'salario mínimo por hora en Uruguay', sub: 'el piso legal de referencia' },
  { value: '$150–250', label: 'tarifa razonable para pagarle a una tejedora', sub: 'por hora estándar del modelo, a convenir y subir con la experiencia' },
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
    body: 'Tops y bolsos suben hacia la meta de 12 meses. La colección nueva es la razón del precio nuevo.',
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
  { id: 'vp-bundle', label: 'Combos "completá el look" + envío gratis desde $1.400', detail: 'Sube el ticket sin bajar el precio de nada.' },
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
    body: 'Precio por pieza = horas estándar del modelo × tarifa por hora acordada (referencia: $150–250/h). Se pacta ANTES de tejer y se paga al aprobar la pieza. La lana la ponés vos: controlás calidad y color.',
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
    body: 'Primer error: se corrige juntas con la ficha. Si se repite: piezas más simples por un tiempo. ¿Es prolija pero lenta? Dale modelos cortos, no la apures. ¿Rápida y prolija? Dale más y mejor.',
  },
  {
    title: 'Empezá con UNA',
    body: 'Una sola tejedora, para bolsos y accesorios (donde los números ya cierran). Vos seguís con las piezas grandes. Sumás otra recién cuando la primera es constante.',
  },
]

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
    'Clases particulares en Superprof Uruguay: $291–500 la hora.',
  ],
  suggestion:
    'Sugerencia: ciclo mensual de 4 encuentros de 2 h en grupo de 4–6, entre $1.600 y $2.200 por persona con materiales incluidos. Un grupo de 5 deja $8.000–11.000 por mes por 8 horas de trabajo — mejor que cualquier prenda. Validalo con tus costos de lana antes de publicar.',
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
    why: 'Es tu única fuente de tráfico hoy y donde vive tu categoría: el crochet se vende por los ojos. Todo lo demás depende de que acá entre gente.',
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
    channel: 'Pinterest',
    role: 'Tráfico que no caduca',
    why: 'La gente busca "top crochet" con ganas de comprar, y un pin trabaja meses (un reel, horas). Para crochet es oro y casi nadie lo usa en Uruguay.',
    action: 'Un pin por producto apuntando a su ficha. Una hora por semana alcanza.',
  },
  {
    rank: 5,
    channel: 'Google',
    role: 'Confianza y búsqueda local',
    why: '"Crochet Montevideo" te tiene que encontrar. Además el perfil de negocio da confianza cuando pedís seña por WhatsApp.',
    action: 'Crear el Perfil de Negocio de Google (gratis, 1 hora). Las descripciones de producto hacen el resto — el sitio ya está preparado.',
  },
  {
    rank: 6,
    channel: 'TikTok',
    role: 'Apuesta de alcance',
    why: 'Un video de proceso puede explotar y traerte el país entero — o nada. Como reutilizás los videos de Instagram, apostar cuesta cero.',
    action: 'Republicá tal cual los videos de proceso. Sin estrategia propia por ahora.',
  },
  {
    rank: 7,
    channel: 'Facebook',
    role: 'Presencia mínima',
    why: 'El público de regalo (madres, señoras) todavía está ahí, pero el retorno por hora invertida es el más bajo de la lista.',
    action: 'Página espejo de Instagram (se comparte solo). Nada más.',
  },
]

// ─── Para hacer (checklist persistente) ──────────────────────

export type ActionHorizon = 'ya' | 'mes' | 'trimestre'

export interface TodoAction extends ActionItem {
  horizon: ActionHorizon
}

export const NEXT_ACTIONS: TodoAction[] = [
  { id: 'descripciones', label: 'Escribir las descripciones de los 32 productos', detail: 'Material, medidas, horas de tejido, cuidado. Es la mejora que más ventas destraba: sin texto no hay conversión, ni Google, ni IA.', horizon: 'ya' },
  { id: 'packaging', label: 'Armar el packaging tipo regalo', detail: 'Papel de seda, bolsa kraft, tarjeta a mano. El aumento de precios ya está — esta es la mejora visible que lo acompaña.', horizon: 'ya' },
  { id: 'clase-piloto', label: 'Hacer la clase piloto', detail: '3–4 conocidas, 4 encuentros. El plan completo está en la pestaña Clases.', horizon: 'mes' },
  { id: 'difusion-wa', label: 'Armar la lista de difusión de WhatsApp', detail: 'Con clientas que ya compraron. Es el canal #1 para vender los drops.', horizon: 'mes' },
  { id: 'anunciar-tejedoras', label: 'Contar que buscás tejedoras', detail: 'Story fijada + link en bio a /tejedoras. La página y el aviso al mail ya funcionan solos.', horizon: 'mes' },
  { id: 'gbp', label: 'Crear el Perfil de Negocio de Google', detail: 'Gratis, ~1 hora. Confianza + aparecer en "crochet Montevideo".', horizon: 'mes' },
  { id: 'mercadopago', label: 'Usar links de pago de Mercado Pago con cuotas', detail: 'Se arma en 2 minutos al cerrar cada venta por WhatsApp. Las cuotas hacen fácil el precio nuevo.', horizon: 'mes' },
  { id: 'cupon-vip', label: 'Crear el primer cupón para la lista VIP', detail: 'Un código de bienvenida chico (ej. 10%) da una razón concreta para anotarse. Se crea en Cupones.', horizon: 'mes' },
  { id: 'drop-verano', label: "Preparar el drop Verano '26", detail: 'Fotos, colección, cupón y el paso a paso de la pestaña Drops. Lanzamiento: noviembre.', horizon: 'trimestre' },
  { id: 'dominio', label: 'Activar dahila.uy (¡ya está comprado!)', detail: 'Seguir el runbook del README: DNS en NetUY, dominio en Netlify, variable, redirect, emails desde send.dahila.uy y Search Console.', horizon: 'ya' },
  { id: 'numero-nuevo', label: 'Propagar el número nuevo (099 850 073) fuera del sitio', detail: 'La web ya lo usa. Falta donde el sitio no llega: la app de WhatsApp Business (transferir el número), el link de la bio de Instagram, Google Business Profile, y tarjetas o packaging impresos con el número viejo.', horizon: 'ya' },
  { id: 'precios-fase2', label: 'Segundo paso de precios', detail: 'Con el drop de verano, tops y bolsos suben hacia la meta de 12 meses (columna "12m" de la tabla).', horizon: 'trimestre' },
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
    title: 'Emails que caen en spam',
    severity: 'media',
    detail: 'El dominio de envío actual no coincide con la marca: algunos avisos pueden ir a spam.',
    mitigation: 'dahila.uy ya está comprado: al activar el envío desde send.dahila.uy (paso 5 del runbook) se arregla de raíz. Mientras: marcar "no es spam" y agendar el remitente.',
  },
]
