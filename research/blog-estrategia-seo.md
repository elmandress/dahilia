# Estrategia de contenido SEO — Dahila Crochet

Fecha: 2026-08-31. Complementa `content-strategy.md` (que era para carruseles de
Instagram) y reusa los datos verificados de `repo-audit.md`.

Regla que atraviesa todo el documento: **lo específico de Dahila sale del código,
de `/info`, de `/encargo` o del catálogo real. Lo general sobre crochet se puede
escribir con fuentes externas, pero siempre marcado como tal dentro de la nota
(bloque `note`).**

---

## 1. Diagnóstico de la oportunidad

Búsquedas exploradas (agosto 2026) para "crochet Uruguay", "comprar ropa tejida
Montevideo", "cómo lavar crochet", "regalos tejidos artesanales Uruguay",
"diferencia crochet dos agujas":

- **La SERP uruguaya de crochet está dominada por marketplaces** (MercadoLibre,
  Evisos) y fichas de clasificados. Casi no hay contenido editorial de marca.
- **Las guías de cuidado que rankean son extranjeras** (España y México casi
  todas). Ninguna habla en es-UY ni conecta con una tienda local.
- **Nadie ocupa el ángulo "comprar crochet en Uruguay"** con contenido real:
  qué mirar, cómo acertar el talle, qué preguntar antes de pagar.
- Uruguay tiene tradición lanera reconocible (Manos del Uruguay, Malabrigo son
  marcas uruguayas): el ángulo local tiene sustento, no es marketing vacío.

**Conclusión:** el hueco no es de volumen, es de *calidad local*. Con 8-15 notas
bien hechas se puede ser la referencia en español rioplatense para consultas de
cuidado y de compra de crochet, que es exactamente el tráfico que después compra.

**Lo que NO conviene perseguir:** "patrones de crochet gratis", "cómo tejer
crochet paso a paso", "puntos de crochet". Es el volumen más grande del nicho y
el peor para este negocio: quien busca aprender a tejer no compra prendas
tejidas. Es tráfico que infla analytics y no mueve una sola venta.

---

## 2. Arquitectura: pilares y clusters

Modelo pillar/cluster. **No hay páginas de taxonomía propias** (`/blog/tema/x`):
con pocas notas por cluster serían thin content. El artículo pilar hace de hub y
el índice de `/blog` agrupa visualmente por tema.

| Cluster | Pilar | Función |
|---|---|---|
| `cuidados` | Cómo cuidar una prenda de crochet | Atrae (TOFU) y retiene post-compra |
| `comprar` | Comprar crochet en Uruguay | Captura intención local (BOFU) |
| `regalos` | Regalos tejidos a mano | Estacional, alta conversión |
| `a-medida` | Cómo encargar una prenda a medida | Empuja al formulario /encargo |

---

## 3. Publicado (8 notas, live)

| # | Nota | Cluster | Rol | Funnel | Enlaza a |
|---|---|---|---|---|---|
| 1 | Comprar crochet en Uruguay | comprar | pilar | BOFU | /tienda, /info, 3 notas |
| 2 | Cómo cuidar una prenda de crochet | cuidados | pilar | TOFU | /tienda, cardigans, 2 notas |
| 3 | Cómo encargar una prenda a medida | a-medida | pilar | BOFU | /encargo, /info, /tienda |
| 4 | Regalos tejidos a mano | regalos | pilar | BOFU | /tienda/accesorios, box-de-regalo |
| 5 | Por qué una prenda tejida cuesta lo que cuesta | comprar | apoyo | MOFU | /tienda/accesorios, /info |
| 6 | Cómo lavar crochet a mano | cuidados | apoyo | TOFU | pilar de cuidados, /tienda |
| 7 | Crochet o dos agujas | comprar | apoyo | TOFU | pilar de compra, /tienda |
| 8 | Cómo guardar prendas tejidas | cuidados | apoyo | TOFU | pilar de cuidados, accesorios |

Cada nota lleva: FAQ con schema, productos reales del catálogo, CTA a tienda o
encargo, y enlaces internos hacia su pilar y hacia notas hermanas.

---

## 4. Roadmap priorizado (siguientes 30)

### Prioridad ALTA — hacer primero (impacto real esperado)

| # | Título de trabajo | Cluster | Funnel | Por qué |
|---|---|---|---|---|
| 9 | Qué talle de prenda tejida me queda: cómo medirte | comprar | BOFU | Es LA objeción de compra online. Alta intención. |
| 10 | Cardigan de crochet: cómo elegirlo y con qué combinarlo | comprar | MOFU | Categoría con mejor margen. Query comercial. |
| 11 | Tops de crochet para verano: qué mirar | comprar | MOFU | Estacional fuerte (nov-feb en UY). |
| 12 | Regalos para el Día de la Madre tejidos a mano | regalos | BOFU | Pico estacional claro (mayo en UY). |
| 13 | Bolsos de crochet: por qué duran y cómo se cuidan | cuidados+comprar | MOFU | Categoría con producto real y poca competencia. |
| 14 | ¿La lana pica? Fibras naturales y piel sensible | cuidados | TOFU | Objeción frecuente, muy buscada. |
| 15 | Cuánto demora una prenda tejida a mano | a-medida | BOFU | Duda previa a encargar. Sostiene /encargo. |

