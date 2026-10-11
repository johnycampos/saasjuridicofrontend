<template>
  <section class="oauth-card">
    <!-- Estado de carregamento -->
    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" size="48" class="mb-4" />
      <p class="text-medium-emphasis">Carregando solicitação de autorização…</p>
    </div>

    <!-- Erro / Solicitação expirada -->
    <div v-else-if="error" class="text-center py-4">
      <v-icon icon="mdi-alert-circle-outline" color="error" size="48" class="mb-3" />
      <h2 class="text-h6 font-weight-bold mb-2">Solicitação Inválida</h2>
      <p class="text-medium-emphasis mb-6">{{ error }}</p>
      <v-btn color="primary" variant="tonal" to="/dashboard">Ir para o Dashboard</v-btn>
    </div>

    <!-- Tela de Consentimento -->
    <div v-else-if="details" class="consent-form">
      <div class="header-section text-center mb-6">
        <v-avatar color="primary" size="56" class="mb-3">
          <v-icon icon="mdi-robot-outline" size="32" color="white" />
        </v-avatar>
        <h2 class="text-h6 font-weight-bold mb-1">
          <span class="client-name">{{ details.clientName }}</span>
        </h2>
        <p class="text-body-2 text-medium-emphasis">quer acessar sua conta JurisFlow</p>
      </div>

      <!-- Alerta de Segurança do Domínio -->
      <v-alert
        variant="tonal"
        color="warning"
        density="comfortable"
        icon="mdi-shield-alert-outline"
        class="mb-6 rounded-lg text-body-2"
      >
        <div class="font-weight-medium">Domínio de redirecionamento:</div>
        <code class="redirect-host">{{ details.redirectHost }}</code>
        <div class="text-caption mt-1">Só autorize se você reconhece e confia neste aplicativo e domínio.</div>
      </v-alert>

      <!-- Seleção de Escritório (Tenant) -->
      <div class="mb-5">
        <label class="d-block text-caption font-weight-bold text-uppercase mb-2 text-medium-emphasis">
          Selecione o Escritório
        </label>
        <v-select
          v-model="selectedTenantId"
          :items="details.tenants"
          item-title="nome"
          item-value="id"
          variant="outlined"
          density="comfortable"
          :rules="[v => !!v || 'Selecione um escritório']"
          hide-details="auto"
          class="tenant-select"
        >
          <template #item="{ props, item }">
            <v-list-item v-bind="props" :subtitle="`Papel: ${item.raw.role}`" />
          </template>
        </v-select>
      </div>

      <!-- Permissões solicitadas -->
      <div class="permissions-card mb-6 pa-4 rounded-lg">
        <div class="text-caption font-weight-bold text-uppercase mb-3 text-medium-emphasis">
          Este aplicativo poderá:
        </div>
        <ul class="permissions-list">
          <li>
            <v-icon icon="mdi-check-circle" color="success" size="18" class="mr-2" />
            <span>Consultar processos, tarefas, audiências e financeiro das áreas às quais você tem acesso</span>
          </li>
          <li>
            <v-icon icon="mdi-check-circle" color="success" size="18" class="mr-2" />
            <span>Criar, editar e excluir registros conforme suas permissões e papel no escritório</span>
          </li>
          <li>
            <v-icon icon="mdi-check-circle" color="success" size="18" class="mr-2" />
            <span>Acessar as ferramentas MCP do escritório selecionado</span>
          </li>
        </ul>
      </div>

      <v-alert v-if="actionError" type="error" variant="tonal" class="mb-4 text-caption" closable @click:close="actionError = ''">
        {{ actionError }}
      </v-alert>

      <!-- Botões de Ação -->
      <div class="actions-stack d-flex flex-column ga-2">
        <v-btn
          color="primary"
          size="large"
          block
          :loading="submitting"
          :disabled="!selectedTenantId || submitting"
          @click="approve"
        >
          Autorizar Acesso
        </v-btn>

        <v-btn
          variant="text"
          size="large"
          block
          color="secondary"
          :disabled="submitting"
          @click="deny"
        >
          Cancelar / Negar
        </v-btn>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { oauthService } from '@/services/oauthService'

const route = useRoute()
const reqId = route.query.req

const loading = ref(true)
const submitting = ref(false)
const error = ref('')
const actionError = ref('')
const details = ref(null)
const selectedTenantId = ref(null)

async function loadRequest() {
  if (!reqId) {
    loading.value = false
    error.value = 'Código de solicitação ausente na URL.'
    return
  }

  loading.value = true
  error.value = ''
  try {
    const res = await oauthService.getRequest(reqId)
    details.value = res.data

    if (details.value.tenants && details.value.tenants.length > 0) {
      // Pré-seleciona se tiver apenas um tenant, ou pega o primeiro
      selectedTenantId.value = details.value.tenants[0].id
    }
  } catch (err) {
    if (err.response?.status === 404) {
      error.value = 'Esta solicitação de autorização expirou ou já foi utilizada.'
    } else {
      error.value = err.response?.data?.message || 'Erro ao carregar solicitação de autorização.'
    }
  } finally {
    loading.value = false
  }
}

async function approve() {
  if (!selectedTenantId.value || submitting.value) return
  submitting.value = true
  actionError.value = ''
  try {
    const res = await oauthService.approve(reqId, selectedTenantId.value)
    if (res.data?.redirectUrl) {
      window.location.href = res.data.redirectUrl
    } else {
      actionError.value = 'Resposta inválida do servidor.'
      submitting.value = false
    }
  } catch (err) {
    actionError.value = err.response?.data?.message || 'Não foi possível aprovar a solicitação.'
    submitting.value = false
  }
}

async function deny() {
  if (submitting.value) return
  submitting.value = true
  actionError.value = ''
  try {
    const res = await oauthService.deny(reqId)
    if (res.data?.redirectUrl) {
      window.location.href = res.data.redirectUrl
    } else {
      actionError.value = 'Resposta inválida do servidor.'
      submitting.value = false
    }
  } catch (err) {
    actionError.value = err.response?.data?.message || 'Não foi possível negar a solicitação.'
    submitting.value = false
  }
}

onMounted(() => {
  loadRequest()
})
</script>

<style scoped>
.oauth-card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: 24px 20px;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
}

@media (min-width: 480px) {
  .oauth-card {
    padding: 32px 28px;
  }
}

.client-name {
  color: var(--ink);
}

.redirect-host {
  display: inline-block;
  margin-top: 2px;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.05);
  font-size: 13px;
  font-weight: 600;
  word-break: break-all;
}

.permissions-card {
  background: var(--bg-2, #f9fafb);
  border: 1px solid var(--line);
}

.permissions-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
  color: var(--ink-2);
}

.permissions-list li {
  display: flex;
  align-items: flex-start;
  line-height: 1.4;
}
</style>
