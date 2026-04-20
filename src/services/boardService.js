import api from './api'

export const boardService = {
  createColumn(data) { return api.post('/board/columns', data) },
  updateColumn(id, data) { return api.put(`/board/columns/${id}`, data) },
  deleteColumn(id) { return api.delete(`/board/columns/${id}`) },
  reorderColumns(columnIds) { return api.put('/board/columns/reorder', { columnIds }) }
}
