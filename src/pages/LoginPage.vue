<template>
  <v-card elevation="0" border rounded="xl" class="pa-4">
    <v-card-title class="text-h5 text-center pb-0">Entrar</v-card-title>
    <v-card-subtitle class="text-center pb-4">
      Acesse sua conta para gerenciar seus processos
    </v-card-subtitle>
    <v-card-text>
      <v-btn
        block
        size="large"
        variant="outlined"
        class="mb-4"
        :href="googleLoginUrl"
      >
        <template #prepend>
          <v-icon>mdi-google</v-icon>
        </template>
        Entrar com Google
      </v-btn>
      <p class="text-caption text-center text-medium-emphasis">
        Ao entrar, você concorda com nossos Termos de Uso.
      </p>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { authService } from '@/services/authService'
const googleLoginUrl = authService.getGoogleLoginUrl()
</script>
