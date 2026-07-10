import api from './api'

export const contratoService = {
  getByProcesso(processoId) { return api.get(`/processos/${processoId}/contrato`) },
  upsert(processoId, data) { return api.put(`/processos/${processoId}/contrato`, data) }
}
