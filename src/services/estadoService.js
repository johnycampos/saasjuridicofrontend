import api from './api'

export const estadoService = {
  list() { return api.get('/estados') }
}
