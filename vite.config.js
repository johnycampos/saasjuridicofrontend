import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
    VitePWA({
      registerType: 'autoUpdate',
      // Inclui os ícones gerados em /public no build
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'JurisFlow — Gestão de Processos Jurídicos',
        short_name: 'JurisFlow',
        description: 'Gestão de processos e fluxos jurídicos para escritórios de advocacia.',
        // --navy = oklch(0.28 0.04 255) calculado com culori → #1b2a3c
        theme_color: '#1b2a3c',
        // --bg = oklch(0.985 0.003 85) calculado com culori → #fbfaf8
        background_color: '#fbfaf8',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        lang: 'pt-BR',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        // Exclui rotas OAuth do service worker — sem isso o SW devolveria
        // index.html em vez de deixar o redirect OAuth passar pelo nginx.
        navigateFallbackDenylist: [/^\/oauth2/, /^\/login\/oauth2/],
        // Sem runtimeCaching para /api: no modo generateSW do Workbox,
        // não escrever regra = chamada vai direto para a rede. Dados
        // jurídicos sensíveis nunca devem ser cacheados no SW.
        runtimeCaching: []
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true },
      '/oauth2': { target: 'http://localhost:8080', changeOrigin: true },
      '/login': { target: 'http://localhost:8080', changeOrigin: true }
    }
  }
})
