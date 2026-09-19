'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { dahila, Eyebrow, Icon } from '@/components/ui/Primitives'
import { CarouselControls, useSwipe } from '@/components/ui/CarouselControls'

// Reseñas REALES del Perfil de Google, sin copiar ni editar nada a mano.
//
// Por qué se piden desde el navegador y recién cuando la sección aparece:
// Google no permite guardar el contenido de Places (ver src/lib/google-reviews.ts),
// así que no hay caché posible. Pedirlas al entrar en pantalla evita gastar una
// llamada por cada visita al sitio y, de paso, no retrasa el primer dibujado.
//
// Atribución (obligatoria por la política de Places): se muestra el nombre y la
// foto de quien escribió, el texto entero (sin recortar) y un link para abrir
// esa misma reseña en Google.
//
// Si la clave no está configurada o Google no responde, no se dibuja nada.

interface Review {
  author: string
  photo: string | null
  rating: number
  text: string
  when: string
  uri: string | null
}

interface Data {
  ok: boolean
  rating?: number
  total?: number
  mapsUri?: string | null
  reviews?: Review[]
}

// 9 s y no 5: una reseña real es más larga que un testimonio de una línea, y
// que el texto cambie mientras se está leyendo es el defecto clásico de los
// carruseles automáticos.
const PASO_MS = 9000

function Estrellas({ valor, size = 14 }: { valor: number; size?: number }) {
  return (
    <span role="img" aria-label={`${valor.toLocaleString('es-UY')} de 5`} style={{ display: 'inline-flex', gap: 1 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon
          key={n}
          name="star"
          size={size}
          weight={n <= Math.round(valor) ? 'fill' : 'light'}
          color={n <= Math.round(valor) ? '#E8A33D' : dahila.ink300}
        />
      ))}
    </span>
  )
}

function Foto({ src, alt }: { src: string | null; alt: string }) {
  const [falló, setFalló] = useState(false)
  const inicial = alt.trim().charAt(0).toUpperCase() || 'D'
  const base = {
    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
    objectFit: 'cover' as const, background: dahila.cream100,
  }
  if (!src || falló) {
    return (
      <span aria-hidden="true" style={{
        ...base, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: dahila.fontSans, fontSize: 14, color: dahila.ink700,
      }}>{inicial}</span>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} width={36} height={36} loading="lazy" referrerPolicy="no-referrer"
      onError={() => setFalló(true)} style={base} />
  )
}

