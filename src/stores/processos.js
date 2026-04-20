import { defineStore } from 'pinia'
import { ref } from 'vue'
import { processoService } from '@/services/processoService'

export const useProcessosStore = defineStore('processos', () => {
  const currentProcesso = ref(null)
  const loading = ref(false)

  async function fetchById(id) {
    loading.value = true
    try {
      const response = await processoService.getById(id)
      currentProcesso.value = response.data
      return response.data
    } finally {
      loading.value = false
    }
  }

  async function create(data) {
    const response = await processoService.create(data)
    return response.data
  }

  async function update(id, data) {
    const response = await processoService.update(id, data)
    if (currentProcesso.value?.id === id) currentProcesso.value = response.data
    return response.data
  }

  async function remove(id) {
    await processoService.delete(id)
    if (currentProcesso.value?.id === id) currentProcesso.value = null
  }

  return { currentProcesso, loading, fetchById, create, update, remove }
})
