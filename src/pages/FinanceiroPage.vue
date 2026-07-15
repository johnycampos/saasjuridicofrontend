<template>
  <v-container class="py-6" max-width="1000">
    <h1 class="text-h5 font-weight-bold mb-6">Financeiro</h1>

    <v-autocomplete
      v-model="selectedClienteId"
      v-model:search="clienteSearch"
      :items="clienteOptions"
      item-title="nome"
      item-value="id"
      label="Buscar cliente pelo nome"
      prepend-inner-icon="mdi-magnify"
      :loading="clienteLoading"
      no-filter
      clearable
      variant="outlined"
      class="mb-4"
      @update:model-value="onClienteSelected"
    />

    <v-card v-if="!selectedClienteId" border rounded="xl">
      <v-card-title class="pa-5 pb-2">Clientes</v-card-title>
      <v-list>
        <v-list-item
          v-for="c in listaClientes"
          :key="c.id"
          :title="c.nome"
          :subtitle="c.email || c.telefone || ''"
          @click="selectCliente(c)"
        />
        <v-list-item v-if="listaClientes.length === 0 && !listaLoading">
          <v-list-item-title class="text-medium-emphasis text-center py-4">
            Nenhum cliente cadastrado ainda.
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>

    <v-card v-else border rounded="xl">
      <v-card-title class="d-flex align-center pa-5 pb-2">
        Processos de {{ selectedClienteNome }}
        <v-spacer />
        <v-btn variant="text" size="small" @click="selectedClienteId = null">Trocar cliente</v-btn>
      </v-card-title>
      <v-card-text class="pt-0">
        <p v-if="processosLoading" class="text-body-2 text-medium-emphasis">Carregando...</p>
        <p v-else-if="processos.length === 0" class="text-body-2 text-medium-emphasis">
          Este cliente não tem processos cadastrados.
        </p>
        <v-table v-else>
          <thead>
            <tr>
              <th>Nº do Processo</th>
              <th>Tipo de Ação</th>
              <th>Valor do Contrato</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in processos"
              :key="p.processoId"
              class="cursor-pointer"
              @click="openContrato(p)"
            >
              <td>{{ p.numeroProcesso || '—' }}</td>
              <td>{{ p.tipoAcao || '—' }}</td>
              <td>{{ p.valorTotal ? formatCurrency(p.valorTotal) : '—' }}</td>
              <td>
                <v-chip size="small" :color="statusColor(p.status)" variant="tonal">
                  {{ statusLabel(p.status) }}
                  <template v-if="p.status !== 'SEM_CONTRATO'"> ({{ p.parcelasPagas }}/{{ p.parcelasTotal }})</template>
                </v-chip>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <!-- Dialog do contrato -->
    <v-dialog v-model="showContratoDialog" max-width="600">
      <v-card rounded="xl" :elevation="0" border>
        <v-card-title class="d-flex align-center pa-5 pb-2">
          Contrato — {{ selectedProcesso?.numeroProcesso || 'Processo' }}
          <v-spacer />
          <v-btn icon variant="text" @click="showContratoDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-5 pt-2">
          <v-row>
            <v-col cols="12" md="8">
              <v-text-field
                v-model.number="contratoForm.valorTotal"
                label="Valor total do contrato *"
                type="number"
                prefix="R$"
              />
            </v-col>
            <v-col cols="12" md="4" class="d-flex align-center">
              <v-btn color="primary" block :loading="contratoSaving" :disabled="!contratoForm.valorTotal" @click="saveContrato">
                {{ contrato ? 'Salvar' : 'Criar contrato' }}
              </v-btn>
            </v-col>
            <v-col v-if="contrato" cols="12">
              <p class="text-caption text-medium-emphasis mb-0">Saldo restante</p>
              <p class="text-h6 font-weight-medium">{{ formatCurrency(contrato.saldoRestante) }}</p>
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="contratoForm.observacoes" label="Observações" rows="2" />
            </v-col>
          </v-row>

          <template v-if="contrato">
            <v-divider class="my-4" />
            <div class="d-flex align-center mb-2">
              <span class="text-subtitle-2">Parcelas</span>
              <v-spacer />
              <v-btn size="small" variant="text" prepend-icon="mdi-plus" @click="showParcelaForm = true">
                Nova parcela
              </v-btn>
            </div>

            <p v-if="contrato.parcelas.length === 0" class="text-body-2 text-medium-emphasis">
              Nenhuma parcela cadastrada — o valor pode ser cobrado em uma vez só.
            </p>
            <v-list v-else density="compact">
              <v-list-item v-for="parcela in contrato.parcelas" :key="parcela.id">
                <v-list-item-title>
                  Parcela {{ parcela.numero }} — {{ formatCurrency(parcela.valor) }}
                  <span v-if="parcela.vencimento" class="text-medium-emphasis">
                    · vence em {{ formatDate(parcela.vencimento) }}
                  </span>
                </v-list-item-title>
                <v-list-item-subtitle>
                  <span v-if="parcela.status === 'PAGO'" class="text-success">
                    Paga em {{ formatDateTime(parcela.dataPagamento) }}
                  </span>
                  <span v-else class="text-medium-emphasis">Pendente</span>
                </v-list-item-subtitle>
                <template #append>
                  <v-btn
                    v-if="parcela.status !== 'PAGO'"
                    size="small"
                    variant="tonal"
                    color="success"
                    @click="marcarPaga(parcela)"
                  >
                    Marcar como paga
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
          </template>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Nova parcela -->
    <v-dialog v-model="showParcelaForm" max-width="400">
      <v-card rounded="xl" :elevation="0" border>
        <v-card-title class="pa-5 pb-2">Nova Parcela</v-card-title>
        <v-card-text class="pa-5 pt-2">
          <v-text-field v-model.number="newParcela.valor" label="Valor *" type="number" prefix="R$" class="mb-2" autofocus />
          <v-text-field v-model="newParcela.vencimento" label="Vencimento" type="date" />
        </v-card-text>
        <v-card-actions class="pa-5 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="showParcelaForm = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="parcelaSaving" :disabled="!newParcela.valor" @click="saveParcela">
            Adicionar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { clienteService } from '@/services/clienteService'
