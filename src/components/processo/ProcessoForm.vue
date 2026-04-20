<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      {{ processo ? 'Editar Processo' : 'Novo Processo' }}
      <v-spacer />
      <v-btn icon variant="text" @click="$emit('close')">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>

    <v-divider />

    <v-card-text style="max-height: 70vh; overflow-y: auto">
      <v-form ref="formRef" v-model="valid">
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="form.titulo"
              label="Título *"
              :rules="[v => !!v || 'Título é obrigatório']"
              required
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.numeroProcesso" label="Número do Processo" />
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="form.prioridade"
              label="Prioridade"
              :items="prioridades"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.tipoAcao" label="Tipo de Ação" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.tribunal" label="Tribunal" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.vara" label="Vara" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.comarca" label="Comarca" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.autor" label="Autor" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.reu" label="Réu" />
          </v-col>
          <v-col cols="12">
            <v-textarea v-model="form.descricao" label="Descrição" rows="3" />
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>

    <v-divider />

    <v-card-actions>
      <v-spacer />
      <v-btn @click="$emit('close')">Cancelar</v-btn>
      <v-btn color="primary" :loading="loading" :disabled="!valid" @click="save">
        Salvar
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useProcessosStore } from '@/stores/processos'

const props = defineProps({
  processo: { type: Object, default: null },
  groupId: { type: String, default: null },
  initialColumnId: { type: String, default: null }
})

const emit = defineEmits(['saved', 'close'])

const processoStore = useProcessosStore()
const formRef = ref(null)
const valid = ref(false)
const loading = ref(false)

const prioridades = ['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']

const form = reactive({
  titulo: props.processo?.titulo ?? '',
  numeroProcesso: props.processo?.numeroProcesso ?? '',
  tipoAcao: props.processo?.tipoAcao ?? '',
  tribunal: props.processo?.tribunal ?? '',
  vara: props.processo?.vara ?? '',
  comarca: props.processo?.comarca ?? '',
  autor: props.processo?.autor ?? '',
  reu: props.processo?.reu ?? '',
  descricao: props.processo?.descricao ?? '',
  prioridade: props.processo?.prioridade ?? 'MEDIA',
  groupId: props.groupId,
  columnId: props.initialColumnId
})

async function save() {
  const { valid: isValid } = await formRef.value.validate()
  if (!isValid) return

  loading.value = true
  try {
    let saved
    if (props.processo) {
      saved = await processoStore.update(props.processo.id, form)
    } else {
      saved = await processoStore.create(form)
    }
    emit('saved', saved)
  } finally {
    loading.value = false
  }
}
</script>
