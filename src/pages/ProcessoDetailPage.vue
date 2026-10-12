<template>
  <v-container v-if="loading" class="d-flex justify-center align-center" style="height:400px">
    <v-progress-circular indeterminate color="primary" />
  </v-container>

  <v-container v-else-if="processo" max-width="900" class="py-6">
    <div class="d-flex align-center mb-6 processo-header">
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
      <v-chip v-if="processo.prioridadeMaisUrgente" :color="prioridadeColor" variant="tonal" class="mr-2">
        {{ processo.prioridadeMaisUrgente }}
      </v-chip>
      <v-btn v-if="processo.status !== 'ARQUIVADO'" variant="outlined" class="mr-2" @click="showMoveAreaDialog = true">Mudar de Área</v-btn>
      <v-btn v-if="canWrite" variant="outlined" class="mr-2" @click="showArchiveDialog = true">{{ processo.status === 'ARQUIVADO' ? 'Desarquivar' : 'Arquivar' }}</v-btn>
      <v-btn color="primary" variant="outlined" @click="showEditForm = true">Editar</v-btn>
    </div>

    <v-alert v-if="processo.status === 'ARQUIVADO'" type="info" variant="tonal" class="mb-4">Processo arquivado</v-alert>
    <ArchiveProcessoDialog v-model="showArchiveDialog" :processo="processo" @changed="onArchiveChanged" />
    <v-snackbar v-model="archiveSnackbar">Processo desarquivado com sucesso.</v-snackbar>
    <ProcessoDetail
      :processo="processo"
      @resumo-atualizado="processoStore.patchCurrentProcesso"
      @refresh="processoStore.fetchById(route.params.id)"
    />

    <v-dialog v-model="showEditForm" max-width="700" :fullscreen="isMobile" :scrollable="isMobile">
      <ProcessoForm
        :processo="processo"
        @saved="onSaved"
        @close="showEditForm = false"
      />
    </v-dialog>

    <v-dialog v-model="showMoveAreaDialog" max-width="480" :fullscreen="isMobile" :scrollable="isMobile">
      <MoveAreaDialog
        v-if="processo"
        :processo="processo"
        @close="showMoveAreaDialog = false"
        @moved="onAreaMoved"
      />
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useIsMobile } from '@/composables/useIsMobile'
import { useRoute, useRouter } from 'vue-router'
import ArchiveProcessoDialog from '@/components/processo/ArchiveProcessoDialog.vue'
import { useTenantWriteAccess } from '@/composables/useTenantWriteAccess'
import { useProcessosStore } from '@/stores/processos'
import ProcessoForm from '@/components/processo/ProcessoForm.vue'
import ProcessoDetail from '@/components/processo/ProcessoDetail.vue'
import MoveAreaDialog from '@/components/processo/MoveAreaDialog.vue'

const route = useRoute()
const router = useRouter()
const { canWrite } = useTenantWriteAccess()
const showArchiveDialog = ref(false), archiveSnackbar = ref(false)
const processoStore = useProcessosStore()
const isMobile = useIsMobile()

const processo = computed(() => processoStore.currentProcesso)
const loading = computed(() => processoStore.loading)
const showEditForm = ref(false)
const showMoveAreaDialog = ref(false)

onMounted(() => processoStore.fetchById(route.params.id))

const prioridadeColor = computed(() => ({
  BAIXA: 'success', MEDIA: 'info', ALTA: 'warning', URGENTE: 'error'
}[processo.value?.prioridadeMaisUrgente] ?? 'default'))

async function onArchiveChanged(processo) {
  if (processo.status === 'ARQUIVADO') await router.push({ path: '/arquivados', query: { arquivado: '1' } })
  else { await processoStore.fetchById(route.params.id); archiveSnackbar.value = true }
}

function onSaved() {
  processoStore.fetchById(route.params.id)
  showEditForm.value = false
}

function onAreaMoved() {
  showMoveAreaDialog.value = false
  processoStore.fetchById(route.params.id)
}
</script>

<style scoped>
/* Mobile: header do processo não deve estourar largura */
.processo-header {
  flex-wrap: wrap;
  row-gap: 8px;
}
@media (min-width: 600px) {
  .processo-header {
    flex-wrap: nowrap;
    row-gap: 0;
  }
}
</style>
