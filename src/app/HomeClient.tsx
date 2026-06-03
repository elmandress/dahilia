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
          <button
            onClick={() => setOpen(open === i ? -1 : i)}
            aria-expanded={open === i}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              width: '100%', textAlign: 'left',
              padding: '20px 0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14,
              fontFamily: dahila.fontSans, fontSize: 15, fontWeight: 400,
              color: dahila.ink900,
            }}
          >
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
        No hay piezas en la tienda por ahora.
      </h3>
      <p style={{
        fontFamily: dahila.fontSans, fontSize: 14, fontWeight: 300, lineHeight: 1.7,
        color: dahila.ink700, margin: 0, maxWidth: 460,
      }}>
        Estoy preparando la próxima edición. Mientras tanto podés pedir una prenda a medida.
      </p>
      <div style={{ marginTop: 10 }}>
        <Button variant="primary" onClick={onCta}>Pedir a medida</Button>
      </div>
    </div>
  )
}

// Site settings shape — only the keys this page reads from.
export type HomeSettings = Partial<Record<
  | 'hero_subtitle' | 'hero_title' | 'hero_cta' | 'hero_image_url'
  | 'process_1_title' | 'process_1_body'
  | 'process_2_title' | 'process_2_body'
  | 'process_3_title' | 'process_3_body'
  | 'about_eyebrow' | 'about_title' | 'about_title_em' | 'about_body' | 'about_image_url' | 'about_cta'
  | 'faq_1_q' | 'faq_1_a'
  | 'faq_2_q' | 'faq_2_a'
  | 'faq_3_q' | 'faq_3_a'
  | 'faq_4_q' | 'faq_4_a',
  string
>>

function val<K extends keyof HomeSettings>(s: HomeSettings, key: K, fallback: string): string {
  const v = s?.[key]
  return v && v.trim() !== '' ? v : fallback
}

export function HomeClient({ products, settings }: { products: Product[]; settings: HomeSettings }) {
  const router = useRouter()
  const featured = products.slice(0, 4)
  const accesorios = products.filter((p) => p.category?.slug === 'accesorios').slice(0, 4)

  const heroImage = val(settings, 'hero_image_url', '/photos/top-lace-parque.png')
  const aboutImage = val(settings, 'about_image_url', '/photos/atelier-escritorio.png')

  const processItems = [
    { t: val(settings, 'process_1_title', 'A medida'),
      b: val(settings, 'process_1_body', 'Cada pieza la trabajo con tu medida exacta y los colores que elegís vos.') },
    { t: val(settings, 'process_2_title', 'Hecho a mano'),
      b: val(settings, 'process_2_body', 'Lana natural, sin prisa. El plazo lo charlamos según el modelo.') },
    { t: val(settings, 'process_3_title', 'Envío incluido'),
      b: val(settings, 'process_3_body', 'A todo Uruguay. Internacionales bajo consulta.') },
  ]

  const faqItems: [string, string][] = [
    [val(settings, 'faq_1_q', '¿Cuánto tarda un encargo?'),
     val(settings, 'faq_1_a', 'Depende del modelo. Te aviso cuando empiezo y cuando está lista.')],
    [val(settings, 'faq_2_q', '¿Puedo elegir colores?'),
     val(settings, 'faq_2_a', 'Sí. Después de confirmar el modelo te muestro las lanas reales que tengo y elegimos juntas.')],
    [val(settings, 'faq_3_q', '¿Hacen envíos al exterior?'),
     val(settings, 'faq_3_a', 'Bajo consulta. Trabajé con clientas en Argentina, Brasil y España — escribime y vemos costos.')],
    [val(settings, 'faq_4_q', '¿Aceptan devoluciones?'),
     val(settings, 'faq_4_a', 'Como cada pieza se hace a medida, no aceptamos cambios. Por eso te acompaño durante todo el proceso.')],
  ]

  return (
    <main>
      {/* HERO */}
      <section className="hero" style={{ position: 'relative', background: '#fff' }}>
        <div className="hero-frame" style={{ position: 'relative', overflow: 'hidden' }}>
          <Image
            src={heroImage}
            alt="Prenda de crochet — Dahila"
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
          />
          <div aria-hidden style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to right, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.48) 35%, rgba(255,255,255,0) 65%)',
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
                {val(settings, 'hero_subtitle', 'Edición a medida')}
              </Eyebrow>
              <h1 style={{
                fontFamily: dahila.fontDisplay, fontWeight: 300,
                fontSize: 'clamp(34px, 5.5vw, 68px)', lineHeight: 1.02,
                letterSpacing: '-0.02em', color: dahila.ink900,
                margin: '14px 0 22px',
                textShadow: '0 2px 20px rgba(255,255,255,0.55)',
              }}>
                {val(settings, 'hero_title', 'Tejido con tiempo.')}
              </h1>
              <Button variant="primary" size="lg" onClick={() => router.push('/tienda')}>
                {val(settings, 'hero_cta', 'Ver tienda')}
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
          }}>Nuevo</h2>
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
            ? featured.map((product) => <ProductCard key={product.id} product={product} />)
            : <EmptyCollectionState onCta={() => router.push('/encargo')} />}
        </div>
      </section>

      {/* PROCESS STRIP */}
      <section style={{ maxWidth: 1280, margin: '88px auto 0', padding: '0 24px' }}>
        <div className="process" style={{
          background: dahila.cream100,
          borderRadius: 16,
          padding: '48px 56px',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40,
        }}>
          {processItems.map((s, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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

      {/* ACCESORIOS */}
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
            {accesorios.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* SPLIT — About */}
      <section style={{ maxWidth: 1280, margin: '88px auto 0', padding: '0 24px' }}>
        <div className="split" style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center',
        }}>
          <div style={{ position: 'relative', width: '100%', aspectRatio: '4/5', borderRadius: 16, overflow: 'hidden' }}>
            <Image
              src={aboutImage}
              alt="Dahila tejiendo"
              fill
              sizes="(max-width: 720px) 100vw, 640px"
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Eyebrow>{val(settings, 'about_eyebrow', 'Sobre Dahila')}</Eyebrow>
            <h2 style={{
              fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 38,
              lineHeight: 1.1, letterSpacing: '-0.01em', color: dahila.ink900, margin: 0,
            }}>
              {val(settings, 'about_title', 'Detrás de cada hilo')}
              {val(settings, 'about_title_em', '') && (
                <>
                  <br/>
                  <em style={{ fontStyle: 'italic', color: dahila.ink700 }}>
                    {settings.about_title_em}
                  </em>
                </>
              )}
            </h2>
            <p style={{ fontFamily: dahila.fontSans, fontSize: 15, fontWeight: 300, lineHeight: 1.7, color: dahila.ink700, margin: 0, maxWidth: 460 }}>
              {val(settings, 'about_body', 'Soy Dahila. Tejo a crochet desde chica y hago prendas únicas, sin apuro y con vos.')}
            </p>
            <div style={{ marginTop: 6 }}>
              <Button variant="secondary" onClick={() => router.push('/atelier')}>
                {val(settings, 'about_cta', 'Conocé el espacio')}
              </Button>
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
        <FAQ items={faqItems}/>
      </section>

    </main>
  )
}
