# Meta Ads para Dahila: qué hacen los expertos con presupuestos chicos (04/11/2026)

Alcance: investigación web. No se tocó Meta, código ni commits. Cada afirmación lleva etiqueta de fuente:
- **[OFICIAL]** Meta, documentación o página de Meta.
- **[EXPERTO]** persona reconocida, y solo si pude verlo directamente.
- **[BLOG]** agencia o proveedor que vende algo. Son heurísticas, no hechos.
- **[MÍA]** cuenta o inferencia mía con tus números. No es de ninguna fuente.

Limitaciones: no pude leer los videos de Ben Heath ni de Dara Denney, Foxwell, Sanchez o Hott. Solo encontré resúmenes de terceros, o nada. El artículo de Loomer sobre el cambio del learning phase me dio 403. No hay una fuente oficial de Meta que valide con números la estructura para USD 5/día. Casi todo lo cuantitativo es heurística de blogs. Tomalo como hipótesis y no como ley.

---

## (a) Resumen en 10 líneas

1. Consenso Andromeda 2026 [BLOG, varias agencias]: menos campañas y menos conjuntos, y que el creativo segmente. Con USD 5/día, 1 conjunto de públicos amplios y no más.
2. Jon Loomer [EXPERTO, dic 2025]: apostar a la diversidad creativa pero empezando de a poco, un anuncio con variedad real adentro. No hace falta hacer 50 anuncios.
3. "Diversidad" quiere decir conceptos distintos (otro ángulo, otra persona, otro formato), no 5 recortes del mismo video. Esa es la idea central de las guías sobre Andromeda [BLOG; la definición de Meta de abril 2025 está citada por terceros, no la leí].
4. La regla de las 50 conversiones por semana es una heurística muy repetida y no un requisito oficial claro. A USD 35/semana es imposible optimizar por compra [MÍA]. Hay que optimizar por un evento más alto en el embudo, o aceptar que es presupuesto de prueba.
5. Tu campaña web optimiza "ver contenido": paga UYU 9 por vista y ~1 pedido cada 415 vistas, o sea ~UYU 3.700 por pedido contra un ticket de 1.400 a 2.600 [MÍA, con tus datos]. Pierde plata aunque no tenga fallas técnicas.
6. Los mensajes a ~UYU 110 por conversación (36 conversaciones, mar-abr) necesitan cerrar ~1 de cada 20 para empatar con el ticket [MÍA]. La métrica que importa no es el costo por conversación sino cuántas terminan en venta.
7. "Compras por mensajes" [OFICIAL, página de Meta]: hay que mandar eventos de compra (más de 5 en 30 días, creando pedidos en el chat). La página solo habla de Messenger y no confirma Instagram Direct. Hoy no conviene contar con eso; hay que mirar si aparece la opción en tu cuenta.
8. Oficial sobre mensajes [OFICIAL, Instagram Direct]: responder rápido, mensaje de ausencia o horarios, y rompehielos. Un blog de LATAM dice "menos de 5 minutos" [BLOG], pero no es una cifra de Meta.
9. Creativo: lo que hay son blogs de herramientas. Dicen que el estilo celular (UGC) rinde mejor que lo pulido y que los primeros 3 segundos deciden. Las cifras (23% menos CPA, hook rate 30%) son de vendedores y no se pueden verificar [BLOG]. No encontré nada específico de crochet.
10. Errores típicos con poco presupuesto: dividir USD 5 en muchos conjuntos y anuncios, editar seguido (resetea el aprendizaje), optimizar un evento que no es plata, y no medir qué anuncio vende.

---

## (b) Recomendaciones priorizadas para Dahila

### P1. Concentrar la plata donde la matemática cierra (cambio grande)
- **Hecho de tus datos:** web ~UYU 9 por vista de prenda x 415 vistas por pedido = ~UYU 3.700 por pedido. Ticket promedio ~2.200. Esa campaña pierde en el mejor de los casos, y encima con CyberLunes baja el ticket.
- **Hecho de tus datos:** mensajes ~UYU 110 por conversación. Con ticket 2.200 empata si cerrás 5% de las conversaciones (110/2.200) y gana plata si cerrás más. Eso es una cuenta de ingresos, no de margen: con el margen real el punto de equilibrio es más alto. Dependés de tu tasa real de cierre, que no tenemos medida. Es el dato que falta.
- **Recomendación:** mover la mayor parte del presupuesto a mensajes. La web puede quedar con un monto de prueba chico, o pausarse.
- **Hipótesis a verificar:** que el cierre de conversaciones de marzo-abril (36) haya sido real. Si Anush sabe cuántas terminaron en venta, ese número manda sobre todo lo demás.

