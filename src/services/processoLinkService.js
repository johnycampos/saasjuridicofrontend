import api from './api'

export const processoLinkService = {
  list(processoId) { return api.get(`/processos/${processoId}/links`) },
  create(processoId, data) { return api.post(`/processos/${processoId}/links`, data) }
}
