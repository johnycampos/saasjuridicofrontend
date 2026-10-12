import { computed, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { tenantService } from '@/services/tenantService'

export function useTenantWriteAccess() {
  const auth = useAuthStore()
  const role = ref(null)
  watch(() => [auth.currentTenantId, auth.user?.id], async ([tenantId, userId], previous, onCleanup) => {
    role.value = null
    let active = true
    onCleanup(() => { active = false })
    if (!tenantId || !userId) return
    try {
      let page = 0
      while (active) {
        const { data } = await tenantService.getMembers(tenantId, { page, size: 100 })
        if (!active) return
        const member = (data.content ?? data).find(m => m.userId === userId)
        if (member) { role.value = member.role; return }
        if (!data.content || ++page >= data.totalPages) return
      }
    } catch { if (active) role.value = null }
  }, { immediate: true })
  return { canWrite: computed(() => ['OWNER', 'ADMIN', 'MEMBER'].includes(role.value)) }
}
