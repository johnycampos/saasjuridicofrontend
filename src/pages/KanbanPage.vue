<template>
  <div class="kanban-page fill-height d-flex flex-column">
    <div class="d-flex align-center pa-4 border-b">
      <h2 class="text-h6">{{ currentGroup?.nome ?? 'Board' }}</h2>
      <v-spacer />
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openProcessoForm(null)">
        Novo Processo
      </v-btn>
    </div>

    <div v-if="loading" class="d-flex justify-center align-center flex-grow-1">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div v-else class="kanban-board pa-4 flex-grow-1">
      <draggable
        v-model="kanbanStore.columns"
        group="columns"
        item-key="id"
        handle=".column-handle"
        class="d-flex ga-4 h-100"
        @end="onColumnReorder"
      >
        <template #item="{ element: column }">
          <KanbanColumn
            :column="column"
            @add-processo="openProcessoForm(column.id)"
            @card-click="openProcesso"
            @card-moved="onCardMoved"
            @edit-column="editColumn(column)"
            @delete-column="deleteColumn(column.id)"
          />
        </template>
      </draggable>

      <v-btn
        variant="outlined"
        prepend-icon="mdi-plus"
        style="min-width: 280px; align-self: flex-start"
        class="ml-4"
        @click="showColumnDialog = true"
      >
        Adicionar Coluna
      </v-btn>
    </div>

    <v-dialog v-model="showColumnDialog" max-width="400">
      <v-card>
        <v-card-title>{{ editingColumn ? 'Editar Coluna' : 'Nova Coluna' }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="columnForm.nome" label="Nome da Coluna" autofocus />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showColumnDialog = false">Cancelar</v-btn>
          <v-btn color="primary" :disabled="!columnForm.nome" @click="saveColumn">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import KanbanColumn from '@/components/kanban/KanbanColumn.vue'
import ProcessoForm from '@/components/processo/ProcessoForm.vue'

const route = useRoute()
const router = useRouter()
const kanbanStore = useKanbanStore()
const groupsStore = useGroupsStore()

const groupId = computed(() => route.params.groupId)
const currentGroup = computed(() => groupsStore.groups.find(g => g.id === groupId.value))
const loading = computed(() => kanbanStore.loading)

const showColumnDialog = ref(false)
const showProcessoForm = ref(false)
const selectedColumnId = ref(null)
const editingColumn = ref(null)
const columnForm = ref({ nome: '', cor: '#6B7280' })

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

async function onCardMoved({ processoId, fromColumnId, toColumnId, newIndex }) {
  await kanbanStore.moveProcesso(processoId, fromColumnId, toColumnId, newIndex)
}

async function onProcessoSaved(processo) {
  kanbanStore.addProcesso(processo)
  showProcessoForm.value = false
}
</script>

<style scoped>
.kanban-board {
  overflow-x: auto;
  align-items: flex-start;
  display: flex;
}
</style>
