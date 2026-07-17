<template>
  <v-container class="py-6" max-width="900">
    <div class="d-flex align-center justify-space-between mb-6">
      <h1 class="text-h5 font-weight-bold">Clientes</h1>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
        Novo Cliente
      </v-btn>
    </div>

    <v-text-field
      v-model="search"
      label="Buscar por nome"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      density="comfortable"
      clearable
      class="mb-4"
    />

    <v-card border rounded="xl">
      <v-list lines="two">
        <v-list-item
          v-for="cliente in clientes"
          :key="cliente.id"
          :title="cliente.nome"
          :subtitle="[cliente.telefone, cliente.email].filter(Boolean).join(' · ') || 'Sem contato cadastrado'"
          @click="openEditDialog(cliente)"
        >
          <template #append>
            <v-icon color="grey">mdi-chevron-right</v-icon>
          </template>
        </v-list-item>

        <v-list-item v-if="clientes.length === 0 && !loading">
          <v-list-item-title class="text-medium-emphasis text-center py-4">
            {{ search ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado ainda' }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>

    <!-- Dialog: Criar/Editar Cliente -->
    <v-dialog v-model="dialog" max-width="520">
      <v-card rounded="xl">
        <v-card-title class="pa-6 pb-2">{{ editing ? 'Editar Cliente' : 'Novo Cliente' }}</v-card-title>
        <v-card-text class="pa-6 pt-2">
          <v-form ref="formRef" v-model="valid">
            <v-text-field
              v-model="form.nome"
              label="Nome *"
              variant="outlined"
              class="mb-2"
              :rules="[v => !!v || 'Nome é obrigatório']"
              autofocus
            />
            <v-text-field v-model="form.cpfCnpj" label="CPF/CNPJ" variant="outlined" class="mb-2" />
            <v-text-field
              v-model="form.telefone"
              label="Telefone"
              variant="outlined"
              class="mb-2"
              hint="DDD + número, ex: 21965702348 (usado no botão de WhatsApp)"
              persistent-hint
            />
            <v-text-field v-model="form.email" label="E-mail" variant="outlined" class="mb-2 mt-2" />
            <v-text-field
              v-model="form.dataNascimento"
              label="Data de Aniversário"
              type="date"
              variant="outlined"
              class="mb-2"
            />
            <v-textarea v-model="form.endereco" label="Endereço" variant="outlined" rows="2" class="mb-2" />
            <v-textarea v-model="form.observacoes" label="Observações" variant="outlined" rows="2" />
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="saving" :disabled="!form.nome" @click="save">
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { clienteService } from '@/services/clienteService'

const clientes = ref([])
const loading = ref(false)
const search = ref('')
let searchTimeout = null

const dialog = ref(false)
const editing = ref(null)
const saving = ref(false)
const formRef = ref(null)
const valid = ref(false)
const form = reactive({ nome: '', cpfCnpj: '', telefone: '', email: '', dataNascimento: '', endereco: '', observacoes: '' })

async function loadClientes() {
  loading.value = true
  try {
    const response = await clienteService.list({ q: search.value || undefined, size: 100 })
    clientes.value = response.data.content ?? response.data
  } finally {
    loading.value = false
  }
}

watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(loadClientes, 300)
})

function resetForm() {
  form.nome = ''
  form.cpfCnpj = ''
  form.telefone = ''
  form.email = ''
  form.dataNascimento = ''
  form.endereco = ''
  form.observacoes = ''
}

function openCreateDialog() {
  editing.value = null
  resetForm()
  dialog.value = true
}

function openEditDialog(cliente) {
  editing.value = cliente
  form.nome = cliente.nome ?? ''
  form.cpfCnpj = cliente.cpfCnpj ?? ''
  form.telefone = cliente.telefone ?? ''
  form.email = cliente.email ?? ''
  form.dataNascimento = cliente.dataNascimento ?? ''
  form.endereco = cliente.endereco ?? ''
  form.observacoes = cliente.observacoes ?? ''
  dialog.value = true
}

async function save() {
  const { valid: isValid } = await formRef.value.validate()
  if (!isValid) return

  saving.value = true
  try {
    const payload = { ...form, dataNascimento: form.dataNascimento || null }
    if (editing.value) {
      const response = await clienteService.update(editing.value.id, payload)
      const idx = clientes.value.findIndex(c => c.id === editing.value.id)
      if (idx !== -1) clientes.value[idx] = response.data
    } else {
      const response = await clienteService.create(payload)
      clientes.value.unshift(response.data)
    }
    dialog.value = false
  } finally {
    saving.value = false
  }
}

onMounted(loadClientes)
</script>
