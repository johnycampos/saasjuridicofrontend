import api from './api'

export const tenantService = {
  create(data) { return api.post('/tenants', data) },
  getById(id) { return api.get(`/tenants/${id}`) },
  update(id, data) { return api.put(`/tenants/${id}`, data) },
  getMembers(id, params) { return api.get(`/tenants/${id}/members`, { params }) },
  addMember(tenantId, email, role) {
    return api.post(`/tenants/${tenantId}/members`, { email, role })
  },
  updateMemberRole(tenantId, userId, role) {
    return api.put(`/tenants/${tenantId}/members/${userId}/role`, { role })
  },
  removeMember(tenantId, userId) {
    return api.delete(`/tenants/${tenantId}/members/${userId}`)
  }
}
