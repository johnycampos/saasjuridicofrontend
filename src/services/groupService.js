import api from './api'

export const groupService = {
  list(params) { return api.get('/groups', { params }) },
  create(data) { return api.post('/groups', data) },
  update(id, data) { return api.put(`/groups/${id}`, data) },
  delete(id) { return api.delete(`/groups/${id}`) },
  addMember(groupId, userId) { return api.post(`/groups/${groupId}/members`, { userId }) },
  removeMember(groupId, userId) { return api.delete(`/groups/${groupId}/members/${userId}`) },
  getBoard(groupId) { return api.get(`/groups/${groupId}/board`) }
}
