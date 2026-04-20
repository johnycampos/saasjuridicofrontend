<template>
  <v-container class="py-6">
    <div class="d-flex align-center justify-space-between mb-6">
      <h1 class="text-h5 font-weight-bold">Membros do Escritório</h1>
      <v-btn
        v-if="canManage"
        color="primary"
        prepend-icon="mdi-account-plus"
        @click="openAddDialog"
      >
        Adicionar Membro
      </v-btn>
    </div>

    <v-card border rounded="xl">
      <v-list lines="two">
        <v-list-item
          v-for="member in members"
          :key="member.id"
          :subtitle="member.userEmail"
        >
          <template #prepend>
            <v-avatar color="grey-lighten-2">
              <v-img v-if="member.userAvatarUrl" :src="member.userAvatarUrl" />
              <v-icon v-else color="grey">mdi-account</v-icon>
            </v-avatar>
          </template>

          <template #title>{{ member.userNome || member.userEmail }}</template>

          <template #append>
            <div class="d-flex align-center gap-2">
              <v-chip size="small" :color="statusColor(member.status)" variant="tonal" class="mr-2">
                {{ member.status === 'PENDING' ? 'Pendente' : 'Ativo' }}
              </v-chip>
              <v-chip size="small" :color="roleColor(member.role)" variant="tonal" class="mr-2">
                {{ roleLabel(member.role) }}
              </v-chip>
              <v-btn
                v-if="canManage && member.role !== 'OWNER'"
                icon="mdi-account-remove"
                size="small"
                variant="text"
                color="error"
                @click="confirmRemove(member)"
              />
            </div>
          </template>
        </v-list-item>

        <v-list-item v-if="members.length === 0 && !loading">
          <v-list-item-title class="text-medium-emphasis text-center py-4">
            Nenhum membro encontrado
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>

    <!-- Dialog: Adicionar Membro -->
    <v-dialog v-model="addDialog" max-width="480" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-6 pb-2">Adicionar Membro</v-card-title>
        <v-card-text class="pa-6 pt-2">
          <v-alert
            v-if="addError"
            type="error"
            variant="tonal"
            class="mb-4"
            closable
            @click:close="addError = ''"
          >
            {{ addError }}
          </v-alert>

          <v-text-field
            v-model="newEmail"
            label="E-mail do membro"
            type="email"
            variant="outlined"
            prepend-inner-icon="mdi-email"
            :error-messages="emailError"
            @input="emailError = ''"
          />

          <v-select
            v-model="newRole"
            label="Papel"
            :items="roleOptions"
            item-title="label"
            item-value="value"
            variant="outlined"
            class="mt-2"
          />
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="closeAddDialog">Cancelar</v-btn>
          <v-btn color="primary" :loading="addLoading" @click="submitAddMember">
            Adicionar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog: Confirmar Remoção -->
    <v-dialog v-model="removeDialog" max-width="400">
      <v-card rounded="xl">
        <v-card-title class="pa-6 pb-2">Remover Membro</v-card-title>
        <v-card-text class="pa-6 pt-2">
          Tem certeza que deseja remover
          <strong>{{ memberToRemove?.userNome || memberToRemove?.userEmail }}</strong>
          do escritório?
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="removeDialog = false">Cancelar</v-btn>
          <v-btn color="error" :loading="removeLoading" @click="submitRemove">
            Remover
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watchEffect } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { tenantService } from '@/services/tenantService'

const authStore = useAuthStore()
const members = ref([])
const loading = ref(false)
const myRole = ref(null)

const addDialog = ref(false)
const addLoading = ref(false)
const addError = ref('')
const newEmail = ref('')
const newRole = ref('MEMBER')
const emailError = ref('')

const removeDialog = ref(false)
const removeLoading = ref(false)
const memberToRemove = ref(null)

const roleOptions = [
  { label: 'Membro', value: 'MEMBER' },
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Visualizador', value: 'VIEWER' }
]

const canManage = computed(() =>
  myRole.value === 'OWNER' || myRole.value === 'ADMIN'
)

// watchEffect executa imediatamente e re-executa quando authStore.user
// ou members mudar — resolve o timing entre fetchMe e loadMembers
watchEffect(() => {
  const user = authStore.user
  const memberList = members.value
  if (user && memberList.length > 0) {
    const me = memberList.find(m => m.userId === user.id)
    myRole.value = me?.role ?? null
  }
})

onMounted(async () => {
  if (!authStore.currentTenantId) return
  await loadMembers()
})

async function loadMembers() {
  loading.value = true
  try {
    // Garante que o usuário está carregado antes de determinar o papel
    if (!authStore.user) await authStore.fetchMe()
    const res = await tenantService.getMembers(authStore.currentTenantId)
    members.value = res.data.content ?? res.data
    const me = members.value.find(m => m.userId === authStore.user?.id)
    myRole.value = me?.role ?? null
  } finally {
    loading.value = false
  }
}

function openAddDialog() {
  newEmail.value = ''
  newRole.value = 'MEMBER'
  addError.value = ''
  emailError.value = ''
  addDialog.value = true
}

function closeAddDialog() {
  addDialog.value = false
}

async function submitAddMember() {
  if (!newEmail.value || !newEmail.value.includes('@')) {
    emailError.value = 'Informe um e-mail válido'
    return
  }
  addLoading.value = true
  addError.value = ''
  try {
    const res = await tenantService.addMember(authStore.currentTenantId, newEmail.value, newRole.value)
    members.value.push(res.data)
    closeAddDialog()
  } catch (err) {
    const msg = err.response?.data?.message || err.response?.data?.error || 'Erro ao adicionar membro'
    addError.value = msg
  } finally {
    addLoading.value = false
  }
}

function confirmRemove(member) {
  memberToRemove.value = member
  removeDialog.value = true
}

async function submitRemove() {
  if (!memberToRemove.value) return
  removeLoading.value = true
  try {
    await tenantService.removeMember(authStore.currentTenantId, memberToRemove.value.userId)
    members.value = members.value.filter(m => m.id !== memberToRemove.value.id)
    removeDialog.value = false
  } catch (err) {
    console.error('Erro ao remover membro:', err)
  } finally {
    removeLoading.value = false
  }
}

function statusColor(status) {
  return status === 'PENDING' ? 'warning' : 'success'
}

function roleColor(role) {
  return { OWNER: 'error', ADMIN: 'warning', MEMBER: 'primary', VIEWER: 'default' }[role] ?? 'default'
}

function roleLabel(role) {
  return { OWNER: 'Proprietário', ADMIN: 'Admin', MEMBER: 'Membro', VIEWER: 'Visualizador' }[role] ?? role
}
</script>
