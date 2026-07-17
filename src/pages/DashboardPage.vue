<template>
  <div class="dash-wrap">
    <!-- Header -->
    <div class="dash-header">
      <div class="dash-title">{{ greeting }}, {{ firstName }}.</div>
      <div class="dash-sub">
        <template v-if="groups.length > 0">
          Você tem
          <strong style="color: var(--ink)">{{ groups.length }} área{{ groups.length !== 1 ? 's' : '' }}</strong>
          ativas com
          <strong style="color: var(--ink)">{{ totalProcessos }} processo{{ totalProcessos !== 1 ? 's' : '' }}</strong>.
        </template>
        <template v-else>Bem-vindo ao JurisFlow.</template>
      </div>
    </div>

    <!-- Stats grid -->
    <div class="stats-grid" v-if="!loading">
      <div class="stat-card">
        <div class="stat-label">Processos ativos</div>
        <div class="stat-num">{{ totalProcessos }}</div>
        <div class="stat-hint">em {{ groups.length }} área{{ groups.length !== 1 ? 's' : '' }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Quadros ativos</div>
        <div class="stat-num">{{ groups.length }}</div>
        <div class="stat-hint">áreas de prática</div>
      </div>
      <div
        class="stat-card"
        :class="{ 'stat-card--cta': resumo?.proximoPrazoData }"
        :title="resumo?.proximoPrazoNumeroProcesso ? `Nº ${resumo.proximoPrazoNumeroProcesso}` : ''"
      >
        <div class="stat-label">Prazos próximos</div>
        <template v-if="resumo?.proximoPrazoData">
          <div class="stat-num" style="font-size: 20px">{{ resumo.proximoPrazoClienteNome || 'Sem cliente' }}</div>
          <div class="stat-hint">{{ formatDate(resumo.proximoPrazoData) }}</div>
        </template>
        <template v-else>
          <div class="stat-num stat-num--dash">—</div>
          <div class="stat-hint">nenhuma tarefa com prazo em aberto</div>
        </template>
      </div>
      <div class="stat-card">
        <div class="stat-label">Valor em causa (pago)</div>
        <div class="stat-num" :class="{ 'stat-num--dash': !resumo?.valorPagoTotal }">
          {{ resumo?.valorPagoTotal ? formatValor(resumo.valorPagoTotal) : '—' }}
        </div>
        <div class="stat-hint">contratos quitados</div>
      </div>
    </div>

    <!-- Agenda da semana -->
    <div v-if="!loading" class="mb-7">
      <div class="section-label">Agenda da semana</div>
      <div class="agenda-card">
        <div class="agenda-days">
          <button
            v-for="dia in diasDaSemana"
            :key="dia.iso"
            class="agenda-day"
            :class="{ 'agenda-day--today': dia.isHoje, 'agenda-day--active': diaSelecionado === dia.iso }"
            @click="selecionarDia(dia.iso)"
          >
            <span class="agenda-day-label">{{ dia.label }}</span>
            <span class="agenda-day-num">{{ dia.numero }}</span>
            <span v-if="dia.total > 0" class="agenda-day-dot" />
          </button>
        </div>

        <v-divider />

        <div class="agenda-tasks">
          <template v-if="tarefasDoDiaSelecionado.length">
            <div
              v-for="t in tarefasDoDiaSelecionado"
              :key="t.id"
              class="agenda-task-row"
              @click="irParaProcesso(t)"
            >
              <span class="agenda-task-dot" :style="{ background: prioridadeCor(t.prioridade) }" />
              <div class="agenda-task-info">
                <div class="agenda-task-title">{{ t.titulo }}</div>
                <div class="agenda-task-sub">
                  {{ t.clienteNome || 'Sem cliente' }}<span v-if="t.processoNumero"> · {{ t.processoNumero }}</span>
                </div>
              </div>
            </div>
          </template>
          <div v-else class="birthday-empty">Nenhuma tarefa para este dia.</div>
        </div>
      </div>
    </div>

    <!-- Aniversariantes do mês -->
    <div v-if="!loading" class="mb-7">
      <div class="section-label">Aniversariantes do mês</div>
      <div class="birthdays-card">
        <template v-if="resumo?.aniversariantesDoMes?.length">
          <div v-for="a in resumo.aniversariantesDoMes" :key="a.clienteId" class="birthday-row">
            <div class="birthday-info">
              <span class="birthday-day">{{ formatDiaMes(a.dataNascimento) }}</span>
              <span class="birthday-name">{{ a.nome }}</span>
            </div>
            <a
              v-if="whatsappLink(a.telefone)"
              :href="whatsappLink(a.telefone)"
              target="_blank"
              rel="noopener"
              class="birthday-whatsapp"
              title="Conversar no WhatsApp"
            >
              <v-icon size="16">mdi-whatsapp</v-icon>
            </a>
          </div>
        </template>
        <div v-else class="birthday-empty">Nenhum cliente faz aniversário este mês.</div>
      </div>
    </div>

    <!-- Groups grid -->
    <div v-if="groups.length > 0 && !loading">
      <div class="section-label">Áreas de prática</div>
      <div class="groups-grid">
        <div
          v-for="group in groups"
          :key="group.id"
          class="group-card"
          @click="router.push({ name: 'kanban', params: { groupId: group.id } })"
        >
          <div class="group-card-top">
            <div class="group-tag">
              <span class="group-dot" :style="{ background: group.cor || 'var(--navy)' }" />
              <span class="group-count">{{ group.totalProcessos }} processo{{ group.totalProcessos !== 1 ? 's' : '' }}</span>
            </div>
          </div>

          <div class="group-name">{{ group.nome }}</div>
          <div class="group-desc">{{ group.descricao || 'Sem descrição' }}</div>

          <!-- Progress bar relative to total -->
          <div v-if="totalProcessos > 0" class="group-bar">
            <div
              class="group-bar-fill"
              :style="{
                width: `${Math.round((group.totalProcessos / totalProcessos) * 100)}%`,
                background: group.cor || 'var(--navy)',
              }"
            />
          </div>

          <div class="group-footer">
            <span class="open-btn">
              Abrir Quadro
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="!loading" class="empty-state">
      <div class="empty-title">Nenhuma área criada</div>
      <div class="empty-sub">Use o menu lateral para criar sua primeira área de prática.</div>
    </div>

    <div v-if="loading" class="loading-state">
      <v-progress-circular indeterminate color="primary" size="32" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useGroupsStore } from '@/stores/groups'
