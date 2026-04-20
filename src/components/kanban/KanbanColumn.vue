<template>
  <div style="min-width: 280px; max-width: 280px;">
    <v-card border rounded="lg" class="d-flex flex-column" style="max-height: calc(100vh - 180px)">
      <v-card-title class="d-flex align-center py-2 px-3">
        <v-icon class="column-handle mr-1" style="cursor: grab" size="18">mdi-drag</v-icon>
        <span
          class="mr-2"
          :style="{ background: column.cor, width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block', flexShrink: 0 }"
        />
        <span class="text-subtitle-2 text-truncate">{{ column.nome }}</span>
        <v-chip size="x-small" class="ml-2">{{ column.processos?.length ?? 0 }}</v-chip>
        <v-spacer />
        <v-menu>
          <template #activator="{ props }">
            <v-btn icon size="x-small" variant="text" v-bind="props">
              <v-icon size="16">mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list density="compact">
            <v-list-item title="Editar" prepend-icon="mdi-pencil" @click="$emit('edit-column', column)" />
            <v-list-item title="Excluir" prepend-icon="mdi-delete" color="error" @click="$emit('delete-column', column.id)" />
          </v-list>
        </v-menu>
      </v-card-title>

      <v-divider />

      <div class="overflow-y-auto flex-grow-1">
        <draggable
          v-model="column.processos"
          group="processos"
          item-key="id"
          class="pa-2 d-flex flex-column ga-2"
          style="min-height: 60px"
          @add="onCardAdded"
        >
          <template #item="{ element: processo }">
            <KanbanCard :processo="processo" @click="$emit('card-click', processo)" />
          </template>
        </draggable>
      </div>

      <v-divider />
      <v-card-actions class="pa-2">
        <v-btn block variant="text" size="small" prepend-icon="mdi-plus" @click="$emit('add-processo', column.id)">
          Adicionar
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup>
import draggable from 'vuedraggable'
import KanbanCard from './KanbanCard.vue'

const props = defineProps({
  column: { type: Object, required: true }
})

const emit = defineEmits(['card-click', 'card-moved', 'add-processo', 'edit-column', 'delete-column'])

// @add dispara na coluna DESTINO quando um card chega de outra coluna
function onCardAdded(event) {
  const processoEl = event.item.__draggable_context?.element
  if (processoEl) {
    emit('card-moved', {
      processoId: processoEl.id,
      fromColumnId: processoEl.columnId,  // ainda tem o ID antigo
      toColumnId: props.column.id,        // coluna destino (correta)
      newIndex: event.newIndex
    })
  }
}
</script>
