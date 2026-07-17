import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { processoService } from '@/services/processoService'
import { isUrgente, isAtrasado } from '@/composables/useProcessoUrgencia'

export const useNotificationsStore = defineStore('notifications', () => {
  const processos = ref([])
  const loading = ref(false)

  const alertProcessos = computed(() => processos.value.filter(p => isUrgente(p) || isAtrasado(p)))
  const hasAlerts = computed(() => alertProcessos.value.length > 0)

  async function loadAlertas() {
    loading.value = true
    try {
      const response = await processoService.list({ size: 100 })
      processos.value = response.data.content ?? response.data
    } finally {
      loading.value = false
    }
  }

  return { processos, loading, alertProcessos, hasAlerts, loadAlertas }
})