import { useAuthStore } from '@/stores/auth'
import { dashboardService } from '@/services/dashboardService'

const router = useRouter()
const groupsStore = useGroupsStore()
const authStore = useAuthStore()

const groups = computed(() => groupsStore.groups)
const loading = computed(() => groupsStore.loading)
const totalProcessos = computed(() => groups.value.reduce((s, g) => s + (g.totalProcessos || 0), 0))
const firstName = computed(() => authStore.user?.nome?.split(' ')[0] || '')

const resumo = ref(null)
const agendaTarefas = ref([])
const diaSelecionado = ref(format(new Date(), 'yyyy-MM-dd'))

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
})

function formatDate(d) {
  return format(new Date(d), 'dd/MM/yyyy', { locale: ptBR })
}

function formatDiaMes(d) {
  return format(new Date(d), "dd 'de' MMMM", { locale: ptBR })
}

function whatsappLink(telefone) {
  const digits = (telefone || '').replace(/\D/g, '')
  return digits ? `https://wa.me/55${digits}` : null
}

// Agenda da semana: domingo a sábado, calculada a partir da data local
// (sem parsear string ISO em Date, pra não cair no problema clássico de
// fuso horário deslocando o dia)
const diasDaSemana = computed(() => {
  const hoje = new Date()
  const hojeIso = format(hoje, 'yyyy-MM-dd')
  const domingo = new Date(hoje)
  domingo.setDate(hoje.getDate() - hoje.getDay())

  const labels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(domingo)
    d.setDate(domingo.getDate() + i)
    const iso = format(d, 'yyyy-MM-dd')
    return {
      iso,
      label: labels[i],
      numero: d.getDate(),
      isHoje: iso === hojeIso,
      total: agendaTarefas.value.filter(t => t.prazo === iso).length
    }
  })
})

const tarefasDoDiaSelecionado = computed(() =>
  agendaTarefas.value.filter(t => t.prazo === diaSelecionado.value)
)

function selecionarDia(iso) {
  diaSelecionado.value = iso
}

function irParaProcesso(tarefa) {
  router.push({ name: 'processo-detail', params: { id: tarefa.processoId } })
}

function prioridadeCor(p) {
  return { BAIXA: 'var(--ink-3)', MEDIA: 'var(--navy)', ALTA: 'var(--amber)', URGENTE: 'var(--red)' }[p] ?? 'var(--ink-3)'
}

