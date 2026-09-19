import api from './api'

export const audienciaService = {
  list() { return api.get('/audiencias') },
  get(id) { return api.get(`/audiencias/${id}`) },
  create(data) { return api.post('/audiencias', data) },
  update(id, data) { return api.put(`/audiencias/${id}`, data) },
  delete(id) { return api.delete(`/audiencias/${id}`) }
}