import { contratoService } from '@/services/contratoService'
import { parcelaService } from '@/services/parcelaService'

const listaClientes = ref([])
const listaLoading = ref(false)

const clienteOptions = ref([])
const clienteSearch = ref('')
const clienteLoading = ref(false)
const selectedClienteId = ref(null)
const selectedClienteNome = ref('')
let clienteSearchTimeout = null

const processos = ref([])
const processosLoading = ref(false)

const showContratoDialog = ref(false)
const selectedProcesso = ref(null)
const contrato = ref(null)
const contratoForm = reactive({ valorTotal: null, observacoes: '' })
const contratoSaving = ref(false)

const showParcelaForm = ref(false)
const newParcela = reactive({ valor: null, vencimento: '' })
const parcelaSaving = ref(false)

async function loadClientes() {
  listaLoading.value = true
  try {
    const response = await clienteService.list()
    listaClientes.value = response.data.content ?? response.data
  } finally {
    listaLoading.value = false
  }
}

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

function selectCliente(c) {
  selectedClienteId.value = c.id
  selectedClienteNome.value = c.nome
  loadProcessos()
}

function onClienteSelected(id) {
  if (!id) return
  const found = clienteOptions.value.find(c => c.id === id) || listaClientes.value.find(c => c.id === id)
  selectedClienteNome.value = found?.nome || ''
  loadProcessos()
}

async function loadProcessos() {
  if (!selectedClienteId.value) return
  processosLoading.value = true
  try {
    const response = await clienteService.processosFinanceiro(selectedClienteId.value)
    processos.value = response.data
  } finally {
    processosLoading.value = false
  }
}

async function openContrato(processo) {
  selectedProcesso.value = processo
  contrato.value = null
  contratoForm.valorTotal = null
  contratoForm.observacoes = ''
  try {
    const response = await contratoService.getByProcesso(processo.processoId)
    contrato.value = response.data
    contratoForm.valorTotal = response.data.valorTotal
    contratoForm.observacoes = response.data.observacoes || ''
  } catch (err) {
    if (err.response?.status !== 404) throw err
    // sem contrato ainda — formulário fica vazio pra criar um novo
  }
  showContratoDialog.value = true
}

async function saveContrato() {
  contratoSaving.value = true
  try {
    const response = await contratoService.upsert(selectedProcesso.value.processoId, {
      valorTotal: contratoForm.valorTotal,
      observacoes: contratoForm.observacoes
    })
    contrato.value = response.data
    await loadProcessos()
  } finally {
    contratoSaving.value = false
  }
}

async function saveParcela() {
  parcelaSaving.value = true
  try {
    await parcelaService.create(contrato.value.id, {
      valor: newParcela.valor,
      vencimento: newParcela.vencimento || null
    })
    newParcela.valor = null
    newParcela.vencimento = ''
    showParcelaForm.value = false
    const response = await contratoService.getByProcesso(selectedProcesso.value.processoId)
    contrato.value = response.data
    await loadProcessos()
  } finally {
    parcelaSaving.value = false
  }
}

async function marcarPaga(parcela) {
  await parcelaService.marcarPaga(parcela.id)
  const response = await contratoService.getByProcesso(selectedProcesso.value.processoId)
  contrato.value = response.data
  await loadProcessos()
}

function statusLabel(status) {
  return { SEM_CONTRATO: 'Sem contrato', PENDENTE: 'Pendente', PAGO: 'Pago' }[status] ?? status
}

function statusColor(status) {
  return { SEM_CONTRATO: 'default', PENDENTE: 'warning', PAGO: 'success' }[status] ?? 'default'
}

function formatCurrency(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function formatDate(d) {
  return format(new Date(d), 'dd/MM/yyyy', { locale: ptBR })
}

function formatDateTime(d) {
  return format(new Date(d), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

onMounted(loadClientes)
</script>
