import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import type { Collection } from '@/lib/types'
import { dahila, Eyebrow } from '@/components/ui/Primitives'
import { OG_BASE } from '@/lib/og'

export const revalidate = 300

// Metadata dinámica por una sola razón: mientras no haya NINGUNA colección
// visible (publicada o teaser), la página es thin content y va noindex —
// misma filosofía que su exclusión condicional del sitemap. Cuando llegue el
// primer drop, vuelve a indexarse sola.
export async function generateMetadata(): Promise<Metadata> {
  let hasVisible = false
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('collections').select('*').limit(12)
    hasVisible = (data ?? []).some((c) => {
      const col = c as Collection
      return (col.published && !col.unlisted) || (!col.published && col.coming_soon)
    })
  } catch { /* sin base: dejamos el default indexable */ hasVisible = true }

  return {
    title: 'Colecciones tejidas a mano, por temporada',
    description: 'Cada colección sale en cantidades chicas — es crochet tejido a mano en Montevideo. Mirá la actual, y anotate para ver la próxima antes que nadie.',
    alternates: { canonical: '/colecciones' },
    ...(hasVisible ? {} : { robots: { index: false, follow: true } }),
    openGraph: {
      ...OG_BASE,
      title: 'Colecciones tejidas a mano, por temporada',
      description: 'Cada colección sale en cantidades chicas — es crochet tejido a mano en Montevideo.',
      url: '/colecciones',
    },
  }
}

export default async function ColeccionesPage() {
  const supabase = await createClient()
  // La RLS devuelve publicadas + "próximamente" (ver database/drops-2026-07.sql).
  // Acá se separan: las unlisted ("solo con link", acceso anticipado VIP) no se
  // listan; las coming_soon se muestran como teaser sin link.
  const { data } = await supabase
    .from('collections')
    .select('*')
    .order('sort_order', { ascending: true })

  const all = (data ?? []) as Collection[]
  const collections = all.filter((c) => c.published && !c.unlisted)
  const upcoming = all.filter((c) => !c.published && c.coming_soon)

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 80px' }}>
      <Eyebrow>Colecciones</Eyebrow>
      <h1 style={{
        fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 'clamp(30px, 5vw, 46px)',
        lineHeight: 1.05, letterSpacing: '-0.02em', color: dahila.ink900, margin: '10px 0 8px',
      }}>Nuestras colecciones</h1>
      <p style={{ fontFamily: dahila.fontSans, fontSize: 15, fontWeight: 300, color: dahila.ink700, maxWidth: 560, margin: '0 0 40px' }}>
        Cada colección reúne piezas que comparten una idea, una paleta y una temporada.
      </p>

      {collections.length === 0 && upcoming.length === 0 ? (
        <p style={{ fontFamily: dahila.fontSans, fontSize: 14, color: dahila.ink500 }}>
          Pronto vas a ver acá las colecciones. Mientras tanto, mirá la <Link href="/tienda" style={{ color: dahila.wine600 }}>tienda</Link>.
        </p>
      ) : (
        <div className="tienda-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, rowGap: 40 }}>
          {/* Próximamente — solo la portada, sin link: expectativa sin filtrar contenido */}
          {upcoming.map((c) => (
            <div key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ position: 'relative', aspectRatio: '4 / 5', borderRadius: 14, overflow: 'hidden', background: dahila.cream100 }}>
                {c.cover_url ? (
                  <Image src={c.cover_url} alt={c.name} fill sizes="(max-width: 720px) 100vw, 400px" style={{ objectFit: 'cover' }} />
                ) : (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: dahila.ink300, fontFamily: dahila.fontDisplay, fontSize: 22 }}>
                    {c.name}
                  </div>
                )}
                <span style={{
                  position: 'absolute', top: 12, left: 12,
                  background: 'rgba(255,255,255,0.94)', color: dahila.wine700,
                  fontFamily: dahila.fontSans, fontSize: 10, fontWeight: 500,
                  letterSpacing: '0.16em', textTransform: 'uppercase',
                  padding: '6px 12px', borderRadius: 999,
                }}>Próximamente</span>
              </div>
              <div>
                <h2 style={{ fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 20, color: dahila.ink900, margin: 0 }}>{c.name}</h2>
                {c.description && (
                  <p style={{ fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 300, color: dahila.ink700, margin: '4px 0 0', lineHeight: 1.5 }}>
                    {c.description}
                  </p>
                )}
              </div>
            </div>
          ))}
          {collections.map((c) => (
            <Link key={c.id} href={`/colecciones/${c.slug}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ position: 'relative', aspectRatio: '4 / 5', borderRadius: 14, overflow: 'hidden', background: dahila.cream50 }}>
                {c.cover_url ? (
                  <Image src={c.cover_url} alt={c.name} fill sizes="(max-width: 720px) 100vw, 400px" style={{ objectFit: 'cover' }} />
                ) : (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: dahila.ink300, fontFamily: dahila.fontDisplay, fontSize: 22 }}>
                    {c.name}
                  </div>
                )}
              </div>
              <div>
                <h2 style={{ fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 20, color: dahila.ink900, margin: 0 }}>{c.name}</h2>
                {c.description && (
                  <p style={{ fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 300, color: dahila.ink700, margin: '4px 0 0', lineHeight: 1.5 }}>
                    {c.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
