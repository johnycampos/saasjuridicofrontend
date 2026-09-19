<template>
  <div class="agenda-wrap">
    <!-- Header -->
    <div class="agenda-top">
      <div>
        <div class="agenda-title">Agenda</div>
        <div class="agenda-sub">Prazos de processos, audiências, vencimentos financeiros e compromissos sincronizados.</div>
      </div>

      <!-- Controls & Navigation -->
      <div class="agenda-nav-bar">
        <div class="month-nav">
          <button class="nav-btn" @click="mesAnterior" title="Mês anterior">
            <app-icon name="chevronR" :size="14" style="transform: rotate(180deg);" />
          </button>
          <span class="month-label">{{ mesAnoLabel }}</span>
          <button class="nav-btn" @click="proximoMes" title="Próximo mês">
            <app-icon name="chevronR" :size="14" />
          </button>
          <button class="today-btn" @click="irParaHoje">Hoje</button>
        </div>

        <!-- Type Filters -->
        <div class="filter-chips">
          <button
            class="chip-btn"
            :class="{ 'chip-btn--active': filtros.tarefas }"
            @click="filtros.tarefas = !filtros.tarefas"
          >
            <span class="chip-dot" style="background: #f59e0b;" />
            Tarefas
          </button>
          <button
            class="chip-btn"
            :class="{ 'chip-btn--active': filtros.audiencias }"
            @click="filtros.audiencias = !filtros.audiencias"
          >
            <span class="chip-dot" style="background: #e53935;" />
            Audiências
          </button>
          <button
            class="chip-btn"
            :class="{ 'chip-btn--active': filtros.parcelas }"
            @click="filtros.parcelas = !filtros.parcelas"
          >
            <span class="chip-dot" style="background: #10b981;" />
            Parcelas
          </button>
          <button
            class="chip-btn"
            :class="{ 'chip-btn--active': filtros.google }"
            @click="filtros.google = !filtros.google"
          >
            <span class="chip-dot" style="background: #3b82f6;" />
            Google Calendar
          </button>
        </div>

        <!-- Group / Area Filter -->
        <div v-if="groups.length > 0" class="group-filter-wrap">
          <select v-model="filtros.grupo" class="group-select">
            <option :value="null">Todas as áreas</option>
            <option v-for="g in groups" :key="g.id" :value="g.id">
              {{ g.nome }}
            </option>
          </select>
        </div>

        <!-- Actions: Nova Audiência + Exportar PDF -->
        <div class="agenda-actions">
          <v-btn color="error" variant="flat" size="small" @click="openAudienciaDialog" class="mr-2">
            <v-icon size="16" start>mdi-gavel</v-icon>
            Nova Audiência
          </v-btn>
          <v-btn variant="outlined" size="small" @click="exportarPdf">
            <v-icon size="16" start>mdi-file-pdf-box</v-icon>
            PDF
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Summary stats cards -->
    <div class="stats-grid" v-if="!loading && resumo">
      <div class="stat-card">
        <div class="stat-label">Prazos no mês</div>
        <div class="stat-num" style="color: #d97706;">{{ resumo.totalTarefas }}</div>
        <div class="stat-hint">tarefas processuais</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Audiências no mês</div>
        <div class="stat-num" style="color: #e53935;">{{ resumo.totalAudiencias || 0 }}</div>
        <div class="stat-hint">compromissos jurídicos</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Parcelas a receber</div>
        <div class="stat-num" style="color: #059669;">{{ resumo.totalParcelas }}</div>
        <div class="stat-hint">vencimentos financeiros</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Google Calendar</div>
        <div class="stat-num" style="color: #2563eb;">{{ resumo.totalEventosGoogle }}</div>
        <div class="stat-hint">eventos da agenda</div>
      </div>
      <div class="stat-card" :class="{ 'stat-card--danger': resumo.totalAtrasados > 0 }">
        <div class="stat-label">Prazos atrasados</div>
        <div class="stat-num" :style="{ color: resumo.totalAtrasados > 0 ? 'var(--red)' : 'var(--ink-3)' }">
          {{ resumo.totalAtrasados }}
        </div>
        <div class="stat-hint">{{ resumo.totalAtrasados > 0 ? 'necessitam atenção imediata' : 'nenhum prazo vencido' }}</div>
      </div>
    </div>

    <!-- Loading spinner -->
    <div v-if="loading" class="loading-box">
      <v-progress-circular indeterminate color="primary" size="32" />
    </div>

    <!-- Main Layout: Grid + Side Detail Panel -->
    <div v-else class="agenda-layout">
      <!-- Monthly Grid -->
      <div class="calendar-card">
        <div class="grid-weekdays">
          <div v-for="d in ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']" :key="d" class="weekday-col">
            {{ d }}
          </div>
        </div>

        <div class="grid-days">
          <div
            v-for="cell in diasCalendario"
            :key="cell.iso"
            class="day-cell"
            :class="{
              'day-cell--outside': !cell.isMesAtual,
              'day-cell--today': cell.isHoje,
              'day-cell--active': diaSelecionado === cell.iso
            }"
            @click="selecionarDia(cell.iso)"
          >
            <div class="day-cell-top">
              <span class="day-num">{{ cell.numero }}</span>
              <span v-if="cell.eventos.length > 0" class="day-count-pill">
                {{ cell.eventos.length }}
              </span>
            </div>

            <!-- Dots indicator -->
            <div class="day-dots" v-if="cell.eventos.length > 0">
              <span
                v-for="(ev, idx) in cell.eventos.slice(0, 4)"
                :key="idx"
                class="event-mini-dot"
                :style="{ background: getEventColor(ev) }"
              />
              <span v-if="cell.eventos.length > 4" class="event-mini-more">+{{ cell.eventos.length - 4 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Side / Day Detail Panel -->
      <div class="day-detail-panel">
        <div class="detail-header">
          <div class="detail-title">{{ diaSelecionadoFormatado }}</div>
          <div class="detail-sub">
            {{ eventosDoDia.length }} {{ eventosDoDia.length === 1 ? 'item' : 'itens' }}
          </div>
        </div>

        <v-divider />

        <div class="detail-list">
          <template v-if="eventosDoDia.length > 0">
            <div
              v-for="(item, i) in eventosDoDia"
              :key="i"
              class="event-card"
              :class="'event-card--' + item.tipo.toLowerCase()"
              @click="handleEventClick(item)"
            >
              <div class="event-card-left">
                <span class="event-type-dot" :style="{ background: getEventColor(item) }" />
              </div>

              <div class="event-card-body">
                <div class="event-card-header">
                  <span class="event-title">{{ item.titulo }}</span>
                  <span
                    v-if="item.prioridade"
                    class="badge-priority"
                    :style="{ background: prioridadeBg(item.prioridade), color: prioridadeCor(item.prioridade) }"
                  >
                    {{ item.prioridade }}
                  </span>
                  <span
                    v-else-if="item.tipo === 'AUDIENCIA'"
                    class="badge-priority"
                    style="background: #fee2e2; color: #b91c1c;"
                  >
                    AUDIÊNCIA
                  </span>
                </div>

                <!-- Meta info -->
                <div class="event-meta">
                  <template v-if="item.tipo === 'TAREFA'">
                    <span v-if="item.horaInicio">⏰ {{ item.horaInicio }} · </span>
                    <span v-if="item.clienteNome">👤 {{ item.clienteNome }}</span>
                    <span v-if="item.processoNumero"> · Nº {{ item.processoNumero }}</span>
                  </template>

                  <template v-else-if="item.tipo === 'AUDIENCIA'">
                    <span v-if="item.horaInicio">⏰ {{ item.horaInicio }} · </span>
                    <span v-if="item.processoNumero">⚖️ Nº {{ item.processoNumero }}</span>
                    <span v-if="item.clienteNome"> · 👤 {{ item.clienteNome }}</span>
                    <span class="ml-1 font-weight-medium" style="color: #b91c1c;">(Clique para editar)</span>
                  </template>

                  <template v-else-if="item.tipo === 'PARCELA'">
                    <span v-if="item.valor" class="parcela-val">💰 {{ formatValor(item.valor) }}</span>
                    <span v-if="item.clienteNome"> · 👤 {{ item.clienteNome }}</span>
                    <span v-if="item.processoNumero"> · Nº {{ item.processoNumero }}</span>
                  </template>

                  <template v-else-if="item.tipo === 'GOOGLE_CALENDAR'">
                    <span v-if="item.horaInicio">⏰ {{ item.horaInicio }}{{ item.horaFim ? ' – ' + item.horaFim : '' }}</span>
                    <span v-else>📅 Dia inteiro</span>
                    <span class="ml-1">· Google Calendar</span>
                  </template>
                </div>
              </div>

              <div class="event-card-arrow">
                <app-icon name="chevronR" :size="12" />
              </div>
            </div>
          </template>

          <div v-else class="empty-day-state">
            <app-icon name="calendar" :size="32" style="color: var(--ink-3); margin-bottom: 8px;" />
            <div class="empty-day-title">Nenhum evento neste dia</div>
            <div class="empty-day-sub">Não há prazos, audiências, parcelas ou compromissos agendados.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog de Audiência -->
    <v-dialog v-model="audienciaDialog" max-width="600">
      <v-card rounded="lg">
        <v-card-title class="pa-4 font-weight-bold d-flex align-center">
          <v-icon size="20" color="error" class="mr-2">mdi-gavel</v-icon>
          {{ audienciaEditId ? 'Editar' : 'Nova' }} Audiência
        </v-card-title>
        <v-card-text class="pa-4 pt-0">
          <v-text-field
            v-model="audienciaForm.titulo"
            label="Título *"
            placeholder="Ex: Audiência de Instrução e Julgamento"
            :rules="[v => !!v || 'Título é obrigatório']"
            class="mb-2"
          />
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-select
                v-model="audienciaForm.tipo"
                label="Tipo"
                :items="tiposAudiencia"
                class="mb-2"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-autocomplete
                v-model="audienciaForm.processoId"
                label="Processo *"
                :items="processos"
                item-title="label"
                item-value="id"
                :rules="[v => !!v || 'Processo é obrigatório']"
                class="mb-2"
                no-data-text="Nenhum processo encontrado"
              />
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="audienciaForm.data"
                label="Data *"
                type="date"
                :rules="[v => !!v || 'Data é obrigatória']"
                class="mb-2"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="audienciaForm.hora"
                label="Hora"
                type="time"
                class="mb-2"
              />
            </v-col>
          </v-row>
          <v-text-field
            v-model="audienciaForm.vara"
            label="Vara / Tribunal"
            placeholder="Ex: 2ª Vara Cível de Curitiba"
            class="mb-2"
          />
          <v-textarea
            v-model="audienciaForm.observacoes"
            label="Observações"
            rows="3"
            placeholder="Pautas, testemunhas, link virtual etc."
          />
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-btn variant="text" @click="audienciaDialog = false">Cancelar</v-btn>
          <v-spacer />
          <v-btn
            v-if="audienciaEditId"
            color="error"
            variant="text"
            @click="cancelarAudiencia"
          >
            Cancelar Audiência
          </v-btn>
          <v-btn
            color="primary"
            @click="salvarAudiencia"
            :loading="audienciaSaving"
            :disabled="!audienciaForm.titulo || !audienciaForm.processoId || !audienciaForm.data"
          >
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import jsPDF from 'jspdf'
import { agendaService } from '@/services/agendaService'
import { audienciaService } from '@/services/audienciaService'
import { processoService } from '@/services/processoService'
import { useGroupsStore } from '@/stores/groups'
import AppIcon from '@/components/AppIcon.vue'

const router = useRouter()
const groupsStore = useGroupsStore()

const groups = computed(() => groupsStore.groups)

const mesAtual = ref(new Date())
const diaSelecionado = ref(format(new Date(), 'yyyy-MM-dd'))
const eventos = ref([])
const resumo = ref(null)
const loading = ref(false)

const filtros = ref({
  tarefas: true,
  audiencias: true,
  parcelas: true,
  google: true,
  grupo: null
})

// Audiência Dialog & Form
const audienciaDialog = ref(false)
const audienciaEditId = ref(null)
const audienciaSaving = ref(false)
const audienciaForm = ref({
  titulo: '',
  tipo: 'AUDIENCIA',
  data: '',
  hora: null,
  processoId: null,
  vara: '',
  observacoes: ''
})
const tiposAudiencia = ['AUDIENCIA', 'CONCILIACAO', 'INSTRUCAO', 'JULGAMENTO', 'PERICIA', 'SESSAO', 'OUTROS']
const processos = ref([])

async function loadProcessos() {
  try {
    const res = await processoService.list({ size: 300 })
    const list = res.data?.content || res.data || []
    processos.value = list.map(p => ({
      id: p.id,
      label: (p.numeroProcesso ? p.numeroProcesso + ' - ' : '') + (p.clienteNome || 'Sem cliente')
    }))
  } catch (e) {
    console.error('Erro ao carregar processos:', e)
  }
}

function openAudienciaDialog() {
  audienciaEditId.value = null
  audienciaForm.value = {
    titulo: '',
    tipo: 'AUDIENCIA',
    data: diaSelecionado.value || format(new Date(), 'yyyy-MM-dd'),
    hora: null,
    processoId: null,
    vara: '',
    observacoes: ''
  }
  if (processos.value.length === 0) {
    loadProcessos()
  }
  audienciaDialog.value = true
}

async function editAudiencia(item) {
  try {
    const res = await audienciaService.get(item.id)
    const aud = res.data
    audienciaEditId.value = aud.id
    audienciaForm.value = {
      titulo: aud.titulo || '',
      tipo: aud.tipo || 'AUDIENCIA',
      data: aud.data || '',
      hora: aud.hora ? aud.hora.slice(0, 5) : null,
      processoId: aud.processoId || null,
      vara: aud.vara || '',
      observacoes: aud.observacoes || ''
    }
    if (processos.value.length === 0) {
      await loadProcessos()
    }
    audienciaDialog.value = true
  } catch (e) {
    console.error('Erro ao carregar audiência para edição:', e)
  }
}

async function salvarAudiencia() {
  if (!audienciaForm.value.titulo || !audienciaForm.value.processoId || !audienciaForm.value.data) return
  audienciaSaving.value = true
  try {
    const payload = {
      titulo: audienciaForm.value.titulo,
      tipo: audienciaForm.value.tipo,
      data: audienciaForm.value.data,
      hora: audienciaForm.value.hora || null,
      processoId: audienciaForm.value.processoId,
      vara: audienciaForm.value.vara || null,
      observacoes: audienciaForm.value.observacoes || null
    }
    if (audienciaEditId.value) {
      await audienciaService.update(audienciaEditId.value, payload)
    } else {
      await audienciaService.create(payload)
    }
    audienciaDialog.value = false
    await loadAgenda()
  } catch (e) {
    console.error('Erro ao salvar audiência:', e)
  } finally {
    audienciaSaving.value = false
  }
}

async function cancelarAudiencia() {
  if (!confirm('Deseja cancelar esta audiência?')) return
  try {
    await audienciaService.delete(audienciaEditId.value)
    audienciaDialog.value = false
    await loadAgenda()
  } catch (e) {
    console.error('Erro ao cancelar audiência:', e)
  }
}

const mesAnoLabel = computed(() => {
  const str = format(mesAtual.value, "MMMM 'de' yyyy", { locale: ptBR })
  return str.charAt(0).toUpperCase() + str.slice(1)
})

const diaSelecionadoFormatado = computed(() => {
  if (!diaSelecionado.value) return ''
  const [y, m, d] = diaSelecionado.value.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  const str = format(dt, "EEEE, dd 'de' MMMM", { locale: ptBR })
  return str.charAt(0).toUpperCase() + str.slice(1)
})

function mesAnterior() {
  mesAtual.value = subMonths(mesAtual.value, 1)
}

function proximoMes() {
  mesAtual.value = addMonths(mesAtual.value, 1)
}

function irParaHoje() {
  mesAtual.value = new Date()
  diaSelecionado.value = format(new Date(), 'yyyy-MM-dd')
}

function selecionarDia(iso) {
  diaSelecionado.value = iso
}

const eventosFiltrados = computed(() => {
  return eventos.value.filter(ev => {
    if (ev.tipo === 'TAREFA' && !filtros.value.tarefas) return false
    if (ev.tipo === 'AUDIENCIA' && !filtros.value.audiencias) return false
    if (ev.tipo === 'PARCELA' && !filtros.value.parcelas) return false
    if (ev.tipo === 'GOOGLE_CALENDAR' && !filtros.value.google) return false
    if (filtros.value.grupo && ev.grupoId !== filtros.value.grupo) return false
    return true
  })
})

const diasCalendario = computed(() => {
  const mStart = startOfMonth(mesAtual.value)
  const mEnd = endOfMonth(mesAtual.value)
  const calStart = startOfWeek(mStart, { weekStartsOn: 0 })
  const calEnd = endOfWeek(mEnd, { weekStartsOn: 0 })

  const allDays = eachDayOfInterval({ start: calStart, end: calEnd })
  const hojeIso = format(new Date(), 'yyyy-MM-dd')

  return allDays.map(d => {
    const iso = format(d, 'yyyy-MM-dd')
    const evs = eventosFiltrados.value.filter(e => e.data === iso)
    return {
      date: d,
      iso,
      numero: d.getDate(),
      isMesAtual: isSameMonth(d, mesAtual.value),
      isHoje: iso === hojeIso,
      eventos: evs
    }
  })
})

const eventosDoDia = computed(() => {
  if (!diaSelecionado.value) return []
  return eventosFiltrados.value.filter(e => e.data === diaSelecionado.value)
})

function getEventColor(ev) {
  if (ev.tipo === 'TAREFA') return '#f59e0b' // Amber/Orange
  if (ev.tipo === 'AUDIENCIA') return '#e53935' // Red
  if (ev.tipo === 'PARCELA') return '#10b981' // Green
  if (ev.tipo === 'GOOGLE_CALENDAR') return '#3b82f6' // Blue
  return 'var(--ink-3)'
}

function prioridadeCor(p) {
  return { BAIXA: 'var(--ink-3)', MEDIA: 'var(--navy)', ALTA: '#d97706', URGENTE: 'var(--red)' }[p] ?? 'var(--ink-3)'
}

function prioridadeBg(p) {
  return { BAIXA: 'var(--bg-3)', MEDIA: 'var(--navy-soft)', ALTA: '#fef3c7', URGENTE: '#fee2e2' }[p] ?? 'var(--bg-3)'
}

function formatValor(v) {
  if (v == null) return ''
  return 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function handleEventClick(item) {
  if (item.tipo === 'TAREFA' && item.processoId) {
    router.push({ name: 'processo-detail', params: { id: item.processoId } })
  } else if (item.tipo === 'AUDIENCIA') {
    if (item.id) {
      editAudiencia(item)
    } else if (item.processoId) {
      router.push({ name: 'processo-detail', params: { id: item.processoId } })
    }
  } else if (item.tipo === 'PARCELA') {
    router.push('/financeiro')
  } else if (item.tipo === 'GOOGLE_CALENDAR' && item.htmlLink) {
    if (item.htmlLink.startsWith('https://')) {
      window.open(item.htmlLink, '_blank', 'noopener,noreferrer')
    }
  }
}

function exportarPdf() {
  try {
    const doc = new jsPDF()
    const mesAno = format(mesAtual.value, "MMMM 'de' yyyy", { locale: ptBR })
    const mesAnoTitle = mesAno.charAt(0).toUpperCase() + mesAno.slice(1)

    // Header
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(30, 41, 59)
    doc.text(`Agenda JurisFlow - ${mesAnoTitle}`, 14, 20)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(100, 116, 139)
    doc.text(`Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })} · Total de eventos: ${eventosFiltrados.value.length}`, 14, 28)

    // Resumo
    if (resumo.value) {
      doc.setFontSize(9)
      doc.setTextColor(71, 85, 105)
      const resText = `Prazos: ${resumo.value.totalTarefas} | Audiências: ${resumo.value.totalAudiencias || 0} | Parcelas: ${resumo.value.totalParcelas} | Google: ${resumo.value.totalEventosGoogle || 0} | Atrasados: ${resumo.value.totalAtrasados || 0}`
      doc.text(resText, 14, 34)
    }

    doc.setDrawColor(226, 232, 240)
    doc.line(14, 38, 196, 38)

    let y = 46
    if (eventosFiltrados.value.length === 0) {
      doc.setFontSize(11)
      doc.text('Nenhum evento encontrado para este período.', 14, y)
    } else {
      eventosFiltrados.value.forEach(ev => {
        if (y > 275) {
          doc.addPage()
          y = 20
        }

        const [anoE, mesE, diaE] = (ev.data || '').split('-')
        const dataStr = diaE && mesE ? `${diaE}/${mesE}` : ''
        const horaStr = ev.horaInicio ? ` às ${ev.horaInicio}` : ''

        let tipoLabel = 'Compromisso'
        if (ev.tipo === 'TAREFA') tipoLabel = 'Prazo/Tarefa'
        else if (ev.tipo === 'AUDIENCIA') tipoLabel = 'Audiência'
        else if (ev.tipo === 'PARCELA') tipoLabel = 'Parcela'
        else if (ev.tipo === 'GOOGLE_CALENDAR') tipoLabel = 'Google'

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.setTextColor(30, 41, 59)
        doc.text(`[${dataStr}${horaStr}] ${tipoLabel}: ${ev.titulo}`, 14, y)

        const subDetails = []
        if (ev.processoNumero) subDetails.push(`Proc: ${ev.processoNumero}`)
        if (ev.clienteNome) subDetails.push(`Cliente: ${ev.clienteNome}`)
        if (ev.valor) subDetails.push(`Valor: ${formatValor(ev.valor)}`)
        if (ev.prioridade) subDetails.push(`Prioridade: ${ev.prioridade}`)

        if (subDetails.length > 0) {
          y += 5
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(8.5)
          doc.setTextColor(100, 116, 139)
          doc.text(`    ${subDetails.join(' · ')}`, 14, y)
        }

        y += 8
      })
    }

    doc.save(`agenda-${format(mesAtual.value, 'yyyy-MM')}.pdf`)
  } catch (err) {
    console.error('Erro ao gerar PDF com jsPDF:', err)
    window.print()
  }
}

async function loadAgenda() {
  loading.value = true
  try {
    const ano = mesAtual.value.getFullYear()
    const mes = mesAtual.value.getMonth() + 1
    const res = await agendaService.getCompleta(ano, mes)
    eventos.value = res.data?.eventos || []
    resumo.value = res.data?.resumo || null
  } catch (e) {
    console.error('Erro ao carregar dados da agenda:', e)
    eventos.value = []
    resumo.value = null
  } finally {
    loading.value = false
  }
}

watch(mesAtual, () => {
  loadAgenda()
})

onMounted(() => {
  groupsStore.fetchGroups()
  loadAgenda()
})
</script>

<style scoped>
.agenda-wrap {
  padding: 24px 28px;
  max-width: 1400px;
}

.agenda-title {
  font-family: 'Fraunces', serif;
  font-size: 30px;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: var(--ink);
  margin-bottom: 4px;
}

.agenda-sub {
  color: var(--ink-3);
  font-size: var(--fs-md);
  margin-bottom: 20px;
}

.agenda-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
}

.agenda-nav-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.month-nav {
  display: flex;
  align-items: center;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 4px 8px;
  gap: 8px;
}

.nav-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  color: var(--ink);
  transition: background 120ms;
}
.nav-btn:hover {
  background: var(--bg-3);
}

.month-label {
  font-size: var(--fs-md);
  font-weight: 600;
  color: var(--ink);
  min-width: 140px;
  text-align: center;
}

.today-btn {
  background: var(--bg-3);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  padding: 3px 8px;
  font-size: var(--fs-xs);
  font-weight: 500;
  color: var(--navy);
  cursor: pointer;
  transition: background 120ms;
}
.today-btn:hover {
  background: var(--line);
}

.filter-chips {
  display: flex;
  align-items: center;
  gap: 6px;
}

.chip-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--panel);
  font-size: var(--fs-xs);
  color: var(--ink-3);
  cursor: pointer;
  transition: all 120ms;
}
.chip-btn:hover {
  border-color: var(--line-2);
}
.chip-btn--active {
  background: var(--panel);
  border-color: var(--navy);
  color: var(--ink);
  font-weight: 500;
  box-shadow: var(--shadow-sm);
}

