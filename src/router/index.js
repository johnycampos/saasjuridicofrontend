import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      { path: '', name: 'login', component: () => import('@/pages/LoginPage.vue') }
    ]
  },
  {
    path: '/onboarding',
    name: 'onboarding',
    component: () => import('@/pages/OnboardingPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard', name: 'dashboard', component: () => import('@/pages/DashboardPage.vue'), meta: { title: 'Dashboard' } },
      { path: 'board/:groupId', name: 'kanban', component: () => import('@/pages/KanbanPage.vue'), meta: { title: 'Kanban' } },
      { path: 'processos/:id', name: 'processo-detail', component: () => import('@/pages/ProcessoDetailPage.vue'), meta: { title: 'Processo' } },
      { path: 'membros', name: 'membros', component: () => import('@/pages/MembersPage.vue'), meta: { title: 'Membros' } }
    ]
  },
  {
    path: '/invite/:token',
    name: 'invite-accept',
    component: () => import('@/pages/InviteAcceptPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.query.token) {
    authStore.setTokens(to.query.token, to.query.refresh)
    if (to.query.tenantId) {
      authStore.setCurrentTenant(to.query.tenantId)
    }
    authStore.fetchMe()
    next({ path: to.path, replace: true })
    return
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }

  next()
})

export default router
