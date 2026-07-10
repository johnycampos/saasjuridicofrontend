import api from './api'

export const dashboardService = {
  getResumo() { return api.get('/dashboard/resumo') }
}
