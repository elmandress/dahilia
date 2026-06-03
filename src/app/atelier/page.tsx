import type { Metadata } from 'next'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { dahila, Eyebrow } from '@/components/ui/Primitives'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Sobre Anush',
  description: 'Quién está detrás de Dahila Crochet. Anush teje a mano en Uruguay, con lana natural y prendas únicas.',
  alternates: { canonical: '/atelier' },
  openGraph: {
    title: 'Sobre Anush | Dahila Crochet',
    description: 'Quién está detrás de Dahila Crochet. Anush teje a mano en Uruguay, con lana natural y prendas únicas.',
    url: '/atelier',
  },
}

export default async function AtelierPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_settings')
    .select('*')
    .in('key', ['about_image_url', 'about_body', 'about_title', 'about_eyebrow'])

  const settings = (data ?? []).reduce<Record<string, string>>(
    (acc, curr) => ({ ...acc, [curr.key]: String(curr.value ?? '') }),
    {}
  )

  const heroImage = settings.about_image_url || '/photos/atelier-tejiendo.png'
  const body = settings.about_body ||
    'Soy Anush. Tejo a crochet desde chica y hago prendas únicas, pensadas con vos. Trabajo con lanas y algodones naturales, sin prisa, paso a paso. Cada pieza la pienso con la persona que la va a usar: conversamos, vemos colores, ajustamos medidas, y tejo.'

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 0' }}>
      <div className="atelier-split" style={{
        display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 64, alignItems: 'center',
      }}>
        <div style={{ position: 'relative', width: '100%', aspectRatio: '4/5', borderRadius: 16, overflow: 'hidden' }}>
          <Image
            src={heroImage}
            alt="Anush tejiendo"
            fill
            sizes="(max-width: 720px) 100vw, 600px"
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Eyebrow>{settings.about_eyebrow || 'Sobre Anush'}</Eyebrow>
          <h1 style={{
            fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 'clamp(32px, 5vw, 56px)',
            lineHeight: 1.05, letterSpacing: '-0.02em', color: dahila.ink900, margin: 0,
          }}>
            {settings.about_title || 'Quién está detrás de cada pieza.'}
          </h1>
          <p style={{
            fontFamily: dahila.fontSans, fontSize: 16, fontWeight: 300, lineHeight: 1.75,
            color: dahila.ink700, margin: 0, maxWidth: 540, whiteSpace: 'pre-line',
          }}>
            {body}
          </p>
        </div>
      </div>

      {/* Numbers strip */}
      <section style={{ marginTop: 96 }}>
        <div className="numbers" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
          {[
            { stat: 'Natural',     l: 'lana y algodón' },
            { stat: 'A mano',      l: 'sin máquinas' },
            { stat: 'Montevideo',  l: 'desde Uruguay' },
          ].map((s) => (
            <div key={s.l} style={{ padding: '28px 0', borderTop: `1px solid ${dahila.border}` }}>
              <div style={{
                fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 'clamp(28px, 4vw, 48px)',
                color: dahila.ink900, letterSpacing: '-0.02em', lineHeight: 1,
              }}>{s.stat}</div>
              <div style={{ fontFamily: dahila.fontSerif, fontStyle: 'italic', fontWeight: 300, fontSize: 16, color: dahila.ink700, marginTop: 6 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Photo strip */}
      <section style={{ marginTop: 64, marginBottom: 96 }}>
        <div className="photo-strip" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {['detalle-tejido.jpg', 'atelier-escritorio.png', 'bufanda-verde.png'].map((p) => (
            <div key={p} style={{ position: 'relative', width: '100%', aspectRatio: '3/4', borderRadius: 12, overflow: 'hidden' }}>
              <Image
                src={`/photos/${p}`}
                alt=""
                fill
                sizes="(max-width: 720px) 50vw, 33vw"
                style={{ objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
