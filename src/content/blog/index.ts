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
  entretiempo,
  topsVerano,
  queDebajo,
  materiales,
  setVsSueltas,
  bolsosDuran,
  cuidarPrendas,
  primerosAuxilios,
  encargoAMedida,
  cuantoDemora,
  lanaPica,
  regalosTejidos,
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
