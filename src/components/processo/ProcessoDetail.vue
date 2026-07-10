<template>
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
          <div v-if="proximaTarefaPrazoLocal" class="d-flex align-center">
            <v-icon :color="prazoColor" size="18" class="mr-1">mdi-clock-outline</v-icon>
            <span class="text-body-2">{{ formatDate(proximaTarefaPrazoLocal) }}</span>
          </div>
          <p v-else class="text-body-2 text-medium-emphasis">Nenhuma tarefa com prazo em aberto</p>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="6">
      <v-card border rounded="lg">
        <v-card-title class="d-flex align-center">
          Tarefas
          <v-spacer />
          <v-btn size="small" variant="text" prepend-icon="mdi-plus" @click="showTarefaForm = true">
            Nova tarefa
          </v-btn>
        </v-card-title>
        <v-card-text>
          <p v-if="tarefas.length === 0" class="text-body-2 text-medium-emphasis">
            Nenhuma tarefa cadastrada.
          </p>
          <v-list v-else density="compact">
            <v-list-item v-for="t in tarefas" :key="t.id">
              <template #prepend>
                <v-checkbox-btn
                  :model-value="t.concluida"
                  @update:model-value="toggleTarefa(t)"
                />
              </template>
              <v-list-item-title :class="{ 'text-decoration-line-through text-medium-emphasis': t.concluida }">
                {{ t.titulo }}
              </v-list-item-title>
              <v-list-item-subtitle>
                <v-chip v-if="t.prioridade" size="x-small" :color="prioridadeColor(t.prioridade)" variant="tonal" class="mr-2">
                  {{ t.prioridade }}
                </v-chip>
                <span v-if="t.prazo">{{ formatDate(t.prazo) }}</span>
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="6">
      <v-card border rounded="lg">
        <v-card-title class="d-flex align-center">
          Links
          <v-spacer />
          <v-btn size="small" variant="text" prepend-icon="mdi-plus" @click="showLinkForm = true">
            Novo link
          </v-btn>
        </v-card-title>
        <v-card-text>
          <p v-if="links.length === 0" class="text-body-2 text-medium-emphasis">
            Nenhum link salvo.
          </p>
          <v-list v-else density="compact">
            <v-list-item v-for="l in links" :key="l.id" :href="l.url" target="_blank">
              <template #prepend>
                <v-icon size="18">mdi-link-variant</v-icon>
              </template>
              <v-list-item-title>{{ l.nomeArquivo }}</v-list-item-title>
              <v-list-item-subtitle>{{ l.url }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Nova tarefa -->
    <v-dialog v-model="showTarefaForm" max-width="400">
      <v-card rounded="xl" :elevation="0" border>
        <v-card-title class="pa-5 pb-2">Nova Tarefa</v-card-title>
        <v-card-text class="pa-5 pt-2">
          <v-text-field v-model="newTarefa.titulo" label="Título *" class="mb-2" autofocus />
          <v-select v-model="newTarefa.prioridade" :items="prioridades" label="Prioridade" class="mb-2" />
          <v-text-field v-model="newTarefa.prazo" label="Prazo" type="date" />
        </v-card-text>
        <v-card-actions class="pa-5 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="showTarefaForm = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="tarefaSaving" :disabled="!newTarefa.titulo" @click="saveTarefa">
            Criar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Novo link -->
    <v-dialog v-model="showLinkForm" max-width="400">
      <v-card rounded="xl" :elevation="0" border>
        <v-card-title class="pa-5 pb-2">Novo Link</v-card-title>
        <v-card-text class="pa-5 pt-2">
          <v-text-field v-model="newLink.nomeArquivo" label="Nome do arquivo *" class="mb-2" autofocus />
          <v-text-field v-model="newLink.url" label="Link *" placeholder="https://drive.google.com/..." />
        </v-card-text>
        <v-card-actions class="pa-5 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="showLinkForm = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="linkSaving" :disabled="!newLink.nomeArquivo || !newLink.url" @click="saveLink">
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { isAfter, addDays, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { tarefaService } from '@/services/tarefaService'
import { processoLinkService } from '@/services/processoLinkService'

const props = defineProps({
  processo: { type: Object, required: true }
})

const emit = defineEmits(['resumo-atualizado'])

const ORDEM_PRIORIDADE = ['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']

// Calculado a partir das tarefas já carregadas neste componente (não da prop
// `processo`, que só reflete o que o backend calculou na última vez que o
// processo foi buscado pelo componente pai) — assim o card fica sempre em dia
// assim que uma tarefa é criada/concluída, sem precisar trocar de tela.
const proximaTarefaPrazoLocal = computed(() => {
  const abertas = tarefas.value.filter(t => !t.concluida && t.prazo)
  if (abertas.length === 0) return null
  return abertas.reduce((min, t) => (t.prazo < min ? t.prazo : min), abertas[0].prazo)
})

const prioridadeMaisUrgenteLocal = computed(() => {
  const abertas = tarefas.value.filter(t => !t.concluida && t.prioridade)
  if (abertas.length === 0) return null
  return abertas.reduce(
    (max, t) => (ORDEM_PRIORIDADE.indexOf(t.prioridade) > ORDEM_PRIORIDADE.indexOf(max) ? t.prioridade : max),
    abertas[0].prioridade
  )
})

watch([proximaTarefaPrazoLocal, prioridadeMaisUrgenteLocal], ([prazo, prioridade]) => {
  emit('resumo-atualizado', { proximaTarefaPrazo: prazo, prioridadeMaisUrgente: prioridade })
})

const prazoColor = computed(() => {
  if (!proximaTarefaPrazoLocal.value) return 'default'
  const prazo = new Date(proximaTarefaPrazoLocal.value)
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

function prioridadeColor(p) {
  return { BAIXA: 'success', MEDIA: 'info', ALTA: 'warning', URGENTE: 'error' }[p] ?? 'default'
}

// Tarefas
const tarefas = ref([])
const showTarefaForm = ref(false)
const tarefaSaving = ref(false)
const prioridades = ['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']
const newTarefa = reactive({ titulo: '', prioridade: 'MEDIA', prazo: '' })

async function loadTarefas() {
  const response = await tarefaService.list(props.processo.id)
  tarefas.value = response.data
}

async function saveTarefa() {
  tarefaSaving.value = true
  try {
    await tarefaService.create(props.processo.id, {
      titulo: newTarefa.titulo,
      prioridade: newTarefa.prioridade,
      prazo: newTarefa.prazo || null
    })
    newTarefa.titulo = ''
    newTarefa.prazo = ''
    newTarefa.prioridade = 'MEDIA'
    showTarefaForm.value = false
    await loadTarefas()
  } finally {
    tarefaSaving.value = false
  }
}

async function toggleTarefa(t) {
  await tarefaService.toggleConcluida(t.id, !t.concluida)
  await loadTarefas()
}

// Links
const links = ref([])
const showLinkForm = ref(false)
const linkSaving = ref(false)
const newLink = reactive({ nomeArquivo: '', url: '' })

async function loadLinks() {
  const response = await processoLinkService.list(props.processo.id)
  links.value = response.data
}

async function saveLink() {
  linkSaving.value = true
  try {
    await processoLinkService.create(props.processo.id, { ...newLink })
    newLink.nomeArquivo = ''
    newLink.url = ''
    showLinkForm.value = false
    await loadLinks()
  } finally {
    linkSaving.value = false
  }
}

onMounted(() => {
  loadTarefas()
  loadLinks()
})

watch(() => props.processo?.id, () => {
  loadTarefas()
  loadLinks()
})
</script>
