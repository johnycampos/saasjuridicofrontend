import api from './api'

export const tarefaService = {
  list(processoId) { return api.get(`/processos/${processoId}/tarefas`) },
  create(processoId, data) { return api.post(`/processos/${processoId}/tarefas`, data) },
  toggleConcluida(id, concluida) { return api.patch(`/tarefas/${id}/concluida`, { concluida }) }
}
