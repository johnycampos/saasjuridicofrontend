import { defineStore } from 'pinia'
import { ref } from 'vue'
import { groupService } from '@/services/groupService'

export const useGroupsStore = defineStore('groups', () => {
  const groups = ref([])
  const loading = ref(false)

  async function fetchGroups() {
    loading.value = true
    try {
      const response = await groupService.list()
      groups.value = response.data.content ?? response.data
    } finally {
      loading.value = false
    }
  }

  async function createGroup(data) {
    const response = await groupService.create(data)
    groups.value.push(response.data)
    return response.data
  }

  async function updateGroup(id, data) {
    const response = await groupService.update(id, data)
    const idx = groups.value.findIndex(g => g.id === id)
    if (idx !== -1) groups.value[idx] = response.data
    return response.data
  }

  async function deleteGroup(id) {
    await groupService.delete(id)
    groups.value = groups.value.filter(g => g.id !== id)
  }

  return { groups, loading, fetchGroups, createGroup, updateGroup, deleteGroup }
})
