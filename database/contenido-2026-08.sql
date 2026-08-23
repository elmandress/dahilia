-- ============================================================
-- Dahila Crochet — Correcciones de contenido (agosto 2026)
-- Correr en el SQL Editor de Supabase. Idempotente: se puede
-- re-ejecutar sin romper nada.
-- ============================================================
--
-- QUÉ HACE ESTE ARCHIVO
-- Reemplaza textos del sitio que hoy están mal, se contradicen entre sí, o
-- usan palabras que le restan valor a la marca. Nada de esto toca precios,
-- productos, pedidos ni configuración técnica: son solo textos.
--
-- CÓMO USARLO
-- Está dividido en 4 bloques independientes. Podés correrlos todos juntos o
-- de a uno. LEÉ los textos antes de correr — son la voz de tu marca, y si
-- alguno no te suena, cambialo acá antes de ejecutar.
--
-- ⚠️ UNA DECISIÓN TUYA EN EL BLOQUE 1: el título del home tiene dos
-- opciones. Está puesta la recomendada; si preferís la otra, comentá una y
-- descomentá la otra antes de correr.
--
-- Para ver cómo quedó algo antes de guardarlo, cada bloque tiene un SELECT
-- de verificación al final.
-- ============================================================


-- ============================================================
-- BLOQUE 1 — Textos del home y páginas
-- ============================================================
-- Por qué cambia cada uno:
--
-- hero_title: hoy dice "Tejido artesanal y atemporal". Es lo primero que ve
--   el 100% de quien entra, y no diferencia: una marca industrial podría
--   escribir la misma frase sin mentir. La palabra "artesanal" está gastada
--   de tanto usarla marcas que no tejen nada. El número real, en cambio, no
--   lo puede copiar nadie.
--
-- hero_subtitle: está bien escrito pero en impersonal ("diseñado",
--   "confeccionado") — no hay nadie hablando. Suena a etiqueta, no a Anush.
--
-- about_value_1_body: tiene "artesanal" otra vez, "calidad ante cantidad"
--   (la frase más copiable que existe) y un error de concordancia: dice
--   "ante" donde va "antes que".
--
-- process_3_body: emoji en la interfaz — el propio checklist de diseño del
--   sitio dice de no usarlos. Y en el mismo espacio se puede decir algo útil.
--
-- info_shipping: dice "Pedidos ya y Dac", sin puntuación. Los demás campos
--   de /info están vacíos y el sitio muestra textos de respaldo que están
--   bien; este tiene valor cargado, así que pisa al bueno.
--
-- faq_3_a: "dac" en minúscula, "el cliente" rompe el voseo del resto del
--   sitio, y responde sobre envío nacional una pregunta que es del exterior.
--
-- faq_4_a: el contenido es correcto y honesto, pero arranca con la negativa
--   — y ese es el momento de más ansiedad de toda la compra.

INSERT INTO site_settings (key, value, updated_at) VALUES

  -- ⚠️ ELEGÍ UNA (dejá descomentada solo una de las dos líneas):
  ('hero_title', 'Cada prenda, entre 4 y 22 horas de trabajo.', now()),
  -- ('hero_title', 'Tejido a mano, en tu talle, en Montevideo.', now()),

  ('hero_subtitle', 'Lo tejo yo, en Montevideo.', now()),

  ('about_value_1_body', 'Punto por punto, sin máquina en ningún paso. Un top me lleva 14 horas; un cardigan, 22.', now()),

  ('process_3_body', 'A todo el país por DAC. El costo lo coordinamos por WhatsApp.', now()),

  ('info_shipping', 'Enviamos a todo Uruguay por DAC. El costo depende de dónde estés y lo coordinamos por WhatsApp antes de que pagues. Al exterior también mandamos — escribinos y cotizamos.', now()),

  ('faq_3_a', 'Sí. Coordinamos por WhatsApp y el envío lo pagás vos aparte — te paso el costo exacto antes de que confirmes.', now()),

  ('faq_4_a', 'Como tejo cada pieza a tu medida, no puedo revenderla si no te va — por eso no hago cambios de talle. Lo que sí hago es acompañarte antes: te pido las medidas, te muestro las lanas y confirmamos todo por WhatsApp antes de dar la primera puntada. Si algo llega mal de mi lado, lo arreglo.', now())

ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();


