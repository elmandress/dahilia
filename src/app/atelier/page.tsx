import type { Metadata } from 'next'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { dahila, Eyebrow } from '@/components/ui/Primitives'
import { SITE_URL } from '@/lib/env'
import { OG_BASE } from '@/lib/og'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Quién teje tus prendas — el taller',
  description: 'Conocé a Anush y el taller de Montevideo donde nace cada pieza: lana elegida a mano, tu medida real y tejido sin apuro. Así se hace lo que ninguna máquina puede.',
  alternates: { canonical: '/atelier' },
  openGraph: {
    ...OG_BASE,
    title: 'Quién teje tus prendas — el taller',
    description: 'Conocé a Anush y el taller de Montevideo donde nace cada pieza: lana elegida a mano, tu medida real y tejido sin apuro.',
    url: '/atelier',
  },
}

export default async function AtelierPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_settings')
    .select('*')
    .in('key', [
      'about_image_url', 'about_body', 'about_body_2', 'about_title', 'about_eyebrow',
      'about_quote',
      'about_value_1_title', 'about_value_1_body',
      'about_value_2_title', 'about_value_2_body',
      'about_value_3_title', 'about_value_3_body',
      'atelier_photo_1', 'atelier_photo_2', 'atelier_photo_3',
    ])

  const s = (data ?? []).reduce<Record<string, string>>(
    (acc, curr) => ({ ...acc, [curr.key]: String(curr.value ?? '') }),
    {}
  )
  const val = (key: string, fallback: string) => (s[key]?.trim() ? s[key] : fallback)

  const heroImage = val('about_image_url', '/photos/atelier-tejiendo.png')
  const body = val('about_body',
    'En Dahila tejemos a crochet desde hace años. Hacemos prendas únicas, pensadas con vos: trabajamos con lanas y algodones naturales, sin prisa, paso a paso. Cada pieza la pensamos con la persona que la va a usar — conversamos, vemos colores, ajustamos medidas, y tejemos.')
  const body2 = s.about_body_2?.trim()
  const quote = s.about_quote?.trim()

  const values = [
    { t: val('about_value_1_title', 'Hecho a mano'), b: val('about_value_1_body', 'Cada prenda se teje pieza por pieza, sin máquinas.') },
    { t: val('about_value_2_title', 'A tu medida'),   b: val('about_value_2_body', 'Ajustamos talle y colores a lo que vos querés.') },
    { t: val('about_value_3_title', 'Materiales nobles'), b: val('about_value_3_body', 'Lana y algodón natural, elegidos con cuidado.') },
  ]

  const stripPhotos = [
    val('atelier_photo_1', '/photos/detalle-tejido.jpg'),
    val('atelier_photo_2', '/photos/atelier-escritorio.png'),
    val('atelier_photo_3', '/photos/bufanda-verde.png'),
  ]

  // Person (Anush) enlazada a la Organization del layout vía worksFor — la
  // entidad "quién está detrás" que los motores de respuesta (ChatGPT,
  // Perplexity, Gemini) usan para citar marcas chicas con confianza. Datos
  // reales y estables, nada inventado.
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Anush',
    jobTitle: 'Tejedora y fundadora',
    description: 'Artesana de crochet. Teje a mano, a medida, cada pieza de Dahila Crochet desde Montevideo, Uruguay.',
    knowsAbout: ['crochet', 'tejido a mano', 'ropa a medida', 'slow fashion'],
    worksFor: { '@type': 'Organization', name: 'Dahila Crochet', url: SITE_URL },
    url: `${SITE_URL}/atelier`,
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 0' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <div className="atelier-split" style={{
        display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 64, alignItems: 'center',
      }}>
        <div style={{ position: 'relative', width: '100%', aspectRatio: '4/5', borderRadius: 16, overflow: 'hidden' }}>
          <Image
            src={heroImage}
            alt="Tejiendo en Dahila"
            fill
            sizes="(max-width: 720px) 100vw, 600px"
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Eyebrow>{val('about_eyebrow', 'Sobre nosotros')}</Eyebrow>
          <h1 style={{
            fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 'clamp(32px, 5vw, 56px)',
            lineHeight: 1.05, letterSpacing: '-0.02em', color: dahila.ink900, margin: 0,
          }}>
            {val('about_title', 'Quiénes estamos detrás de cada pieza.')}
          </h1>
          <p style={{
            fontFamily: dahila.fontSans, fontSize: 16, fontWeight: 300, lineHeight: 1.75,
            color: dahila.ink700, margin: 0, maxWidth: 540, whiteSpace: 'pre-line',
          }}>
            {body}
          </p>
          {body2 && (
            <p style={{
              fontFamily: dahila.fontSans, fontSize: 16, fontWeight: 300, lineHeight: 1.75,
              color: dahila.ink700, margin: 0, maxWidth: 540, whiteSpace: 'pre-line',
            }}>
              {body2}
            </p>
          )}
        </div>
      </div>

      {/* Editable pull-quote */}
      {quote && (
        <section style={{ marginTop: 80, textAlign: 'center', maxWidth: 760, margin: '80px auto 0' }}>
          <blockquote style={{
            fontFamily: dahila.fontSerif, fontStyle: 'italic', fontWeight: 300,
            fontSize: 'clamp(22px, 3.2vw, 32px)', lineHeight: 1.4,
            color: dahila.ink900, margin: 0,
          }}>
            “{quote}”
          </blockquote>
        </section>
      )}

      {/* Values — editable */}
      <section style={{ marginTop: 88 }}>
        <div className="numbers" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40 }}>
          {values.map((v) => (
            <div key={v.t} style={{ padding: '28px 0', borderTop: `1px solid ${dahila.border}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{
                fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 22,
                color: dahila.ink900, letterSpacing: '-0.01em', lineHeight: 1.1,
              }}>{v.t}</div>
              <div style={{ fontFamily: dahila.fontSans, fontSize: 14, fontWeight: 300, lineHeight: 1.65, color: dahila.ink700 }}>{v.b}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Photo strip — CMS-editable via atelier_photo_1/2/3 in site_settings */}
      <section style={{ marginTop: 64, marginBottom: 96 }}>
        <div className="photo-strip" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {stripPhotos.map((src, i) => (
            <div key={i} style={{ position: 'relative', width: '100%', aspectRatio: '3/4', borderRadius: 12, overflow: 'hidden' }}>
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width: 720px) 50vw, 33vw"
                style={{ objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
