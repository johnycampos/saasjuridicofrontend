import api from './api'

export const oauthService = {
  getRequest: (requestId) => api.get(`/oauth/requests/${requestId}`),
  approve: (requestId, tenantId) => api.post(`/oauth/requests/${requestId}/approve`, { tenantId }),
  deny: (requestId) => api.post(`/oauth/requests/${requestId}/deny`)
}
