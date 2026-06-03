'use client'

import { useState } from 'react'
import Image from 'next/image'
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

function EmptyCollectionState({ onCta }: { onCta: () => void }) {
  return (
    <div style={{
      gridColumn: '1 / -1',
      background: dahila.cream100,
      borderRadius: 16,
      padding: '56px 32px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14,
    }}>
      <Eyebrow>Próximamente</Eyebrow>
      <h3 style={{
        fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 24,
        color: dahila.ink900, margin: 0,
      }}>
        No hay colecciones activas por ahora.
      </h3>
      <p style={{
        fontFamily: dahila.fontSans, fontSize: 14, fontWeight: 300, lineHeight: 1.7,
        color: dahila.ink700, margin: 0, maxWidth: 460,
      }}>
        Estoy preparando la próxima edición. Mientras tanto, podés encargar tu prenda a medida y la tejo para vos.
      </p>
      <div style={{ marginTop: 10 }}>
        <Button variant="primary" onClick={onCta}>Encargar a medida</Button>
      </div>
    </div>
  )
}

interface HomeSettings {
  hero_subtitle?: string
  hero_title?: string
  hero_cta?: string
}

export function HomeClient({ products, settings }: { products: Product[], settings: HomeSettings }) {
  const router = useRouter()
  const featured = products.slice(0, 4)
  const accesorios = products.filter(p => p.category?.slug === 'accesorios').slice(0, 4)

  return (
    <main>
      {/* HERO — full-bleed photo, minimal text */}
      <section className="hero" style={{ position: 'relative', background: '#fff' }}>
        <div className="hero-frame" style={{ position: 'relative', overflow: 'hidden' }}>
          <Image
            src="/photos/top-lace-parque.png"
            alt="Top de crochet — Dahila"
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
          />
          {/* Readability scrim: stronger on the left where copy sits, fades right */}
          <div aria-hidden style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to right, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.45) 35%, rgba(255,255,255,0) 65%)',
          }}/>
          <div aria-hidden style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(255,255,255,0) 60%, rgba(255,255,255,0.35) 100%)',
          }}/>
          <div className="hero-content" style={{
            position: 'absolute', inset: 0,
            maxWidth: 1280, margin: '0 auto',
            padding: '0 32px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
          }}>
            <div style={{ maxWidth: 480 }}>
              <Eyebrow style={{
                color: dahila.ink900,
                textShadow: '0 1px 14px rgba(255,255,255,0.7)',
              }}>
                {settings?.hero_subtitle || 'Otoño 2026 — Edición a medida'}
              </Eyebrow>
              <h1 style={{
                fontFamily: dahila.fontDisplay, fontWeight: 300,
                fontSize: 'clamp(36px, 5.5vw, 68px)', lineHeight: 1.02,
                letterSpacing: '-0.02em', color: dahila.ink900,
                margin: '14px 0 22px',
                textShadow: '0 2px 20px rgba(255,255,255,0.55)',
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
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 24px 0' }}>
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
          {featured.length > 0
            ? featured.map(product => <ProductCard key={product.id} product={product} />)
            : <EmptyCollectionState onCta={() => router.push('/encargo')} />}
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
          <div style={{ position: 'relative', width: '100%', aspectRatio: '4/5', borderRadius: 16, overflow: 'hidden' }}>
            <Image
              src="/photos/atelier-escritorio.png"
              alt="Atelier de Dahila"
              fill
              sizes="(max-width: 720px) 100vw, 640px"
              style={{ objectFit: 'cover' }}
            />
          </div>
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

    </main>
  )
}
