import api from './api'

export const parcelaService = {
  create(contratoId, data) { return api.post(`/contratos/${contratoId}/parcelas`, data) },
  marcarPaga(id) { return api.patch(`/parcelas/${id}/pagar`) }
}
