// Reloj del aviso a la lista privada, dentro de Netlify (27/10/2026).
//
// Antes lo corría una Action de GitHub (.github/workflows/lista-privada.yml):
// las 79 corridas fallaron (el secreto CRON_SECRET no estaba en GitHub) y,
// además, GitHub espaciaba el "cada hora" a cada 4-6 horas. Una función
// programada de Netlify corre puntual y ya tiene CRON_SECRET (es el mismo
// sitio que lo valida): no hay un segundo lugar donde cargar el secreto.
//
// Solo le pregunta al sitio si toca mandar; la decisión (24 h antes, una vez
// por drop, envío automático activado) vive en src/app/api/cron/lista-privada.

export default async function reloj() {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    console.error('reloj-lista-privada: falta CRON_SECRET en Netlify')
    return
  }
  const res = await fetch('https://dahila.uy/api/cron/lista-privada', {
    headers: { Authorization: `Bearer ${secret}` },
  })
  console.log('reloj-lista-privada', res.status, (await res.text()).slice(0, 300))
}

export const config = { schedule: '0 * * * *' }
