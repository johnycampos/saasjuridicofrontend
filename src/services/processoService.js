import api from './api'

export const processoService = {
  list(params) { return api.get('/processos', { params }) },
  archive(id) { return api.put(`/processos/${id}/arquivar`) },
  unarchive(id) { return api.put(`/processos/${id}/desarquivar`) },
  listArquivados(params) { return api.get('/processos/arquivados', { params }) },
  create(data) { return api.post('/processos', data) },
  getById(id) { return api.get(`/processos/${id}`) },
  update(id, data) { return api.put(`/processos/${id}`, data) },
  move(id, targetColumnId, newPosition) {
    return api.put(`/processos/${id}/move`, { targetColumnId, newPosition })
  },
  moveToArea(id, groupId) {
    return api.put(`/processos/${id}/area`, { groupId })
  },
  delete(id) { return api.delete(`/processos/${id}`) },
  search(q, params) { return api.get('/processos', { params: { q, ...params } }) },
  atualizarDataJud(processoId) {
    return api.post(`/processos/${processoId}/atualizar-datajud`)
  }
}
