<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" permanent>
      <v-list-item
        prepend-icon="mdi-gavel"
        title="JurisFlow"
        subtitle="Gestão Jurídica"
        nav
      />
      <v-divider />
      <v-list density="compact" nav>
        <v-list-item
          prepend-icon="mdi-view-dashboard"
          title="Dashboard"
          :to="{ name: 'dashboard' }"
          rounded="lg"
        />

        <v-list-subheader>GRUPOS</v-list-subheader>

        <v-list-item
          v-for="group in groups"
          :key="group.id"
          :to="{ name: 'kanban', params: { groupId: group.id } }"
          rounded="lg"
        >
          <template #prepend>
            <v-icon :color="group.cor">mdi-folder</v-icon>
          </template>
          <v-list-item-title>{{ group.nome }}</v-list-item-title>
        </v-list-item>

        <v-list-item
          prepend-icon="mdi-plus"
          title="Novo Grupo"
          rounded="lg"
          @click="showGroupDialog = true"
        />

        <v-divider class="my-2" />

        <v-list-item
          prepend-icon="mdi-account-group"
          title="Membros"
          :to="{ name: 'membros' }"
          rounded="lg"
        />
      </v-list>

      <template #append>
        <v-list density="compact" nav>
          <v-list-item rounded="lg" @click="handleLogout">
            <template #prepend>
              <v-avatar size="32">
                <v-img v-if="authStore.user?.avatarUrl" :src="authStore.user.avatarUrl" />
                <v-icon v-else>mdi-account</v-icon>
              </v-avatar>
            </template>
            <v-list-item-title>{{ authStore.user?.nome }}</v-list-item-title>
            <v-list-item-subtitle>Sair</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </template>
    </v-navigation-drawer>

    <v-app-bar elevation="0" border="b">
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-app-bar-title>{{ pageTitle }}</v-app-bar-title>
    </v-app-bar>

    <v-main>
      <RouterView />
    </v-main>

    <v-dialog v-model="showGroupDialog" max-width="500">
      <v-card>
        <v-card-title>Novo Grupo</v-card-title>
        <v-card-text>
          <v-text-field v-model="newGroup.nome" label="Nome do Grupo" />
          <v-text-field v-model="newGroup.descricao" label="Descrição" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showGroupDialog = false">Cancelar</v-btn>
          <v-btn color="primary" :disabled="!newGroup.nome" @click="createGroup">Criar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useGroupsStore } from '@/stores/groups'

const authStore = useAuthStore()
const groupsStore = useGroupsStore()
const route = useRoute()
const router = useRouter()

const drawer = ref(true)
const showGroupDialog = ref(false)
const newGroup = ref({ nome: '', descricao: '' })

const groups = computed(() => groupsStore.groups)
const pageTitle = computed(() => route.meta.title ?? 'JurisFlow')

onMounted(() => groupsStore.fetchGroups())

async function createGroup() {
  await groupsStore.createGroup(newGroup.value)
  newGroup.value = { nome: '', descricao: '' }
  showGroupDialog.value = false
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>
