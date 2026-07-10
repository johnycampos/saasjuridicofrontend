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
          <v-col cols="12" md="6">
            <v-text-field v-model="form.numeroProcesso" label="Número do Processo" />
          </v-col>
          <v-col cols="12" md="6">
            <v-autocomplete
              v-model="form.clienteId"
              v-model:search="clienteSearch"
              :items="clienteOptions"
              item-title="nome"
              item-value="id"
              label="Cliente *"
              :loading="clienteLoading"
              :rules="[v => !!v || 'Cliente é obrigatório']"
              no-filter
              clearable
              required
            >
              <template #append>
                <v-btn icon="mdi-plus" size="small" variant="text" title="Novo cliente" @click="showClienteDialog = true" />
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.tipoAcao" label="Tipo de Ação" />
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="form.tribunal"
              :items="tribunalOptions"
              item-title="sigla"
              item-value="sigla"
              label="Tribunal"
              clearable
            >
              <template #append>
                <v-btn icon="mdi-plus" size="small" variant="text" title="Nova opção de tribunal" @click="showTribunalDialog = true" />
              </template>
            </v-select>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.comarca" label="Comarca" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.vara" label="Vara" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.reu" label="Réu" />
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="form.prioridade"
              label="Prioridade"
              :items="prioridades"
            />
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

    <!-- Quick-create Cliente -->
    <v-dialog v-model="showClienteDialog" max-width="400">
      <v-card rounded="xl" :elevation="0" border>
        <v-card-title class="pa-5 pb-2">Novo Cliente</v-card-title>
        <v-card-text class="pa-5 pt-2">
          <v-text-field v-model="newCliente.nome" label="Nome *" autofocus />
        </v-card-text>
        <v-card-actions class="pa-5 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="showClienteDialog = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="clienteSaving" :disabled="!newCliente.nome" @click="saveNewCliente">
            Criar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Quick-create Tribunal -->
    <v-dialog v-model="showTribunalDialog" max-width="400">
      <v-card rounded="xl" :elevation="0" border>
        <v-card-title class="pa-5 pb-2">Nova Opção de Tribunal</v-card-title>
        <v-card-text class="pa-5 pt-2">
          <v-text-field v-model="newTribunal.sigla" label="Sigla *" class="mb-2" autofocus />
          <v-text-field v-model="newTribunal.nome" label="Nome" />
        </v-card-text>
        <v-card-actions class="pa-5 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="showTribunalDialog = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="tribunalSaving" :disabled="!newTribunal.sigla" @click="saveNewTribunal">
            Criar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useProcessosStore } from '@/stores/processos'
import { clienteService } from '@/services/clienteService'
import { tribunalService } from '@/services/tribunalService'

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
  clienteId: props.processo?.clienteId ?? null,
  numeroProcesso: props.processo?.numeroProcesso ?? '',
  tipoAcao: props.processo?.tipoAcao ?? '',
  tribunal: props.processo?.tribunal ?? '',
  vara: props.processo?.vara ?? '',
  comarca: props.processo?.comarca ?? '',
  reu: props.processo?.reu ?? '',
  descricao: props.processo?.descricao ?? '',
  prioridade: props.processo?.prioridade ?? 'MEDIA',
  groupId: props.groupId,
  columnId: props.initialColumnId
})

// Cliente autocomplete (busca server-side)
const clienteOptions = ref(
  props.processo?.clienteId
    ? [{ id: props.processo.clienteId, nome: props.processo.clienteNome }]
    : []
)
const clienteSearch = ref('')
const clienteLoading = ref(false)
let clienteSearchTimeout = null

watch(clienteSearch, (q) => {
  clearTimeout(clienteSearchTimeout)
  if (!q) return
  clienteSearchTimeout = setTimeout(async () => {
    clienteLoading.value = true
    try {
      const response = await clienteService.list({ q })
      clienteOptions.value = response.data.content ?? response.data
    } finally {
      clienteLoading.value = false
    }
  }, 300)
})

const showClienteDialog = ref(false)
const clienteSaving = ref(false)
const newCliente = reactive({ nome: '' })

async function saveNewCliente() {
  clienteSaving.value = true
  try {
    const response = await clienteService.create({ nome: newCliente.nome })
    clienteOptions.value = [response.data, ...clienteOptions.value]
    form.clienteId = response.data.id
    newCliente.nome = ''
    showClienteDialog.value = false
  } finally {
    clienteSaving.value = false
  }
}

// Tribunal select
const tribunalOptions = ref([])
const showTribunalDialog = ref(false)
const tribunalSaving = ref(false)
const newTribunal = reactive({ sigla: '', nome: '' })

onMounted(async () => {
  const response = await tribunalService.list()
  tribunalOptions.value = response.data
})

async function saveNewTribunal() {
  tribunalSaving.value = true
  try {
    const response = await tribunalService.create({ sigla: newTribunal.sigla, nome: newTribunal.nome })
    tribunalOptions.value = [...tribunalOptions.value, response.data]
    form.tribunal = response.data.sigla
    newTribunal.sigla = ''
    newTribunal.nome = ''
    showTribunalDialog.value = false
  } finally {
    tribunalSaving.value = false
  }
}

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
