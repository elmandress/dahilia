import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { dahila, Eyebrow } from '@/components/ui/Primitives'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Términos y condiciones',
  description: 'Términos y condiciones de compra, política de privacidad y derechos del consumidor en Dahila Crochet.',
  alternates: { canonical: '/terminos' },
  robots: { index: true, follow: true },
}

export default async function TerminosPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['contact_whatsapp', 'contact_whatsapp_url', 'contact_instagram_url'])

  const s = (data ?? []).reduce<Record<string, string>>(
    (acc, curr) => ({ ...acc, [curr.key]: String(curr.value ?? '') }),
    {}
  )
  const whatsapp = s.contact_whatsapp || '+598 99 850 073'
  const waUrl = s.contact_whatsapp_url || 'https://wa.me/59899850073'
  const igUrl = s.contact_instagram_url || 'https://www.instagram.com/dahila.crochet/'
  const year = new Date().getFullYear()

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 96px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 48 }}>
        <Eyebrow>Legal</Eyebrow>
        <h1 style={{
          fontFamily: dahila.fontDisplay, fontWeight: 300,
          fontSize: 'clamp(28px, 4.5vw, 48px)',
          lineHeight: 1.05, letterSpacing: '-0.02em', color: dahila.ink900, margin: 0,
        }}>
          Términos y condiciones
        </h1>
        <p style={{ fontFamily: dahila.fontSans, fontSize: 13, color: dahila.ink500, margin: 0 }}>
          Última actualización: enero {year}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

        <Block title="1. Identificación del vendedor">
          <p>
            Este sitio web es operado por <strong>Dahila Crochet</strong>, emprendimiento unipersonal con domicilio en
            Montevideo, República Oriental del Uruguay. Para consultas podés contactarnos por WhatsApp al{' '}
            <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{ color: dahila.wine600 }}>{whatsapp}</a>{' '}
            o por Instagram en{' '}
            <a href={igUrl} target="_blank" rel="noopener noreferrer" style={{ color: dahila.wine600 }}>@dahila.crochet</a>.
          </p>
        </Block>

        <Block title="2. Objeto y aceptación">
          <p>
            Al navegar este sitio web y/o realizar una compra o encargo, el usuario acepta los presentes términos y
            condiciones en su totalidad. Estos términos se rigen por la legislación uruguaya, en particular la{' '}
            <strong>Ley N.º 17.250 de Defensa del Consumidor</strong> y su decreto reglamentario N.º 244/000, así como
            la <strong>Ley N.º 18.331 de Protección de Datos Personales</strong> (LPDP) y sus decretos reglamentarios.
          </p>
        </Block>

        <Block title="3. Productos y prendas a medida">
          <p>
            Todos los productos ofrecidos en este sitio son <strong>tejidos a mano de forma artesanal</strong> en
            Montevideo, Uruguay. Las prendas pueden presentar pequeñas variaciones entre sí, propias del proceso manual,
            lo cual forma parte de su naturaleza artesanal y no constituye un defecto.
          </p>
          <p style={{ marginTop: 12 }}>
            Las prendas fabricadas <strong>a medida o bajo encargo personalizado</strong> (según el artículo 17 de la
            Ley 17.250) quedan expresamente excluidas del derecho de retractación previsto en el artículo 13 de dicha
            ley, en tanto fueron confeccionadas según especificaciones particulares del consumidor. Por este motivo,
            durante todo el proceso de confección se realizan consultas y confirmaciones con el cliente para asegurar
            su conformidad.
          </p>
        </Block>

        <Block title="4. Precios y formas de pago">
          <p>
            Todos los precios publicados están expresados en <strong>pesos uruguayos (UYU)</strong> e incluyen el IVA
            correspondiente cuando aplica. Los precios pueden modificarse sin previo aviso, pero el precio vigente al
            momento de la confirmación del encargo o compra es el que aplica a esa transacción.
          </p>
          <p style={{ marginTop: 12 }}>
            Las formas de pago se coordinan directamente con el vendedor por WhatsApp e incluyen transferencia
            bancaria, BROU, RedPagos u otros medios acordados en cada caso. No se procesan pagos con tarjeta de crédito
            directamente en el sitio web.
          </p>
        </Block>

        <Block title="5. Proceso de compra y confirmación">
          <p>
            El proceso de compra se realiza de la siguiente forma:
          </p>
          <ol style={{ margin: '12px 0 0 20px', display: 'flex', flexDirection: 'column', gap: 8,
            fontFamily: dahila.fontSans, fontSize: 14, fontWeight: 300, lineHeight: 1.7, color: dahila.ink700 }}>
            <li>El cliente selecciona el/los producto(s) y envía su consulta o pedido vía WhatsApp o a través del formulario de encargo.</li>
            <li>Dahila Crochet confirma disponibilidad, plazo de entrega y precio final.</li>
            <li>El cliente confirma el pedido y abona según lo acordado.</li>
            <li>Se inicia la confección. El cliente recibe actualizaciones durante el proceso.</li>
            <li>Una vez finalizada la prenda, se coordina la entrega o envío.</li>
          </ol>
          <p style={{ marginTop: 12 }}>
            El contrato de compraventa se perfecciona con la confirmación expresa por parte de ambas partes y el pago
            acordado, no con la simple selección de productos en el sitio web.
          </p>
        </Block>

        <Block title="6. Envíos y plazos de entrega">
          <p>
            Los envíos se realizan a todo el territorio nacional uruguayo. Los plazos de entrega son aproximados y
            dependen del tipo de prenda y la carga de trabajo del momento. Los plazos se informan al confirmar cada
            pedido y pueden variar entre 1 y 6 semanas según el modelo y las medidas.
          </p>
          <p style={{ marginTop: 12 }}>
            Para envíos al exterior de Uruguay, los costos y plazos se coordinan en cada caso particular vía WhatsApp.
            Dahila Crochet no se responsabiliza por demoras causadas por empresas de transporte o aduanas.
          </p>
        </Block>

        <Block title="7. Cambios, devoluciones y garantía legal">
          <p>
            De conformidad con el artículo 17 de la Ley 17.250, las prendas confeccionadas a medida o personalizadas
            según especificaciones del consumidor <strong>no pueden ser objeto de devolución o cambio</strong> salvo
            que presenten un vicio o defecto de fabricación.
          </p>
          <p style={{ marginTop: 12 }}>
            En caso de que la prenda presente un defecto de fabricación imputable a Dahila Crochet, el consumidor
            tiene derecho a:
          </p>
          <ul style={{ margin: '12px 0 0 20px', display: 'flex', flexDirection: 'column', gap: 6,
            fontFamily: dahila.fontSans, fontSize: 14, fontWeight: 300, lineHeight: 1.7, color: dahila.ink700 }}>
            <li>La reparación gratuita del producto.</li>
            <li>La sustitución del producto por otro equivalente.</li>
            <li>La reducción proporcional del precio.</li>
            <li>La resolución del contrato con devolución del precio pagado.</li>
          </ul>
          <p style={{ marginTop: 12 }}>
            Para ejercer estos derechos, el consumidor debe comunicarse dentro de los <strong>30 días corridos</strong>{' '}
            desde la recepción del producto, aportando evidencia fotográfica del defecto.
          </p>
        </Block>

        <Block title="8. Protección de datos personales">
          <p>
            En cumplimiento de la <strong>Ley N.º 18.331</strong> y el Decreto N.º 414/009, Dahila Crochet informa
            que los datos personales recopilados (nombre, apellido, teléfono, correo electrónico, dirección de entrega)
            son utilizados exclusivamente para:
          </p>
          <ul style={{ margin: '12px 0 0 20px', display: 'flex', flexDirection: 'column', gap: 6,
            fontFamily: dahila.fontSans, fontSize: 14, fontWeight: 300, lineHeight: 1.7, color: dahila.ink700 }}>
            <li>Gestionar y cumplir los pedidos realizados.</li>
            <li>Comunicar el estado del encargo al cliente.</li>
            <li>Coordinar envíos y pagos.</li>
          </ul>
          <p style={{ marginTop: 12 }}>
            Los datos no son cedidos ni vendidos a terceros. El titular de los datos tiene derecho de acceso,
            rectificación, actualización, inclusión o supresión de sus datos personales. Para ejercer estos derechos
            puede contactarnos por{' '}
            <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{ color: dahila.wine600 }}>WhatsApp</a>.
          </p>
          <p style={{ marginTop: 12 }}>
            Este sitio utiliza cookies técnicas necesarias para el funcionamiento del carrito de compras y preferencias
            del usuario. No se utilizan cookies de seguimiento publicitario de terceros.
          </p>
        </Block>

        <Block title="9. Propiedad intelectual">
          <p>
            Todos los textos, fotografías, diseños, logotipos e imágenes publicados en este sitio web son propiedad
            de Dahila Crochet o han sido utilizados con autorización expresa de sus titulares. Queda prohibida su
            reproducción, distribución o uso comercial sin autorización previa y escrita.
          </p>
        </Block>

        <Block title="10. Limitación de responsabilidad">
          <p>
            Dahila Crochet no será responsable por daños indirectos, pérdida de ganancias o perjuicios derivados del
            uso del sitio web. La responsabilidad máxima frente al consumidor en cualquier caso estará limitada al
            valor del producto adquirido.
          </p>
          <p style={{ marginTop: 12 }}>
            Las fotografías de los productos son representativas. Los colores pueden variar ligeramente según la
            pantalla y la iluminación de la fotografía. En prendas a medida, la confirmación de colores se realiza
            mostrando muestras físicas o fotos de las lanas disponibles antes de iniciar la confección.
          </p>
        </Block>

        <Block title="11. Jurisdicción y ley aplicable">
          <p>
            Estos términos y condiciones se rigen por las leyes de la República Oriental del Uruguay. Para cualquier
            controversia que pudiera surgir, las partes se someten a la jurisdicción de los Tribunales ordinarios de
            la ciudad de Montevideo, renunciando expresamente a cualquier otro fuero que pudiera corresponder.
          </p>
          <p style={{ marginTop: 12 }}>
            Para reclamaciones de consumidores, también puede acudirse a la{' '}
            <strong>Dirección General de Comercio</strong> del Ministerio de Economía y Finanzas (AGESIC / LPDP para
            datos personales) o al servicio de mediación del{' '}
            <strong>Centro de Relaciones de Consumo</strong>.
          </p>
        </Block>

        <Block title="12. Modificaciones">
          <p>
            Dahila Crochet se reserva el derecho de modificar estos términos y condiciones en cualquier momento. Las
            modificaciones entran en vigencia desde su publicación en este sitio. El uso continuado del sitio implica
            la aceptación de los términos vigentes.
          </p>
        </Block>

        <div style={{
          marginTop: 40, padding: '20px 24px',
          background: dahila.cream50, borderRadius: 12, border: `1px solid ${dahila.border}`,
        }}>
          <p style={{
            fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 300,
            color: dahila.ink700, margin: 0, lineHeight: 1.7,
          }}>
            ¿Tenés alguna duda sobre estos términos? Escribinos por{' '}
            <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{ color: dahila.wine600 }}>WhatsApp</a>{' '}
            o a través de{' '}
            <a href={igUrl} target="_blank" rel="noopener noreferrer" style={{ color: dahila.wine600 }}>Instagram</a>{' '}
            y te respondemos con gusto.
          </p>
        </div>
      </div>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ padding: '28px 0', borderTop: `1px solid ${dahila.border}` }}>
      <h2 style={{
        fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 22,
        color: dahila.ink900, margin: '0 0 14px', letterSpacing: '-0.01em',
      }}>{title}</h2>
      <div style={{
        fontFamily: dahila.fontSans, fontSize: 14, fontWeight: 300,
        lineHeight: 1.75, color: dahila.ink700,
      }}>
        {children}
      </div>
    </section>
  )
}
