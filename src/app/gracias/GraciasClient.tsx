'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { dahila, Eyebrow, Button, Icon, Badge } from '@/components/ui/Primitives'
import { VipForm } from '@/components/VipForm'
import { track } from '@/lib/analytics'

/** Misma clave que usa el carrito para recordar un cupón (CarritoClient). */
const COUPON_STORAGE_KEY = 'dahila_coupon_code'

const section: React.CSSProperties = { borderTop: `1px solid ${dahila.border}`, padding: '28px 0 0', marginTop: 28, textAlign: 'left' }
const h2: React.CSSProperties = { fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 24, color: dahila.ink900, margin: '0 0 12px' }
const p: React.CSSProperties = { fontFamily: dahila.fontSans, fontSize: 14.5, fontWeight: 300, lineHeight: 1.7, color: dahila.ink700, margin: 0 }

export default function GraciasClient({
  enabled, eyebrow, title, body, code, percent, makerName, makerPhoto, reviewEnabled, photoWhatsapp, listEnabled,
}: {
  enabled: boolean
  eyebrow: string
  title: string
  body: string
  code: string
  percent: string
  makerName: string
  makerPhoto: string
  reviewEnabled: boolean
  photoWhatsapp: string
  listEnabled: boolean
}) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    track('qr_thanks_view')
  }, [])

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      track('qr_discount_copy', { code })
      setTimeout(() => setCopied(false), 2200)
    } catch {
      // Portapapeles bloqueado: el código está bien visible, se copia a mano.
    }
  }

  // "Usarlo ahora": deja el cupón guardado como lo guarda el carrito; al
  // entrar a /carrito se valida y se aplica solo. Sin copiar ni pegar.
  const applyNow = () => {
    try { sessionStorage.setItem(COUPON_STORAGE_KEY, code) } catch { /* storage bloqueado: igual va a la tienda */ }
    track('qr_discount_use', { code })
    router.push('/tienda')
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '56px 24px 96px', textAlign: 'center' }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%', background: dahila.cream100,
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
      }}>
        <Icon name="sparkle" size={26} color={dahila.wine600} />
      </div>

      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 style={{
        fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 'clamp(32px, 6vw, 46px)',
        lineHeight: 1.08, letterSpacing: '-0.02em', color: dahila.ink900, margin: '14px 0 22px',
      }}>
        {title}
      </h1>

      {/* La nota firmada: la investigación de la tarjeta (ver entrega/) dice que
          la nota personal genera más vínculo que el descuento en sí. */}
      <figure style={{
        margin: '0 0 30px', padding: '20px 22px', borderRadius: 16, background: dahila.cream50,
        border: `1px solid ${dahila.border}`, textAlign: 'left',
      }}>
        <blockquote style={{ margin: 0, fontFamily: dahila.fontSerif, fontStyle: 'italic', fontWeight: 300, fontSize: 17, lineHeight: 1.6, color: dahila.ink900 }}>
          {body}
        </blockquote>
        <figcaption style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, fontFamily: dahila.fontSans, fontSize: 13, color: dahila.ink700 }}>
          {makerPhoto && (
            <span style={{ position: 'relative', width: 34, height: 34, borderRadius: 999, overflow: 'hidden', flexShrink: 0 }}>
              <Image src={makerPhoto} alt={makerName} fill sizes="34px" style={{ objectFit: 'cover' }} />
            </span>
          )}
          — {makerName}, Dahila
        </figcaption>
      </figure>

      {enabled ? (
        <div style={{
          position: 'relative', background: '#fff',
          border: `1.5px dashed ${dahila.borderStrong}`, borderRadius: 16,
          padding: '30px 24px 24px',
        }}>
          <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>
            <Badge tone="pink">Un regalo para la próxima</Badge>
          </div>
          <p style={{ ...p, textAlign: 'center', margin: '8px 0 6px' }}>−{percent}% en tu próxima pieza, con el código</p>
          <div style={{
            fontFamily: dahila.fontSans, fontWeight: 500, fontSize: 'clamp(24px, 6vw, 30px)',
            letterSpacing: '0.1em', color: dahila.ink900, margin: '4px 0 18px', wordBreak: 'break-word',
          }}>
            {code}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="primary" size="md" onClick={applyNow}>Usarlo ahora</Button>
            <Button variant="secondary" size="md" onClick={copyCode}>
              <Icon name={copied ? 'check' : 'tag'} size={15} />
              {copied ? '¡Copiado!' : 'Copiar código'}
            </Button>
          </div>
          <p style={{ ...p, fontSize: 12.5, color: dahila.ink500, textAlign: 'center', marginTop: 14 }}>
            &ldquo;Usarlo ahora&rdquo; lo deja puesto en el carrito: elegís tu pieza y confirmás por WhatsApp.
          </p>
        </div>
      ) : (
        <p style={{ ...p, color: dahila.ink500 }}>Gracias por elegirnos.</p>
      )}

      {/* Lo que necesita alguien que acaba de recibir su prenda. */}
      <section style={section} aria-labelledby="g-cuidado">
        <h2 id="g-cuidado" style={h2}>Para que te dure años</h2>
        <ol style={{ ...p, paddingLeft: 20, display: 'grid', gap: 6 }}>
          <li>A mano y con agua fría, con un jabón neutro.</li>
          <li>Sin retorcer: apretala entre las manos o dentro de una toalla.</li>
          <li>Secala estirada en plano y a la sombra. Guardala doblada, no colgada.</li>
        </ol>
        <p style={{ ...p, fontSize: 13.5, marginTop: 10 }}>
          El paso a paso, en <Link href="/blog/como-lavar-crochet-a-mano" style={{ color: dahila.wine600 }}>cómo lavar crochet a mano</Link>.
        </p>
      </section>

      {/* Sin ningún beneficio a cambio: Google prohíbe las reseñas incentivadas. */}
      <section style={section} aria-labelledby="g-contalo">
        <h2 id="g-contalo" style={h2}>¿Te gustó?</h2>
        <p style={p}>Nos ayuda muchísimo que otras personas sepan cómo te quedó.</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
          {reviewEnabled && (
            <a href="/resena" onClick={() => track('qr_review_click')} className="dh-btn" style={actionLink}>
              <Icon name="star" size={15} /> Contarlo en Google
            </a>
          )}
          <a href={photoWhatsapp} target="_blank" rel="noopener noreferrer" onClick={() => track('qr_photo_click')} className="dh-btn" style={actionLink}>
            <Icon name="camera" size={15} /> Mandarnos una foto con tu prenda
          </a>
        </div>
        <p style={{ ...p, fontSize: 12.5, color: dahila.ink500, marginTop: 10 }}>
          Si nos das permiso, la sumamos a &ldquo;Clientas con su Dahila&rdquo;. También podés etiquetar a @dahila.crochet.
        </p>
      </section>

      {listEnabled && (
        <section style={section} aria-labelledby="g-lista">
          <h2 id="g-lista" style={h2}>Lo próximo, antes que nadie</h2>
          <p style={{ ...p, marginBottom: 14 }}>Cada tanda es chica. La lista privada la ve 24 horas antes que la tienda.</p>
          <VipForm source="gracias" idSuffix="gracias" cta="Entrar a la lista" />
        </section>
      )}
    </div>
  )
}

const actionLink: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, padding: '0 16px', borderRadius: 10,
  border: `1px solid ${dahila.borderStrong}`, background: '#fff', color: dahila.ink900, textDecoration: 'none',
  fontFamily: dahila.fontSans, fontSize: 13,
}
