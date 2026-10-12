<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="480" :persistent="saving">
    <v-card rounded="xl">
      <v-card-title class="pa-5">{{ archived ? 'Desarquivar processo' : 'Arquivar processo' }}</v-card-title>
      <v-card-text>
        <p>{{ archived ? 'O processo voltará ao quadro, à agenda e às listagens da área.' : 'O processo sairá do quadro, da agenda e das listagens. Você pode desarquivá-lo em Arquivados.' }}</p>
        <v-alert v-if="error" type="error" variant="tonal" class="mt-3">{{ error }}</v-alert>
      </v-card-text>
      <v-card-actions class="pa-5">
        <v-spacer />
        <v-btn :disabled="saving" @click="$emit('update:modelValue', false)">Cancelar</v-btn>
        <v-btn color="primary" :loading="saving" @click="save">{{ archived ? 'Desarquivar' : 'Arquivar' }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { processoService } from '@/services/processoService'
import { useGroupsStore } from '@/stores/groups'
import { useNotificationsStore } from '@/stores/notifications'

const props = defineProps({ modelValue: Boolean, processo: Object })
const emit = defineEmits(['update:modelValue', 'changed'])
const groups = useGroupsStore()
const notifications = useNotificationsStore()
const archived = computed(() => props.processo?.status === 'ARQUIVADO')
const saving = ref(false)
const error = ref('')
watch(() => props.modelValue, () => { error.value = '' })

async function save() {
  if (!props.processo || saving.value) return
  saving.value = true
  error.value = ''
  try {
    const { data } = await (archived.value ? processoService.unarchive(props.processo.id) : processoService.archive(props.processo.id))
    await Promise.allSettled([groups.fetchGroups(), notifications.loadAlertas()])
    emit('update:modelValue', false)
    emit('changed', data)
  } catch (err) {
    error.value = err.response?.data?.message || 'Não foi possível atualizar o processo.'
  } finally { saving.value = false }
}
</script>
