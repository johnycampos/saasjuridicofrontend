import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const accessToken = ref(null)
  const refreshTokenValue = ref(null)
  const currentTenantId = ref(null)

  const isAuthenticated = computed(() => !!accessToken.value)

  function setTokens(token, refresh) {
    accessToken.value = token
    refreshTokenValue.value = refresh
    localStorage.setItem('access_token', token)
    if (refresh) localStorage.setItem('refresh_token', refresh)
  }

  function initFromStorage() {
    const token = localStorage.getItem('access_token')
    const refresh = localStorage.getItem('refresh_token')
    const tenantId = localStorage.getItem('current_tenant_id')
    if (token) {
      accessToken.value = token
      refreshTokenValue.value = refresh
      fetchMe()
    }
    if (tenantId) currentTenantId.value = tenantId
  }

  async function fetchMe() {
    try {
      const response = await authService.me()
      user.value = response.data
    } catch {
      logout()
    }
  }

  async function refreshToken() {
    if (!refreshTokenValue.value) throw new Error('No refresh token')
    const response = await authService.refresh(refreshTokenValue.value)
    setTokens(response.data.accessToken, response.data.refreshToken)
  }

  function setCurrentTenant(tenantId) {
    currentTenantId.value = tenantId
    localStorage.setItem('current_tenant_id', tenantId)
  }

  function logout() {
    user.value = null
    accessToken.value = null
    refreshTokenValue.value = null
    currentTenantId.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('current_tenant_id')
  }

  return {
    user, accessToken, currentTenantId, isAuthenticated,
    setTokens, initFromStorage, fetchMe, refreshToken, setCurrentTenant, logout
  }
})
