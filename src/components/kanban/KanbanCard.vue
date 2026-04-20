<template>
  <div
    class="card"
    :class="[`card--${variant}`]"
    role="button"
    tabindex="0"
    @click="$emit('click')"
    @keydown.enter="$emit('click')"
    @keydown.space.prevent="$emit('click')"
  >
    <!-- Standard variant -->
    <template v-if="variant === 'standard' || !variant">
      <div class="card-row1">
        <tipo-tag v-if="processo.tipoAcao" :tipo="processo.tipoAcao" />
        <prazo-pill :dias="prazoDias" />
      </div>

      <div class="card-title">{{ processo.titulo }}</div>

      <div v-if="processo.numeroProcesso" class="card-cnj">{{ processo.numeroProcesso }}</div>

      <div v-if="processo.autor || processo.reu" class="card-partes">
        <span class="parte-nome">{{ processo.autor }}</span>
        <span v-if="processo.reu" class="parte-v">v.</span>
        <span v-if="processo.reu" class="parte-nome">{{ processo.reu }}</span>
      </div>

      <div class="card-footer">
        <div class="prio-badge" :class="`prio--${(processo.prioridade || 'MEDIA').toLowerCase()}`">
          {{ prioLabel }}
        </div>
        <div class="card-meta">
          <span v-if="processo.valorCausa" class="meta-valor">{{ formatValor(processo.valorCausa) }}</span>
          <span v-if="processo.totalAnexos > 0" class="meta-icon-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12 12 21a5 5 0 0 1-7-7l9-9a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L15 8"/></svg>
            {{ processo.totalAnexos }}
          </span>
          <span v-if="processo.totalComentarios > 0" class="meta-icon-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            {{ processo.totalComentarios }}
          </span>
        </div>
      </div>
    </template>

    <!-- Minimal variant -->
    <template v-else-if="variant === 'minimal'">
      <div class="minimal-bar" :style="{ background: tipoColor }" />
      <div class="card-title" style="margin-bottom: 6px">{{ processo.titulo }}</div>
      <div class="card-row1" style="margin-bottom: 0">
        <prazo-pill :dias="prazoDias" compact />
        <span v-if="processo.numeroProcesso" class="card-cnj" style="margin: 0">
          …{{ processo.numeroProcesso.slice(-8) }}
        </span>
      </div>
    </template>

    <!-- Timeline variant -->
    <template v-else-if="variant === 'timeline'">
      <div class="prio-stripe" :style="{ background: prioColor }" />
      <div class="card-row1" style="margin-bottom: 8px">
        <tipo-tag v-if="processo.tipoAcao" :tipo="processo.tipoAcao" />
        <span class="prio-label-sm" :style="{ color: prioColor }">{{ prioLabel }}</span>
      </div>
      <div class="card-title">{{ processo.titulo }}</div>

      <div v-if="prazoDias != null" class="timeline-wrap">
        <div class="timeline-track">
          <div class="timeline-today" :style="{ left: `${todayPct}%` }" />
          <div class="timeline-marker" :style="{ left: `${prazoPct}%`, background: toneColor, boxShadow: `0 0 0 1px ${toneColor}` }" />
        </div>
        <div class="timeline-labels">
          <span>hoje</span>
          <span :style="{ color: toneColor, fontWeight: 600 }">{{ prazoLabel }}</span>
          <span>+30d</span>
        </div>
      </div>

      <div class="card-footer" style="border-top: none; padding-top: 0">
        <span v-if="processo.autor" class="parte-nome" style="font-size: 11px; color: var(--ink-2)">{{ processo.autor }}</span>
        <span v-if="processo.valorCausa" class="meta-valor">{{ formatValor(processo.valorCausa) }}</span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  processo: { type: Object, required: true },
  variant: { type: String, default: 'standard' }
})
defineEmits(['click'])

