<template>
  <div class="shell">
    <!-- Sidebar Rail -->
    <aside
      class="rail"
      :class="{ 'rail--open': sidebarOpen }"
      @mouseenter="sidebarOpen = true"
      @mouseleave="sidebarOpen = false"
    >
      <!-- Brand -->
      <div class="rail-brand">
        <div class="brand-mark">J</div>
        <div class="brand-text" :class="{ visible: sidebarOpen }">
          <div class="brand-name">JurisFlow</div>
          <div class="brand-tag">Gestão Jurídica</div>
        </div>
      </div>

      <!-- Nav -->
      <nav class="rail-nav">
        <div class="nav-item" :class="{ active: route.name === 'dashboard' }" @click="router.push('/dashboard')">
          <app-icon name="dashboard" :size="16" :stroke-width="route.name === 'dashboard' ? 2 : 1.6" />
          <span class="nav-label" :class="{ visible: sidebarOpen }">Dashboard</span>
        </div>

        <div class="nav-section-label" :class="{ visible: sidebarOpen }">Áreas</div>

        <div
          v-for="group in groups"
          :key="group.id"
          class="nav-item"
          :class="{ active: route.params.groupId === group.id }"
          @click="router.push({ name: 'kanban', params: { groupId: group.id } })"
        >
          <span class="nav-dot" :style="{ background: group.cor || 'var(--navy)' }" />
          <span class="nav-label" :class="{ visible: sidebarOpen }">{{ group.nome }}</span>
          <span class="nav-count" :class="{ visible: sidebarOpen }">{{ group.totalProcessos }}</span>
          
        </div>
        <div class="nav-section-label" :class="{ visible: sidebarOpen }">Equipe</div>

        <div class="nav-item" :class="{ active: route.name === 'membros' }" @click="router.push('/membros')">
          <app-icon name="users" :size="16" :stroke-width="route.name === 'membros' ? 2 : 1.6" />
          <span class="nav-label" :class="{ visible: sidebarOpen }">Equipe</span>
        </div>

        <div class="nav-item">
          <app-icon name="settings" :size="16" :stroke-width="1.6" />
          <span class="nav-label" :class="{ visible: sidebarOpen }">Configurações</span>
        </div>
      </nav>

      <!-- Footer user -->
      <div class="rail-footer">
        <div class="user-pill">
          <div class="user-avatar" :style="{ background: avatarColor }">
            {{ initials }}
          </div>
          <div class="user-info" :class="{ visible: sidebarOpen }">
            <div class="user-name">{{ authStore.user?.nome }}</div>
            <div class="user-sub" @click="authStore.logout(); router.push('/login')">Sair</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main -->
    <div class="main">
      <!-- Topbar -->
      <header class="topbar">
        <div class="crumb">
          <span class="crumb-item">JurisFlow</span>
          <app-icon name="chevronR" :size="12" class="crumb-sep" />
          <span class="crumb-item crumb-active">{{ pageTitle }}</span>
        </div>

        <!-- View tabs (kanban page only) -->
        <div v-if="route.name === 'kanban'" class="view-tabs">
          <button
            v-for="tab in viewTabs"
            :key="tab.id"
            class="view-tab"
            :class="{ active: currentView === tab.id }"
            @click="currentView = tab.id"
          >
            <app-icon :name="tab.icon" :size="13" />
            {{ tab.label }}
          </button>
        </div>

        <div style="flex-grow: 1" />

        <div class="topbar-search">
          <app-icon name="search" :size="14" />
          <span>Buscar por CNJ, partes, advogado…</span>
          <kbd>⌘K</kbd>
        </div>

        <div class="icon-btn notif-btn" title="Notificações">
          <app-icon name="bell" :size="17" />
          <span class="notif-dot" />
        </div>

        <div class="icon-btn" title="Preferências" @click="tweaksOpen = !tweaksOpen">
          <app-icon name="settings" :size="17" />
        </div>
      </header>

      <!-- Page content -->
      <div class="content">
        <RouterView />
      </div>
    </div>

    <!-- Tweaks panel -->
    <TweaksPanel :open="tweaksOpen" @close="tweaksOpen = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useGroupsStore } from '@/stores/groups'
import AppIcon from '@/components/AppIcon.vue'
import TweaksPanel from '@/components/TweaksPanel.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const groupsStore = useGroupsStore()
const sidebarOpen = ref(false)
const tweaksOpen = ref(false)
const currentView = ref('kanban')

const viewTabs = [
  { id: 'kanban', label: 'Kanban', icon: 'columns' },
  { id: 'list',   label: 'Lista',  icon: 'list' },
]

const groups = computed(() => groupsStore.groups)

const pageTitle = computed(() => {
  const titles = { dashboard: 'Dashboard', kanban: 'Quadro', membros: 'Equipe', 'processo-detail': 'Processo' }
  return titles[route.name] || 'JurisFlow'
})

const initials = computed(() => {
  const nome = authStore.user?.nome || ''
  return nome.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
})

const avatarColor = computed(() => {
  const colors = ['oklch(0.42 0.09 220)', 'oklch(0.42 0.09 155)', 'oklch(0.42 0.09 290)', 'oklch(0.42 0.09 50)']
  const idx = (authStore.user?.nome?.charCodeAt(0) || 0) % colors.length
  return colors[idx]
})


onMounted(() => {
  if (authStore.currentTenantId) groupsStore.fetchGroups()
})
</script>

<style scoped>
.shell {
  display: grid;
  grid-template-columns: auto 1fr;
  height: 100vh;
  background: var(--bg);
  overflow: hidden;
}

