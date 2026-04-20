<template>
  <v-card
    border
    rounded="lg"
    style="cursor: pointer"
    @click="$emit('click', processo)"
  >
    <v-card-text class="pa-3">
      <div class="d-flex justify-space-between align-start mb-1">
        <v-chip :color="prioridadeColor" size="x-small" variant="tonal">
          {{ processo.prioridade }}
        </v-chip>
        <v-icon v-if="processo.prazoProximo" size="14" :color="prazoColor">mdi-clock-outline</v-icon>
      </div>

      <p class="text-body-2 font-weight-medium mb-1" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">
        {{ processo.titulo }}
      </p>

      <p v-if="processo.numeroProcesso" class="text-caption text-medium-emphasis">
        {{ processo.numeroProcesso }}
      </p>

      <p v-if="processo.autor || processo.reu" class="mt-1 text-caption text-medium-emphasis">
        <span v-if="processo.autor">{{ processo.autor }}</span>
        <span v-if="processo.autor && processo.reu"> × </span>
        <span v-if="processo.reu">{{ processo.reu }}</span>
      </p>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { isAfter, addDays } from 'date-fns'

const props = defineProps({
  processo: { type: Object, required: true }
})

defineEmits(['click'])

const prioridadeColor = computed(() => ({
  BAIXA: 'success', MEDIA: 'info', ALTA: 'warning', URGENTE: 'error'
}[props.processo.prioridade] ?? 'default'))

const prazoColor = computed(() => {
  if (!props.processo.prazoProximo) return 'default'
  const prazo = new Date(props.processo.prazoProximo)
  if (isAfter(new Date(), prazo)) return 'error'
  if (isAfter(addDays(new Date(), 3), prazo)) return 'warning'
  return 'success'
})
</script>
