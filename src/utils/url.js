const ALLOWED_PROTOCOLS = ['http:', 'https:']

/**
 * Verdadeiro apenas para URLs absolutas com esquema http/https. Usado antes
 * de jogar uma URL fornecida pelo usuario num atributo :href, bloqueando
 * esquemas como javascript:/data: (ver docs/security-audit/relatorio-
 * auditoria-seguranca.md — Stored XSS em links de processo).
 */
export function isSafeUrl(rawUrl) {
  if (!rawUrl) return false
  try {
    return ALLOWED_PROTOCOLS.includes(new URL(rawUrl).protocol)
  } catch {
    return false
  }
}