.chip-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.group-filter-wrap {
  display: flex;
  align-items: center;
}

.group-select {
  padding: 6px 12px;
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--panel);
  color: var(--ink);
  font-size: var(--fs-xs);
  outline: none;
}

.agenda-actions {
  display: flex;
  align-items: center;
}

/* Stats cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 14px 18px;
}
.stat-card--danger {
  border-color: rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.02);
}

.stat-label {
  font-size: var(--fs-xs);
  color: var(--ink-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
  margin-bottom: 4px;
}

.stat-num {
  font-family: 'Geist Mono', monospace;
  font-size: 26px;
  font-weight: 600;
  line-height: 1.1;
  margin-bottom: 2px;
}

.stat-hint {
  font-size: 11px;
  color: var(--ink-3);
}

/* Agenda Main Layout */
.agenda-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 20px;
  align-items: start;
}

/* Calendar Card */
.calendar-card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.grid-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: var(--bg-2);
  border-bottom: 1px solid var(--line);
}

.weekday-col {
  padding: 10px 4px;
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ink-3);
}

.grid-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.day-cell {
  min-height: 86px;
  padding: 8px;
  border-right: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  cursor: pointer;
  background: var(--panel);
  transition: background 120ms;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.day-cell:nth-child(7n) {
  border-right: none;
}
.day-cell:hover {
  background: var(--bg-3);
}
.day-cell--outside {
  background: rgba(0, 0, 0, 0.015);
  opacity: 0.45;
}
.day-cell--today .day-num {
  color: var(--navy);
  font-weight: 700;
  background: var(--navy-soft);
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.day-cell--active {
  background: rgba(37, 99, 235, 0.06) !important;
  box-shadow: inset 0 0 0 2px var(--navy);
}

.day-cell-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.day-num {
  font-family: 'Geist Mono', monospace;
  font-size: 13px;
  font-weight: 500;
  color: var(--ink);
}

.day-count-pill {
  font-size: 10px;
  font-weight: 600;
  background: var(--bg-3);
  color: var(--ink);
  border-radius: 8px;
  padding: 1px 5px;
}

.day-dots {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 3px;
  margin-top: 6px;
}

.event-mini-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.event-mini-more {
  font-size: 9px;
  color: var(--ink-3);
  font-weight: 600;
}

/* Detail Panel */
.day-detail-panel {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.detail-header {
  padding: 16px 20px;
}

.detail-title {
  font-size: var(--fs-md);
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 2px;
}

.detail-sub {
  font-size: var(--fs-xs);
  color: var(--ink-3);
}

.detail-list {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 600px;
  overflow-y: auto;
}

.event-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  background: var(--bg-2);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 120ms;
}
.event-card:hover {
  background: var(--panel);
  border-color: var(--line-2);
  box-shadow: var(--shadow-sm);
}

.event-type-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  margin-top: 4px;
}

.event-card-body {
  flex: 1;
  min-width: 0;
}

.event-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.event-title {
  font-size: var(--fs-sm);
  font-weight: 500;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge-priority {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}

.event-meta {
  font-size: var(--fs-xs);
  color: var(--ink-3);
  line-height: 1.4;
}

.parcela-val {
  font-family: 'Geist Mono', monospace;
  font-weight: 600;
  color: #059669;
}

.event-card-arrow {
  color: var(--ink-3);
  margin-top: 2px;
}

.empty-day-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  text-align: center;
}

.empty-day-title {
  font-size: var(--fs-sm);
  font-weight: 500;
  color: var(--ink);
  margin-bottom: 2px;
}

.empty-day-sub {
  font-size: var(--fs-xs);
  color: var(--ink-3);
}

.loading-box {
  display: flex;
  justify-content: center;
  padding: 48px 0;
}

@media (max-width: 1024px) {
  .agenda-layout {
    grid-template-columns: 1fr;
  }
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .agenda-wrap {
    padding: 16px;
  }
  .month-nav {
    width: 100%;
    justify-content: space-between;
  }
}

@media print {
  .agenda-nav-bar,
  .agenda-actions,
  .nav-btn,
  .filter-chips,
  .group-filter-wrap {
    display: none !important;
  }
  .agenda-wrap {
    padding: 0;
    max-width: 100%;
  }
}
</style>
