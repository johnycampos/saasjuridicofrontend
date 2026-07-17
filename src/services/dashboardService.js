import api from './api'

export const dashboardService = {
  getResumo() { return api.get('/dashboard/resumo') },
  getAgendaSemana() { return api.get('/dashboard/agenda-semana') }
}
