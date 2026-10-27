// Remitente de respaldo (27/10/2026). EMAIL_FROM local apuntaba a
// hola@send.dahila.uy y Resend lo rechazaba con 403 "domain is not verified":
// ningún mail salía. dahila.uy sí está verificado (probado ese día: 200). Si
// el remitente configurado cae en ese 403, se reintenta una vez con este, y
// quien llama se entera (para avisar que conviene corregir EMAIL_FROM).
export const VERIFIED_FROM = 'Dahila Crochet <hola@dahila.uy>'

export function isUnverifiedDomain(status: number, body: string): boolean {
  return status === 403 && /not verified/i.test(body)
}