const TIPO_CORES = {
  'Cível': 'oklch(0.62 0.09 220)',
  'Trabalhista': 'oklch(0.72 0.13 70)',
  'Tributário': 'oklch(0.48 0.12 290)',
  'Família': 'oklch(0.58 0.09 155)',
  'Consumidor': 'oklch(0.55 0.18 25)',
  'Imobiliário': 'oklch(0.55 0.08 50)',
}

const PRIO_CORES = {
  URGENTE: 'var(--red)',
  ALTA:    'var(--amber)',
  MEDIA:   'var(--ink-4)',
  BAIXA:   'var(--green)',
}

const tipoColor = computed(() => TIPO_CORES[props.processo.tipoAcao] || 'var(--ink-3)')
const prioColor = computed(() => PRIO_CORES[props.processo.prioridade] || PRIO_CORES.MEDIA)
const prioLabel = computed(() => ({ URGENTE: 'Urgente', ALTA: 'Alta', MEDIA: 'Média', BAIXA: 'Baixa' }[props.processo.prioridade] || 'Média'))

const prazoDias = computed(() => {
  if (!props.processo.prazoProximo) return null
  return Math.ceil((new Date(props.processo.prazoProximo) - new Date()) / 86400000)
})

const toneColor = computed(() => {
  const d = prazoDias.value
  if (d == null) return 'var(--ink-3)'
  if (d < 0 || d <= 2) return 'var(--red)'
  if (d <= 7) return 'var(--amber)'
  return 'var(--ink-3)'
})

const prazoLabel = computed(() => {
  const d = prazoDias.value
  if (d == null) return ''
  if (d < 0) return `${Math.abs(d)}d atrasado`
  if (d === 0) return 'hoje'
  if (d === 1) return 'amanhã'
  return `em ${d}d`
})

const windowStart = -7, windowEnd = 30
const todayPct = ((0 - windowStart) / (windowEnd - windowStart)) * 100
const prazoPct = computed(() => {
  if (prazoDias.value == null) return 0
  const clamped = Math.max(windowStart, Math.min(windowEnd, prazoDias.value))
  return ((clamped - windowStart) / (windowEnd - windowStart)) * 100
})

function formatValor(v) {
  if (!v) return ''
  const n = Number(v)
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (n >= 1_000) return `R$ ${Math.round(n / 1_000)}k`
  return `R$ ${n.toLocaleString('pt-BR')}`
}

// Sub-components defined inline
const TipoTag = {
  props: ['tipo'],
  setup(p) {
    const CORES = {
      'Cível': 'oklch(0.62 0.09 220)', 'Trabalhista': 'oklch(0.72 0.13 70)',
      'Tributário': 'oklch(0.48 0.12 290)', 'Família': 'oklch(0.58 0.09 155)',
      'Consumidor': 'oklch(0.55 0.18 25)', 'Imobiliário': 'oklch(0.55 0.08 50)',
    }
    return { cor: CORES[p.tipo] || 'var(--ink-3)' }
  },
  template: `<div class="tipo-tag"><span class="tipo-dot" :style="{background: cor}"/>{{ tipo }}</div>`
}

const PrazoPill = {
  props: ['dias', 'compact'],
  setup(p) {
    const tone = computed(() => {
      if (p.dias == null) return 'neutral'
      if (p.dias < 0 || p.dias <= 2) return 'red'
      if (p.dias <= 7) return 'amber'
      return 'neutral'
    })
    const label = computed(() => {
      if (p.dias == null) return ''
      if (p.dias < 0) return `${Math.abs(p.dias)}d atrasado`
      if (p.dias === 0) return 'hoje'
      if (p.dias === 1) return 'amanhã'
      return `em ${p.dias}d`
    })
    return { tone, label }
  },
  template: `
    <div v-if="dias != null" class="prazo-pill" :class="['prazo--'+tone, compact ? 'prazo--compact' : '']">
      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0">
        <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
      </svg>
      {{ label }}
    </div>
  `
}
</script>

