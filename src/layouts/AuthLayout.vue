<template>
  <!-- NÃO remover este <v-app>: o AuthLayout é uma árvore Vuetify independente
       do <v-app> do DefaultLayout (aninhar dois <v-app> quebra o Vuetify). -->
  <v-app>
    <v-main class="auth-main">
      <div class="auth-shell">
        <div class="auth-glow" aria-hidden="true"></div>

        <div class="auth-stack">
          <header class="auth-brand">
            <div class="brand-mark" aria-hidden="true">J</div>
            <h1 class="brand-word">JurisFlow</h1>
            <p class="brand-tag">Gestão de Processos Jurídicos</p>
          </header>

          <RouterView />

          <p class="auth-foot">Acesso exclusivo para escritórios cadastrados.</p>
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<script setup>
import { RouterView } from 'vue-router'
</script>

<style scoped>
/* =======================================================================
   SHELL — centralização à prova de viewport móvel.

   Por que NÃO usamos <v-container class="fill-height">:
   `.fill-height` é `height: 100% !important`, uma porcentagem que precisa
   resolver contra o `.v-main`, que é `flex: 1 0 auto` dentro de um container
   flex-column cujo height é `auto` + `min-height`. Altura indefinida =>
   a porcentagem cai para `auto`, a caixa fica do tamanho do conteúdo e o
   `align-items: center` não centraliza nada (conteúdo cola no topo).

   Aqui: min-height explícito + flex centering. Como é `min-height` (e não
   `height`), conteúdo mais alto que a tela faz a página rolar em vez de
   ser cortado no topo (bug clássico de flex centrado com overflow).
   ======================================================================= */
.auth-main {
  display: flex;
  flex-direction: column;
  background: var(--bg);
}

.auth-shell {
  position: relative;
  flex: 1 1 auto;

  /* 100dvh é a MESMA unidade usada pelo `.v-application__wrap` do Vuetify 3.12
     (min-height: 100vh; min-height: 100dvh). Manter igual evita que o shell
     fique mais curto que o v-main e sobre espaço morto embaixo.
     NÃO trocar por 100svh. */
  min-height: 100vh;
  min-height: 100dvh;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  /* Safe-area: protege notch / status bar / home indicator.
     Vira no-op (env() = 0px) enquanto o index.html não tiver
     `viewport-fit=cover` — nunca regride em relação ao layout atual. */
  padding:
    max(28px, env(safe-area-inset-top))
    max(20px, env(safe-area-inset-right))
    max(28px, env(safe-area-inset-bottom))
    max(20px, env(safe-area-inset-left));

  background: var(--bg);
  overflow-x: hidden;
}

/* Profundidade sutil, 100% dentro do sistema de tokens. */
.auth-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(72% 46% at 50% 16%, var(--navy-soft), transparent 70%),
    radial-gradient(100% 58% at 50% 118%, var(--bg-3), transparent 66%);
}

.auth-stack {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: auth-rise 380ms cubic-bezier(.16, 1, .3, 1) both;
}

@keyframes auth-rise {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  .auth-stack { animation: none; }
}

/* =======================================================================
   BRAND — espelha `.brand-mark` / `.brand-name` do DefaultLayout.vue
   (fonte da verdade: DefaultLayout.vue, .brand-mark ~linha 562).
   Se aquele bloco mudar, atualizar aqui também.
   ======================================================================= */
.auth-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.brand-mark {
  width: 56px;
  height: 56px;
  /* 14/56 = 25%, mesma proporção do 7/28 do DefaultLayout */
  border-radius: 14px;
  background: var(--navy);
  display: grid;
  place-items: center;
  color: #fff;
  /* Mesmo fallback de scripts/generate-pwa-icons.js: se o Fraunces ainda não
     carregou, o "J" cai exatamente no letterform do ícone PWA já instalado. */
  font-family: 'Fraunces', Georgia, 'Times New Roman', serif;
  font-style: italic;
  font-weight: 600;
  font-size: 30px;
  line-height: 1;
  letter-spacing: -0.02em;
  user-select: none;
  box-shadow: var(--shadow-md);
}

.brand-word {
  margin-top: 16px;
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 500;
  font-size: clamp(27px, 7.4vw, 32px);
  line-height: 1.1;
  letter-spacing: -0.015em;
  color: var(--ink);
}

.brand-tag {
  margin-top: 8px;
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-3);
}

.auth-foot {
  text-align: center;
  font-size: 11px;
  line-height: 1.5;
  color: var(--ink-4);
}

/* Telas baixas (celular deitado, fonte do SO ampliada): troca centralização
   por alinhamento ao topo — impede corte do topo, que é irrecuperável por
   scroll quando um item flex centralizado transborda. */
@media (max-height: 560px) {
  .auth-shell {
    justify-content: flex-start;
    padding-top: max(20px, env(safe-area-inset-top));
    padding-bottom: max(20px, env(safe-area-inset-bottom));
  }
  .auth-stack { gap: 16px; }
  .brand-mark { width: 44px; height: 44px; border-radius: 11px; font-size: 24px; }
  .brand-word { margin-top: 12px; font-size: 24px; }
  .auth-foot  { display: none; }
}
</style>
