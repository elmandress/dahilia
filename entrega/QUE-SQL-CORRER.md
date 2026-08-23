# Qué SQL te falta correr

Verificado en vivo contra tu base el 23/08/2026 — no es una lista teórica,
es lo que realmente falta.

---

## ✅ Lo que YA corriste (no lo repitas)

- **`schema-orders.sql`** — la tabla de pedidos existe. "Pedidos enviados" en
  el admin ya funciona: de acá en más, cada vez que alguien toca "Coordinar
  por WhatsApp" queda registrado.
- **`schema-orders-attribution.sql`** y **`schema-encargos-attribution.sql`** —
  las 4 columnas de canal (`utm_source`, `utm_medium`, `utm_campaign`,
  `referrer_host`) están en las dos tablas. Cada venta va a quedar con el
  canal de dónde vino.

---

## 📋 Lo único que falta: `database/contenido-2026-08.sql`

Es un archivo nuevo, ya escrito, con **todos los textos corregidos adentro**.
No tenés que copiar y pegar nada a mano: abrís el archivo, lo pegás entero en
el SQL Editor de Supabase y listo.

**Antes de correrlo, dos cosas:**

1. **Elegí el título del home.** El archivo tiene dos opciones al principio
   (BLOQUE 1). Está puesta la recomendada:

   > Cada prenda, entre 4 y 22 horas de trabajo.

   Si preferís la otra ("Tejido a mano, en tu talle, en Montevideo."),
   comentá una línea y descomentá la otra antes de correr.

2. **Leé los textos.** Son la voz de tu marca. Si alguno no te suena a vos,
   cambialo directamente en el archivo antes de ejecutar — para eso está en
   texto plano.

**Qué corrige** (4 bloques, se pueden correr juntos o de a uno):

| Bloque | Qué hace |
|---|---|
| 1 | 7 textos del sitio: título del home, subtítulo, valores, envíos, 2 preguntas frecuentes, y saca el emoji de la bandera |
| 2 | El texto de cuidados: unifica **9 versiones distintas** en una, y corrige "agua tibia" → **"agua fría"** (ver abajo) |
| 3 | 6 descripciones de producto, con las horas reales de tejido |
| 4 | Consultas de verificación — no cambian nada, solo te muestran cómo quedó |

**Verificado ahora mismo:** los 34 productos siguen diciendo "agua tibia" y el
título sigue siendo "Tejido artesanal y atemporal", así que este script todavía
no se corrió.

---

## ⚠️ Por qué lo del agua importa de verdad

No es una corrección de estilo. **El agua tibia apelmaza la lana, y eso no
tiene vuelta atrás.** También encoge el algodón. El agua fría es segura para
todos los materiales que usás.

Y ya estabas diciendo cosas distintas según dónde mirara la clienta:

- Las 34 fichas de producto: "agua **tibia**"
- La página /info y el carrusel de Instagram: "agua **fría**" (4 veces)

Como el carrusel ya dice lo correcto, **no hay que rehacerlo** — solo corregir
las fichas, que es lo que hace el script.

Se suma además un dato que no estaba en ningún lado: el enjuague va a la misma
temperatura que el lavado. El cambio brusco es lo que apelmaza la fibra,
incluso con agua fría.

---

## 🔎 Una cosa que no puedo verificar desde acá

**¿Estás anotada como admin?** La tabla `admins` está protegida (es lo
correcto), así que desde afuera no puedo ver si tu usuario está adentro.

Si entrás a **Admin → Pedidos** y ves un error en vez de "Todavía no se envió
ningún pedido por acá", te falta este paso. Corré esto para ver tu ID:

```sql
select id, email from auth.users order by created_at;
```

Y después, con tu ID y tu email:

```sql
insert into admins (user_id, email) values ('<tu-id>', '<tu-email>')
on conflict (user_id) do nothing;
```

Si en cambio ves "Todavía no se envió ningún pedido por acá", **está todo
bien** — solo significa que todavía no hubo ningún checkout desde que la tabla
existe. Es lo esperable.