-- ============================================================
-- BLOQUE 2 — El texto de cuidados (¡ojo, esto corrige un error real!)
-- ============================================================
-- Hoy hay NUEVE versiones distintas del texto de cuidados dando vueltas por
-- el catálogo (19 productos comparten una, 6 otra, 3 otra, y 6 tienen la
-- suya propia). Todas dicen lo mismo con palabras distintas, y todas tienen
-- el mismo problema de fondo:
--
--   DICEN "AGUA TIBIA", PERO CORRESPONDE AGUA FRÍA.
--
-- No es una preferencia de redacción:
--   · Lana: el agua tibia la apelmaza, y eso NO tiene vuelta atrás.
--   · Algodón: el calor la encoge y la deforma.
--   · Acrílico: aguanta tibia, pero el calor igual la aplasta.
-- O sea: fría es segura para todo lo que usás; tibia arruina algunas.
--
-- Además, la página /info y el carrusel de Instagram YA dicen "agua fría"
-- (ahí aparece 4 veces). Así que hoy una clienta lee una cosa en la ficha y
-- otra en Instagram. Esto unifica todo en la versión correcta — y por eso
-- NO hay que rehacer el carrusel.
--
-- Se suma un dato que no estaba en ningún lado y es el que más importa: el
-- enjuague va a la misma temperatura que el lavado. El cambio brusco de
-- temperatura es lo que apelmaza la fibra, incluso con agua fría.

-- Va sin filtro de producto A PROPÓSITO: unifica las 9 variantes en una sola.
-- El "IS DISTINCT FROM" hace que solo toque las filas que realmente cambian,
-- así Supabase te dice cuántas actualizó de verdad (la primera vez ~34; si lo
-- volvés a correr, 0 — señal de que ya está aplicado).
-- Si algún día una pieza necesita cuidados propios, editala después desde el
-- admin: este script no la vuelve a pisar salvo que lo corras de nuevo.
UPDATE products SET care_instructions =
'Lavá a mano con agua fría y jabón neutro, sin frotar ni retorcer. Enjuagá con agua a la misma temperatura: el cambio brusco es lo que apelmaza la fibra.
Para secar: apoyala en horizontal sobre una toalla, a la sombra. Nunca colgada — el peso del agua la estira. Nada de secarropas.
Si la guardás mucho tiempo, sacala del placard cada tanto para que la fibra respire.'
WHERE care_instructions IS DISTINCT FROM
'Lavá a mano con agua fría y jabón neutro, sin frotar ni retorcer. Enjuagá con agua a la misma temperatura: el cambio brusco es lo que apelmaza la fibra.
Para secar: apoyala en horizontal sobre una toalla, a la sombra. Nunca colgada — el peso del agua la estira. Nada de secarropas.
Si la guardás mucho tiempo, sacala del placard cada tanto para que la fibra respire.';

