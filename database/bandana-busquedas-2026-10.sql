-- ============================================================================
-- Bandana: el texto, con las palabras que la gente busca (05/10/2026)
-- ============================================================================
-- Por qué: en 90 días la ficha de la bandana tuvo 210 impresiones en Google y
-- CERO clics, en posición 10-11 ("bandana" 149, "bandanas" 41, "bandana tejida
-- a crochet precio" 8). O sea: Google ya la muestra, pero abajo del todo.
--
-- También aparece en posición 4 por "pañuelo tejido", una palabra que el texto
-- de la ficha no usa nunca. Esta versión la suma, junto con las tres formas de
-- usarla, que es lo que ya decía el texto anterior. Nada inventado: material,
-- horas y usos salen de lo que ya estaba escrito y de las fotos.
--
-- Qué NO hace: cambiar el precio ni el nombre. Solo el texto de la ficha.
--
-- Seguro de correr dos veces: solo se aplica si nadie editó la ficha desde el
-- 09/09. Si Anush ya la cambió a mano, no toca nada.
-- Cómo: Supabase → SQL Editor → pegar → Run. Se ve en el sitio dentro de la
-- hora (o al instante si después se guarda cualquier cosa desde el admin).
-- ============================================================================

UPDATE products SET description = $d$La bandana es el accesorio más chico del catálogo y el que más formas de usar tiene: en el pelo, como pañuelo al cuello o atada a la cartera. Son cuatro horas de crochet en algodón, así que es fresca y se lava fácil.

Es la forma más simple de tener algo tejido a mano sin pensarlo mucho, y de regalarlo: no depende del talle. Elegís el color y la tejo para vos.

Envío a todo Uruguay.$d$
WHERE slug = 'bandana' AND updated_at = '2026-09-09T16:34:39.31809+00:00';

SELECT slug, length(description) AS caracteres, updated_at::date AS modificada
FROM products WHERE slug = 'bandana';
