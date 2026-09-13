# Estadísticas de dahila.uy al 13/09/2026: qué anda, qué no y qué hacer

Pedido de Mati (13/09): "fijate si el search index de Google funciona, si indexó todo, fijate las estadísticas y pensá lo que le va mejor, lo que le va peor, cómo explotar lo mejor y cómo mejorar".

**En una línea:** Google ya manda gente: 122 clics en 28 días, 6 veces más que el mes anterior. Casi todo llega desde el celular y desde Uruguay, y buscando la marca. Lo que mejor anda es la home y el Spring cardigan. Lo que peor anda son las páginas que salen en la primera página de Google y que nadie toca: la nota de cuidados, Accesorios y Tops.

---

## 1. De dónde salen los números

- **Search Console (API):** del 14/08 al 10/09, comparado con el 17/07 al 13/08. Los datos crudos están en `research/mediciones/seo-2026-09-13.md` y en `seo-detalle-2026-09-13.md`, que tiene páginas, búsquedas, búsquedas por página, dispositivos y día por día.
- **Indexación:** inspección URL por URL de las 72 del sitemap (13/09) y estado de los sitemaps.
- **Carritos y encargos:** resumen de la base del 12/09. Los carritos están inflados: no se limpian, no se marcan como convertidos y se cuenta uno por navegador (ver el embudo del 12/09).
- **Lo que NO hay:**
  - ventas cerradas, porque el pago se arregla por WhatsApp;
  - números de Instagram de 30 días (Mati no los tiene);
  - Umami confiable (en julio contó 6 visitantes contra 21 carritos reales);
  - Clarity de las últimas semanas: la seguridad del sitio lo bloqueaba y vuelve a grabar con el próximo deploy.

---

## 2. ¿Funciona la "indexación" de Google?

Son dos cosas distintas.

**El script `npm run index-urls` (Indexing API): no funciona para esta tienda.**
- Google contestó 200 a cada una de las 68 URLs mandadas el 11 y el 12/09, pero no registró ninguna. La consulta `npm run index-urls -- --status` (nueva, solo lectura) devuelve "Requested entity was not found." para las 68, incluidas las del 11/09.
- La documentación oficial, actualizada el 16/07/2026, lo dice claro: esa API es solo para páginas de avisos de empleo (JobPosting) y de transmisiones en vivo (BroadcastEvent).
- No hace daño, pero no hace nada. **Dejar de usarlo.**

**La indexación normal (sitemap y rastreo): sí funciona.**
- `sitemap.xml` se envió el 11/09 y Google lo leyó el 13/09, sin errores ni advertencias.
- Hay un segundo sitemap mal escrito, `sitemap.xlm` (del 09/07), pendiente y con un error. Hay que quitarlo (tarea de Mati).
- **61 de 72 URLs indexadas.** Faltan 11:

| Estado | URLs | Qué significa |
|---|---|---|
| "Google no reconoce esta URL" (5) | `/blog/cardigan-de-crochet-como-elegirlo`, `/blog/tops-de-crochet-para-verano`, `/blog/set-tejido-vs-piezas-sueltas`, `/tienda/sweater-cherry`, `/tienda/top-race` | Las más nuevas. Google recién leyó hoy el sitemap que las trae. |
| "Descubierta: actualmente sin indexar" (6) | `/blog/el-crochet-se-hace-a-maquina`, `/blog/que-talle-de-prenda-tejida-me-queda`, `/blog/materiales-de-una-prenda-tejida`, `/blog/bolsos-de-crochet-por-que-duran`, `/blog/cuanto-demora-una-prenda-tejida-a-mano`, `/tienda/sweaters` | Google sabe que existen y todavía no las rastreó. Es normal en un sitio de 2 meses con poca autoridad. |

**Qué hice.** Cada categoría ahora enlaza sus notas en un bloque "Antes de elegir" al pie. Las 3 notas del blog que Google "no reconoce" son justo las de cardigans, tops y sets. Ahora tienen un enlace desde una página que Google rastrea seguido: `/tienda/cardigans` el 29/08, `/tienda/tops` y `/tienda/sets` el 30/08.

**Qué falta (Mati).** "Solicitar indexación" a mano en Search Console para esas 11 (unas 10 por día) y quitar `sitemap.xlm`. Las dos tareas ya están en `/admin/estrategia`.

---

## 3. Lo que mejor anda, y cómo exprimirlo

**1. La marca y la home.** `/` trae 78 de los 122 clics (64%), con posición 2,9 y un CTR de 32,9%. "dahila" y "dahila uy" salen en la posición 1.
- Quien ya conoce Dahila (por Instagram, por boca en boca) la busca en Google y la encuentra.
- *Exprimirlo:* que cada publicación y cada historia digan "dahila.uy", escrito así. Google corrige "dahila" por "dahlia" (investigación del 12/09), y la dirección escrita evita que se pierdan.
- El Perfil de Google existe pero no tiene reseñas. Pedir reseñas a clientas reales, sin nada a cambio, es lo que más haría crecer las búsquedas de marca.

