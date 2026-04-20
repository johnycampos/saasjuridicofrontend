<template>
  <v-container class="py-12" max-width="600">
    <div class="text-center mb-8">
      <v-icon size="64" color="primary">mdi-gavel</v-icon>
      <h1 class="text-h4 font-weight-bold mt-4">Bem-vindo ao JurisFlow!</h1>
      <p class="text-body-1 text-medium-emphasis mt-2">Vamos configurar o seu escritório.</p>
    </div>

    <v-card border rounded="xl" class="pa-6">
      <v-stepper v-model="step" :items="['Escritório', 'Primeiro Grupo']" hide-actions>
        <template #item.1>
          <v-card flat>
            <v-card-title>Dados do Escritório</v-card-title>
            <v-card-text>
              <v-text-field v-model="form.nome" label="Nome do Escritório *" class="mb-2" />
              <v-text-field v-model="form.cnpj" label="CNPJ" class="mb-2" />
              <v-text-field v-model="form.telefone" label="Telefone" class="mb-2" />
              <v-textarea v-model="form.endereco" label="Endereço" rows="2" />
            </v-card-text>
          </v-card>
        </template>

        <template #item.2>
          <v-card flat>
            <v-card-title>Primeiro Grupo</v-card-title>
            <v-card-subtitle>Grupos organizam processos por equipe ou área.</v-card-subtitle>
            <v-card-text>
              <v-text-field v-model="firstGroup.nome" label="Nome do Grupo *" class="mb-2" />
              <v-text-field v-model="firstGroup.descricao" label="Descrição" />
            </v-card-text>
          </v-card>
        </template>
      </v-stepper>

      <v-card-actions class="pa-4">
        <v-btn v-if="step > 1" variant="text" @click="step--">Voltar</v-btn>
        <v-spacer />
        <v-btn v-if="step < 2" color="primary" :disabled="!form.nome" @click="step++">
          Continuar
        </v-btn>
        <v-btn v-else color="primary" :loading="loading" :disabled="!firstGroup.nome" @click="finish">
          Começar!
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { tenantService } from '@/services/tenantService'
import { groupService } from '@/services/groupService'

const router = useRouter()
const authStore = useAuthStore()

const step = ref(1)
const loading = ref(false)
const form = ref({ nome: '', cnpj: '', telefone: '', endereco: '' })
const firstGroup = ref({ nome: 'Geral', descricao: 'Grupo padrão do escritório' })

async function finish() {
  loading.value = true
  try {
    const tenantRes = await tenantService.create(form.value)
    authStore.setCurrentTenant(tenantRes.data.id)
    await groupService.create(firstGroup.value)
    router.push('/dashboard')
  } catch (error) {
    console.error('Erro no onboarding:', error)
  } finally {
    loading.value = false
  }
}
</script>
