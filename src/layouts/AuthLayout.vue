<template>
  <v-app>
    <v-main class="bg-grey-lighten-4">
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="5" lg="4">
            <div class="text-center mb-8">
              <v-icon size="48" color="primary">mdi-gavel</v-icon>
              <h1 class="text-h4 font-weight-bold mt-2">JurisFlow</h1>
              <p class="text-body-2 text-medium-emphasis">Gestão de Processos Jurídicos</p>
            </div>
            <RouterView />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { RouterView } from 'vue-router'
</script>