### P2. Una sola campaña de mensajes, un solo conjunto, creativos realmente distintos
- Hoy hay 2 anuncios en mensajes (video del drop y reel "¿cuál te llevás? 1, 2 o 3"). Esos dos ya son conceptos distintos: mantenerlos.
- Sumar hasta 2 más con ángulos diferentes (ver sección c), no más. Ben Heath, en una transcripción de su video sobre presupuestos chicos, habla de unos 2 anuncios activos por conjunto con USD 10/día y de evaluar a las 2 semanas [EXPERTO, vía transcripción de terceros, no oficial]. Con USD 5/día yo iría con 3 a 4 como máximo, y es juicio mío.
- Loomer en la misma línea: empezar de a poco, y con variedad adentro del anuncio [EXPERTO].

### P3. Audiencia: amplia, sin estrechar
- Advantage+ audience / público amplio en Uruguay, 18-55+, mujeres como señal y no como límite duro (hipótesis mía; sin fuente que la respalde con números para Uruguay).
- Uruguay es mercado chico (3,4 M). A UYU 100-150/día, con frecuencia alta rápido te quemás la audiencia. Vigilar frecuencia (ver reglas de corte). Excluir a quienes ya te escribieron, si Meta lo permite.

### P4. Medir ventas de verdad (más importante que cualquier ajuste de audiencia)
- Cada conversación que termina en venta se anota con el anuncio de origen. Preguntar "¿cómo nos conociste?" no alcanza porque el click-to-message ya te lo dice por el anuncio de referencia en el chat.
- Planilla simple: fecha, anuncio, ¿respondió?, ¿pidió precio?, ¿compró?, monto. Es lo que permite calcular el costo por venta, que hoy no existe.
- La compra por WhatsApp ya se reporta como Purchase (commit "la venta de WhatsApp como compra" en el repo). Verificar en Administrador de eventos que lleguen y que atribuyan al anuncio.
- Optimización "compras por mensajes": [OFICIAL] requiere eventos de compra enviados (más de 5 en 30 días sin partner) y la página solo describe Messenger. **No sé si Instagram Direct la ofrece en tu cuenta.** Mirar si aparece en el conjunto; si no, optimizar por conversaciones.

### P5. Responder rápido y tener todo listo
- [OFICIAL] Meta pide responsividad: respuesta instantánea o mensaje de ausencia, horarios o tiempo estimado.
- [BLOG, Mercately] "menos de 5 minutos si es posible", seguimiento a las 24-48 h a quien preguntó y no compró, y programar anuncios en horario de atención o dejar mensaje de ausencia.
- Anush no puede estar siempre: usar respuestas guardadas y mensaje de ausencia. Si no puede responder en un rato razonable durante el día, considerar un horario de anuncios (cuando ella está).

### P6. Qué mantener
- El reel "¿cuál te llevás? 1, 2 o 3": es el formato "esto o aquello", interactivo, y encaja con mensajes (la gente responde con un número).
- Precio: ver sección c.
- Dejar de tocar la campaña: editar seguido resetea el aprendizaje [BLOG].

### P7. Qué NO hacer
- No sumar más campañas ni conjuntos "para probar públicos".
- No escalar el presupuesto hasta tener una tasa de cierre medida.
- No optimizar por eventos de la web mientras el píxel tenga pocos eventos reales.

---

## (c) "Campaña perfecta" propuesta (UYU ~200/día total)

Todo es propuesta para decisión de Mati/Anush. Los números son mías, no de fuentes, salvo donde digo.

### Estructura
| Campaña | Presupuesto/día | Objetivo | Conjunto | Evento |
|---|---|---|---|---|
| A. Mensajes (principal) | UYU 150 | Ventas o Interacción con destino Instagram Direct (según lo que ofrezca la cuenta) | 1 conjunto, público amplio, ubicaciones Advantage+ | Conversaciones iniciadas; "compras por mensajes" solo si aparece y hay eventos |
| B. Web (prueba, opcional) | UYU 50, o pausada | Ventas web | 1 conjunto | Ver la nota abajo |

