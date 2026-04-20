<template>
  <div class="board-page">
    <!-- Board Header -->
    <div class="board-header">
      <div class="board-title-row">
        <div>
          <div class="board-label">Quadro</div>
          <div class="board-title">{{ currentGroup?.nome ?? 'Board' }}</div>
        </div>

        <div style="flex-grow: 1" />

        <div class="board-meta">
          <div class="meta-item">
            <div class="meta-label">Ativos</div>
            <div class="meta-num">{{ totalProcessos }}</div>
          </div>
          <div v-if="atrasados > 0" class="meta-item">
            <div class="meta-label" style="color: var(--red)">Atrasados</div>
            <div class="meta-num" style="color: var(--red)">{{ atrasados }}</div>
          </div>
          <div v-if="urgentes > 0" class="meta-item">
            <div class="meta-label" style="color: var(--amber)">Urgentes</div>
            <div class="meta-num" style="color: var(--amber)">{{ urgentes }}</div>
          </div>
          <div v-if="valorTotal > 0" class="meta-item">
            <div class="meta-label">Valor total</div>
            <div class="meta-num meta-num--mono">{{ formatValor(valorTotal) }}</div>
          </div>

          <div class="meta-sep" />

          <button class="btn-primary" @click="openProcessoForm(null)">
            <app-icon name="plus" :size="14" /> Novo processo
          </button>
        </div>
      </div>

      <div class="filter-bar">
        <button
          v-for="f in filters"
          :key="f.id"
          class="filter-chip"
          :class="{ active: activeFilter === f.id }"
          @click="activeFilter = f.id"
        >
          <span v-if="f.dot" class="filter-dot" :style="{ background: f.dot }" />
          {{ f.label }}
          <span v-if="f.count != null" class="filter-count">{{ f.count }}</span>
        </button>

        <div style="flex-grow: 1" />

        <button class="btn-ghost">
          <app-icon name="filter" :size="13" /> Filtros
        </button>
        <button class="btn-ghost">
          <app-icon name="arrowDown" :size="13" /> Ordenar
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="board-loading">
      <v-progress-circular indeterminate color="primary" size="28" />
    </div>

    <!-- Board -->
    <div v-else class="board-area">
      <draggable
        v-model="kanbanStore.columns"
        group="columns"
        item-key="id"
        handle=".column-handle"
        class="board-inner"
        @end="onColumnReorder"
      >
        <template #item="{ element: column }">
          <KanbanColumn
            :column="column"
            :card-variant="settingsStore.cardStyle"
            @add-processo="openProcessoForm(column.id)"
            @card-click="openProcesso"
            @card-moved="onCardMoved"
            @edit-column="editColumn(column)"
            @delete-column="deleteColumn(column.id)"
          />
        </template>
      </draggable>

      <button class="add-col-btn" @click="showColumnDialog = true">
        <app-icon name="plus" :size="14" /> Adicionar coluna
      </button>
    </div>

    <!-- Column dialog -->
    <v-dialog v-model="showColumnDialog" max-width="400">
      <v-card rounded="xl" :elevation="0" border>
        <v-card-title class="pa-5 pb-2">{{ editingColumn ? 'Editar Coluna' : 'Nova Coluna' }}</v-card-title>
        <v-card-text class="pa-5 pt-2">
          <v-text-field v-model="columnForm.nome" label="Nome da coluna" autofocus />
        </v-card-text>
        <v-card-actions class="pa-5 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="showColumnDialog = false">Cancelar</v-btn>
          <v-btn color="primary" :disabled="!columnForm.nome" @click="saveColumn">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Processo form dialog -->
    <v-dialog v-model="showProcessoForm" max-width="700">
      <ProcessoForm
        :group-id="groupId"
        :initial-column-id="selectedColumnId"
        @saved="onProcessoSaved"
        @close="showProcessoForm = false"
      />
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import draggable from 'vuedraggable'
import { useKanbanStore } from '@/stores/kanban'
import { useGroupsStore } from '@/stores/groups'
import { useSettingsStore } from '@/stores/settings'
import KanbanColumn from '@/components/kanban/KanbanColumn.vue'
import ProcessoForm from '@/components/processo/ProcessoForm.vue'
import AppIcon from '@/components/AppIcon.vue'

const route = useRoute()
const router = useRouter()
const kanbanStore = useKanbanStore()
const groupsStore = useGroupsStore()
const settingsStore = useSettingsStore()

const groupId = computed(() => route.params.groupId)
const currentGroup = computed(() => groupsStore.groups.find(g => g.id === groupId.value))
const loading = computed(() => kanbanStore.loading)

const showColumnDialog = ref(false)
const showProcessoForm = ref(false)
const selectedColumnId = ref(null)
const editingColumn = ref(null)
const columnForm = ref({ nome: '', cor: '#6B7280' })
const activeFilter = ref('todos')

const allProcessos = computed(() => kanbanStore.columns.flatMap(c => c.processos || []))
const totalProcessos = computed(() => allProcessos.value.length)

const atrasados = computed(() => allProcessos.value.filter(p => {
  if (!p.prazoProximo) return false
  return Math.ceil((new Date(p.prazoProximo) - new Date()) / 86400000) < 0
}).length)