**2. El Spring cardigan.** Es la ficha con más clics: 10 de 28 impresiones (CTR 35,7%).
- Los carritos confirman que el cardigan es la prenda que más se quiere: el Cardigan amour es el más agregado (12 carritos).
- *Exprimirlo:*
  - que los cardigans estén primeros en el orden de categorías (tarea `orden-categorias`);
  - completar las descripciones del Spring y del Amour (tarea `descripciones-top`);
  - la categoría ya enlaza la guía "cómo elegir un cardigan de crochet".

**3. "crochet uruguay".** Tiene 15 impresiones y 2 clics: posición 4,1 con la home y 8,3 con la nota "comprar crochet en Uruguay". Es la búsqueda genérica más valiosa en la que ya estamos en la primera página.
- *Exprimirlo:* que la nota enlace a las fichas que más se agregan al carrito (Cardigan amour, Set de bufanda y guantes, Sweater Senda).

**4. El celular.** Trae 109 de los 122 clics (89%), con CTR de 18,1% y posición 7,4. En escritorio: 6,9% y 17,0. Todo lo que se mejora para el celular (galería con swipe, barra fija, carrito) está puesto en el lugar correcto.

**5. El blog empezó a traer impresiones.**
- Las impresiones pasaron de unas 16 por día (14 al 29/08) a unas 46 por día (1 al 10/09).
- El salto empieza el 30/08, justo cuando Google rastreó el blog por primera vez (31/08).
- Entre las notas suman 269 impresiones: regalos 117, cuidados 90, comprar crochet en Uruguay 46.

---

## 4. Lo que peor anda, y cómo mejorarlo

**1. Las impresiones se triplicaron, los clics no.**
- Sin contar el pico del 17 al 19/08 (47 clics en 3 días), hay unos 3 clics por día tanto en agosto como en septiembre.
- Las impresiones nuevas son búsquedas genéricas (blog, categorías), donde casi nadie hace clic.
- **La palanca ahora no es "salir en Google", es que den ganas de hacer clic**: títulos, descripciones y las palabras que usa la gente.

**2. Páginas en la primera página sin clics:**

| Página | Impresiones | Clics | Posición | Qué hacer |
|---|---|---|---|---|
| `/blog/como-cuidar-prendas-de-crochet` | 90 | 0 | 5,8 | **Hecho:** título nuevo, "…para que dure años" en vez de "(guía completa)". Medir el 11/10. |
| `/tienda/accesorios` | 70 | 0 | 5,4 | Parte de las impresiones son el enlace que sale debajo de "dahila uy". El resto: "accesorios crochet" (posición 2,5), "accesorios en crochet para mujer" (8,0). |
| `/tienda/tops` | 65 | 1 | 6,0 | Búsquedas reales: "top de hilo" (6,5), "top poncho" (8,0), "tops tejidos" (4,3), "tops de lana" (1,7). Usar esas palabras en la descripción si son verdad (tarea `palabras-busqueda`). |
| `/tejedoras` | 47 | 0 | 5,9 | No vende. No preocupa. |
| `/info` y `/contacto` | 78 y 74 | 2 y 1 | ~6 | Salen como enlaces debajo del resultado de la marca. No es un problema. |

**3. Búsquedas donde no vale la pena pelear:** "cardigans de mujer" (28 impresiones, posición 58,9), "cardigan" (65), "chaleco" (53) y "poncho mujer" (55). Son de tiendas grandes. En cambio, "cardigan tejido" (posición 17) y "cardigan de crochet" sí se pueden ganar, y la guía de cardigans apunta ahí.

**4. Oportunidades chicas y concretas:**
- "bandana tejida a crochet precio": 7 impresiones, posición 9,1. La ficha ya muestra el precio en la descripción de Google.
- "bolsa dona": posición 2,7 y 0 clics. Así le dice la gente a la Donut bag.
- "cowl neck": posición 4,7, para el Cowl neck top.
- "set crochet": posición 9,3, para Sets.
- Todo esto está en la tarea `palabras-busqueda` para Anush, sin inventar nada: solo usar esas palabras donde sean ciertas.

**5. `/ofertas` estaba vacía y Google la mostraba 71 veces.** **Hecho:** si no hay ofertas, la página pide no indexarse (noindex) y muestra piezas para seguir mirando. El sitemap ya la sacaba cuando estaba vacía. Cuando Anush cargue una oferta, la página vuelve sola al índice.

**6. La velocidad.** Lighthouse en celular contra producción (12/09): entre 43 y 51 de 100. El carrito tenía 15, con un salto de diseño (CLS) de 0,455. El salto queda en 0 con el próximo deploy. El resto de la velocidad (LCP entre 4,7 y 7,3 s) sigue pendiente y depende de las fotos y del JavaScript de terceros.

