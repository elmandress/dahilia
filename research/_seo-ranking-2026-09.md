# SEO: por qué Dahila no rankea y qué hacer — análisis de SERP y plan
**Fecha: 2026-09-04 · Sitio: https://dahila.uy**

---

## 0. Nota de método (leela antes de creerle nada a este informe)

**No pude scrapear el SERP literal de google.com.uy.** Google devuelve un shell que exige JavaScript
(probado con `gbv=1`, UAs legacy tipo Lynx/w3m/Firefox 3, cookie `CONSENT`, `gl=uy&hl=es` — todos
devuelven la página `enablejs`). DuckDuckGo, Ecosia y varias instancias de SearXNG responden captcha,
403 o 429.

Lo que **sí** hice, y es lo que sostiene cada afirmación de acá abajo:

1. **Brave Search** con `country=uy&search_lang=es`, vía curl (índice propio, no Google).
2. Búsquedas en español rioplatense con la herramienta de búsqueda del agente.
3. **Verificación directa de cada competidor y de cada página de dahila.uy fetcheando el HTML.**
   Esto es dato duro: títulos, H1, JSON-LD, códigos HTTP, cantidad de productos.
4. Documentación oficial de Google Search Central y Google Business Profile, con fecha de
   actualización y cita textual.
5. El único dato real **de Google** es el export de Search Console del 02/09 que venía en el brief.

**Cero números inventados.** No hay en este informe un solo volumen de búsqueda, DA/PA ni tráfico
estimado, porque no puedo verificarlos. Donde hablo de "quién rankea" sin haber visto el SERP de
Google UY, la afirmación se apoya en *quién existe con catálogo real*, que es lo que determina si una
pelea es ganable — y eso sí lo verifiqué uno por uno.

---

## 1. SERP real por query

### 1.1 `crochet uruguay` — el país está secuestrado por una marca de lana
Brave UY (04/09) para "crochet uruguay" devuelve **ebay.com**, casi entero, vendiendo lana
*Manos del Uruguay*. Lo mismo con "cardigan crochet uruguay": jimmybeanswool.com, laughinghens.us,
woolandcompany.com, fairmountfibers.com, yarn.com — todos revendedores de la lana, ninguno vende prendas.

- https://www.ebay.com/b/Crochet-Manos-del-Uruguay-Yarns/36589/bn_119361775
- https://www.jimmybeanswool.com/knitting/yarn/kits/ManosdelUruguayClovesCardigan.asp
- https://www.laughinghens.us/knitting-pattern/manos-del-uruguay-fraile-cardigan
- https://www.woolandcompany.com/collections/manos-del-uruguay-patterns

**Qué significa:** Dahila está en pos. 16,5 con 8 impresiones en "crochet uruguay". Esa keyword tiene
la intención **partida**: mitad "comprar lana Manos del Uruguay" (mercado global, en inglés, nada que
ver con Dahila) y mitad "crochet en Uruguay" (lo de Dahila). Es una keyword chica y sucia, no la joya
que su posición sugiere. Vale defenderla; no vale invertir en ella.

**¿Hay hueco?** Angosto: el hueco es *"comprar prendas de crochet en Uruguay"*, no "crochet uruguay".

---

### 1.2 `ropa tejida a mano uruguay` — hueco real, competencia sin contenido
Brave UY (04/09), primeros orgánicos:

1. https://www.amorito.uy/ — ropa de bebé artesanal, UY
2. https://tiendasderopaenuruguay.online/manos-del-uruguay/ — directorio/afiliado
3. https://www.terratejidos.com/ — knitwear a mano, UY
4. https://www.lasruanas.com.uy/ — ruanas, UY
5. https://www.evisos.com.uy/tejidos-a-mano.htm — clasificados
6. https://manos.uy/artesanas
7. https://ovillova.com/ropa-tejida-a-mano/

…más bastante YouTube y Facebook.

**Qué gana:** homes de marca y clasificados. **No hay una sola página construida específicamente para
esta query.** Una landing o un `/tienda` con copy real de "ropa tejida a mano en Uruguay" no tiene
enfrente nada difícil de superar. Hueco: **sí, claro.**

