<template>
  <Teleport to="body">
    <Transition name="tweaks">
      <div v-if="open" class="tweaks-panel">
        <div class="tweaks-header">
          <span class="tweaks-title">Preferências</span>
          <button class="tweaks-close" @click="$emit('close')">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="tweaks-label">Densidade</div>
        <div class="segment">
          <button
            class="seg-opt"
            :class="{ active: settings.density === 'comfortable' }"
            @click="settings.setDensity('comfortable')"
          >Confortável</button>
          <button
            class="seg-opt"
            :class="{ active: settings.density === 'compact' }"
            @click="settings.setDensity('compact')"
          >Compacta</button>
        </div>

        <div class="tweaks-label">Estilo de card</div>
        <div class="segment">
          <button
            class="seg-opt"
            :class="{ active: settings.cardStyle === 'minimal' }"
            @click="settings.setCardStyle('minimal')"
          >Minimal</button>
          <button
            class="seg-opt"
            :class="{ active: settings.cardStyle === 'standard' }"
            @click="settings.setCardStyle('standard')"
          >Padrão</button>
          <button
            class="seg-opt"
            :class="{ active: settings.cardStyle === 'timeline' }"
            @click="settings.setCardStyle('timeline')"
          >Timeline</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { useSettingsStore } from '@/stores/settings'

defineProps({ open: Boolean })
defineEmits(['close'])

const settings = useSettingsStore()
</script>

<style scoped>
.tweaks-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 280px;
  background: var(--panel);
  border: 1px solid var(--line-2);
  border-radius: 12px;
  box-shadow: 0 12px 40px -12px oklch(0 0 0 / 0.2);
  z-index: 300;
  padding: 16px;
}

.tweaks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.tweaks-title {
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-3);
}

.tweaks-close {
  color: var(--ink-3);
  width: 24px; height: 24px;
  display: grid; place-items: center;
  border-radius: 6px;
  transition: background 120ms;
}
.tweaks-close:hover { background: var(--bg-3); color: var(--ink); }

.tweaks-label {
  font-size: 11px;
  color: var(--ink-3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 500;
  margin-bottom: 6px;
}

.segment {
  display: flex;
  gap: 2px;
  padding: 3px;
  background: var(--bg-3);
  border-radius: 8px;
  margin-bottom: 14px;
}

.seg-opt {
  flex: 1;
  padding: 6px 8px;
  font-size: 12px;
  border-radius: 6px;
  background: transparent;
  color: var(--ink-3);
  font-weight: 400;
  cursor: pointer;
  transition: background 120ms, color 120ms, box-shadow 120ms;
  font-family: inherit;
  text-align: center;
  white-space: nowrap;
}
.seg-opt.active {
  background: var(--panel);
  color: var(--ink);
  font-weight: 500;
  box-shadow: var(--shadow-sm);
}

.tweaks-enter-active,
.tweaks-leave-active {
  transition: opacity 180ms, transform 180ms cubic-bezier(.4,0,.2,1);
}
.tweaks-enter-from,
.tweaks-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.97);
}
</style>
