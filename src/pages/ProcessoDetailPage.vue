<template>
  <v-container v-if="loading" class="d-flex justify-center align-center" style="height:400px">
    <v-progress-circular indeterminate color="primary" />
  </v-container>

  <v-container v-else-if="processo" max-width="900" class="py-6">
    <div class="d-flex align-center mb-6">
      <v-btn icon variant="text" @click="$router.back()">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <div class="ml-2">
        <h1 class="text-h5 font-weight-bold">{{ processo.titulo }}</h1>
        <p v-if="processo.numeroProcesso" class="text-body-2 text-medium-emphasis">
          Nº {{ processo.numeroProcesso }}
        </p>
      </div>
      <v-spacer />
      <v-chip :color="prioridadeColor" variant="tonal" class="mr-2">
        {{ processo.prioridade }}
      </v-chip>
      <v-btn color="primary" variant="outlined" @click="showEditForm = true">Editar</v-btn>
    </div>

    <v-row>
      <v-col cols="12" md="8">
        <v-card border rounded="lg" class="mb-4">
          <v-card-title>Informações do Processo</v-card-title>
          <v-card-text>
            <v-row dense>
              <v-col v-if="processo.tipoAcao" cols="6">
                <p class="text-caption text-medium-emphasis">Tipo de Ação</p>
                <p class="text-body-2">{{ processo.tipoAcao }}</p>
              </v-col>
              <v-col v-if="processo.tribunal" cols="6">
                <p class="text-caption text-medium-emphasis">Tribunal</p>
                <p class="text-body-2">{{ processo.tribunal }}</p>
              </v-col>
              <v-col v-if="processo.vara" cols="6">
                <p class="text-caption text-medium-emphasis">Vara</p>
                <p class="text-body-2">{{ processo.vara }}</p>
              </v-col>
              <v-col v-if="processo.comarca" cols="6">
                <p class="text-caption text-medium-emphasis">Comarca</p>
                <p class="text-body-2">{{ processo.comarca }}</p>
              </v-col>
              <v-col v-if="processo.autor" cols="6">
                <p class="text-caption text-medium-emphasis">Autor</p>
                <p class="text-body-2">{{ processo.autor }}</p>
              </v-col>
              <v-col v-if="processo.reu" cols="6">
                <p class="text-caption text-medium-emphasis">Réu</p>
                <p class="text-body-2">{{ processo.reu }}</p>
              </v-col>
              <v-col v-if="processo.valorCausa" cols="6">
                <p class="text-caption text-medium-emphasis">Valor da Causa</p>
                <p class="text-body-2">{{ formatCurrency(processo.valorCausa) }}</p>
              </v-col>
            </v-row>
            <div v-if="processo.descricao" class="mt-4">
              <p class="text-caption text-medium-emphasis">Descrição</p>
              <p class="text-body-2 mt-1">{{ processo.descricao }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card border rounded="lg">
          <v-card-title>Próximo Prazo</v-card-title>
          <v-card-text>
            <div v-if="processo.prazoProximo" class="d-flex align-center">
              <v-icon :color="prazoColor" size="18" class="mr-1">mdi-clock-outline</v-icon>
              <span class="text-body-2">{{ formatDate(processo.prazoProximo) }}</span>
            </div>
            <p v-else class="text-body-2 text-medium-emphasis">Nenhum prazo cadastrado</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="showEditForm" max-width="700">
      <ProcessoForm
        :processo="processo"
        @saved="onSaved"
        @close="showEditForm = false"
      />
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProcessosStore } from '@/stores/processos'
import { isAfter, addDays, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import ProcessoForm from '@/components/processo/ProcessoForm.vue'

const route = useRoute()
const processoStore = useProcessosStore()

const processo = computed(() => processoStore.currentProcesso)
const loading = computed(() => processoStore.loading)
const showEditForm = ref(false)

onMounted(() => processoStore.fetchById(route.params.id))

const prioridadeColor = computed(() => ({
  BAIXA: 'success', MEDIA: 'info', ALTA: 'warning', URGENTE: 'error'
}[processo.value?.prioridade] ?? 'default'))

const prazoColor = computed(() => {
  if (!processo.value?.prazoProximo) return 'default'
  const prazo = new Date(processo.value.prazoProximo)
  if (isAfter(new Date(), prazo)) return 'error'
  if (isAfter(addDays(new Date(), 3), prazo)) return 'warning'
  return 'success'
})

function formatDate(d) {
  return format(new Date(d), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
}

function formatCurrency(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function onSaved() {
  processoStore.fetchById(route.params.id)
  showEditForm.value = false
}
</script>