Por qué 150/50 y no 100/100: con cada sol que va a la web a UYU 3.700 por pedido, la matemática no cierra. Si prefieren mantener la web, hacerlo como prueba acotada con regla de corte.

Nota sobre la web (B): optimizar por "ver contenido" trae curiosos (UYU 9 por vista, 0 carritos en 3 días). Alternativas: optimizar por "agregar al carrito" aunque haya pocos eventos [BLOG: es lo que aconsejan cuando hay muchos ATC y pocas compras], o directamente pausar y dejar a mensajes. Mi voto: pausar hasta que mensajes tenga una tasa de cierre medida.

### Creativos (en la campaña A, 3-4 anuncios, conceptos distintos)
1. **Video del drop** (ya existe): mantener.
2. **Reel "¿cuál te llevás? 1, 2 o 3"** (ya existe): mantener. Es el que ya invita a responder.
3. **Proceso / detrás de escena** (nuevo): manos tejiendo la pieza, de la lana a la prenda terminada. Es la prueba de "hecho a mano en Montevideo". No encontré evidencia específica para crochet; es hipótesis.
4. **Prenda puesta + un detalle** (nuevo, opcional): una persona real usando el poncho o el bolso, con una pregunta que pida respuesta ("¿Lo querés en otro color?").
- Primeros 3 segundos: mostrar la prenda o la acción desde el cuadro uno, sin logo ni intro [BLOG: coincide en que los 3 primeros segundos pesan; los porcentajes son de vendedores].
- Precio en pantalla: **no verificado con evidencia.** Hipótesis mía: con destino mensajes, poner el precio filtra a curiosos y sube la calidad de la conversación, pero puede bajar el volumen. Probar un anuncio con precio y otro sin, y comparar por venta y no por conversación.
- Descuento: el −15% CyberLunes puede ir en el texto. Ojo con la contradicción stock/descuento ya anotada en la auditoría del 03/11.

### Reglas de corte (hipótesis mías, con la lógica de abajo)
- **No tocar nada los primeros 7 días** (cada cambio resetea el aprendizaje [BLOG]). Evaluar a las 2 semanas, que es lo que sugiere Ben Heath para USD 10/día [EXPERTO, vía transcripción].
- **Anuncio:** si pasó UYU 600 (aprox. 5 conversaciones esperadas a UYU 110) con cero conversaciones, pausarlo.
- **Costo por conversación:** si la campaña supera ~UYU 220 (el doble del histórico) por 7 días seguidos, revisar el creativo.
- **Frecuencia:** si pasa de ~3 en 7 días, la audiencia se está quemando: cambiar creativo.
- **Cierre:** a las 2 semanas, si hay 15+ conversaciones y ninguna venta, el problema está en la conversación o la oferta, no en el anuncio.
- **Punto de equilibrio:** costo por venta = costo por conversación / tasa de cierre. Con 110 y 10% de cierre = UYU 1.100 por venta, que cierra con ticket 2.200 si el margen da. Con 5% queda en 2.200 y ya no hay ganancia.
- **Escalar:** solo si el costo por venta quedó por debajo de ~30-40% del ticket durante 2 semanas, y de a 20% como mucho [BLOG: aumentos chicos para no resetear].

---

## (d) Saludo y 4 preguntas frecuentes (ice breakers)

Límites a confirmar en tu cuenta: un blog [BLOG, Shopline] menciona 4 rompehielos de hasta 80 caracteres, y la documentación de Meta describe el saludo como personalizable (por defecto: "Hello! Can I get more info on this?") [OFICIAL, docs developers]. Confirmar en el Administrador de anuncios.

**Saludo (voseo, cálido):**
> ¡Hola! Soy Anush de Dahila 🌼 Gracias por escribirnos. Todo lo tejo yo a mano acá en Montevideo. Contame qué pieza te gustó y te cuento colores, talles y cómo coordinar la entrega.

**4 preguntas frecuentes (cada una ≤ 80 caracteres):**
1. `¿Cuánto sale y qué colores hay?`
2. `¿Cuál es mi talle?`
3. `¿Cómo es el envío y cuándo llega?`
4. `¿Cómo se paga y cómo la reservo?`

