<template>
  <v-container class="py-6" max-width="900">
    <div class="d-flex align-center justify-space-between mb-6 ga-3">
      <h1 class="text-h5 font-weight-bold">Integrações IA</h1>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">Gerar token</v-btn>
    </div>
    <p class="mb-4 text-medium-emphasis">Conecte sua IA aos processos, tarefas e agenda deste escritório. O acesso segue seu papel e suas áreas.</p>
    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" closable @click:close="error = ''">{{ error }}</v-alert>
    <v-progress-linear v-if="loading" indeterminate color="primary" />

    <!-- Tokens Pessoais (PAT) -->
    <h2 class="text-subtitle-1 font-weight-bold mb-2">Tokens de Acesso Pessoal (PAT)</h2>
    <v-card border rounded="xl" class="mb-6">
      <v-list lines="three">
        <v-list-item v-for="token in tokens" :key="token.id" :title="token.nome">
          <template #subtitle>
            <div>{{ token.tokenPrefix }}… · {{ status(token) }}</div>
            <div>Criado: {{ date(token.createdAt) }} · Último uso: {{ date(token.lastUsedAt) }}</div>
            <div>Validade: {{ token.expiresAt ? date(token.expiresAt) : 'Sem expiração' }}</div>
          </template>
          <template #append>
            <v-btn v-if="!token.revoked" color="error" variant="text" :loading="revoking === token.id" @click="revokeTarget = token">Revogar</v-btn>
          </template>
        </v-list-item>
        <v-list-item v-if="!tokens.length && !loading" title="Nenhum token PAT cadastrado ainda" />
      </v-list>
    </v-card>

    <!-- Apps Conectados (OAuth) -->
    <h2 class="text-subtitle-1 font-weight-bold mb-2">Apps Conectados (OAuth)</h2>
    <v-card border rounded="xl" class="mb-6">
      <v-list lines="two">
        <v-list-item v-for="conn in connections" :key="conn.clientId" :title="conn.clientName">
          <template #prepend>
            <v-avatar color="primary" variant="tonal" class="mr-3">
              <v-icon icon="mdi-robot" />
            </v-avatar>
          </template>
          <template #subtitle>
            <div>Conectado em: {{ date(conn.conectadoEm) }} · Último uso: {{ date(conn.ultimoUso) }}</div>
          </template>
          <template #append>
            <v-btn
              color="error"
              variant="text"
              :loading="revokingConn === conn.clientId"
              @click="revokeConnTarget = conn"
            >
              Desconectar
            </v-btn>
          </template>
        </v-list-item>
        <v-list-item v-if="!connections.length && !loading" title="Nenhum aplicativo OAuth conectado neste escritório" />
      </v-list>
    </v-card>

    <!-- Como conectar -->
    <v-card border rounded="xl" class="pa-6">
      <h2 class="text-h6 mb-3">Como conectar</h2>

      <div class="mb-5">
        <div class="text-subtitle-2 font-weight-bold mb-1">ChatGPT e Claude.ai (Recomendado)</div>
        <p class="text-body-2 text-medium-emphasis mb-2">
          Adicione um conector MCP com a URL abaixo — a autenticação e autorização são feitas diretamente pelo navegador via login com sua conta:
        </p>
        <pre>{{ mcpUrl }}</pre>
        <v-btn variant="text" size="small" prepend-icon="mdi-content-copy" @click="copy(mcpUrl)">Copiar URL</v-btn>
      </div>

      <v-divider class="my-4" />

      <div class="mb-5">
        <div class="text-subtitle-2 font-weight-bold mb-1">Claude Code (Terminal)</div>
        <p class="text-body-2 text-medium-emphasis mb-2">
          Substitua &lt;TOKEN&gt; por um token PAT gerado acima:
        </p>
        <pre>{{ claudeCommand }}</pre>
        <v-btn variant="text" size="small" prepend-icon="mdi-content-copy" @click="copy(claudeCommand)">Copiar comando</v-btn>
      </div>

      <v-divider class="my-4" />

      <div>
        <div class="text-subtitle-2 font-weight-bold mb-1">Cursor / Windsurf / Configuração Manual</div>
        <p class="text-body-2 text-medium-emphasis mb-2">
          Insira no arquivo de configuração do seu editor (ex: <code>~/.cursor/mcp.json</code>):
        </p>
        <pre>{{ jsonConfig }}</pre>
        <v-btn variant="text" size="small" prepend-icon="mdi-content-copy" @click="copy(jsonConfig)">Copiar JSON</v-btn>
      </div>
    </v-card>

    <!-- Modal Gerar Token PAT -->
    <v-dialog v-model="createDialog" max-width="520" :fullscreen="isMobile">
      <v-card rounded="xl">
        <v-card-title class="pa-6 pb-2">Gerar token MCP (PAT)</v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="formRef" @submit.prevent="create">
            <v-text-field v-model="nome" label="Nome do token" variant="outlined" maxlength="100" :rules="[v => !!v?.trim() || 'Informe o nome', v => v.length <= 100 || 'Máximo de 100 caracteres']" autofocus />
            <v-select v-model="expiresInDays" :items="validities" label="Validade" variant="outlined" />
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer /><v-btn :disabled="saving" @click="createDialog = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="saving" @click="create">Gerar token</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal Segredo do Token PAT gerado -->
    <v-dialog v-model="secretDialog" max-width="650" persistent>
      <v-card rounded="xl" class="pa-6">
        <v-card-title class="px-0">Seu token de acesso</v-card-title>
        <p class="mb-4">Copie agora e guarde em local seguro. Este token só é exibido uma vez.</p>
        <pre>{{ secret }}</pre>
        <v-card-actions class="px-0">
          <v-btn prepend-icon="mdi-content-copy" color="primary" @click="copy(secret)">Copiar token</v-btn>
          <v-spacer /><v-btn @click="closeSecret">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal Revogar PAT -->
    <v-dialog :model-value="!!revokeTarget" max-width="450" @update:model-value="v => { if (!v) revokeTarget = null }">
      <v-card rounded="xl" class="pa-6">
        <v-card-title class="px-0">Revogar token</v-card-title>
        <p>O token {{ revokeTarget?.nome }} perderá acesso imediatamente.</p>
        <v-card-actions class="px-0"><v-spacer /><v-btn @click="revokeTarget = null">Cancelar</v-btn><v-btn color="error" :loading="!!revoking" @click="revoke">Revogar</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal Revogar Conexão OAuth -->
    <v-dialog :model-value="!!revokeConnTarget" max-width="450" @update:model-value="v => { if (!v) revokeConnTarget = null }">
      <v-card rounded="xl" class="pa-6">
        <v-card-title class="px-0">Desconectar aplicativo</v-card-title>
        <p>O aplicativo {{ revokeConnTarget?.clientName }} perderá acesso a este escritório imediatamente.</p>
        <v-card-actions class="px-0"><v-spacer /><v-btn @click="revokeConnTarget = null">Cancelar</v-btn><v-btn color="error" :loading="!!revokingConn" @click="revokeConnection">Desconectar</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="copied" timeout="2000">Copiado para a área de transferência</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useIsMobile } from '@/composables/useIsMobile'
