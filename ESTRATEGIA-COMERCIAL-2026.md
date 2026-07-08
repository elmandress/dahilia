# Estrategia comercial Dahila Crochet — Informe maestro (2026-07)

Consultoría de pricing + crecimiento. Foco **Uruguay**. Supera la parte de precios de `ESTRATEGIA-PRECIOS.md`.

---

## 0. El email a floralcrochet12 — causa real (resuelto)

No es un bug de código. Prueba de diagnóstico: envié el **mismo** email a las dos casillas con el dominio verificado → **ambas HTTP 200** (Resend las acepta igual). `EMAIL_FROM` = `hola@send.farodigital.uy` (verificado, no modo prueba), `OWNER_NOTIFICATION_EMAIL` = floralcrochet12. **No hay ningún fallback a neptuno en el código** (grep confirmado).

**Por qué parecía que "solo llega a neptuno":**
1. Las tandas de prueba que te mandé fueron **a propósito a neptuno** (tu inbox, para que las revises). Eso NO es el ruteo del sistema.
2. El mail a floralcrochet12 **sí se envía y se acepta** (HTTP 200). Si no lo ves, está en **Spam/Promociones**, por deliverability de un dominio nuevo:
   - `send.farodigital.uy` es **nuevo** (sin reputación).
   - **Falta DMARC** (solo hay DKIM+SPF).
   - **Mismatch nombre/dominio**: "Dahila Crochet" vs `farodigital.uy` → señal típica de spam.
   - floralcrochet12 **no tiene relación previa** con el remitente; neptuno (dueño de la cuenta Resend) sí.

**Fix real (no temporal):**
1. **DMARC** en NetUY: TXT en `_dmarc.send.farodigital.uy` = `v=DMARC1; p=none; rua=mailto:floralcrochet12@gmail.com`.
2. En floralcrochet12: revisar Spam/Promociones, marcar **"No es spam"** + agregar remitente a Contactos (entrena a Gmail — es reputación, no un parche).
3. Confirmar en **Netlify** que `OWNER_NOTIFICATION_EMAIL=floralcrochet12@gmail.com` y `EMAIL_FROM=Dahila Crochet <hola@send.farodigital.uy>` + redeploy.
4. Fix definitivo del mismatch: cuando tengas `dahila.uy`, enviar desde `hola@send.dahila.uy` → nombre y dominio coinciden. Hasta entonces, DMARC + warmup resuelven.

---

## 1. El mercado uruguayo de crochet artesanal (análisis profundo)

**Dato central: es un mercado OPACO.** Tras revisar Instagram, Facebook, Mercado Libre, ferias, tiendas independientes y marcas: **casi nadie publica precios**. Se cotiza por DM, en ferias o listados sueltos de ML. Consecuencias estratégicas enormes:

1. **El cliente no puede comparar** → hay poco "anclaje" de precio → **más margen para cobrar por valor/marca** (no por comparación).
2. **Tener precios transparentes en la web es una ventaja competitiva** (profesionalismo + confianza) que casi ningún emprendimiento UY tiene.
3. Las **referencias reales** del cliente uruguayo son: **ferias** (accesible, artesanal), **ML** (masivo barato), y **retail a máquina** (Zara/Mango/Indian: knitwear UYU 1.500–3.500; Indian tejidos $899–1.499; cardigan de máquina $1.399).

**El "cachet" del hecho a mano uruguayo es real y alto:** Manos del Uruguay teje para **Gabriela Hearst**, se exhibe en **Bergdorf Goodman** y desfila en Nueva York; hay 6 marcas uruguayas éticas/sostenibles en Coterie NY. "Hecho a mano en Uruguay" tiene prestigio internacional → sostiene un pricing de valor sin volverse "caro".

**Las tres bandas (recordatorio):** industrial-máquina (abajo) · handmade-global/Etsy (UYU 1.200–4.000) · premium (Manos/MOMO UYU 4.000–14.000). **Dahila debe ubicarse apenas por encima del industrial** = "handmade a precio de casi-máquina" = mejor relación calidad-precio del país.

**Horas de trabajo (para justificar):** top 8–18 h · cardigan/poncho +mangas/costura · Manos clasifica prendas en 15/20/30 h. A UYU 899 por un top de ~12 h te pagás ~75/hora; una hora de esa habilidad vale $350–500 en UY.

