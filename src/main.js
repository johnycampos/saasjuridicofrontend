import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import '@/styles/tokens.css'

import App from './App.vue'
import router from './router'

const jurisTheme = {
  dark: false,
  colors: {
    background: '#faf9f5',
    surface: '#fefefe',
    primary: '#1f2e50',
    'on-primary': '#ffffff',
    secondary: '#5a6a8a',
    error: '#c04a2a',
    warning: '#c88a2e',
    success: '#588060',
    info: '#3a6ea5',
  },
}

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'juris',
    themes: { juris: jurisTheme },
  },
  defaults: {
    VBtn: { variant: 'flat', rounded: 'lg' },
    VTextField: { variant: 'outlined', density: 'compact' },
    VSelect: { variant: 'outlined', density: 'compact' },
  },
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(vuetify)
app.mount('#app')