const urgentes = computed(() => allProcessos.value.filter(p => p.prioridade === 'URGENTE').length)

const valorTotal = computed(() =>
  allProcessos.value.reduce((s, p) => s + (Number(p.valorCausa) || 0), 0)
)

const filters = computed(() => [
  { id: 'todos',    label: 'Todos',    count: totalProcessos.value },
  { id: 'urgentes', label: 'Urgentes', count: urgentes.value },
  { id: 'atrasados', label: 'Atrasados', dot: 'var(--red)', count: atrasados.value },
  { id: 'semana',   label: 'Prazo ≤ 7d', count: null },
])

function formatValor(n) {
  if (!n || n === 0) return '—'
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (n >= 1_000) return `R$ ${Math.round(n / 1_000)}k`
  return `R$ ${n.toLocaleString('pt-BR')}`
}

onMounted(() => { if (groupId.value) kanbanStore.loadBoard(groupId.value) })
watch(groupId, id => { if (id) kanbanStore.loadBoard(id) })

function openProcesso(processo) {
  router.push({ name: 'processo-detail', params: { id: processo.id } })
}

function openProcessoForm(columnId) {
  selectedColumnId.value = columnId
  showProcessoForm.value = true
}

function editColumn(column) {
  editingColumn.value = column
  columnForm.value = { nome: column.nome, cor: column.cor }
  showColumnDialog.value = true
}

async function saveColumn() {
  if (editingColumn.value) {
    await kanbanStore.updateColumn(editingColumn.value.id, columnForm.value)
  } else {
    await kanbanStore.createColumn(columnForm.value)
  }
  columnForm.value = { nome: '', cor: '#6B7280' }
  editingColumn.value = null
  showColumnDialog.value = false
}

async function deleteColumn(columnId) {
  await kanbanStore.deleteColumn(columnId)
}

async function onColumnReorder() {
  await kanbanStore.reorderColumns(kanbanStore.columns)
}

async function onCardMoved({ processoId, fromColumnId, newIndex }) {
  const toCol = kanbanStore.columns.find(c => c.processos?.some(p => p.id === processoId))
  if (!toCol) return
  const processo = toCol.processos.find(p => p.id === processoId)
  if (processo) processo.columnId = toCol.id
  await kanbanStore.moveProcesso(processoId, fromColumnId, toCol.id, newIndex)
}

async function onProcessoSaved(processo) {
  kanbanStore.addProcesso(processo)
  showProcessoForm.value = false
}
</script>

<style scoped>
.board-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.board-header {
  padding: 14px 20px 10px;
  border-bottom: 1px solid var(--line);
  background: var(--bg);
  flex-shrink: 0;
}

.board-title-row {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 10px;
}

.board-label {
  font-size: 10px;
  color: var(--ink-3);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 2px;
  font-weight: 500;
}

.board-title {
  font-family: 'Fraunces', serif;
  font-size: 24px;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: var(--ink);
}

.board-meta {
  display: flex;
  align-items: center;
  gap: 20px;
}

.meta-item {
  text-align: right;
}

.meta-label {
  font-size: 10px;
  color: var(--ink-3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.meta-num {
  font-family: 'Geist Mono', monospace;
  font-size: 16px;
  font-weight: 500;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}
.meta-num--mono { font-size: 13px; }

.meta-sep {
  width: 1px;
  height: 28px;
  background: var(--line);
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 16px;
  font-size: 12px;
  background: var(--bg-2);
  color: var(--ink-2);
  border: 1px solid var(--line);
  cursor: pointer;
  transition: background 120ms, color 120ms, border-color 120ms;
  font-family: inherit;
}
.filter-chip:hover { border-color: var(--line-2); color: var(--ink); }
.filter-chip.active { background: var(--navy); color: white; border-color: var(--navy); }

.filter-dot {
  width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
}

.filter-count {
  font-family: 'Geist Mono', monospace;
  font-size: 10px;
  opacity: 0.8;
}

.btn-primary {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 12px;
  border-radius: 8px;
  font-size: var(--fs-sm);
  background: var(--navy);
  color: white;
  font-weight: 500;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  font-family: inherit;
  transition: background 120ms;
}
.btn-primary:hover { background: var(--navy-ink); }

.btn-ghost {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 10px;
  border-radius: 8px;
  font-size: var(--fs-sm);
  background: var(--panel);
  color: var(--ink-2);
  border: 1px solid var(--line);
  cursor: pointer;
  font-family: inherit;
  transition: border-color 120ms;
}
.btn-ghost:hover { border-color: var(--line-2); }

.board-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
}

.board-area {
  flex-grow: 1;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 16px 20px 24px;
}

.board-inner {
  display: flex;
  gap: var(--gap-col);
  height: 100%;
  align-items: stretch;
}

.add-col-btn {
  width: 260px;
  flex-shrink: 0;
  border-radius: var(--radius-lg);
  border: 1px dashed var(--line-2);
  background: transparent;
  color: var(--ink-3);
  font-size: var(--fs-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  align-self: stretch;
  font-family: inherit;
  transition: border-color 120ms, color 120ms;
}
.add-col-btn:hover { border-color: var(--navy); color: var(--navy); }
</style>
