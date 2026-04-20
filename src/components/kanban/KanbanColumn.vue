<template>
  <div class="col">
    <!-- Color strip -->
    <div class="col-strip" :style="{ background: column.cor || 'var(--navy)' }" />

    <!-- Header -->
    <div class="col-header">
      <div class="col-header-row">
        <app-icon name="grip" :size="14" class="col-drag-handle column-handle" />
        <span class="col-name">{{ column.nome }}</span>
        <span class="col-count" :class="{ 'col-count--over': isWipOver }">
          {{ cardCount }}{{ column.wip ? `/${column.wip}` : '' }}
        </span>
        <div style="flex-grow: 1" />
        <button class="col-icon-btn" @click="$emit('add-processo', column.id)" title="Novo processo">
          <app-icon name="plus" :size="14" />
        </button>
        <v-menu location="bottom end">
          <template #activator="{ props }">
            <button class="col-icon-btn" v-bind="props">
              <app-icon name="moreV" :size="14" />
            </button>
          </template>
          <v-list density="compact" :elevation="2" rounded="lg" min-width="140">
            <v-list-item density="compact" @click="$emit('edit-column', column)">
              <template #prepend><app-icon name="check" :size="14" style="margin-right: 8px" /></template>
              Editar
            </v-list-item>
            <v-list-item density="compact" class="text-error" @click="$emit('delete-column', column.id)">
              <template #prepend><app-icon name="warn" :size="14" style="margin-right: 8px" /></template>
              Excluir
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <!-- Sub-line: description + valor sum -->
      <div v-if="column.descricao || sumValor > 0" class="col-sub">
        <span v-if="column.descricao">{{ column.descricao }}</span>
        <span v-if="column.descricao && sumValor > 0"> · </span>
        <span v-if="sumValor > 0" class="col-valor">{{ formatValor(sumValor) }}</span>
      </div>

      <!-- WIP progress bar -->
      <div v-if="column.wip" class="col-wip-bar">
        <div
          class="col-wip-fill"
          :style="{
            width: `${Math.min(100, (cardCount / column.wip) * 100)}%`,
            background: isWipOver ? 'var(--red)' : (column.cor || 'var(--navy)'),
          }"
        />
      </div>
    </div>

    <!-- Cards -->
    <div class="col-body">
      <draggable
        v-model="column.processos"
        group="processos"
        item-key="id"
        class="col-drop"
        @add="onCardAdded"
      >
        <template #item="{ element: processo }">
          <KanbanCard
            :processo="processo"
            :variant="cardVariant"
            @click="$emit('card-click', processo)"
          />
        </template>
      </draggable>

      <button class="col-add-btn" @click="$emit('add-processo', column.id)">
        <app-icon name="plus" :size="13" /> Novo processo
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import draggable from 'vuedraggable'
import KanbanCard from './KanbanCard.vue'
import AppIcon from '@/components/AppIcon.vue'

const props = defineProps({
  column: { type: Object, required: true },
  cardVariant: { type: String, default: 'standard' }
})

const emit = defineEmits(['card-click', 'card-moved', 'add-processo', 'edit-column', 'delete-column'])

const cardCount = computed(() => props.column.processos?.length ?? 0)
const isWipOver = computed(() => props.column.wip && cardCount.value > props.column.wip)

const sumValor = computed(() =>
  props.column.processos?.reduce((s, p) => s + (Number(p.valorCausa) || 0), 0) || 0
)

function formatValor(n) {
  if (!n) return ''
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (n >= 1_000) return `R$ ${Math.round(n / 1_000)}k`
  return `R$ ${n.toLocaleString('pt-BR')}`
}

function onCardAdded(event) {
  const processoEl = event.item.__draggable_context?.element
  if (processoEl) {
    emit('card-moved', {
      processoId: processoEl.id,
      fromColumnId: processoEl.columnId,
      toColumnId: props.column.id,
      newIndex: event.newIndex
    })
  }
}
</script>

<script>
export default { inheritAttrs: false }
</script>

<style scoped>
.col {
  width: 308px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-2);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  overflow: hidden;
  position: relative;
}

.col-strip {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  z-index: 1;
}

.col-header {
  padding: 14px 14px 10px;
  padding-top: 17px;
  border-bottom: 1px solid var(--line);
  background: var(--panel);
}

.col-header-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.col-drag-handle {
  color: var(--ink-4);
  cursor: grab;
  flex-shrink: 0;
}
.col-drag-handle:active { cursor: grabbing; }

.col-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-feature-settings: "ss01";
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.col-count {
  font-family: 'Geist Mono', monospace;
  font-size: 11px;
  font-weight: 500;
  padding: 1px 7px;
  border-radius: 10px;
  background: var(--bg-3);
  color: var(--ink-2);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
  transition: background 120ms, color 120ms;
}
.col-count--over {
  background: var(--red-bg);
  color: var(--red);
}

.col-sub {
  font-size: 11px;
  color: var(--ink-3);
  margin-top: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.col-valor {
  font-family: 'Geist Mono', monospace;
  color: var(--ink-2);
  font-variant-numeric: tabular-nums;
}

.col-wip-bar {
  margin-top: 8px;
  height: 3px;
  background: var(--bg-3);
  border-radius: 2px;
  overflow: hidden;
}
.col-wip-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 200ms;
}

.col-icon-btn {
  width: 26px; height: 26px;
  display: grid; place-items: center;
  border-radius: 6px;
  color: var(--ink-3);
  transition: background 120ms, color 120ms;
  flex-shrink: 0;
}
.col-icon-btn:hover { background: var(--bg-3); color: var(--ink); }

.col-body {
  flex-grow: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.col-drop {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 40px;
}

.col-add-btn {
  padding: 10px;
  border-radius: var(--radius);
  border: 1px dashed var(--line-2);
  color: var(--ink-3);
  font-size: var(--fs-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: border-color 120ms, color 120ms;
  font-family: inherit;
}
.col-add-btn:hover { border-color: var(--navy); color: var(--navy); }
</style>