function formatValor(n) {
  const num = Number(n)
  if (!num) return '—'
  if (num >= 1_000_000) return `R$ ${(num / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (num >= 1_000) return `R$ ${Math.round(num / 1_000)}k`
  return `R$ ${num.toLocaleString('pt-BR')}`
}

async function loadResumo() {
  const response = await dashboardService.getResumo()
  resumo.value = response.data
}

async function loadAgendaSemana() {
  const response = await dashboardService.getAgendaSemana()
  agendaTarefas.value = response.data
}

onMounted(() => {
  groupsStore.fetchGroups()
  loadResumo()
  loadAgendaSemana()
})
</script>

<style scoped>
.dash-wrap {
  padding: 24px 28px;
  max-width: 1280px;
}

.dash-title {
  font-family: 'Fraunces', serif;
  font-size: 32px;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: var(--ink);
  margin-bottom: 5px;
}

.dash-sub {
  color: var(--ink-3);
  font-size: var(--fs-md);
  margin-bottom: 24px;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 28px;
}

.stat-card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 18px;
}
.stat-card--cta { cursor: default; }

.stat-label {
  font-size: 11px;
  color: var(--ink-3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 500;
  margin-bottom: 4px;
}

.stat-num {
  font-size: 30px;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
  margin-bottom: 6px;
}
.stat-num--dash {
  font-size: 22px;
  color: var(--ink-4);
}

.stat-hint {
  font-size: 11.5px;
  color: var(--ink-3);
}

/* Section label */
.section-label {
  font-size: var(--fs-xs);
  color: var(--ink-3);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 500;
  margin-bottom: 12px;
}

/* Agenda da semana */
.agenda-card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.agenda-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.agenda-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 14px 4px;
  background: transparent;
  border: none;
  border-right: 1px solid var(--line);
  cursor: pointer;
  font-family: inherit;
  transition: background 120ms;
}
.agenda-day:last-child { border-right: none; }
.agenda-day:hover { background: var(--bg-3); }
.agenda-day--today .agenda-day-num { color: var(--navy); font-weight: 700; }
.agenda-day--active { background: var(--navy-soft); }

.agenda-day-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ink-3);
}

.agenda-day-num {
  font-family: 'Geist Mono', monospace;
  font-size: 17px;
  font-weight: 500;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

.agenda-day-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--navy);
}

.agenda-tasks {
  padding: 4px 0;
}

.agenda-task-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  cursor: pointer;
  transition: background 120ms;
}
.agenda-task-row:hover { background: var(--bg-3); }
.agenda-task-row + .agenda-task-row { border-top: 1px solid var(--line); }

.agenda-task-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.agenda-task-info { min-width: 0; }

.agenda-task-title {
  font-size: var(--fs-md);
  color: var(--ink);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.agenda-task-sub {
  font-size: 11.5px;
  color: var(--ink-3);
  margin-top: 1px;
}

/* Aniversariantes */
.birthdays-card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.birthday-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
}
.birthday-row + .birthday-row {
  border-top: 1px solid var(--line);
}

.birthday-info {
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
}

.birthday-day {
  font-family: 'Geist Mono', monospace;
  font-size: 12px;
  color: var(--ink-3);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  flex-shrink: 0;
}

.birthday-name {
  font-size: var(--fs-md);
  color: var(--ink);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.birthday-whatsapp {
  display: grid;
  place-items: center;
  width: 28px; height: 28px;
  border-radius: 50%;
  color: var(--green);
  flex-shrink: 0;
  transition: background 120ms;
}
.birthday-whatsapp:hover { background: var(--green-bg); }

.birthday-empty {
  padding: 18px;
  font-size: var(--fs-sm);
  color: var(--ink-3);
  text-align: center;
}

/* Groups */
.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

.group-card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 20px;
  cursor: pointer;
  transition: border-color 120ms, box-shadow 120ms;
}
.group-card:hover {
  border-color: var(--line-2);
  box-shadow: var(--shadow-md);
}

.group-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.group-tag {
  display: flex;
  align-items: center;
  gap: 6px;
}

.group-dot {
  width: 8px; height: 8px;
  border-radius: 2px;
  display: inline-block;
  flex-shrink: 0;
}

.group-count {
  font-family: 'Geist Mono', monospace;
  font-size: var(--fs-xs);
  color: var(--ink-3);
  font-variant-numeric: tabular-nums;
}

.group-name {
  font-size: var(--fs-lg);
  font-weight: 500;
  color: var(--ink);
  margin-bottom: 4px;
  letter-spacing: -0.01em;
}

.group-desc {
  font-size: var(--fs-sm);
  color: var(--ink-3);
  margin-bottom: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.45;
}

.group-bar {
  height: 3px;
  background: var(--bg-3);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 14px;
}
.group-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 300ms;
}

.group-footer {
  border-top: 1px solid var(--line);
  padding-top: 12px;
}

.open-btn {
  font-size: var(--fs-sm);
  color: var(--navy);
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* Empty + Loading */
.empty-state { padding: 48px 0; }
.empty-title {
  font-size: var(--fs-lg);
  font-weight: 500;
  color: var(--ink);
  margin-bottom: 6px;
}
.empty-sub { font-size: var(--fs-sm); color: var(--ink-3); }

.loading-state {
  display: flex;
  justify-content: center;
  padding: 48px 0;
}

@media (max-width: 900px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 560px) {
  .stats-grid { grid-template-columns: 1fr; }
  .dash-wrap { padding: 20px 16px; }
}
</style>
