import api from './api'

export const authService = {
  me() {
    return api.get('/auth/me')
  },
  refresh(refreshToken) {
    return api.post('/auth/refresh', { refreshToken })
  },
  getGoogleLoginUrl() {
    return '/oauth2/authorization/google'
  }
}
