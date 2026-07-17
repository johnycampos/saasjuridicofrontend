import api from './api'

export const importService = {
  downloadTemplate(groupId) {
    return api.get(`/groups/${groupId}/import/template`, { responseType: 'blob' })
  },
  upload(groupId, file) {
    const formData = new FormData()
    formData.append('file', file)
    // A instância `api` define Content-Type: application/json por padrão;
    // sem essa sobrescrita, o axios serializa o FormData como JSON em vez de
    // deixar o navegador montar o corpo multipart com boundary.
    return api.post(`/groups/${groupId}/import/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}
