<template>
  <v-dialog v-model="internalOpen" max-width="420">
    <v-card rounded="xl" :elevation="0" border>
      <v-card-title class="pa-5 pb-2">Nova Área</v-card-title>
      <v-card-text class="pa-5 pt-2">
        <v-text-field v-model="form.nome" label="Nome da área *" class="mb-2" autofocus />
        <v-text-field v-model="form.descricao" label="Descrição" />
      </v-card-text>
      <v-card-actions class="pa-5 pt-0">
        <v-spacer />
        <v-btn variant="text" @click="close">Cancelar</v-btn>
        <v-btn color="primary" :loading="loading" :disabled="!form.nome" @click="save">Criar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useGroupsStore } from '@/stores/groups'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue', 'created'])

const groupsStore = useGroupsStore()
const internalOpen = ref(props.modelValue)
const loading = ref(false)
const form = ref({ nome: '', descricao: '' })

watch(() => props.modelValue, (value) => {
  internalOpen.value = value
  if (value) form.value = { nome: '', descricao: '' }
})
watch(internalOpen, (value) => emit('update:modelValue', value))

async function save() {
  loading.value = true
  try {
    const group = await groupsStore.createGroup(form.value)
    emit('created', group)
    internalOpen.value = false
  } finally {
    loading.value = false
  }
}

function close() {
  internalOpen.value = false
}
</script>
