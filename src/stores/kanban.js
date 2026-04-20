import { defineStore } from 'pinia'
import { ref } from 'vue'
import { groupService } from '@/services/groupService'
import { boardService } from '@/services/boardService'
import { processoService } from '@/services/processoService'

export const useKanbanStore = defineStore('kanban', () => {
  const columns = ref([])
  const loading = ref(false)
  const currentGroupId = ref(null)

  async function loadBoard(groupId) {
    loading.value = true
    currentGroupId.value = groupId
    try {
      const response = await groupService.getBoard(groupId)
      columns.value = response.data
    } finally {
      loading.value = false
    }
  }

  async function createColumn(data) {
    const response = await boardService.createColumn({ ...data, groupId: currentGroupId.value })
    columns.value.push({ ...response.data, processos: [] })
    return response.data
  }

  async function updateColumn(columnId, data) {
    const response = await boardService.updateColumn(columnId, data)
    const idx = columns.value.findIndex(c => c.id === columnId)
    if (idx !== -1) columns.value[idx] = { ...columns.value[idx], ...response.data }
  }

  async function deleteColumn(columnId) {
    await boardService.deleteColumn(columnId)
    columns.value = columns.value.filter(c => c.id !== columnId)
  }

  async function reorderColumns(newOrder) {
    await boardService.reorderColumns(newOrder.map(c => c.id))
    columns.value = newOrder
  }

  async function moveProcesso(processoId, fromColumnId, toColumnId, newPosition) {
    await processoService.move(processoId, toColumnId, newPosition)

    const fromCol = columns.value.find(c => c.id === fromColumnId)
    const toCol = columns.value.find(c => c.id === toColumnId)
    if (!fromCol || !toCol) return

    const idx = fromCol.processos.findIndex(p => p.id === processoId)
    if (idx === -1) return

    const [processo] = fromCol.processos.splice(idx, 1)
    processo.columnId = toColumnId
    toCol.processos.splice(newPosition ?? toCol.processos.length, 0, processo)
  }

  function addProcesso(processo) {
    const col = columns.value.find(c => c.id === processo.columnId)
    if (col) col.processos.push(processo)
  }

  return {
    columns, loading, currentGroupId,
    loadBoard, createColumn, updateColumn, deleteColumn, reorderColumns, moveProcesso, addProcesso
  }
})
