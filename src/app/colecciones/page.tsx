import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import type { Collection } from '@/lib/types'
import { dahila, Eyebrow } from '@/components/ui/Primitives'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Colecciones',
  description: 'Las colecciones de Dahila Crochet — piezas tejidas a mano agrupadas por temporada e historia.',
  alternates: { canonical: '/colecciones' },
}

export default async function ColeccionesPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('collections')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true })

  const collections = (data ?? []) as Collection[]

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 80px' }}>
      <Eyebrow>Colecciones</Eyebrow>
      <h1 style={{
        fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 'clamp(30px, 5vw, 46px)',
        lineHeight: 1.05, letterSpacing: '-0.02em', color: dahila.ink900, margin: '10px 0 8px',
      }}>Nuestras colecciones</h1>
      <p style={{ fontFamily: dahila.fontSans, fontSize: 15, fontWeight: 300, color: dahila.ink700, maxWidth: 560, margin: '0 0 40px' }}>
        Cada colección reúne piezas que comparten una idea, una paleta y una temporada.
      </p>

      {collections.length === 0 ? (
        <p style={{ fontFamily: dahila.fontSans, fontSize: 14, color: dahila.ink500 }}>
          Pronto vas a ver acá las colecciones. Mientras tanto, mirá la <Link href="/tienda" style={{ color: dahila.wine600 }}>tienda</Link>.
        </p>
      ) : (
        <div className="tienda-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, rowGap: 40 }}>
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
    </main>
  )
}