---

## 5. Carritos y encargos (base, 12/09)

- 64 carritos y 78 piezas.
- Las más agregadas: Cardigan amour (12), Set de bufanda y guantes (6), Sweater Senda (5), Bandana (5) y Bolso a cuadros (4).
- 8 encargos a medida.

**Cruce con Google.** El Cardigan amour, el más agregado, tiene solo 3 impresiones en Google (posición 17). **Lo que más se agrega al carrito llega por Instagram, no por Google.** Google trae la marca y el Spring cardigan.

Entonces:
- Instagram es el canal que vende.
- Lo que más importa del sitio es que el salto de Instagram a WhatsApp no se corte (prueba pendiente de Mati, con el nuevo "¿No se abrió WhatsApp?").
- Poner `?utm_source=instagram&utm_medium=bio` en el link de la bio, si todavía no está (pendiente desde el 22/08). Así los pedidos guardan de dónde vino cada clienta.

---

## 6. Qué cambié hoy por estos datos

- **Indexación:** las categorías enlazan sus notas ("Antes de elegir").
- **Clics:** título nuevo de la nota de cuidados (prueba).
- **Página vacía:** `/ofertas` sin ofertas pide no indexarse y muestra piezas.
- **Medición:** `npm run seo-report -- --detalle`, con sitemaps, páginas, búsquedas por página, dispositivos, día por día y oportunidades (posición 3 a 15). El historial queda en una fila por día.
- **Indexing API:** `npm run index-urls -- --status` para comprobar si Google registró algo, y la conclusión de dejar de usarla.
- **Tareas nuevas en `/admin/estrategia`:** `sitemap-xlm`, `pedir-indexacion`, `palabras-busqueda` y `medir-titulo-cuidados`.

Las microinteracciones de esta misma vuelta están en `research/auditoria-total-2026-09-12.md`, sección 9.

---

## 7. Qué medir y cuándo

- **Después del deploy:**
  - a los 2 o 3 días, Clarity con grabaciones nuevas;
  - en Umami, los eventos nuevos: `order_copy` y `order_reopen` (el aviso "¿No se abrió WhatsApp?"), `whatsapp_click` con `source: float_ficha`, y `encargo_sent` con `desde` (encargos que llegan desde una ficha).
- **Durante la semana:** que Mati pida la indexación de las 11 URLs.
- **11/10:** `npm run seo-report -- --detalle`. Comparar:
  - CTR de `/blog/como-cuidar-prendas-de-crochet`;
  - indexación de las 11;
  - clics de `/tienda/cardigans`, `/tienda/tops` y `/tienda/accesorios`;
  - clics por día fuera de picos (hoy son unos 3).
- **12/10:** la re-medición completa de la auditoría (sección 2 del informe).

---

## 8. Actualización de la tarde: Google Imágenes y las fotos del blog

**Google Imágenes** (mismo período, `npm run seo-report -- --detalle` ya lo incluye): **381 impresiones y 1 clic**, en posición media 38,9. Son casi la mitad de las impresiones de la búsqueda web (782), con casi nada de clics.

| Página | Impresiones | Posición |
|---|---|---|
| /tienda | 44 | 23,8 |
| /blog/como-cuidar-prendas-de-crochet | 29 | 23,5 |
| / | 26 | 28,4 |
| /blog/regalos-tejidos-a-mano | 26 | 49,6 |
| /tienda/bolso-a-cuadros | 21 | 39,3 |
| /tienda/accesorios | 20 | 41,6 |
| /tienda/bandana | 20 | 44,1 |
| /blog | 15 | 40,3 |
| /blog/comprar-crochet-en-uruguay | 13 | 17,0 |

**Las fotos del blog no mostraban lo que decían.**
- Las 21 notas se repartían 5 fotos, y los nombres de archivo y los textos alternativos no coincidían con lo que se ve.
- "Top tejido a crochet con punto calado" era un set violeta de trapillo sobre una mesa de café.
- "Manos tejiendo a crochet en el taller" era Anush sentada en un parque.
- Google Imágenes ya muestra esas fotos, pero con descripciones equivocadas.

**Qué se hizo** (detalle en la sección 10 del informe de auditoría):
- Cada nota tiene su propia portada: una foto real de la prenda de la que habla, con nombre de archivo y texto alternativo que dicen lo que se ve.
- 15 notas llevan además una foto dentro del texto, que lleva a la ficha.
- Se sumaron 6 notas nuevas del estilo que más rinde (regalos y cuidados), más playa y chaleco, que tienen búsquedas sin una página que las conteste.
- Títulos nuevos en las 3 notas con más impresiones.
- Las categorías tienen títulos con las palabras de la gente y "Desde UYU…" en la descripción.
- La home enlaza 3 notas.