<style scoped>
.card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: var(--pad-card);
  cursor: pointer;
  transition: border-color 120ms, box-shadow 120ms;
  position: relative;
  user-select: none;
}
.card:hover {
  border-color: var(--line-2);
  box-shadow: var(--shadow-md);
}
.card:focus-visible {
  outline: 2px solid var(--navy);
  outline-offset: 2px;
}

.card-row1 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  gap: 6px;
}

.card-title {
  font-size: var(--fs-md);
  font-weight: 500;
  line-height: 1.35;
  color: var(--ink);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 6px;
  text-wrap: pretty;
}

.card-cnj {
  font-family: 'Geist Mono', monospace;
  font-size: var(--fs-xs);
  color: var(--ink-3);
  font-variant-numeric: tabular-nums;
  margin-bottom: 6px;
}

.card-partes {
  font-size: 11.5px;
  color: var(--ink-2);
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 10px;
}
.parte-nome {
  max-width: 110px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.parte-v {
  color: var(--ink-4);
  font-family: 'Fraunces', serif;
  font-style: italic;
  flex-shrink: 0;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid var(--line);
}

.prio-badge {
  font-size: var(--fs-xs);
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
  letter-spacing: 0.02em;
}
.prio--urgente { background: var(--red-bg); color: var(--red); }
.prio--alta    { background: var(--amber-bg); color: var(--amber); }
.prio--media   { background: var(--bg-3); color: var(--ink-3); }
.prio--baixa   { background: var(--green-bg); color: var(--green); }

.card-meta {
  display: flex; align-items: center; gap: 8px;
  color: var(--ink-3); font-size: 11px;
}
.meta-valor {
  font-family: 'Geist Mono', monospace;
  color: var(--ink-2); font-weight: 500;
  font-variant-numeric: tabular-nums;
}
.meta-icon-item {
  display: flex; align-items: center; gap: 3px;
  color: var(--ink-3);
}

/* Minimal */
.minimal-bar {
  position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
  border-top-left-radius: var(--radius); border-bottom-left-radius: var(--radius);
}
.card--minimal { padding-left: 14px; }

/* Timeline */
.prio-stripe {
  position: absolute; left: 0; top: 8px; bottom: 8px; width: 3px; border-radius: 3px;
}
.card--timeline { padding-left: 16px; }
.prio-label-sm { font-size: var(--fs-xs); font-family: 'Geist Mono', monospace; }

.timeline-wrap { margin-bottom: 10px; }
.timeline-track {
  position: relative; height: 4px; background: var(--bg-3); border-radius: 2px; margin-bottom: 4px;
}
.timeline-today {
  position: absolute; top: -3px; bottom: -3px; width: 1.5px; background: var(--ink-3); transform: translateX(-50%);
}
.timeline-marker {
  position: absolute; top: 50%; width: 10px; height: 10px; border-radius: 50%;
  transform: translate(-50%, -50%); border: 2px solid var(--panel);
}
.timeline-labels {
  display: flex; justify-content: space-between;
  font-size: 9.5px; color: var(--ink-4);
  font-family: 'Geist Mono', monospace; font-variant-numeric: tabular-nums;
}

/* Sub-components via :deep() */
:deep(.tipo-tag) {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 10.5px; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--ink-2); font-weight: 500;
}
:deep(.tipo-dot) {
  width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0;
}
:deep(.prazo-pill) {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 2px 8px; border-radius: 12px;
  font-size: 11px; font-weight: 500;
  font-variant-numeric: tabular-nums;
  font-family: 'Geist Mono', monospace;
}
:deep(.prazo--red)     { background: var(--red-bg);   color: var(--red);   }
:deep(.prazo--amber)   { background: var(--amber-bg); color: var(--amber); }
:deep(.prazo--neutral) { background: var(--bg-3);     color: var(--ink-3); }
:deep(.prazo--compact) { padding: 1px 6px; }
</style>
