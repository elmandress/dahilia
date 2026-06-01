'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ProductCard } from '@/components/ProductCard'
import type { Product } from '@/lib/types'
import { dahila, Button, Eyebrow, Icon } from '@/components/ui/Primitives'
import { useRouter } from 'next/navigation'

function FAQ({ items }: { items: [string, string][] }) {
  const [open, setOpen] = useState<number>(0)
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {items.map(([q, a], i) => (
        <div key={q} style={{ borderBottom: `1px solid ${dahila.border}` }}>
          <button onClick={() => setOpen(open === i ? -1 : i)} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            width: '100%', textAlign: 'left',
            padding: '20px 0',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14,
            fontFamily: dahila.fontSans, fontSize: 15, fontWeight: 400,
            color: dahila.ink900,
          }}>
            <span>{q}</span>
            <Icon name={open === i ? 'minus' : 'plus'} size={16}/>
          </button>
          {open === i && (
            <p style={{
              fontFamily: dahila.fontSans, fontSize: 14, fontWeight: 300, lineHeight: 1.7,
              color: dahila.ink700, margin: 0, padding: '0 0 20px',
              maxWidth: 640,
            }}>{a}</p>
          )}
        </div>
      ))}
    </div>
  )
}

export function HomeClient({ products, settings }: { products: Product[], settings: any }) {
  const router = useRouter()
  const featured = products.slice(0, 4)
  const accesorios = products.filter(p => p.category?.slug === 'accesorios').slice(0, 4)

  return (
    <main>
      {/* HERO — full-bleed photo, minimal text */}
      <section style={{ position: 'relative', background: '#fff' }}>
        <div style={{
          position: 'relative', overflow: 'hidden',
          aspectRatio: '16 / 8',
          maxHeight: 640,
        }}>
          <img
            src="/photos/top-lace-parque.png"
            alt="Top de crochet — Dahila"
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center 30%',
            }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to right, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 50%)',
          }}/>
          <div className="hero-content" style={{
            position: 'absolute', inset: 0,
            maxWidth: 1280, margin: '0 auto',
            padding: '0 32px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
          }}>
            <div style={{ maxWidth: 460 }}>
              <Eyebrow style={{ color: dahila.ink900 }}>{settings?.hero_subtitle || 'Otoño 2026 — Edición a medida'}</Eyebrow>
              <h1 style={{
                fontFamily: dahila.fontDisplay, fontWeight: 300,
                fontSize: 'clamp(40px, 6vw, 76px)', lineHeight: 1.02,
                letterSpacing: '-0.02em', color: dahila.ink900,
                margin: '14px 0 22px',
              }}>
                {settings?.hero_title || 'Tejido con tiempo.'}
              </h1>
              <Button variant="primary" size="lg" onClick={() => router.push('/tienda')}>
                {settings?.hero_cta || 'Ver tienda'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* NEW IN */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '72px 24px 0' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          marginBottom: 32, paddingBottom: 12,
          borderBottom: `1px solid ${dahila.border}`,
        }}>
          <h2 style={{
            fontFamily: dahila.fontDisplay, fontWeight: 300,
            fontSize: 22, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: dahila.ink900, margin: 0,
          }}>New in</h2>
          <button onClick={() => router.push('/tienda')} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontFamily: dahila.fontSans, fontSize: 12, fontWeight: 400,
            letterSpacing: '0.06em', color: dahila.ink700,
          }}>Ver más →</button>
        </div>

        <div className="product-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22,
        }}>
          {featured.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* SUBTLE PROCESS STRIP — three lines, cream card */}
      <section style={{ maxWidth: 1280, margin: '88px auto 0', padding: '0 24px' }}>
        <div className="process" style={{
          background: dahila.cream100,
          borderRadius: 16,
          padding: '48px 56px',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40,
        }}>
          {[
            { t: 'A medida', b: 'Cada pieza la trabajo con tu medida exacta y los colores que elegís vos.' },
            { t: 'Hecho a mano', b: 'Lana natural, sin prisa. Entre dos y seis semanas según el modelo.' },
            { t: 'Envío incluido', b: 'A todo Uruguay. Internacionales bajo consulta, con tracking.' },
          ].map((s) => (
            <div key={s.t} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <h3 style={{
                fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 20,
                color: dahila.ink900, margin: 0,
              }}>{s.t}</h3>
              <p style={{
                fontFamily: dahila.fontSans, fontSize: 14, fontWeight: 300, lineHeight: 1.65,
                color: dahila.ink700, margin: 0,
              }}>{s.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECOND ROW — ACCESORIOS */}
      {accesorios.length > 0 && (
        <section style={{ maxWidth: 1280, margin: '88px auto 0', padding: '0 24px' }}>
          <h2 style={{
            fontFamily: dahila.fontDisplay, fontWeight: 300,
            fontSize: 22, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: dahila.ink900, margin: '0 0 32px',
            paddingBottom: 12, borderBottom: `1px solid ${dahila.border}`,
          }}>Accesorios</h2>
          <div className="product-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22,
          }}>
            {accesorios.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* SPLIT — atelier image + about */}
      <section style={{ maxWidth: 1280, margin: '88px auto 0', padding: '0 24px' }}>
        <div className="split" style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center',
        }}>
          <img src="/photos/atelier-escritorio.png" alt="Atelier" style={{
            width: '100%', borderRadius: 16, aspectRatio: '4/5', objectFit: 'cover',
          }}/>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Eyebrow>El atelier</Eyebrow>
            <h2 style={{
              fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 38,
              lineHeight: 1.1, letterSpacing: '-0.01em', color: dahila.ink900, margin: 0,
            }}>
              Detrás de cada hilo<br/>
              <em style={{ fontStyle: 'italic', color: dahila.ink700 }}>está mi mesa.</em>
            </h2>
            <p style={{ fontFamily: dahila.fontSans, fontSize: 15, fontWeight: 300, lineHeight: 1.7, color: dahila.ink700, margin: 0, maxWidth: 460 }}>
              Soy Dahila. Tejo a crochet desde chica y abrí el atelier en 2023 para hacer prendas únicas, sin apuro y con vos.
            </p>
            <div style={{ marginTop: 6 }}>
              <Button variant="secondary" onClick={() => router.push('/atelier')}>Conocé el atelier</Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: 880, margin: '88px auto 0', padding: '0 24px' }}>
        <h2 style={{
          fontFamily: dahila.fontDisplay, fontWeight: 300,
          fontSize: 22, letterSpacing: '0.08em', textTransform: 'uppercase',
          color: dahila.ink900, margin: '0 0 28px', textAlign: 'center',
        }}>Preguntas frecuentes</h2>
        <FAQ items={[
          ['¿Cuánto tarda un encargo?', 'Entre dos y seis semanas, dependiendo del modelo. Te aviso por mail apenas empiezo y cuando está lista.'],
          ['¿Puedo elegir colores?', 'Sí. Después de confirmar el modelo te muestro las lanas reales que tengo en el atelier y elegimos juntas.'],
          ['¿Hacen envíos al exterior?', 'Bajo consulta. Trabajé con clientas en Argentina, Brasil y España — escribime y vemos costos.'],
          ['¿Aceptan devoluciones?', 'Como cada pieza se hace a medida, no aceptamos cambios. Por eso te acompaño durante todo el proceso.'],
        ]}/>
      </section>

      {/* Mobile-first responsive overrides */}
      <style>{`
        @media (max-width: 720px) {
          .product-grid { grid-template-columns: 1fr 1fr !important; gap: 14px !important; }
          .process     { grid-template-columns: 1fr !important; padding: 32px 28px !important; gap: 24px !important;}
          .split       { grid-template-columns: 1fr !important; gap: 28px !important;}
          .hero-content { padding: 0 24px !important; }
        }
      `}</style>
    </main>
  )
}
