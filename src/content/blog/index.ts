import type { Article, Cluster } from './types'

import { article as cuidarPrendas } from './articles/como-cuidar-prendas-de-crochet'
import { article as lavarCrochet } from './articles/como-lavar-crochet-a-mano'
import { article as guardarTejidas } from './articles/como-guardar-prendas-tejidas'
import { article as comprarUruguay } from './articles/comprar-crochet-en-uruguay'
import { article as cuantoCuesta } from './articles/cuanto-cuesta-una-prenda-tejida-a-mano'
import { article as crochetODosAgujas } from './articles/crochet-o-dos-agujas-diferencias'
import { article as regalosTejidos } from './articles/regalos-tejidos-a-mano'
import { article as encargoAMedida } from './articles/como-encargar-prenda-a-medida'
import { article as queTalle } from './articles/que-talle-de-prenda-tejida-me-queda'
import { article as cuantoDemora } from './articles/cuanto-demora-una-prenda-tejida-a-mano'
import { article as cardiganComoElegir } from './articles/cardigan-de-crochet-como-elegirlo'
import { article as lanaPica } from './articles/la-lana-pica-fibras-piel-sensible'
import { article as topsVerano } from './articles/tops-de-crochet-para-verano'
import { article as bolsosDuran } from './articles/bolsos-de-crochet-por-que-duran'
import { article as materiales } from './articles/materiales-de-una-prenda-tejida'
import { article as setVsSueltas } from './articles/set-tejido-vs-piezas-sueltas'
import { article as crochetAMaquina } from './articles/el-crochet-se-hace-a-maquina'
import { article as holgura } from './articles/holgura-prenda-tejida'
import { article as queDebajo } from './articles/que-ponerse-debajo-de-un-top-de-crochet'
import { article as primerosAuxilios } from './articles/primeros-auxilios-prenda-tejida'
import { article as entretiempo } from './articles/entretiempo-uruguay-prendas-tejidas'
import { article as amigoInvisible } from './articles/regalos-amigo-invisible-tejidos'
import { article as regalosNavidad } from './articles/regalos-de-navidad-tejidos-a-mano'
import { article as regaloAmiga } from './articles/regalos-para-una-amiga-tejidos'
import { article as accesoriosPlaya } from './articles/accesorios-tejidos-para-la-playa'
import { article as chalecoCombinar } from './articles/chaleco-tejido-como-combinarlo'
import { article as pelotitas } from './articles/pelotitas-en-prendas-tejidas'

/**
 * Registro de artículos. Agregar una nota = crear el archivo en `articles/` e
 * importarlo acá. Es a propósito el único paso manual: un import explícito le
 * da a TypeScript la posibilidad de validar el artículo entero en build, cosa
 * que una lectura dinámica del directorio no permite.
 *
 * El orden de este array es el orden por defecto del listado, así que el
 * criterio editorial (qué nota queremos arriba) se decide acá, no por fecha.
 */
const ARTICLES: Article[] = [
  comprarUruguay,
  crochetAMaquina,
  queTalle,
  holgura,
  cardiganComoElegir,
  chalecoCombinar,
  entretiempo,
  topsVerano,
  queDebajo,
  materiales,
  setVsSueltas,
  bolsosDuran,
  accesoriosPlaya,
  cuidarPrendas,
  primerosAuxilios,
  pelotitas,
  encargoAMedida,
  cuantoDemora,
  lanaPica,
  regalosTejidos,
  regalosNavidad,
  amigoInvisible,
  regaloAmiga,
  cuantoCuesta,
  lavarCrochet,
  crochetODosAgujas,
  guardarTejidas,
]

export function getAllArticles(): Article[] {
  return ARTICLES
}

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug)
}

/**
 * Notas para la franja "Notas del taller" de la home. La home es la página que
 * Google rastrea más seguido (Search Console, 13/09/2026): un enlace desde ahí
 * es la forma más rápida de que descubra una nota nueva. Se eligen a mano, por
 * criterio editorial y de temporada; si alguna deja de existir, se completa
 * con las más nuevas.
 */
const HOME_ARTICLE_SLUGS = [
  'regalos-de-navidad-tejidos-a-mano',
  'accesorios-tejidos-para-la-playa',
  'pelotitas-en-prendas-tejidas',
]

export function getHomeArticles(limit = 3): Article[] {
  const picked = HOME_ARTICLE_SLUGS
    .map((slug) => getArticle(slug))
    .filter((a): a is Article => !!a)
  const newest = [...ARTICLES]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .filter((a) => !picked.includes(a))
  return [...picked, ...newest].slice(0, limit)
}

/** Artículos de un cluster, con el pilar primero. */
export function getClusterArticles(cluster: Cluster): Article[] {
  return ARTICLES
    .filter((a) => a.cluster === cluster)
    .sort((a, b) => (a.role === 'pillar' ? -1 : 0) - (b.role === 'pillar' ? -1 : 0))
}

/** Clusters que tienen al menos un artículo, en el orden en que aparecen. */
export function getUsedClusters(): Cluster[] {
  const seen: Cluster[] = []
  for (const a of ARTICLES) if (!seen.includes(a.cluster)) seen.push(a.cluster)
  return seen
}

/**
 * Notas para el pie de una categoría de la tienda (/tienda/cardigans…): las que
 * empujan hacia esa categoría, primero las que la nombran en el slug
 * ("cardigan-de-crochet-como-elegirlo" en cardigans). Las notas ya enlazaban a
 * su categoría, pero las categorías no enlazaban a ninguna nota, y una nota
 * nueva depende de esos enlaces para que Google la encuentre (Search Console,
 * 13/09/2026: las 3 notas que "no reconoce" son las de cardigans, tops y sets).
 */
export function getCategoryGuides(categorySlug: string, limit = 3): Article[] {
  const root = categorySlug.replace(/s$/, '')
  const score = (a: Article) => (a.slug.includes(root) ? 2 : 0) + (a.role === 'pillar' ? 1 : 0)
  return ARTICLES
    .filter((a) => a.relatedCategorySlug === categorySlug)
    .sort((a, b) => score(b) - score(a) || b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, limit)
}

/**
 * Notas relacionadas para el pie de un artículo. Usa las declaradas a mano y,
 * si faltan, completa con las del mismo cluster: así una nota nueva nunca
 * queda sin salida hacia el resto del blog (que es donde se pierde el
 * enlazado interno cuando el contenido crece).
 */
export function getRelatedArticles(article: Article, limit = 3): Article[] {
  const explicit = (article.relatedArticleSlugs ?? [])
    .map((slug) => getArticle(slug))
    .filter((a): a is Article => !!a && a.slug !== article.slug)

  if (explicit.length >= limit) return explicit.slice(0, limit)

  const sameCluster = ARTICLES.filter(
    (a) => a.cluster === article.cluster && a.slug !== article.slug && !explicit.includes(a)
  )
  const rest = ARTICLES.filter(
    (a) => a.cluster !== article.cluster && a.slug !== article.slug && !explicit.includes(a)
  )
  return [...explicit, ...sameCluster, ...rest].slice(0, limit)
}
