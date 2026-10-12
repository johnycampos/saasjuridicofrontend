<template>
  <v-container class="py-6" max-width="1200">
    <h1 class="text-h5 font-weight-bold mb-6">Arquivados</h1>
    <v-text-field v-model="search" label="Buscar por cliente, número ou réu" prepend-inner-icon="mdi-magnify" variant="outlined" clearable class="mb-4" />
    <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>
    <v-card border rounded="xl">
      <v-progress-linear v-if="loading" indeterminate color="primary" />
      <v-table>
        <thead><tr><th>Cliente</th><th>Nº do processo</th><th>Área</th><th>Tipo de ação</th><th>Arquivado em</th><th v-if="canWrite">Ações</th></tr></thead>
        <tbody>
          <tr v-for="processo in processos" :key="processo.id" @click="router.push(`/processos/${processo.id}`)" style="cursor:pointer">
            <td>{{ processo.clienteNome || '—' }}</td><td>{{ processo.numeroProcesso || '—' }}</td>
            <td>{{ groups.groups.find(g => g.id === processo.groupId)?.nome || '—' }}</td>
            <td>{{ processo.tipoAcao || '—' }}</td><td>{{ formatDate(processo.updatedAt) }}</td>
            <td v-if="canWrite"><v-btn size="small" variant="text" @click.stop="selected = processo; dialog = true">Desarquivar</v-btn></td>
          </tr>
          <tr v-if="!processos.length && !loading"><td :colspan="canWrite ? 6 : 5" class="text-center py-6 text-medium-emphasis">Nenhum processo arquivado encontrado.</td></tr>
        </tbody>
      </v-table>
    </v-card>
    <v-pagination v-if="totalPages > 1" v-model="page" :length="totalPages" class="mt-4" />
    <ArchiveProcessoDialog v-model="dialog" :processo="selected" @changed="onUnarchived" />
    <v-snackbar v-model="snackbar">{{ message }}</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useGroupsStore } from '@/stores/groups'
import { useTenantWriteAccess } from '@/composables/useTenantWriteAccess'
import { processoService } from '@/services/processoService'
import ArchiveProcessoDialog from '@/components/processo/ArchiveProcessoDialog.vue'

const router = useRouter(), route = useRoute(), auth = useAuthStore(), groups = useGroupsStore()
const { canWrite } = useTenantWriteAccess()
const processos = ref([]), search = ref(''), page = ref(1), totalPages = ref(0), loading = ref(false), error = ref('')
const dialog = ref(false), selected = ref(null), snackbar = ref(!!route.query.arquivado)
const message = ref(route.query.arquivado ? 'Processo arquivado com sucesso.' : '')
let timer, request = 0
function formatDate(value) { return value ? new Date(value).toLocaleString('pt-BR') : '—' }
async function load() {
  const current = ++request
  loading.value = true; error.value = ''
  try {
    const { data } = await processoService.listArquivados({ q: search.value || undefined, page: page.value - 1, size: 20 })
    if (current !== request) return
    processos.value = data.content; totalPages.value = data.totalPages
  } catch (err) {
    if (current === request) { processos.value = []; error.value = err.response?.data?.message || 'Não foi possível carregar os arquivados.' }
  } finally { if (current === request) loading.value = false }
}
watch(search, () => {
  clearTimeout(timer); ++request
  timer = setTimeout(() => { if (page.value !== 1) page.value = 1; else load() }, 300)
})
watch(page, load)
watch(() => auth.currentTenantId, () => {
  clearTimeout(timer); ++request; processos.value = []; dialog.value = false; selected.value = null
  if (page.value !== 1) page.value = 1; else load()
  groups.fetchGroups().catch(() => {})
}, { immediate: true })
onBeforeUnmount(() => { clearTimeout(timer); ++request })
async function onUnarchived() {
  message.value = 'Processo desarquivado com sucesso.'; snackbar.value = true
  processos.value = processos.value.filter(p => p.id !== selected.value?.id)
  if (!processos.value.length && page.value > 1) page.value--
  else await load()
}
</script>
