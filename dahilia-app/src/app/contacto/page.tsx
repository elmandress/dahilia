'use client'

import { dahila, Eyebrow, Icon } from '@/components/ui/Primitives'

export default function ContactoPage() {
  return (
    <main style={{ maxWidth: 880, margin: '0 auto', padding: '60px 24px 0', textAlign: 'center' }}>
      <Eyebrow>Contacto</Eyebrow>
      <h1 style={{
        fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 'clamp(32px, 5vw, 56px)',
        lineHeight: 1.05, letterSpacing: '-0.02em', color: dahila.ink900, margin: '12px 0 14px',
      }}>Escribime y vemos juntas.</h1>
      <p style={{ fontFamily: dahila.fontSans, fontSize: 15, fontWeight: 300, color: dahila.ink700, margin: '0 auto 48px', maxWidth: 540 }}>
        Te respondo por DM, mail o WhatsApp. Lo que te quede más cómodo.
      </p>
      <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 64 }}>
        {[
          { icon: 'instagram-logo', label: 'Instagram', value: '@dahila.crochet' },
          { icon: 'envelope-simple', label: 'Mail',      value: 'hola@dahila.uy' },
          { icon: 'whatsapp-logo',  label: 'WhatsApp',  value: '+598 94 605 015' },
        ].map((c) => (
          <div key={c.label} style={{
            background: dahila.cream100,
            borderRadius: 12, padding: '28px 18px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          }}>
            <Icon name={c.icon} size={22} color={dahila.ink900}/>
            <div style={{ fontFamily: dahila.fontSans, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: dahila.ink500 }}>{c.label}</div>
            <div style={{ fontFamily: dahila.fontSans, fontSize: 14, fontWeight: 400, color: dahila.ink900 }}>{c.value}</div>
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 720px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  )
}
