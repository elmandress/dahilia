// ----------------------------------------------------------------
//  EncargoScreen — single-screen custom order form (simplified)
// ----------------------------------------------------------------
function EncargoScreen({ onNavigate }) {
  const [tipo, setTipo] = React.useState('Cardigan');
  const [talle, setTalle] = React.useState('M');
  const [submitted, setSubmitted] = React.useState(false);

  if (submitted) {
    return (
      <main style={{ maxWidth: 560, margin: '0 auto', padding: '120px 24px', textAlign: 'center' }}>
        <Eyebrow>Encargo recibido</Eyebrow>
        <h1 style={{
          fontFamily: dahila.fontDisplay, fontWeight: 300,
          fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: 1.1, letterSpacing: '-0.02em',
          color: dahila.ink900, margin: '14px 0 16px',
        }}>Gracias 🪡</h1>
        <p style={{ fontFamily: dahila.fontSerif, fontStyle: 'italic', fontWeight: 300, fontSize: 18, color: dahila.ink700, marginBottom: 28 }}>
          Te escribo en las próximas 48hs con un boceto y presupuesto.
        </p>
        <Button variant="secondary" onClick={() => onNavigate('home')}>Volver al inicio</Button>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36 }}>
        <Eyebrow>Encargos a medida</Eyebrow>
        <h1 style={{
          fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 'clamp(32px, 5vw, 48px)',
          lineHeight: 1.05, letterSpacing: '-0.02em', color: dahila.ink900, margin: 0,
        }}>Contame qué tenés en mente</h1>
        <p style={{ fontFamily: dahila.fontSans, fontSize: 15, fontWeight: 300, lineHeight: 1.7, color: dahila.ink700, margin: 0 }}>
          Te respondo por mail en 48hs con un boceto, los materiales que tengo y el presupuesto.
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
            style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

        <Field label="¿Qué querés tejer?">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 8 }}>
            {['Cardigan', 'Top', 'Set', 'Otro'].map((t) => (
              <button key={t} type="button" onClick={() => setTipo(t)} style={{
                padding: '14px 8px', borderRadius: 8,
                background: tipo === t ? dahila.ink900 : '#fff',
                color: tipo === t ? '#fff' : dahila.ink900,
                border: `1px solid ${tipo === t ? dahila.ink900 : dahila.borderStrong}`,
                cursor: 'pointer',
                fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 400, letterSpacing: '0.04em',
                transition: `all 140ms ${dahila.ease}`,
              }}>{t}</button>
            ))}
          </div>
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <Field label="Tu nombre"><TextInput placeholder="¿Cómo te llamás?"/></Field>
          <Field label="Mail"><TextInput placeholder="vos@correo.uy" type="email"/></Field>
        </div>

        <Field label="Talle aproximado">
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            {['XS', 'S', 'M', 'L', 'XL'].map((t) => (
              <button key={t} type="button" onClick={() => setTalle(t)} style={{
                width: 44, height: 40, borderRadius: 8,
                fontFamily: dahila.fontSans, fontSize: 12,
                border: `1px solid ${talle === t ? dahila.ink900 : dahila.borderStrong}`,
                background: talle === t ? dahila.ink900 : '#fff',
                color: talle === t ? '#fff' : dahila.ink900,
                cursor: 'pointer', transition: `all 140ms ${dahila.ease}`,
              }}>{t}</button>
            ))}
          </div>
        </Field>

        <Field label="Contame de tu prenda" helper="Para qué la querés, qué colores te gustan, en qué lana — cuanto más detalles, mejor.">
          <textarea rows={5} style={{
            fontFamily: dahila.fontSans, fontSize: 14, fontWeight: 300, color: dahila.ink900,
            background: 'transparent', border: 'none',
            borderBottom: `1px solid ${dahila.borderStrong}`,
            padding: '10px 0 8px', outline: 'none', resize: 'vertical',
          }}/>
        </Field>

        <Button variant="primary" size="lg" full type="submit">Enviar encargo</Button>
      </form>
    </main>
  );
}

// ----------------------------------------------------------------
//  AtelierScreen — about + founder story
// ----------------------------------------------------------------
function AtelierScreen() {
  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 0' }}>
      <div className="atelier-split" style={{
        display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 64, alignItems: 'center',
      }}>
        <img src="../../assets/photos/atelier-tejiendo.png" alt="Dahila en su atelier" style={{
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
            { stat: '3', l: 'años tejiendo Dahila' },
            { stat: '180+', l: 'piezas a medida entregadas' },
            { stat: '100%', l: 'lana natural · hecho a mano' },
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
            <img key={p} src={`../../assets/photos/${p}`} alt="" style={{
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
  );
}

// ----------------------------------------------------------------
//  ContactoScreen
// ----------------------------------------------------------------
function ContactoScreen() {
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
  );
}

window.EncargoScreen = EncargoScreen;
window.AtelierScreen = AtelierScreen;
window.ContactoScreen = ContactoScreen;
