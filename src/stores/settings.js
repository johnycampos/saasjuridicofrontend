import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const density = ref(localStorage.getItem('jf-density') || 'comfortable')
  const cardStyle = ref(localStorage.getItem('jf-cardStyle') || 'standard')

  function setDensity(d) {
    density.value = d
    localStorage.setItem('jf-density', d)
    document.body.setAttribute('data-density', d)
  }

  function setCardStyle(s) {
    cardStyle.value = s
    localStorage.setItem('jf-cardStyle', s)
  }

  // Apply on init
  document.body.setAttribute('data-density', density.value)

  return { density, cardStyle, setDensity, setCardStyle }
})