### Prioridad MEDIA — construyen autoridad temática

| # | Título de trabajo | Cluster | Funnel |
|---|---|---|---|
| 16 | Lana, algodón o mezcla: cómo elegir según la prenda | comprar | MOFU |
| 17 | Cómo se ve un tejido bien hecho: 6 señales | comprar | MOFU |
| 18 | Prendas de crochet para entretiempo | comprar | TOFU |
| 19 | Qué es el bloqueo de una prenda tejida | cuidados | TOFU |
| 20 | Cómo arreglar un enganche sin arruinar la prenda | cuidados | TOFU |
| 21 | Por qué mi prenda tejida hace pelotitas | cuidados | TOFU |
| 22 | Slow fashion en Uruguay: qué significa comprar así | comprar | TOFU |
| 23 | Regalos para una amiga que tiene todo | regalos | BOFU |
| 24 | Cómo pedir un color específico en un encargo | a-medida | BOFU |
| 25 | Set tejido: por qué conviene frente a piezas sueltas | comprar | MOFU |

### Prioridad BAJA — oportunistas / estacionales

| # | Título de trabajo | Cluster | Funnel |
|---|---|---|---|
| 26 | Regalos tejidos para bebés y baby showers | regalos | BOFU |
| 27 | Qué ponerse en una boda de día (con tejido) | comprar | TOFU |
| 28 | Accesorios tejidos para la playa | comprar | TOFU |
| 29 | Cómo combinar una prenda tejida con lo que ya tenés | comprar | TOFU |
| 30 | El crochet en la moda: por qué volvió | comprar | TOFU |
| 31 | Cuidar prendas tejidas en el clima húmedo de Montevideo | cuidados | TOFU |
| 32 | Guía de regalos de fin de año | regalos | BOFU |
| 33 | Prendas tejidas para el invierno uruguayo | comprar | MOFU |
| 34 | Cómo lavar un bolso de crochet | cuidados | TOFU |
| 35 | Qué hacer si una prenda tejida encogió | cuidados | TOFU |
| 36 | Diferencia entre hecho a mano y artesanal | comprar | TOFU |
| 37 | Cómo saber si una prenda es realmente hecha a mano | comprar | MOFU |
| 38 | Encargar una prenda como regalo sin arruinar la sorpresa | regalos+a-medida | BOFU |

**Ritmo sugerido:** 2 notas por mes. Es preferible 15 notas buenas a 40
mediocres: el modelo de bloques hace fácil sumar, pero el cuello de botella real
es tener algo verdadero para decir en cada una.

---

## 5. Cómo se conecta con la tienda

- Cada nota declara `relatedProductSlugs` y/o `relatedCategorySlug` → el pie
  muestra fichas reales del catálogo (salen del catálogo ya cacheado: **cero
  consultas extra a Supabase**).
- Bloques `shopCta` dentro del cuerpo, en el punto donde la duda ya está
  resuelta y la acción tiene sentido.
- Enlaces contextuales inversos: `/info` → guía de cuidado y guía de encargo;
  ficha de producto (panel "Cuidados") → guía de cuidado.
- Nav principal ("Notas") + footer.

## 6. Cómo evitar contenido superficial

1. Cada nota tiene que responder algo que hoy se contesta por WhatsApp. Si no
   es una pregunta real de una clienta, no se escribe.
2. Nada de "en el mundo de hoy…": la nota abre con el problema concreto.
3. Todo dato específico de Dahila, verificado contra el código. Lo general, en
   un bloque `note` que lo aclara.
4. Nada de precios exactos en el cuerpo: los precios cambian y la nota
   envejecería mal. Se enlaza a la tienda, que siempre tiene el precio vivo.
5. Sin FAQ de relleno: la FAQ alimenta schema, así que una pregunta inventada
   ensucia datos estructurados reales.

---

## 7. Pendiente de Anush (no se inventó nada de esto)

Estas notas están listas para escribirse apenas haya la información:

- [ ] **Materiales concretos**: qué lanas/algodones se usan habitualmente
      (marca o tipo). Habilita las notas 14 y 16, que hoy no se pueden escribir
      sin inventar.
- [ ] **Plazos por tipo de prenda**: rango real de demora para un cardigan, un
      top, un accesorio. Habilita la nota 15.
- [ ] **Fotos**: hoy hay 5 fotos reales en `public/photos/`. Para escalar el
      blog sin repetir imágenes hacen falta más (proceso, detalle, prenda
      puesta). 3 notas de las 8 publicadas van sin hero por esto.
- [ ] **Testimonios reales**: la tabla `testimonials` existe pero está vacía de
      contenido citable. Un testimonio real en la nota de "cuánto cuesta"
      valdría más que cualquier argumento.
- [ ] **Medidas por talle**: si existe una tabla de medidas en cm por talle,
      la nota 9 (la de mayor impacto comercial de la lista) se vuelve mucho
      más fuerte.

## 8. Inconsistencia detectada en el sitio (no es del blog)

`/info` declara en su meta description que se paga "transferencia o Mercado
Pago", pero el texto visible del bloque de pagos dice solo "transferencia o el
medio que te quede cómodo". Hay que decidir cuál es la verdad y alinear las dos
— el blog, por las dudas, no menciona medios de pago concretos.
