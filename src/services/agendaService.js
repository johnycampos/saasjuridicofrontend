import api from './api'

export const agendaService = {
  getCompleta(ano, mes) {
    return api.get('/agenda/completa', { params: { ano, mes } })
  },
  getEventosMes(ano, mes) {
    return api.get('/agenda/mes', { params: { ano, mes } })
  },
  getResumoMes(ano, mes) {
    return api.get('/agenda/resumo', { params: { ano, mes } })
  }
}
