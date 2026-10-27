// Reloj del resumen diario para Anush, dentro de Netlify (27/10/2026). Mismo
// motivo que reloj-lista-privada.mts: la Action de GitHub que lo llamaba no
// tenía el CRON_SECRET. 12:00 UTC = 9:00 en Montevideo.

export default async function reloj() {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    console.error('reloj-resumen-diario: falta CRON_SECRET en Netlify')
    return
  }
  const res = await fetch('https://dahila.uy/api/cron/daily-summary', {
    headers: { Authorization: `Bearer ${secret}` },
  })
  console.log('reloj-resumen-diario', res.status, (await res.text()).slice(0, 300))
}

export const config = { schedule: '0 12 * * *' }