-- El mismo texto en la página /info, para que digan exactamente lo mismo.
-- (Ese campo hoy está vacío, por eso el sitio mostraba un texto de respaldo
--  distinto al de las fichas.)
INSERT INTO site_settings (key, value, updated_at) VALUES
  ('info_care', 'Lavá a mano con agua fría y jabón neutro, sin frotar ni retorcer. Enjuagá con agua a la misma temperatura: el cambio brusco es lo que apelmaza la fibra.
Para secar: apoyala en horizontal sobre una toalla, a la sombra. Nunca colgada — el peso del agua la estira. Nada de secarropas.
Si la guardás mucho tiempo, sacala del placard cada tanto para que la fibra respire.', now())
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();


-- ============================================================
-- BLOQUE 3 — Descripciones de 6 productos
-- ============================================================
-- NO son las 34 a propósito. Con una sola persona tejiendo, reescribir 34
-- descripciones son horas que compiten con horas de tejido. Estas 6 son las
-- que más lo necesitaban: dos usaban "artesanal" como relleno, y ninguna
-- decía las horas de trabajo (que es el argumento que más hace pagar).
--
-- Ojo con no convertirlo en plantilla: si "22 horas" aparece en las 34
-- fichas deja de ser un dato y se lee como fórmula, igual que "artesanal".
-- Por eso va donde el número sorprende, no en todas.
--
-- Las horas salen de tu tabla de precios (pestaña Estrategia), no las
-- inventé. Los materiales son los que ya tenías cargados en cada ficha.

UPDATE products SET description =
'Veintidós horas de trabajo, punto por punto, para un cardigan de mangas 3/4 que resuelve el entretiempo: sobre una camisa, sobre un vestido, o con jean y listo.

No lo tengo hecho esperando en un cajón. Lo empiezo cuando lo pedís, en tu talle y en el color que elijas — antes de arrancar te muestro los algodones que tengo y decidimos juntas.

Envío a todo Uruguay.'
WHERE slug = 'cardigan-3-4';

UPDATE products SET description =
'Diecinueve horas de tejido para un poncho de esos que se heredan: abriga de verdad, no pasa de moda y queda bien encima de cualquier cosa que ya tengas puesta.

Lo tejo a pedido, así que el color lo definís vos. Si es para regalar, decímelo cuando escribas y coordinamos los tiempos con margen.

Envío a todo Uruguay.'
WHERE slug = 'poncho';

-- El trapillo reciclado ya estaba cargado en la ficha y no se estaba usando
-- como argumento de venta: estaba escondido detrás de la palabra "artesanal".
UPDATE products SET description =
'Siete horas de crochet en trapillo reciclado: entra el cuaderno, la notebook chica y todo lo que arrastrás en el día. El trapillo aguanta el peso sin darse — por eso lo uso en los bolsos y no en la ropa.

Lo tejo en el color que quieras cuando lo pedís.

Envío a todo Uruguay.'
WHERE slug = 'bolso-de-estudiante';

UPDATE products SET description =
'Cinco horas de tejido en chenille, el hilado más suave que uso: las polainas abrigan el tobillo sin sumar bulto adentro de la bota.

Van con calzas, con jean o por encima de las botas. Las tejo en el color que elijas cuando las pedís.

Envío a todo Uruguay.'
WHERE slug = 'calentadores';

UPDATE products SET description =
'Cuatro horas de crochet en el accesorio más chico del catálogo: en el pelo, al cuello o atada a la cartera. Un mismo accesorio, tres usos.

Es la forma más fácil de tener algo tejido a mano sin pensarlo mucho — y de regalarlo. Elegís el color y la tejo para vos.

Envío a todo Uruguay.'
WHERE slug = 'bandana';

UPDATE products SET description =
'CHERRY lleva catorce horas de crochet y se nota en la caída: el punto tiene cuerpo, no se estira ni se deforma con el uso.

Fresco para el verano, va con shorts de día y con falda de noche. Lo tejo en tu talle y en tus colores cuando lo encargás — contame qué tenés en mente y vemos las opciones.

Envío a todo Uruguay.'
WHERE slug = 'top-cherry';


-- ============================================================
-- BLOQUE 4 — Verificación (no cambia nada, solo muestra el resultado)
-- ============================================================
-- Corré esto después para confirmar que quedó todo bien.

-- 1. Los textos del sitio que se acaban de cambiar:
SELECT key, left(value, 90) AS texto
FROM site_settings
WHERE key IN ('hero_title','hero_subtitle','about_value_1_body','process_3_body',
              'info_shipping','info_care','faq_3_a','faq_4_a')
ORDER BY key;

-- 2. ¿Quedó alguna ficha diciendo "agua tibia"? Tiene que dar 0 filas.
SELECT slug, left(care_instructions, 60) AS cuidados
FROM products
WHERE care_instructions ILIKE '%tibia%';

-- 3. ¿Quedó alguna descripción con las palabras que restan valor?
--    Lo ideal es 0 filas. Si aparece alguna, es una de las 28 que no se
--    tocaron a propósito — se puede corregir cuando toque.
SELECT slug, left(description, 70) AS descripcion
FROM products
WHERE description ILIKE '%artesanal%'
   OR description ILIKE '%con amor%'
   OR description ILIKE '%con pasión%'
   OR description ILIKE '%auténtic%';