Fuentes: [Indian](https://www.indian.com.uy/tejidos) · [Manos del Uruguay (El Observador)](https://www.elobservador.com.uy/cafe-y-negocios/de-la-cooperativa-paysandu-un-desfile-gabriela-hearst-nueva-york-la-historia-mabel-manos-del-uruguay-y-la-resistencia-las-artesanas-un-mundo-consumo-voraz-n6046465) · [Manos/lujo (FashionNetwork)](https://es.fashionnetwork.com/news/Manos-del-uruguay-artesanas-que-tejen-los-suenos-del-lujo-internacional,1303799.html) · [Uruguay XXI moda ética](https://www.uruguayxxi.gub.uy/es/noticias/articulo/seis-marcas-uruguayas-llevan-su-moda-etica-sostenible-e-innovadora-a-coterie/) · [Etsy](https://www.mouseandsparrow.com/blog/26-bestselling-crochet-items-to-sell-on-etsy) · [MOMO NY](https://momonewyork.com/collections/crochet-collection) · [horas de trabajo](https://desertblossomcrafts.com/how-long-does-it-take-to-crochet-a-sweater/) · [drops/Shopify](https://www.shopify.com/blog/limited-drops).

---

## 2. Precios PARA HOY — producto por producto

`Hoy` = lo que pondría **ahora mismo** (primer paso, no agresivo). `12m` = valor a alcanzar en 1–2 pasos más. `Conf.` = confianza en la recomendación.

### Statement & sets (prioridad — más horas, más subvaluados)
| Producto | Actual | **HOY** | Δ hoy | 12m | Conf. | Por qué |
|---|---:|---:|---:|---:|:--:|---|
| **Set BRISA** (3 pzs, c/bikini) | 690 | **890** | +29% | 1.090 | Alta | 3 piezas a menos que un bikini solo; subvaluación extrema |
| Cardigan 3/4 | 1.100 | **1.290** | +17% | 1.490 | Alta | ~20 h; hoy < cardigan de máquina ($1.399) |
| Cardigan CRUZADO | 1.100 | **1.290** | +17% | 1.490 | Alta | ídem |
| Poncho | 1.100 | **1.290** | +17% | 1.450 | Alta | Mucho metraje; Etsy ~8.000 |
| Chaleco | 1.000 | **1.190** | +19% | 1.350 | Alta | Pieza grande |
| BEACH set | 1.300 | **1.490** | +15% | 1.690 | Alta | Set de playa multi-pieza |
| Set LUEUR (3 pzs) | 999 | **1.150** | +15% | 1.290 | Alta | short+scarf+ponchito |
| Set LUREX | 1.100 | **1.250** | +14% | 1.390 | Media-Alta | Set + hilado especial |
| Set bufanda y guantes | 700 | **790** | +13% | 890 | Media | 2 piezas |

### Tops (núcleo)
| Producto | Actual | **HOY** | Δ hoy | 12m | Conf. |
|---|---:|---:|---:|---:|:--:|
| Top FLOWER | 1.100 | **1.250** | +14% | 1.390 | Alta |
| Top CHERRY / SUMMER | 990 | **1.090** | +10% | 1.190 | Alta |
| Falda SERENADA | 990 | **1.090** | +10% | 1.190 | Media-Alta |
| Top HIGGIE | 950 | **1.050** | +11% | 1.150 | Alta |
| Top RACE / MARESIA / LAGOM / AMÉLIE | 899 | **990** | +10% | 1.090 | Alta |
| Top HALTER / DUNA | 780 | **890** | +14% | 990 | Alta |
| COWL NECK top | 560 | **620** | +11% | 720 | Media |

### Bolsos
| Producto | Actual | **HOY** | Δ hoy | 12m | Conf. |
|---|---:|---:|---:|---:|:--:|
| Bolso LOLA | 1.300 | **1.390** | +7% | 1.490 | Media |
| Bolso a cuadros | 950 | **1.050** | +11% | 1.150 | Media |
| Bolso de estudiante | 650 | **720** | +11% | 790 | Media |
| Tote bag de playa | 670 | **720** | +7% | 790 | Media |
| DONUT bag | 650 | **720** | +11% | 790 | Media |
| Mini tote bag | 590 | **650** | +10% | 690 | Media |

### Accesorios entry — NO aumentar hoy (o mínimo)
| Producto | Actual | **HOY** | 12m | Conf. | Nota |
|---|---:|---:|---:|:--:|---|
| Bufanda SOPHIE | 550 | **590** | 620 | Media | Nudge chico |
| Calentadores | 550 | **590** | 620 | Media | Nudge chico |
| **Bandana** | 500 | **500 (HOLD)** | 550 | — | Gancho de entrada; no tocar hoy |
| **Mini BUFANDAS** | 360 | **360 (HOLD)** | 390 | — | Producto de prueba/impulso; no tocar hoy |
| **Box de regalo** | 650 | **revisar** | — | — | ¿Producto o packaging? (ver §5) |

**Impacto de aplicar HOY:** ~**+13% promedio ponderado**, concentrado en statement/sets. Sigue siendo, en cada pieza, la mitad o menos que Etsy → el cliente sigue sintiendo que roba. Riesgo de volumen bajísimo por ser a medida y por el mercado opaco (poco anclaje).

**Qué NO tocar hoy (explícito):** Mini bufandas, Bandana (entry/gancho), Box de regalo (revisar formato), y tus **2–3 más vendidos** si los conocés (subilos en la 2ª ronda para no arriesgar el volumen mientras medís).

**¿Cambié de opinión vs. el informe anterior?** Sí, en dos cosas: (1) separé **HOY** (paso conservador) del **target 12m** (antes daba solo el target); (2) al confirmar que el mercado UY es opaco y que "hecho a mano UY" tiene cachet, **subí la confianza** en los aumentos de statement/sets (hay menos riesgo de comparación de precios del que suponía).

---

## 3. Estrategia gradual (12 meses)

Regla: **ningún aumento sin mejora visible + una razón** (temporada, lana premium, colección). Nunca "subimos precios".
- **Hoy:** aplicar la columna **HOY** (statement/sets primero; entry en HOLD). Acompañar con descripciones + packaging + fotos nuevas.
- **Mes 4–5:** segundo paso hacia `12m` en **tops + bolsos**, junto a un **drop de temporada**.
- **Mes 7–8:** cerrar `12m` en statement/sets; mover best-sellers; empezar a subir entry (Bandana/Mini bufandas a target).
- **Mes 10–11:** cerrar `12m` en tops/bolsos; redondeos finales.
- **Continuo:** numeración a mano en statement (escasez que sostiene precio).

---

## 4. Red de tejedoras — plan implementable (modelo Manos del Uruguay)

**El problema:** la dueña teje todo → los tiempos la ahogan y el negocio no escala. **La solución existe y es uruguaya:** Manos del Uruguay (12 cooperativas de mujeres, desde 1968) prueba que el modelo "la marca diseña, controla y vende; las tejedoras producen" funciona a escala global.

**Cómo lo hacen (y cómo copiarlo):**
- **Pago:** por hora **y por prenda terminada**. → Dahila: tarifa por pieza = horas estimadas × valor-hora justo (arrancar ~UYU 150–250/h equivalente, a convenir), **pagada al aprobar la pieza**. Margen Dahila = precio − lana − pago tejedora.
- **Estándares:** patrones de referencia aprobados + **ficha técnica por modelo** (lana, aguja, medidas por talle, puntos, fotos de "aceptable / no aceptable"). Clasificar prendas por horas (como Manos: 15/20/30 h).
- **Control de calidad:** **cada pieza se inspecciona antes de enviar** (checklist: medidas, tensión/parejo, terminación, costuras, cierres). **Cada prenda lleva el nombre de quién la tejió** (como Manos) → orgullo + responsabilidad.
- **Selección:** postulación + **muestra pagada** (una pieza de prueba contra un patrón de referencia) → se evalúa tensión, terminación, cumplimiento de medidas, tiempos y seguir instrucciones.
- **Marca protegida:** acuerdo simple (no revender bajo nombre propio, respetar el estándar), **etiqueta "Dahila" cosida** en cada prenda.

**Cómo arrancar (realista):**
1. Empezar con **1–2 tejedoras de confianza** — idealmente **alumnas de sus clases** (ya conoce su nivel) o referidas.
2. Delegar primero lo **simple y repetible** (accesorios, bolsos, tops básicos). La dueña conserva las piezas complejas/statement al principio.
3. Escalar **de a poco**: sumar una tejedora nueva solo cuando la anterior es consistente. Tiers: **aprendiz → asociada → senior** según constancia.

**Sección web "Tejé con Dahila" (recomendada):**
- Página `/tejedoras` con la propuesta (trabajá desde casa, a tu ritmo, pago por pieza) + formulario.
- **Pedir:** nombre, ubicación/departamento, años de experiencia, **fotos de 2–3 trabajos**, qué sabe tejer (tops/cardigans/bolsos), disponibilidad horaria semanal, si tiene máquina/agujas/lana, contacto (WhatsApp/mail).
- **Proceso:** postula → charla por WhatsApp → **muestra pagada** contra ficha técnica → evaluación (checklist) → alta como aprendiz → primeros encargos simples.
- **Reutiliza la infraestructura que ya tenés:** el sistema de encargos + estados + emails sirve casi igual para gestionar asignaciones a tejedoras (otro "estado" del pedido: *asignado a tejedora → en producción → QC → listo*).

**Por qué conviene:** desbloquea el cuello de botella (tiempo), mantiene la calidad (estándares + QC + nombre), protege la marca (etiqueta + acuerdo) y es socialmente lindo (da trabajo a mujeres tejedoras) — exactamente el ADN que hace grande a Manos del Uruguay.

---

## 5. Estrategia de DROPS (colecciones limitadas) — desarrollada

**Por qué:** en tiendas que los usan, los drops generan **40–60% de la facturación anual** con 15–25% de los productos. Y el handmade **ya es escaso por naturaleza** → la escasez es honesta, no inventada.

**Cadencia:** 3–4 drops/año alineados a estación/ocasión UY: **Verano** (nov), **Día de la Madre** (may), **Invierno** (jun), **Navidad** (dic). Cada drop = una colección curada con nombre ("Verano '26").

**Playbook por drop (4 semanas):**
- **Sem −3/−2 (teaser):** "algo se viene" — fotos borrosas, detalle de un punto, behind-the-scenes del tejido. **Abrir waitlist** (email/WhatsApp) con promesa de **acceso anticipado**.
- **Sem −1 (reveal):** un "first look" por día en Stories con **sticker de cuenta regresiva**; 1 reel de proceso; teasers de piezas.
- **Día 0 (launch):** la **waitlist compra 24 h antes** que el público. "Live now" en Stories + email + difusión de WhatsApp con el link.
- **Post:** a las pocas horas, post **"lo que queda"**; después, **recap** ("se agotó X"). Reposición solo **por encargo a medida** con plazo mayor (mantiene la escasez).

**Exclusividad sin engañar:** cantidades reales limitadas (porque es a mano), **"edición [temporada]"**, **número de pieza a mano**, y "después del drop solo por encargo". Nada falso — la escasez es real.

**Captación de emails (el activo clave):** landing de waitlist + campo en el footer + aviso post-encargo. Incentivo honesto: **acceso anticipado** (y opcional, precio de lanzamiento las primeras 48 h). Seguimiento a la waitlist 24–48 h después con otro ángulo (recupera 12–28% de los que no abrieron).

**Valor percibido:** un drop concentra la demanda, **justifica invertir en fotos/contenido**, crea un **hábito** en la audiencia (teaser→reveal→acceso→launch→recap) y hace que una **colección curada** valga más que un catálogo suelto. Es, además, el marco perfecto para introducir los aumentos de precio ("colección nueva").

---

## 6. Síntesis de decisiones
1. Aplicar la columna **HOY** (statement/sets primero, entry en HOLD).
2. Descripciones + horas de trabajo + packaging tipo regalo + tag cosido (valor percibido, casi sin costo).
3. Mercado Pago **Link de Pago con cuotas** (manual) — quita fricción y hace indoloro el aumento.
4. Arrancar la **red de tejedoras** con 1–2 personas de confianza + sección `/tejedoras`.
5. Montar el **primer drop** (Verano '26) con waitlist por email/WhatsApp.
6. Capturar email desde ya (footer + post-encargo) — sin eso no hay drops ni recompra.
