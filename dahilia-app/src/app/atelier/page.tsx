'use client'

import { dahila, Eyebrow } from '@/components/ui/Primitives'

export default function AtelierPage() {
  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 0' }}>
      <div className="atelier-split" style={{
        display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 64, alignItems: 'center',
      }}>
        <img src="/photos/atelier-tejiendo.png" alt="Dahila en su atelier" style={{
          width: '100%', borderRadius: 16, aspectRatio: '4/5', objectFit: 'cover',
        }}/>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Eyebrow>El atelier</Eyebrow>
          <h1 style={{
            fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 'clamp(32px, 5vw, 56px)',
            lineHeight: 1.05, letterSpacing: '-0.02em', color: dahila.ink900, margin: 0,
          }}>Por si todavía no nos conocíamos.</h1>
          <p style={{ fontFamily: dahila.fontSerif, fontStyle: 'italic', fontWeight: 300, fontSize: 18, lineHeight: 1.55, color: dahila.ink700, margin: 0 }}>
            Abrí esta cuenta hace un tiempo, pero me parece clave que sepas quién está detrás de cada hilo.
          </p>
          <p style={{ fontFamily: dahila.fontSans, fontSize: 15, fontWeight: 300, lineHeight: 1.75, color: dahila.ink700, margin: 0, maxWidth: 540 }}>
            Soy Anush. Tejo a crochet desde chica y abrí el atelier en 2023 para hacer lo que más me gusta: prendas únicas, a medida, que no se parezcan a las del resto.
          </p>
          <p style={{ fontFamily: dahila.fontSans, fontSize: 15, fontWeight: 300, lineHeight: 1.75, color: dahila.ink700, margin: 0, maxWidth: 540 }}>
            Cada pieza la pienso con vos. Conversamos, te mando opciones, ajustamos, y tejo. Sin prisa.
          </p>
        </div>
      </div>

      {/* Numbers strip */}
      <section style={{ marginTop: 96 }}>
        <div className="numbers" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
          {[
            { stat: '100%', l: 'lana y algodón natural' },
            { stat: '100%', l: 'tejido a mano' },
            { stat: 'UY', l: 'desde Montevideo' },
          ].map((s) => (
            <div key={s.l} style={{ padding: '28px 0', borderTop: `1px solid ${dahila.border}` }}>
              <div style={{
                fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 56,
                color: dahila.ink900, letterSpacing: '-0.02em', lineHeight: 1,
              }}>{s.stat}</div>
              <div style={{ fontFamily: dahila.fontSerif, fontStyle: 'italic', fontWeight: 300, fontSize: 16, color: dahila.ink700, marginTop: 6 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Photo strip */}
      <section style={{ marginTop: 64 }}>
        <div className="photo-strip" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {['detalle-tejido.jpg', 'atelier-escritorio.png', 'bufanda-verde.png'].map((p) => (
            <img key={p} src={`/photos/${p}`} alt="" style={{
              width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: 12,
            }}/>
          ))}
        </div>
      </section>

      <style>{`
        @media (max-width: 720px) {
          .atelier-split { grid-template-columns: 1fr !important; gap: 28px !important;}
          .numbers       { grid-template-columns: 1fr !important; gap: 0 !important;}
          .photo-strip   { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </main>
  )
}
