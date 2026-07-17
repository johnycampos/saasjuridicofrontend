<template>
  <v-card rounded="xl" :elevation="0" border>
    <v-card-title class="d-flex align-center pa-5 pb-2">
      Mudar de Área
      <v-spacer />
      <v-btn icon variant="text" @click="$emit('close')">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>

    <v-divider />

    <v-card-text class="pa-5">
      <p class="text-body-2 text-medium-emphasis mb-4">
        O processo será movido para a coluna inicial da área escolhida.
      </p>

      <v-select
        v-model="targetGroupId"
        label="Área de destino"
        :items="areaOptions"
        item-title="nome"
        item-value="id"
        variant="outlined"
        :error-messages="error"
        @update:model-value="error = ''"
      />

      <p v-if="areaOptions.length === 0" class="text-caption text-medium-emphasis">
        Não há outra área disponível para mover este processo.
      </p>
    </v-card-text>

    <v-divider />

    <v-card-actions class="pa-5 pt-3">
      <v-spacer />
      <v-btn variant="text" @click="$emit('close')">Cancelar</v-btn>
      <v-btn color="primary" :loading="saving" :disabled="!targetGroupId" @click="confirm">
        Mover
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGroupsStore } from '@/stores/groups'
import { processoService } from '@/services/processoService'

const props = defineProps({
  processo: { type: Object, required: true }
})
const emit = defineEmits(['close', 'moved'])

const groupsStore = useGroupsStore()
const targetGroupId = ref(null)
const saving = ref(false)
const error = ref('')

const areaOptions = computed(() =>
  groupsStore.groups.filter(g => g.id !== props.processo.groupId)
)

async function confirm() {
  if (!targetGroupId.value) return
  saving.value = true
  error.value = ''
  try {
    const response = await processoService.moveToArea(props.processo.id, targetGroupId.value)
    emit('moved', response.data)
  } catch (err) {
    error.value = err.response?.data?.detail || 'Não foi possível mover o processo.'
  } finally {
    saving.value = false
  }
}
</script>
