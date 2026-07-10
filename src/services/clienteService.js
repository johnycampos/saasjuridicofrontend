import api from './api'

export const clienteService = {
  list(params) { return api.get('/clientes', { params }) },
  create(data) { return api.post('/clientes', data) },
  getById(id) { return api.get(`/clientes/${id}`) },
  update(id, data) { return api.put(`/clientes/${id}`, data) }
}
