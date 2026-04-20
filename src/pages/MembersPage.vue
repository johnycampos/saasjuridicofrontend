<template>
  <v-container class="py-6">
    <h1 class="text-h5 font-weight-bold mb-6">Membros do Escritório</h1>
    <v-card border rounded="xl">
      <v-list lines="two">
        <v-list-item
          v-for="member in members"
          :key="member.id"
          :subtitle="member.userEmail"
        >
          <template #prepend>
            <v-avatar>
              <v-img v-if="member.userAvatarUrl" :src="member.userAvatarUrl" />
              <v-icon v-else>mdi-account</v-icon>
            </v-avatar>
          </template>
          <template #title>{{ member.userNome }}</template>
          <template #append>
            <v-chip size="small" :color="roleColor(member.role)" variant="tonal">
              {{ member.role }}
            </v-chip>
          </template>
        </v-list-item>
      </v-list>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { tenantService } from '@/services/tenantService'

const authStore = useAuthStore()
const members = ref([])

onMounted(async () => {
  if (!authStore.currentTenantId) return
  const res = await tenantService.getMembers(authStore.currentTenantId)
  members.value = res.data.content ?? res.data
})

function roleColor(role) {
  return { OWNER: 'error', ADMIN: 'warning', MEMBER: 'primary', VIEWER: 'default' }[role] ?? 'default'
}
</script>
