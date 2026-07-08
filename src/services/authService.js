import api from './api'

export const authService = {
  me() {
    return api.get('/auth/me')
  },
  refresh(refreshToken) {
    return api.post('/auth/refresh', { refreshToken })
  },
  getGoogleLoginUrl() {
    const base = import.meta.env.VITE_API_URL || ''
    return `${base}/oauth2/authorization/google`
  }
}
