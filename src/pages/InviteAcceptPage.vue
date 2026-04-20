<template>
  <v-container class="d-flex justify-center align-center fill-height">
    <v-card max-width="400" border rounded="xl" class="pa-6 text-center">
      <v-icon size="64" :color="status === 'success' ? 'success' : 'error'">
        {{ status === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }}
      </v-icon>
      <h2 class="text-h6 mt-4">{{ message }}</h2>
      <v-btn class="mt-6" color="primary" to="/dashboard">Ir para o Dashboard</v-btn>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const status = ref('loading')
const message = ref('Processando convite...')

onMounted(async () => {
  try {
    await api.get(`/invites/accept/${route.params.token}`)
    status.value = 'success'
    message.value = 'Convite aceito com sucesso!'
  } catch {
    status.value = 'error'
    message.value = 'Convite inválido ou expirado.'
  }
})
</script>
