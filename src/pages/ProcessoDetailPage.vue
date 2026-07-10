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
        <h1 class="text-h5 font-weight-bold">{{ processo.clienteNome }}</h1>
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

    <ProcessoDetail :processo="processo" />

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
import ProcessoForm from '@/components/processo/ProcessoForm.vue'
import ProcessoDetail from '@/components/processo/ProcessoDetail.vue'

const route = useRoute()
const processoStore = useProcessosStore()

const processo = computed(() => processoStore.currentProcesso)
const loading = computed(() => processoStore.loading)
const showEditForm = ref(false)

onMounted(() => processoStore.fetchById(route.params.id))

const prioridadeColor = computed(() => ({
  BAIXA: 'success', MEDIA: 'info', ALTA: 'warning', URGENTE: 'error'
}[processo.value?.prioridade] ?? 'default'))

function onSaved() {
  processoStore.fetchById(route.params.id)
  showEditForm.value = false
}
</script>
