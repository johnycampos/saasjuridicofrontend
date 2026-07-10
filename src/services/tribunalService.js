import api from './api'

export const tribunalService = {
  list() { return api.get('/tribunais') },
  create(data) { return api.post('/tribunais', data) }
}
