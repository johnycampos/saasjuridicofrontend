/**
 * useIsMobile — fonte única do breakpoint "é mobile" para o app inteiro.
 *
 * Usa o breakpoint nativo do Vuetify (smAndDown = < 960px), eliminando os
 * valores hardcoded divergentes (900/560/1024/600px) espalhados pelo app.
 *
 * Uso:
 *   import { useIsMobile } from '@/composables/useIsMobile'
 *   const isMobile = useIsMobile()
 *   // isMobile.value === true quando viewport < 960px
 */
import { useDisplay } from 'vuetify'
import { computed } from 'vue'

export function useIsMobile() {
  const { smAndDown } = useDisplay()
  return computed(() => smAndDown.value)
}
