// Modelo de contenido del blog.
//
// POR QUÉ ARCHIVOS Y NO BASE DE DATOS: el blog no puede convertirse en una
// fuente nueva de egress (regla explícita del proyecto). Los artículos viven
// como módulos TypeScript, así que se compilan dentro del bundle del servidor y
// las páginas salen 100% estáticas: cero consultas a Supabase por visita. Lo
// único que el blog lee de la base son los productos que recomienda, y eso sale
// del catálogo YA cacheado (lib/catalog.ts), sin una sola query extra.
//
// POR QUÉ BLOQUES Y NO MARKDOWN/MDX: MDX exigiría dependencias nuevas (@next/mdx
// + plugins de remark) y deja el diseño librado a lo que escriba cada archivo.
// Con bloques tipados, el renderer aplica los tokens de Dahila una sola vez y
// TODOS los artículos salen consistentes; además el índice, el schema FAQPage y
// el tiempo de lectura se derivan solos del mismo dato, sin repetirlos a mano.
// El costo es un import por artículo — sostenible hasta cientos de notas.

/** Texto en línea. Admite `[texto](/url)` y `**negrita**` (ver RichText.tsx). */
export type Inline = string

export type Block =
  | { type: 'p'; text: Inline }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: Inline[] }
  | { type: 'ol'; items: Inline[] }
  /** Caja cream con un consejo o advertencia puntual. */
  | { type: 'callout'; title?: string; text: Inline }
  /** Cita/frase destacada en Fraunces itálica. */
  | { type: 'quote'; text: string }
  /** Pasos numerados (proceso, instructivo). */
  | { type: 'steps'; items: { title: string; text: Inline }[] }
  /** Aside chico, en gris — contexto o aclaración de fuente. */
  | { type: 'note'; text: Inline }
  /** Llamada a producto/categoría dentro del cuerpo del artículo. */
  | { type: 'shopCta'; title: string; text: Inline; href: string; label: string }
  /** Preguntas frecuentes. Alimenta también el JSON-LD FAQPage. */
  | { type: 'faq'; items: { q: string; a: Inline }[] }

/** Etapa del embudo. Sirve para no llenar el blog de tráfico que no compra. */
export type Funnel = 'TOFU' | 'MOFU' | 'BOFU'

/** Clusters temáticos. El artículo `pillar` de cada cluster hace de hub: los
 *  de apoyo enlazan hacia él y él hacia ellos (modelo pillar/cluster clásico).
 *  No hay páginas de taxonomía propias a propósito: con pocos artículos por
 *  cluster serían thin content, y el pilar cumple mejor esa función. */
export type Cluster = 'cuidados' | 'comprar' | 'regalos' | 'a-medida'

export const CLUSTER_LABEL: Record<Cluster, string> = {
  cuidados: 'Cuidado de las prendas',
  comprar: 'Comprar crochet',
  regalos: 'Regalos tejidos',
  'a-medida': 'Prendas a medida',
}

export interface Article {
  slug: string
  /** H1 y título de la tarjeta. */
  title: string
  /** <title> del navegador si conviene uno distinto al H1 (más corto/con
   *  keyword). Opcional: por defecto se usa `title`. */
  metaTitle?: string
  /** Meta description. 140-160 caracteres, específica de esta nota. */
  description: string
  /** Bajada visible bajo el H1 y resumen en el listado. */
  excerpt: string
  cluster: Cluster
  role: 'pillar' | 'support'
  funnel: Funnel
  /** ISO date. `updatedAt` solo si de verdad se revisó el contenido. */
  publishedAt: string
  updatedAt?: string
  hero?: { src: string; alt: string }
  body: Block[]
  /** Slugs de productos reales para el bloque de recomendados del pie. */
  relatedProductSlugs?: string[]
  /** Slug de categoría de la tienda hacia la que empuja la nota. */
  relatedCategorySlug?: string
  /** Otras notas relacionadas (interlinking). Si se omite, el pie muestra las
   *  del mismo cluster. */
  relatedArticleSlugs?: string[]
}