export function GoogleReviews() {
  const ref = useRef<HTMLDivElement | null>(null)
  const [data, setData] = useState<Data | null>(null)
  const [actual, setActual] = useState(0)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const nodo = ref.current
    if (!nodo || typeof IntersectionObserver === 'undefined') return
    let pedido = false
    const obs = new IntersectionObserver((entries) => {
      // "Ya se pasó de largo" también cuenta: si alguien salta al pie de la
      // página de un golpe (un link del footer), el bloque nunca llega a estar
      // "entrando en pantalla" y las reseñas no se pedían nunca.
      const aLaVista = entries.some((e) => e.isIntersecting || e.boundingClientRect.bottom <= 0)
      if (!aLaVista || pedido) return
      pedido = true
      obs.disconnect()
      fetch('/api/resenas')
        .then((r) => r.json())
        .then((j: Data) => setData(j))
        .catch(() => setData({ ok: false }))
    }, { rootMargin: '300px' })
    obs.observe(nodo)
    return () => obs.disconnect()
  }, [])

  const reviews = data?.reviews ?? []
  const total = reviews.length
  const hayDatos = data?.ok === true && typeof data.rating === 'number' && total > 0

  const frenar = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  // Va pasando sola. Se frena con el cursor encima o con el foco del teclado,
  // y respeta a quien pidió menos movimiento en su sistema.
  const arrancar = useCallback(() => {
    frenar()
    if (total <= 1) return
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    timer.current = setTimeout(() => setActual((c) => (c + 1) % total), PASO_MS)
  }, [frenar, total])

  useEffect(() => {
    arrancar()
    return frenar
  }, [actual, total, arrancar, frenar])

  const ir = (i: number) => {
    setActual(((i % total) + total) % total)
    arrancar()
  }
  const swipe = useSwipe(() => ir(actual + 1), () => ir(actual - 1))

  const r = reviews[Math.min(actual, Math.max(total - 1, 0))]

  return (
    // El div queda siempre en el árbol para poder detectar cuándo aparece en
    // pantalla; la sección se dibuja solo si Google respondió con reseñas.
    // minHeight 1px: un elemento de alto 0 no siempre dispara el observador.
    <div ref={ref} style={{ minHeight: 1 }}>
      {hayDatos && r && (
        <section className="home-section" aria-label="Reseñas en Google"
          style={{ maxWidth: 880, margin: '88px auto 0', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <Eyebrow>Reseñas en Google</Eyebrow>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 10, flexWrap: 'wrap', marginBottom: 28,
          }}>
            <strong style={{ fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 32, color: dahila.ink900 }}>
              {data!.rating!.toLocaleString('es-UY', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </strong>
            <Estrellas valor={data!.rating!} size={18} />
            <span style={{ fontFamily: dahila.fontSans, fontSize: 13, color: dahila.ink500 }}>
              {data!.total} {data!.total === 1 ? 'opinión' : 'opiniones'} en Google
            </span>
          </div>

          <div
            onMouseEnter={frenar}
            onMouseLeave={arrancar}
            onFocusCapture={frenar}
            onBlurCapture={arrancar}
            {...(total > 1 ? swipe : {})}
            style={{
              background: dahila.cream50,
              border: `1px solid ${dahila.border}`,
              borderRadius: 20,
              padding: 'clamp(24px, 4vw, 40px)',
            }}
          >
            {/* aria-live: quien usa lector de pantalla se entera del cambio. */}
            <article aria-live="polite" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <header style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Foto src={r.photo} alt={r.author} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: dahila.fontSans, fontSize: 13.5, fontWeight: 500, color: dahila.ink900 }}>
                    {r.author}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Estrellas valor={r.rating} />
                    <span style={{ fontFamily: dahila.fontSans, fontSize: 11.5, color: dahila.ink500 }}>{r.when}</span>
                  </div>
                </div>
              </header>

              {/* Texto completo, sin recortar: la política de Google pide
                  mostrar la reseña tal como la escribió su autora. El trim solo
                  saca espacios de los bordes, para que la comilla de cierre no
                  quede sola en otra línea. */}
              <p key={`${r.author}-${actual}`} style={{
                fontFamily: dahila.fontSerif, fontStyle: 'italic', fontWeight: 300,
                fontSize: 'clamp(15px, 2.2vw, 18px)', lineHeight: 1.65, color: dahila.ink900, margin: 0,
              }}>
                “{r.text.trim()}”
              </p>

              {r.uri && (
                <a href={r.uri} target="_blank" rel="noopener noreferrer" style={{
                  fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink700, textDecoration: 'none',
                }}>
                  Ver en Google →
                </a>
              )}
            </article>

          </div>

          {/* Flechas y puntitos debajo de la tarjeta (ver CarouselControls). */}
          <div style={{ marginTop: 16 }}>
            <CarouselControls
              total={total}
              actual={actual}
              onAnterior={() => ir(actual - 1)}
              onSiguiente={() => ir(actual + 1)}
              onIr={ir}
              labels={{ anterior: 'Reseña anterior', siguiente: 'Reseña siguiente', ir: (n) => `Ver reseña ${n}` }}
            />
          </div>

          {data!.mapsUri && (
            <div style={{ textAlign: 'center', marginTop: 22 }}>
              <a href={data!.mapsUri!} target="_blank" rel="noopener noreferrer" style={{
                fontFamily: dahila.fontSans, fontSize: 13, color: dahila.ink900,
                border: `1px solid ${dahila.borderStrong}`, borderRadius: 999,
                padding: '10px 18px', textDecoration: 'none', display: 'inline-block',
              }}>
                Ver todas las reseñas en Google
              </a>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
