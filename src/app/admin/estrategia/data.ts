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
  'Es gratis y usa lo que el sitio ya tiene: aparecer con foto y precio en la pestaña Shopping de Google, en Google Imágenes y en Maps (si está atado al Perfil de Negocio) — más lugares donde te encuentra alguien que ya está por comprar. No reemplaza a Instagram ni es un chorro de ventas garantizado: es un canal extra, gratis, que se prepara una vez y queda funcionando solo. Google también tiene un sello "Pequeña empresa" que ayuda a diferenciarte de las tiendas grandes. Y si algún día se quiere invertir en Google Ads/Shopping, Merchant Center es el paso obligatorio previo — armarlo ahora no se pierde.'

export const MERCHANT_STEPS = [
  { step: 'Verificar el sitio en Search Console', detail: 'Si ya se hizo como parte de la migración a dahila.uy, este paso ya está — confirmar en search.google.com/search-console que la propiedad "Dominio: dahila.uy" existe y está verificada.' },
  { step: 'Crear la cuenta en Merchant Center', detail: 'Gratis, en business.google.com/merchant. Usar la misma cuenta de Google que Search Console.' },
  { step: 'Vincular Merchant Center con Search Console', detail: 'Se hace desde Configuración → Herramientas empresariales, en un par de clics una vez que ambas cuentas existen.' },
  { step: 'Activar "usar datos estructurados del sitio"', detail: 'En vez de subir un archivo de productos a mano, Merchant Center puede leer directo el precio/stock/marca que el sitio ya publica en cada ficha (Product schema) — cero trabajo técnico extra.' },
  { step: 'Activar "Listados gratuitos" para Uruguay', detail: 'Dentro de Merchant Center, en el programa de listados gratuitos, elegir Uruguay como país de venta.' },
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
  { id: 'descripciones', label: 'Escribir las descripciones de los 32 productos', detail: 'Material, medidas, horas de tejido, cuidado. Es la mejora que más ventas destraba: sin texto no hay conversión, ni Google, ni IA.', horizon: 'ya' },
  { id: 'packaging', label: 'Armar el packaging tipo regalo', detail: 'Papel de seda, bolsa kraft, tarjeta a mano. El aumento de precios ya está — esta es la mejora visible que lo acompaña.', horizon: 'ya' },
  { id: 'clase-piloto', label: 'Hacer la clase piloto', detail: '3–4 conocidas, 4 encuentros. El plan completo está en la pestaña Clases.', horizon: 'mes' },
  { id: 'difusion-wa', label: 'Armar la lista de difusión de WhatsApp', detail: 'Con clientas que ya compraron. Es el canal #1 para vender los drops.', horizon: 'mes' },
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
  { id: 'medicion-on', label: 'Prender la medición del sitio (30 min, gratis)', detail: 'Dos cuentas gratis: Umami Cloud (cloud.umami.is) y Microsoft Clarity (clarity.microsoft.com). Matías pega 3 variables en Netlify y el sitio empieza a contar solo el embudo completo: visita → producto → carrito → WhatsApp, más grabaciones de sesión para ver dónde se traban. Hoy el negocio vuela a ciegas: no sabemos qué producto convierte ni dónde se caen las clientas.', horizon: 'ya' },
  { id: 'ig-checklist-viral', label: 'Usar el checklist de reel viral en el próximo que despegue', detail: 'Comentario fijado con el link a la pieza, responder todos los comentarios el primer día, "comentá LINK y te lo mando por DM", y anotar el formato ganador. El playbook completo está en la pestaña Canales.', horizon: 'ya' },
  { id: 'precios-fase2', label: 'Segundo paso de precios', detail: 'Con el drop de verano, tops y bolsos suben hacia la meta de 12 meses (columna "12m" de la tabla).', horizon: 'trimestre' },
  { id: 'merchant-center', label: 'Activar Google Merchant Center', detail: 'Gratis, ~30 minutos. El paso a paso está en la pestaña Canales, debajo de "Google". El sitio ya tiene todo lo técnico listo — solo falta el paso de cuenta.', horizon: 'mes' },
  { id: 'bing-webmaster', label: 'Registrar el sitio en Bing Webmaster Tools', detail: 'Gratis, ~15 minutos (bing.com/webmasters, se puede importar directo desde Search Console). Importa más de lo que suena: ChatGPT busca con el índice de Bing — estar bien indexada ahí es la vía más directa a que la IA recomiende Dahila.', horizon: 'mes' },
  { id: 'etiquetas-clientas', label: 'Etiquetar a las clientas en WhatsApp Business', detail: 'Dos etiquetas por clienta: "frecuente" (2+ compras) y su mes de cumpleaños. Son la base de los referidos, el cumple y el acceso anticipado — 2 minutos por clienta. El sistema completo está en la pestaña Clientas.', horizon: 'mes' },
  { id: 'cupon-amiga', label: 'Crear los primeros cupones AMIGA-(nombre)', detail: 'Elegí 5 clientas contentas y mandale a cada una su código para regalar (15%, 3 usos). La receta exacta está en la pestaña Clientas.', horizon: 'mes' },
  { id: 'drop-site', label: 'Probar la maquinaria de drops del sitio', detail: 'Antes del drop de verano: Configuración → "Próximo drop" (countdown + captura VIP en el home) y una colección en estado "Próximamente". El paso a paso está en la pestaña Drops.', horizon: 'trimestre' },
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
]
