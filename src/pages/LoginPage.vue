<template>
  <section class="login-card">
    <h2 class="login-title">Acessar sua conta</h2>
    <p class="login-sub">
      Entre com a conta Google do seu escritório para continuar.
    </p>

    <!-- <a> nativo (não v-btn): preserva o redirect puro do OAuth, evita o
         text-transform: uppercase padrão do VBtn e segue o padrão de botão
         do resto do app (.btn-primary / .btn-ghost em KanbanPage.vue). -->
    <a
      class="google-btn"
      :class="{ 'is-busy': redirecting }"
      :href="googleLoginUrl"
      :aria-busy="redirecting ? 'true' : 'false'"
      @click="redirecting = true"
    >
      <span class="google-btn__icon" aria-hidden="true">
        <!-- Logotipo oficial "G" do Google. NÃO recolorir, girar nem alterar.
             Fonte: https://developers.google.com/identity/branding-guidelines -->
        <svg v-if="!redirecting" viewBox="0 0 48 48" width="20" height="20" focusable="false">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        <span v-else class="spinner"></span>
      </span>

      <span class="google-btn__label">
        {{ redirecting ? 'Redirecionando…' : 'Entrar com o Google' }}
      </span>

      <span aria-hidden="true"></span>
    </a>

    <p class="login-legal">
      Ao continuar, você concorda com os Termos de Uso.
    </p>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { authService } from '@/services/authService'

const googleLoginUrl = authService.getGoogleLoginUrl()

/* Feedback durante o redirect de página inteira do OAuth: sem isso, em rede
   móvel lenta a tela fica congelada e o usuário toca duas vezes.
   Importante: não chamar preventDefault() — a navegação nativa do <a> segue. */
const redirecting = ref(false)
</script>

<style scoped>
.login-card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: 24px 20px;
  text-align: center;
}

@media (min-width: 400px) {
  .login-card { padding: 28px 26px; }
}

.login-title {
  font-size: 16.5px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--ink);
}

.login-sub {
  margin-top: 6px;
  font-size: var(--fs-md);
  line-height: 1.45;
  color: var(--ink-3);
}

/* ---------- Botão Google ---------- */
.google-btn {
  margin-top: 22px;
  display: grid;
  /* ícone à esquerda | rótulo opticamente centralizado | espaçador */
  grid-template-columns: 20px 1fr 20px;
  align-items: center;
  gap: 12px;
  min-height: 52px;
  padding: 0 16px;
  border: 1px solid var(--line-2);
  border-radius: var(--radius);
  /* Branco puro é exigência das diretrizes do botão claro do Google. */
  background: #fff;
  box-shadow: var(--shadow-sm);
  color: var(--ink);
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
  transition: background 120ms, border-color 120ms, box-shadow 120ms, transform 120ms;
}

.google-btn:hover {
  background: var(--bg-2);
  border-color: var(--ink-4);
  box-shadow: var(--shadow-md);
}

.google-btn:active {
  transform: translateY(1px);
  box-shadow: var(--shadow-sm);
}

.google-btn:focus-visible {
  outline: 2px solid var(--navy);
  outline-offset: 2px;
}

.google-btn.is-busy {
  pointer-events: none;
  opacity: 0.75;
}

.google-btn__icon {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
}

.google-btn__label {
  text-align: center;
  white-space: nowrap;
}

.spinner {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid var(--line-2);
  border-top-color: var(--navy);
  animation: login-spin 700ms linear infinite;
}

@keyframes login-spin {
  to { transform: rotate(360deg); }
}

.login-legal {
  margin-top: 16px;
  font-size: 11.5px;
  line-height: 1.5;
  color: var(--ink-4);
}
</style>
