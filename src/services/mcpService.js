import api from './api'

export const mcpService = {
  list: () => api.get('/mcp/tokens'),
  create: (request) => api.post('/mcp/tokens', request),
  revoke: (id) => api.delete(`/mcp/tokens/${id}`),
  listConnections: () => api.get('/mcp/connections'),
  revokeConnection: (clientId) => api.delete(`/mcp/connections/${clientId}`)
}
