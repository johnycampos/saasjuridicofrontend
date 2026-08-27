import api from './api'

export const movimentoService = {
  list(processoId) { return api.get(`/processos/${processoId}/movimentos`) },
  toggleVisualizado(id, visualizado) { return api.patch(`/movimentos/${id}/visualizado`, { visualizado }) }
}
