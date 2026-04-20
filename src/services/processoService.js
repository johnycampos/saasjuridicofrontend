import api from './api'

export const processoService = {
  list(params) { return api.get('/processos', { params }) },
  create(data) { return api.post('/processos', data) },
  getById(id) { return api.get(`/processos/${id}`) },
  update(id, data) { return api.put(`/processos/${id}`, data) },
  move(id, targetColumnId, newPosition) {
    return api.put(`/processos/${id}/move`, { targetColumnId, newPosition })
  },
  delete(id) { return api.delete(`/processos/${id}`) },
  search(q, params) { return api.get('/processos', { params: { q, ...params } }) }
}