---

### 1.3 `cardigan crochet` / `cardigans de mujer` — la trampa del reporte de GSC
Quién ocupa realmente el espacio de "cardigan" en Uruguay (sitios verificados, con catálogo real):

| Tienda | URL | Escala |
|---|---|---|
| La Ópera | https://laopera.com.uy/vestimenta/cardigans | declara **218 cardigans** |
| Lemon | https://lemon.com.uy/coleccion/cardigans-sweaters | cadena nacional |
| MANGO Uruguay (Forus) | https://www.forusuy.com/mujer/prendas/cardigans | marca global |
| Savia | https://www.savia.com.uy/catalogo/cardigan-terro-uy-crudo_FW260609_CRU | marca UY |
| The Urban Haus | https://theurbanhaus.com/categoria-producto/mujer/sweaters-y-cardigans-mujer/ | tienda UY |
| Guapa | https://www.guapa.com.uy/ | cadena UY |
| Indian | https://www.indian.com.uy/tejidos | cadena UY |
| Manos del Uruguay | https://manos.uy/apparel/sweaters-and-cardigans | marca-país |

Dahila tiene **5 cardigans** (verificado en https://dahila.uy/tienda/cardigans el 04/09).

**Esto es lo más importante del informe:** las 20 impresiones de `cardigans de mujer` en pos. 58 y las
12 de `cardigan` en pos. 69 **no son una oportunidad reprimida**. Son la cola larga de una query cuya
intención es *comprar un cardigan de punto industrial de temporada*. Aunque Dahila escalara de 58 a
15 — meses de trabajo contra La Ópera y Mango — el clic que ganaría es de alguien que quiere un
cardigan barato, en talle S, disponible hoy; no una pieza de crochet hecha a mano por encargo.
**Rebote garantizado, conversión cero.**

**Dónde sí:** con modificador. Buscando "cardigan de crochet" / "saco de crochet tejido a mano"
aparecen MercadoLibre, blogs de patrones regionales
(https://www.ctejidas.co/2024/12/30-cardigans-crochet-para-renovar-tu.html, Colombia) y microtiendas
argentinas (https://hilourbano.com.ar/categoria-producto/tejidos/sweaters-sacos/,
https://mypugtejidoscrochet.com/producto/sacon-tejido-a-crochet-lana-merino-sedificada/).
**Ninguna tienda uruguaya tiene una página dedicada a "cardigan de crochet".** Ese es el hueco, y
Dahila ya tiene la URL para ocuparlo.

---

### 1.4 `top crochet` — Zara y MercadoLibre, con blogs de patrones de relleno
- https://www.zara.com/us/en/woman-tops-crochet-l1226.html (Zara tiene categoría "Tops Crochet" para UY)
- https://listado.mercadolibre.com.uy/top-crochet
- https://cortefiel.com/es/es/mujer/camisetas-y-tops/tops/crochet
- https://www2.hm.com/es_es/mujer/compra-por-producto/tops.html?trendings=De+ganchillo
- Blogs de patrones: https://www.katia.com/blog/es/tops-de-crochet-faciles-de-hacer/ , https://www.crochetisimo.com/20-top-en-crochet-para-verano/
- https://www.ocompra.com/uruguay/buscar/item/tops-a-crochet/

**Qué gana:** categorías de fast fashion que usan "crochet" como *tendencia estética* (tejido a máquina
que imita crochet). Es la query más adversa del set: Dahila compite contra Zara con la misma palabra y
un producto que cuesta varias veces más. **Hueco bajo en la genérica; alto en "top de crochet tejido a
mano" / "top de crochet a medida".**

---

### 1.5 `bolso crochet` — cerrada. Es de MercadoLibre.
- https://listado.mercadolibre.com.uy/carteras-a-crochet — **445+ resultados, 424 en Montevideo**
- https://listado.mercadolibre.com.uy/carteras-en-crochet — 28 resultados
- https://listado.mercadolibre.com.uy/tejidos-crochet
- https://www.percibal.com/carteras?material=cuero (cuero, competidor tangencial)
- Resto: Instagram, Facebook, blogs de trapillo (http://tricotonas.com/comprar-bolsos-de-crochet-y-trapillo/)

Un marketplace con 400+ ítems activos y autoridad de dominio nacional no se le gana con una categoría
de accesorios de 8 productos. **No pelear acá por búsqueda genérica.** Los bolsos de Dahila se venden
por Instagram y como add-on de carrito, no por SEO.

---

### 1.6 `tejidos a medida montevideo` / `prendas a medida crochet` — VACANTE. Este es el premio.
La búsqueda devuelve, literalmente: clasificados, un directorio, una nota de prensa y clases de tejido.

- https://www.evisos.com.uy/compra-venta/ropa-calzado/crochet.htm
- https://montevideo.evisos.com.uy/compra-venta/ropa-calzado/ropa-artesanal.htm
- https://www.planetauruguay.com/montevideo-capital/tejidos
- https://www.montevideo.com.uy/Ciencia-y-Tecnologia/Inventora-uruguaya-premiada-por-la-UE-con-herramienta-innovadora-para-tejer-crochet-uc935570
- https://listado.mercadolibre.com.uy/clases-de-tejido-crochet
- https://clubdetejido.com/ (escuela online, España)

**Cero tiendas compitiendo.** Y no es casualidad: Terra, Vitanza, Puro Punto, La Ópera y Zara **no
pueden** competir acá. Su modelo es stock de temporada; "a medida" es exactamente lo que no venden.
Es la única categoría del mercado donde Dahila tiene ventaja estructural, no de esfuerzo.

**Y `/encargo` está vacía.** Verificado 04/09:
- title: `Encargá tu prenda de crochet a medida | Dahila Crochet` (bien)
- H1: `Contame qué tenés en mente`
- de ahí en adelante: **etiquetas de formulario.** Sin FAQ, sin plazos, sin proceso, sin rango de
  precios, sin guía de talles, sin fotos de encargos entregados.
- JSON-LD: tiene `Service` con `areaServed: Uruguay`. Bien. Pero **no tiene `FAQPage`**.

La página con la mejor relación oportunidad/competencia de todo el sitio es la única sin contenido.

---

### 1.7 `set de crochet` — nicho real, ya estás adentro
Dahila ya está en pos. 16,5 con 2 impresiones. El SERP para "set/top de crochet" en UY es
MercadoLibre + Zara + blogs de patrones. "Set de crochet" como *conjunto de prenda* (no como kit de
agujas) es una query chica pero limpia: quien la busca quiere exactamente lo que Dahila vende.
https://dahila.uy/tienda/sets ya existe. **Barato de defender, poco upside. Mantener, no invertir.**

---

### 1.8 `regalo tejido a mano` — gana el listicle, no la ficha de producto
- https://listado.mercadolibre.com.uy/regalos-artesanales y /regalos-tipicos-uruguay
- https://regalosenuruguay.com.uy/ (portal de regalos)
- https://mispetates.com/catalogo?grp=296
- Listicles de turismo: https://www.thefreetourshop.com/es/blog/mejores-souvenirs-de-montevideo/ ,
  https://descubreuruguay.com/cultura-uruguaya/regalos-tipicos-de-uruguay/ ,
  https://wanderlog.com/list/geoCategory/757632/best-gift-and-souvenir-shops-speciality-and-artisan-stores-in-montevideo
- https://www.evisos.com.uy/tejidos-a-mano.htm

**El tipo de contenido que gana esta query es una guía/listicle, no una categoría.** Es la única de
las 8 queries donde el formato blog gana de verdad, y Dahila **ya escribió el post**
(`/blog/regalos-tejidos-a-mano`) — **y devuelve 404.**

---

## 2. Competidores de contenido: nadie tiene blog. Nadie.

Verificado fetcheando cada home el 04/09/2026:

| Competidor | Nav real | ¿Blog? |
|---|---|---|
| **Terra Tejidos** https://www.terratejidos.com/ | Colecciones / Batouk / Arya / Origen / Pacific / Freya / Nosotros | **No.** Lookbook sin precios ni carrito |
| **Vitanza** https://vitanza.com.uy/ | SHOP (Sweaters, Sacos, Ponchos, Capas, Ruanas, Chales, Camperas, Vestidos) / SALE / Contacto / About us | **No.** Feed de IG + WhatsApp |
| **Puro Punto** https://puropunto.com/ | INVIERNO 26 / BUZOS Y SACOS / RUANAS Y PONCHOS / BLUSAS Y TOPS / CHALECOS / CHAQUETAS / VESTIDOS / POLLERAS / ACCESORIOS / Sobre nosotros / Contacto | **No.** Local en Solano García 2454 |
| **Amorito** https://www.amorito.uy/ | TIENDA / QUIÉNES SOMOS / CONTACTO / MI CUENTA / POLÍTICA DE DEVOLUCIÓN | **No.** |
| **Manos del Uruguay** https://manos.uy/ | marca-país: lana + apparel | Contenido institucional, no editorial de compra |

**El único contenido que rankea en el nicho es de fuera de Uruguay y es de patrones**
(katia.com, crochetisimo.com, ctejidas.co) — justamente el territorio ya descartado.

### Qué no cubre absolutamente nadie en Uruguay
1. **Cuánto cuesta y por qué cuesta** una prenda tejida a mano en UY: horas reales, lana, comparación
   honesta contra un cardigan de cadena.
2. **Cómo funciona un encargo a medida**: proceso, plazos reales, cómo se toman medidas por WhatsApp,
   qué pasa si no queda bien.
3. **Guía de compra local**: dónde comprar crochet en Uruguay, con nombres propios (competidores incluidos).
4. **Talles reales en crochet.** El crochet no tiene talles estandarizados y es la objeción número uno
   de la compra online. Nadie lo explica.
5. **Regalos tejidos a mano**, con el ángulo de "regalo que no se consigue en ningún lado".

Los cinco son temas donde el requisito de Google de *"first-hand expertise... that comes from having
actually used a product or service"* está del lado de Anush y de nadie más.

---

## 3. Qué hacer para rankear, en orden de impacto

### P0 — Arreglar los 404 del blog. Nada de lo demás importa hasta esto.
Verificado 04/09 con curl:

```
200  https://dahila.uy/blog
404  https://dahila.uy/blog/comprar-crochet-en-uruguay
404  https://dahila.uy/blog/regalos-tejidos-a-mano
```

`sitemap.xml` (58 URLs) **envía 8 URLs de blog a Google y las 8 dan 404**:
`comprar-crochet-en-uruguay`, `como-cuidar-prendas-de-crochet`, `como-encargar-prenda-a-medida`,
`regalos-tejidos-a-mano`, `cuanto-cuesta-una-prenda-tejida-a-mano`, `como-lavar-crochet-a-mano`,
`crochet-o-dos-agujas-diferencias`, `como-guardar-prendas-tejidas`.

Además `/blog` responde 200 y **lista 8 links que rompen todos** — es una página cuyo contenido entero
está muerto, con riesgo de soft-404 sobre la sección completa.

No es "el blog no rankea": es que le estás enviando activamente a Google 8 URLs rotas y una página
índice inútil. Es el peor estado posible, peor que no tener blog. **Y el contenido ya está escrito y
pago: hoy no rinde nada.** (Causa conocida = deploy de Netlify; no la re-investigué por indicación del brief.)

> Nota lateral verificada: el brief dice **16 notas**, pero tanto `/blog` como el `sitemap.xml`
> exponen **8**. Las otras 8 no están desplegadas o no están en el índice del sitio. Vale chequearlo.

### P1 — Convertir `/encargo` en la mejor página de "a medida" del país
Es el único territorio sin competencia (§1.6) y hoy es un formulario pelado. Qué agregarle:

- **Proceso en pasos** con plazos reales: "respuesta en X horas, propuesta en X días, entrega en X semanas".
- **Rango de precios honesto** por tipo de prenda. Es lo que más se busca y lo que nadie publica.
- **Cómo se toman las medidas por WhatsApp**, con el detalle real. Esto es E-E-A-T puro.
- **Qué pasa si no te queda**: la garantía. Elimina la objeción que mata el encargo online.
- **3-5 encargos reales entregados**, con foto y el pedido original que los originó.
- **`FAQPage` JSON-LD** — hoy `/encargo` tiene `Service` pero no `FAQPage`.

Fundamento: Google, *Creating helpful content* (act. 2025-12-10), pide *"original information,
reporting, research, or analysis"* y *"substantial, complete, or comprehensive description of the
topic"*. Publicar plazos y precios reales es exactamente eso, y es información que ningún competidor
puede copiar porque no tiene el modelo de negocio.
https://developers.google.com/search/docs/fundamentals/creating-helpful-content

### P2 — Copy propio en las 5 páginas de categoría, con modificador
Estado actual de `/tienda/cardigans` (verificado): title correcto
(`Cardigans de crochet tejidos a mano en Uruguay | Dahila Crochet`), meta description correcta,
`BreadcrumbList` + `ItemList` + `Product`/`Offer` OK… y **H1 = "Cardigans"**, genérico, sin una línea
de texto propio salvo el bloque "A medida". 5 productos y nada más.

Qué hacer, por categoría:
- **H1 con el modificador que sí es ganable**: "Cardigans de crochet tejidos a mano", no "Cardigans".
  El H1 genérico te posiciona contra La Ópera (imposible); el H1 con modificador te posiciona contra
  nadie (§1.3). Hoy el `<title>` dice la verdad de lo que vendés y el H1 dice lo contrario.
- 150-250 palabras de copy **de utilidad, no de relleno**: qué lana, cuánto abriga, cómo cae, cómo se
  lava, cómo elegir talle en crochet.
- **Guía de talles específica de crochet** en cada categoría. Objeción número uno, y nadie la resuelve.
- Enlace de cada categoría a `/encargo` con el ángulo de esa categoría ("¿lo querés en tu color?"),
  no el bloque genérico actual.

### P3 — Blog: reescribir el enfoque, no escribir más notas
De las 8 notas existentes, **3 son casi la misma nota**: `como-cuidar-prendas-de-crochet`,
`como-lavar-crochet-a-mano` y `como-guardar-prendas-tejidas`. Son informacionales, sin intención de
compra, y compiten entre sí. Las que valen son `cuanto-cuesta-una-prenda-tejida-a-mano`,
`comprar-crochet-en-uruguay`, `como-encargar-prenda-a-medida` y `regalos-tejidos-a-mano`: las cuatro
con intención comercial y las cuatro sin competencia uruguaya.

Plan: consolidar las 3 de cuidados en una sola nota buena, y que **cada nota que quede enlace a la
categoría o a `/encargo` que corresponda**. Fundamento textual de Google, *Ecommerce site structure*
(act. 2025-12-10): Google *"analyzes the linkages between pages to gain insights about the relative
importance of different pages"* y *"the more links a page has to it within a site, the higher the
relative importance"*, y recomienda explícitamente empujar páginas clave **con enlaces desde el blog**.
https://developers.google.com/search/docs/specialty/ecommerce/help-google-understand-your-ecommerce-site-structure

### P4 — Google Business Profile (ver §5). Barato, y ataca la única query donde la distancia juega a favor.

### P5 — Free listings de Merchant Center
Ya existe el merchant feed. Uruguay figura en la tabla oficial de países/monedas soportadas de
Merchant Center (*"Uruguay | Uruguayan Peso (UYU)"*,
https://support.google.com/merchants/answer/160637). **No pude confirmar en la documentación pública
que Uruguay tenga free listings habilitadas**: la tabla no lo desglosa y la página de países beta
(https://support.google.com/merchants/answer/7101265) no enumera países. **Hay que verificarlo dentro
de la cuenta de Merchant Center, no asumirlo.** Si están disponibles, es tráfico con intención de
compra, sin costo y sin depender de rankear orgánicamente.

---

## 4. Categorías vs. blog — la recomendación, sin "depende"

**Ambas, pero no al mismo tiempo y no en el orden que sugiere el reporte de GSC.**

**Primero categorías. Después blog. Y el blog existe para empujar a las categorías, no para traer
tráfico propio.**

Por qué, concretamente:

1. **La señal de `cardigan` en pos. 58-69 es una señal falsa.** No dice "estás cerca, empujá": dice
   "estás apareciendo en una query cuya intención no es la tuya" (§1.3). Reforzar `/tienda/cardigans`
   apuntando a **`cardigan`** es tirar plata contra La Ópera (218 cardigans) y Mango. Reforzarla
   apuntando a **`cardigan de crochet` / `cardigan tejido a mano`** — donde ninguna tienda uruguaya
   tiene página — es ganable en semanas, con el H1 y 200 palabras de copy. Es el cambio más barato con
   mejor relación esfuerzo/resultado de toda la lista.

2. **El blog hoy tiene ROI negativo, no bajo: negativo.** 8 URLs enviadas por sitemap que dan 404 y una
   página índice llena de links rotos. Escribir la nota número 17 antes de arreglar eso es empeorar el
   problema. Arreglado el deploy, las 4 notas comerciales que ya existen valen — sobre todo
   `regalos-tejidos-a-mano`, que es la **única** de las 8 queries donde el formato que gana el SERP es
   un listicle y no una categoría (§1.8).

3. **La función principal del blog acá no es rankear, es enlazar.** Es la propia recomendación de
   Google en su documentación de ecommerce: los links internos determinan la importancia relativa de
   una página, y sugiere empujar categorías desde posts. Con 37 productos y un sitio chico, el blog es
   el único mecanismo disponible para darle peso interno a `/tienda/cardigans` y a `/encargo` sin
   comprar links.

4. **Y hay una razón de negocio que rompe el empate:** 344 de 588 sesiones vienen de Instagram. El
   tráfico ya existe; lo que falta es que la página a la que llega convierta y esté indexada por lo que
   realmente vende. Copy de categoría y contenido en `/encargo` sirven a los dos canales a la vez. Una
   nota de blog sirve a uno solo.

**Orden concreto:** (a) desbloquear el blog en Netlify → (b) H1 + copy + guía de talles en las 5
categorías → (c) `/encargo` completa con FAQPage → (d) consolidar las 3 notas de cuidados y enlazar
las 4 comerciales a categorías/encargo → (e) GBP → (f) verificar free listings.

---

## 5. Google Business Profile — ¿sirve sin local a la calle?

**Sí, y es de lo más barato que hay disponible — pero solo bajo la figura de *service-area business*,
y solo si la entrega en Montevideo es un encuentro en persona.**

Fuente: https://support.google.com/business/answer/3038177 (ES y EN, consultada 04/09/2026).

- Elegibilidad, textual: *"If your business either has a physical location that customers can visit,
  **or travels to customers where they are**, you can create a Business Profile on Google."*
- Área de servicio, textual: *"Service-area businesses, or businesses that serve customers at their
  locations, should have one profile for the central office or location with a designated service
  area."* y *"If you're a service-area business, you should hide your business address from customers."*
- Si mostrás dirección (ES): *"Las empresas que muestren su dirección en Google deben tener una señal
  fija permanente con el nombre de la empresa en la dirección."* Es decir: **no muestres la dirección
  del atelier.** Ocultala y declará área de servicio.
- Nombre, textual: *"Your name should reflect your business's real-world name, as used consistently on
  your storefront, website, stationery, and as known to customers."* Prohibido meter slogan, teléfono,
  URL o mayúsculas totales.

**Cómo pesa el perfil una vez creado.** Fuente: https://support.google.com/business/answer/7091 —
los tres factores son **relevancia** (*"how well a Business Profile matches what someone is searching
for"*, se mejora con *"complete and detailed business info"*), **distancia** (automática) y
**prominencia** (*"More reviews and positive ratings can help your business's local ranking"*, y depende
de *"how many websites link to your business and how many reviews you have"*). Y explícitamente:
*"There's no way to request or pay for a better local ranking on Google."*

### Checklist de elegibilidad para Dahila
1. **Requisito duro: contacto presencial.** Si Anush entrega en mano en Montevideo (coordinado por
   WhatsApp), Dahila califica como service-area business. Si todo va por courier sin encontrarse nunca
   con la clienta, el perfil es suspendible. **Esta es la única pregunta que decide si vale la pena.**
2. **Dirección oculta**, área de servicio = Montevideo + las zonas del interior a las que realmente llega.
3. **Nombre exacto: "Dahila"** (el nombre real que usa la marca). No "Dahila Crochet Tejidos a Mano
   Montevideo": eso es keyword stuffing en el nombre y causa clásica de suspensión.
4. **Verificación por video**: es el método habitual hoy. Para un service-area business el video debe
   mostrar el atelier, lana/herramientas/stock reales y que quien filma administra el negocio. No tener
   local no es un impedimento acá; es el caso normal.
5. **Reseñas**: es la palanca de "prominencia" y la única que Dahila puede mover rápido — hay clientas
   reales de WhatsApp a las que se les puede pedir la reseña después de entregar.

### Cuánto vale realmente
Alto para su costo, moderado en absoluto. GBP no te da tráfico web: te da panel de conocimiento y
presencia en Maps para búsquedas con intención local ("tejidos a mano montevideo", "crochet
montevideo"), que es exactamente el segmento donde el SERP orgánico está vacante (§1.6). Es la única
palanca del informe donde la **distancia** juega a favor de una marca chica contra Zara y La Ópera:
ellas no compiten en Maps por "crochet a medida".

---

## 6. Señales técnicas a revisar (solo lo que NO está resuelto)

Lo que ya está bien y verifiqué en el HTML en vivo, para no repetirlo: sitemap dinámico (58 URLs),
robots.txt, JSON-LD `Organization` + `WebSite` + `BreadcrumbList` + `CollectionPage` + `ItemList` +
`Product`/`Offer` + `MerchantReturnPolicy` + `Service`, canonical, OG/Twitter, y titles y meta
descriptions bien escritos en `/encargo`, `/info`, `/atelier` y las categorías.

Lo que falta:

1. **[CRÍTICO] 8 URLs de blog en el sitemap devuelven 404** y `/blog` lista 8 links rotos. Ver §3-P0.
   Es la única cosa realmente rota del sitio.
2. **Discrepancia 16 vs 8 notas.** El brief dice 16; `/blog` y el sitemap exponen 8. Verificar si hay 8
   notas escritas que nunca se desplegaron.
3. **`FAQPage` ausente en `/encargo`.** Tiene `Service` con `areaServed: Uruguay`; le falta el FAQ (que
   además hay que escribir, §3-P1).
4. **H1 genéricos en las categorías.** `/tienda/cardigans` tiene `<title>` con modificador y `H1` sin él.
   Alinear los cinco.
5. **`Service` solo en `/encargo`, con `areaServed: Country/Uruguay`.** Si se abre el GBP como
   service-area business en Montevideo, conviene que el `areaServed` refleje eso (Montevideo + zonas),
   para que schema y perfil digan lo mismo.
6. **Sin `LocalBusiness` en ninguna página.** Ojo: la documentación
   (https://developers.google.com/search/docs/appearance/structured-data/local-business, act. 2025-12-10)
   exige `address` con `PostalAddress` completa. Hoy el sitio declara `addressLocality: Montevideo,
   addressCountry: UY` sin calle — correcto y honesto. **No inventar una dirección para poder poner
   `LocalBusiness`.** El schema de `Service` más el GBP cubren el caso mejor y sin riesgo.
7. **Free listings de Merchant Center: verificar disponibilidad para UY dentro de la cuenta** (§3-P5).

---

## 7. Lo que este informe NO puede decirte

- **Posiciones exactas en google.com.uy.** No pude scrapear el SERP (§0). Las posiciones reales que
  tenés son las de Search Console, y son mejores que cualquier estimación mía.
- **Volumen de búsqueda de ninguna keyword.** No tengo acceso a Keyword Planner ni a ninguna fuente
  verificable. Todo el orden de prioridades de este informe está construido sobre **competencia
  observable** — cuántos competidores reales hay y qué tan fuertes son — no sobre volumen.
- **Cuánto tráfico traería cada acción.** Cualquier número acá sería inventado.