import { mcpService } from '@/services/mcpService'

const auth = useAuthStore()
const isMobile = useIsMobile()
const tokens = ref([]), connections = ref([]), loading = ref(false), saving = ref(false), error = ref('')
const createDialog = ref(false), secretDialog = ref(false), secret = ref(''), copied = ref(false)
const nome = ref(''), expiresInDays = ref(90), formRef = ref(null)
const revoking = ref(null), revokeTarget = ref(null)
const revokingConn = ref(null), revokeConnTarget = ref(null)

const validities = [{ title: '30 dias', value: 30 }, { title: '90 dias', value: 90 }, { title: '180 dias', value: 180 }, { title: '365 dias', value: 365 }, { title: 'Sem expiração', value: null }]
const backend = (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/+$/, '')
const mcpUrl = `${backend}/mcp`
const claudeCommand = `claude mcp add --transport http jurisflow ${mcpUrl} --header "Authorization: Bearer <TOKEN>"`
const jsonConfig = JSON.stringify({ mcpServers: { jurisflow: { type: 'http', url: mcpUrl, headers: { Authorization: 'Bearer <TOKEN>' } } } }, null, 2)
let loadVersion = 0

function date(value) { return value ? new Date(value).toLocaleString('pt-BR') : 'Nunca' }
function status(token) { return token.revoked ? 'Revogado' : token.expiresAt && new Date(token.expiresAt) <= new Date() ? 'Expirado' : 'Ativo' }
function message(e) { return e.response?.data?.message || 'Não foi possível completar a operação' }

function openCreate() { nome.value = ''; expiresInDays.value = 90; createDialog.value = true }
function closeSecret() { secret.value = ''; secretDialog.value = false }

async function load() {
  const version = ++loadVersion
  loading.value = true
  try {
    const [tokensRes, connsRes] = await Promise.all([
      mcpService.list(),
      mcpService.listConnections()
    ])
    if (version === loadVersion) {
      tokens.value = tokensRes.data
      connections.value = connsRes.data
    }
  } catch (e) {
    if (version === loadVersion) error.value = message(e)
  } finally {
    if (version === loadVersion) loading.value = false
  }
}

async function create() {
  if (saving.value || !(await formRef.value.validate()).valid) return
  const tenant = auth.currentTenantId
  saving.value = true; error.value = ''
  try {
    const response = await mcpService.create({ nome: nome.value.trim(), expiresInDays: expiresInDays.value })
    if (tenant !== auth.currentTenantId) return
    secret.value = response.data.token; secretDialog.value = true; createDialog.value = false
    await load()
  } catch (e) { error.value = message(e) }
  finally { saving.value = false }
}

async function revoke() {
  if (!revokeTarget.value || revoking.value) return
  revoking.value = revokeTarget.value.id; error.value = ''
  try {
    await mcpService.revoke(revoking.value)
    revokeTarget.value = null
    await load()
  } catch (e) { error.value = message(e) }
  finally { revoking.value = null }
}

async function revokeConnection() {
  if (!revokeConnTarget.value || revokingConn.value) return
  revokingConn.value = revokeConnTarget.value.clientId; error.value = ''
  try {
    await mcpService.revokeConnection(revokingConn.value)
    revokeConnTarget.value = null
    await load()
  } catch (e) { error.value = message(e) }
  finally { revokingConn.value = null }
}

async function copy(value) {
  try { await navigator.clipboard.writeText(value); copied.value = true }
  catch { error.value = 'Não foi possível copiar. Selecione e copie o texto manualmente.' }
}

watch(() => auth.currentTenantId, () => {
  closeSecret()
  tokens.value = []
  connections.value = []
  error.value = ''
  createDialog.value = false
  revokeTarget.value = null
  revokeConnTarget.value = null
  load()
})

onMounted(load)
onBeforeUnmount(() => { ++loadVersion; closeSecret() })
</script>

<style scoped>
pre { white-space: pre-wrap; overflow-wrap: anywhere; padding: 12px; border-radius: 8px; background: var(--bg-3, #f5f5f5); font-size: 13px; }
</style>