Respuestas guardadas (a completar con datos reales de Anush; no inventé precios, plazos ni medios de pago):
- 1: precio actual de la pieza (tabla `PRICE_TABLE` / lo que tenga el drop vigente) más colores disponibles.
- 2: guía de talles o medidas de la prenda.
- 3: zonas, costo y plazos de envío reales.
- 4: medios de pago reales y cómo se reserva.

Mensaje de ausencia (fuera de horario):
> ¡Hola! Ahora no estoy frente al celu. Te respondo apenas pueda, normalmente en el día. Si querés ir adelantando, contame qué pieza te gustó 🧶

(La frase "normalmente en el día" es un ejemplo: poner lo que Anush realmente pueda cumplir.)

---

## (e) Fuentes

**Oficiales (Meta)**
- Compras por mensajes (click-to-message): https://www.facebook.com/business/ads/click-to-message-ads/purchases-through-messaging
- Instagram Direct, mejores prácticas (redirige a): https://www.facebook.com/business/instagram/instagram-direct-business (no pude cargar el contenido, lo usé por el resumen del buscador)
- Docs de desarrolladores, anuncios click-to-Instagram: https://developers.secure.facebook.com/docs/marketing-api/ad-creative/messaging-ads/click-to-instagram/

**Expertos**
- Jon Loomer, "Stop Blaming Andromeda for Your Results" (dic 2025): https://pubcast.jonloomer.com/stop-blaming-andromeda-for-your-results/
- Jon Loomer, qué es Andromeda: https://www.jonloomer.com/meta-andromeda/
- Jon Loomer, "Is the Learning Phase Changing?" (no pude abrirla, 403): https://www.jonloomer.com/qvt/is-the-learning-phase-changing/
- Ben Heath, transcripción de su video sobre presupuestos chicos (transcripción de terceros): https://gotranscript.com/public/optimizing-facebook-ad-campaigns-for-small-budgets-tips-and-strategies
- Podcast de Ben Heath, "How to crush Facebook ads with a small budget in 2026" (solo vi el título): https://www.buzzsprout.com/2198975/episodes/18805320-how-to-crush-facebook-ads-with-a-small-budget-in-2026-ep-121

**Blogs de agencias y proveedores (heurísticas, sin verificar)**
- Confect, guía Andromeda: https://confect.io/tactics/meta-andromeda-2026
- PPC Hero, estructura en la era Andromeda: https://ppchero.com/meta-campaign-structure-in-andromeda-era/
- AdLibrary, estructura 2026: https://www.adlibrary.com/posts/meta-ads-campaign-structure-2026-andromeda-update
- Segwise, playbook creativo: https://segwise.ai/blog/meta-andromeda-update-creative-strategy-2026
- Segwise, creativo para ecommerce: https://segwise.ai/blog/meta-creative-strategy-ecommerce-2026
- Skaleit, Andromeda para ecommerce: https://skaleit.agency/blog/meta-andromeda-complete-guide-ecommerce/
- Aimerce, salir del learning phase: https://www.aimerce.ai/blogs/stuck-in-the-learning-phase-here-is-how-to-get-out
- GoMarble, learning phase: https://gomarble.ai/blog/meta-ads-learning-phase-understanding
- Mercately (LATAM), 7 errores en Click-to-WhatsApp: https://blog.mercately.com/por-que-tu-dinero-de-publicidad-se-esfuma-7-errores-en-tus-campanas-click-to-whatsapp-que-te-estan-costando-ventas/
- Felipe Vergara (Colombia), anuncios a WhatsApp: https://felipevergara.co/blogs/whatsapp/como-crear-anuncios-de-clic-a-whatsapp-2024/
- Shopline, rompehielos en Instagram: https://help.shopline.com/hc/en-001/articles/13453240721433-Setting-up-Ice-Breakers-for-Instagram
- Meta, click-to-message tips (Social Media Today, nota antigua): https://www.socialmediatoday.com/news/meta-shares-click-to-messaging-ad-tips/745595/

## Vacíos que quedan (para una ronda futura)
- No hay caso verificado de una marca de ropa de LATAM con costo por conversación y venta auditados. Lo que apareció son cifras de proveedores.
- Sin fuente fiable sobre precio en pantalla para handmade, ni sobre crochet en particular.
- Sin Foxwell, Sanchez, Denney ni Hott leídos directamente.
- Falta tu dato más importante: cuántas de las 36 conversaciones de marzo-abril terminaron en venta.
