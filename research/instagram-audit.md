# Instagram audit — @dahila.crochet

Fecha: 2026-08-17.

## Cuenta encontrada

Confirmada por dos fuentes del propio repo, no por adivinanza:
- `src/app/layout.tsx` → JSON-LD Organization, `sameAs: ['https://www.instagram.com/dahila.crochet/']`
- `src/components/Footer.tsx` → link visible "@dahila.crochet" → `https://www.instagram.com/dahila.crochet/`

Handle: **@dahila.crochet**

## ⚠️ Nota importante sobre el método (leer antes de usar estos datos)

Instagram no sirve el perfil completo a un fetch sin sesión iniciada — solo entrega un `<meta>` tag `og:description` pensado para previews de links, más un bundle de JS que carga el resto solo si hay login. Al pedirle a la herramienta de fetch automático que describiera el perfil, la primera respuesta devolvió una bio larga con emojis, conteo de seguidores, y una lista de "story highlights" (Ustedes, Envíos, Creando, Inspo, Info, Medidas) con mucho detalle. Eso me hizo sospechar, así que lo verifiqué con un segundo fetch (que ya no pudo sostener los mismos datos) y bajé el HTML crudo yo mismo por fuera de esa herramienta.

**Resultado: el HTML real no contiene bio, ni highlights, ni grilla de posts — solo el meta tag de preview.** El conteo de seguidores que había inventado la primera respuesta (4.120) tampoco coincidía exactamente con el real (4.114) — suficientemente parecido para sonar creíble, pero inventado. Así que **descarté toda esa descripción como no confiable** y me quedo únicamente con lo que pude verificar en el HTML crudo. Te aviso esto explícitamente para que no se cuele un dato inventado en la estrategia.

## Lo único verificado (HTML crudo, meta tag `og:description`)

```
4,114 Followers, 85 Following, 38 Posts - See Instagram photos and videos
from Ropa y accesorios a crochet 🪡 (@dahila.crochet)
```

De acá se puede extraer con confianza:
- **Seguidores**: 4.114
- **Siguiendo**: 85
- **Posts publicados**: 38
- **Nombre de perfil / tagline corta** (campo "Nombre", no la bio completa): **"Ropa y accesorios a crochet 🪡"** — coherente con el catálogo real del repo (tops, cardigans, accesorios) y con el emoji de aguja/costura.

Todo lo demás — bio completa, tono de las captions, hashtags usados, qué formatos publican (fotos/reels/carruseles), qué posts tienen más interacción, highlights de historias, paleta y estilo fotográfico de la grilla — **no se pudo obtener por esta vía** (perfil requiere sesión iniciada para ver el resto).

## Qué hacer con esto

Siguiendo la instrucción del pedido original ("si no encontrás la cuenta o el perfil es privado/inaccesible, documentalo y seguí igual con lo que da el repo — no bloquees el resto del trabajo por esto"): la cuenta SÍ existe y está identificada con certeza, pero su contenido visual/editorial no es accesible por herramientas automáticas sin login. Para la Fase 2 (brand-brief) y Fase 4 (estrategia) me apoyo en:
1. Los 38 posts existentes y el nombre de perfil confirman que el catálogo real (tops, cardigans, accesorios en crochet) es lo que ya se comunica — no hay contradicción con el repo.
2. Todo lo demás (paleta real de la grilla, qué ángulos de contenido ya cubren, qué formato funciona mejor) se define en la Fase 3 con research de la industria en general, y quedará marcado como supuesto razonado, no como hecho verificado del perfil.

**Recomendación**: si querés que el carrusel #3 evite pisar contenido que ya publicaste, lo más rápido es que vos me pases 3-4 capturas de pantalla de tu grilla actual (o me digas de memoria qué temas ya cubriste) — con eso afino la elección del ángulo #3 con datos reales en vez de una suposición razonable.
