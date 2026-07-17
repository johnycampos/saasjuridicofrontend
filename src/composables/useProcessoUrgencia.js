// dias até o próximo prazo em aberto do processo; null = sem prazo, negativo = atrasado
export function diasAteProximoPrazo(processo) {
  if (!processo.proximaTarefaPrazo) return null
  return Math.ceil((new Date(processo.proximaTarefaPrazo) - new Date()) / 86400000)
}

export function isUrgente(processo) {
  return processo.prioridadeMaisUrgente === 'URGENTE'
}

export function isAtrasado(processo) {
  const dias = diasAteProximoPrazo(processo)
  return dias !== null && dias < 0
}