/* Rail */
.rail {
  width: var(--rail);
  background: var(--panel);
  border-right: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  z-index: 20;
  transition: width 220ms cubic-bezier(.4,0,.2,1);
  overflow: hidden;
  flex-shrink: 0;
}
.rail--open { width: var(--rail-open); }

.rail-brand {
  height: var(--header);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  border-bottom: 1px solid var(--line);
  flex-shrink: 0;
  white-space: nowrap;
}

.brand-mark {
  width: 28px; height: 28px;
  border-radius: 7px;
  background: var(--navy);
  display: grid; place-items: center;
  color: white;
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-weight: 600;
  font-size: 15px;
  letter-spacing: -0.02em;
  flex-shrink: 0;
}

.brand-text {
  opacity: 0;
  transition: opacity 150ms;
}
.brand-text.visible { opacity: 1; }

.brand-name {
  font-family: 'Fraunces', serif;
  font-size: 17px;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--ink);
  white-space: nowrap;
}

.brand-tag {
  font-size: 10px;
  color: var(--ink-3);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-top: 1px;
}

.rail-nav {
  padding: 12px 8px;
  overflow-y: auto;
  overflow-x: hidden;
  flex-grow: 1;
}

.nav-section-label {
  font-size: 10px;
  color: var(--ink-3);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 12px 12px 6px;
  white-space: nowrap;
  font-weight: 500;
  opacity: 0;
  transition: opacity 150ms;
  pointer-events: none;
}
.nav-section-label.visible { opacity: 1; }

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  margin: 1px 0;
  border-radius: 8px;
  font-size: var(--fs-md);
  color: var(--ink-2);
  cursor: pointer;
  white-space: nowrap;
  transition: background 120ms, color 120ms;
  overflow: hidden;
}
.nav-item :deep(svg) { flex-shrink: 0; }
.nav-item:hover { background: var(--bg-3); color: var(--ink); }
.nav-item.active { background: var(--bg-3); color: var(--ink); font-weight: 500; }

.nav-dot {
  width: 8px; height: 8px;
  border-radius: 3px;
  flex-shrink: 0;
}

.nav-label {
  opacity: 0;
  transition: opacity 120ms;
  flex-grow: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
.nav-label.visible { opacity: 1; }

.nav-count {
  font-family: 'Geist Mono', monospace;
  font-size: 11px;
  color: var(--ink-3);
  font-variant-numeric: tabular-nums;
  opacity: 0;
  transition: opacity 120ms;
}
.nav-count.visible { opacity: 1; }

.rail-footer {
  border-top: 1px solid var(--line);
  padding: 10px;
  flex-shrink: 0;
}

.user-pill {
  display: flex; align-items: center; gap: 10px;
  padding: 6px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 120ms;
}
.user-pill:hover { background: var(--bg-3); }

.user-avatar {
  width: 28px; height: 28px;
  border-radius: 50%;
  color: white;
  display: grid; place-items: center;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
  letter-spacing: -0.02em;
}

.user-info {
  opacity: 0;
  transition: opacity 150ms;
  min-width: 0;
}
.user-info.visible { opacity: 1; }

.user-name {
  font-size: 12.5px; font-weight: 500;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  color: var(--ink);
}

.user-sub {
  font-size: 11px;
  color: var(--ink-3);
  cursor: pointer;
}
.user-sub:hover { color: var(--red); }

/* Main */
.main {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  min-width: 0;
}

.topbar {
  height: var(--header);
  border-bottom: 1px solid var(--line);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  background: var(--panel);
  flex-shrink: 0;
}

.crumb {
  display: flex; align-items: center; gap: 6px;
  font-size: var(--fs-md); color: var(--ink-2);
}
.crumb-sep { color: var(--ink-4); }
.crumb-active { color: var(--ink); font-weight: 500; }

/* View tabs */
.view-tabs {
  display: flex;
  gap: 2px;
  background: var(--bg-3);
  padding: 3px;
  border-radius: 8px;
  margin-left: 16px;
}

.view-tab {
  display: flex; align-items: center; gap: 5px;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 12.5px;
  font-family: inherit;
  background: transparent;
  color: var(--ink-2);
  font-weight: 400;
  cursor: pointer;
  transition: background 120ms, color 120ms, box-shadow 120ms;
  white-space: nowrap;
}
.view-tab.active {
  background: var(--panel);
  color: var(--ink);
  font-weight: 500;
  box-shadow: var(--shadow-sm);
}

.topbar-search {
  display: flex; align-items: center; gap: 8px;
  background: var(--bg-3);
  padding: 7px 12px;
  border-radius: 8px;
  width: 320px;
  color: var(--ink-3);
  font-size: 13px;
  border: 1px solid transparent;
  cursor: text;
}
.topbar-search:hover { border-color: var(--line); }

kbd {
  font-family: 'Geist Mono', monospace;
  font-size: 10px;
  padding: 2px 5px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 4px;
  color: var(--ink-3);
  margin-left: auto;
}

.icon-btn {
  width: 34px; height: 34px;
  display: grid; place-items: center;
  border-radius: 8px;
  color: var(--ink-2);
  cursor: pointer;
  transition: background 120ms;
  position: relative;
  flex-shrink: 0;
}
.icon-btn:hover { background: var(--bg-3); }

.notif-btn { position: relative; }
.notif-dot {
  position: absolute;
  top: 7px; right: 8px;
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--red);
  border: 2px solid var(--panel);
}

.content {
  flex-grow: 1;
  overflow: auto;
  position: relative;
  background: var(--bg);
}
</style>
