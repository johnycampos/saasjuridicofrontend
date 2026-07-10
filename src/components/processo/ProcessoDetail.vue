<template>
  <v-row>
    <v-col cols="12" md="8">
      <v-card border rounded="lg" class="mb-4">
        <v-card-title>Informações do Processo</v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col v-if="processo.tipoAcao" cols="6">
              <p class="text-caption text-medium-emphasis">Tipo de Ação</p>
              <p class="text-body-2">{{ processo.tipoAcao }}</p>
            </v-col>
            <v-col v-if="processo.tribunal" cols="6">
              <p class="text-caption text-medium-emphasis">Tribunal</p>
              <p class="text-body-2">{{ processo.tribunal }}</p>
            </v-col>
            <v-col v-if="processo.vara" cols="6">
              <p class="text-caption text-medium-emphasis">Vara</p>
              <p class="text-body-2">{{ processo.vara }}</p>
            </v-col>
            <v-col v-if="processo.comarca" cols="6">
              <p class="text-caption text-medium-emphasis">Comarca</p>
              <p class="text-body-2">{{ processo.comarca }}</p>
            </v-col>
            <v-col v-if="processo.reu" cols="6">
              <p class="text-caption text-medium-emphasis">Réu</p>
              <p class="text-body-2">{{ processo.reu }}</p>
            </v-col>
            <v-col v-if="processo.valorCausa" cols="6">
              <p class="text-caption text-medium-emphasis">Valor da Causa</p>
              <p class="text-body-2">{{ formatCurrency(processo.valorCausa) }}</p>
            </v-col>
          </v-row>
          <div v-if="processo.descricao" class="mt-4">
            <p class="text-caption text-medium-emphasis">Descrição</p>
            <p class="text-body-2 mt-1">{{ processo.descricao }}</p>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="4">
      <v-card border rounded="lg">
        <v-card-title>Próximo Prazo</v-card-title>
        <v-card-text>
          <div v-if="processo.prazoProximo" class="d-flex align-center">
            <v-icon :color="prazoColor" size="18" class="mr-1">mdi-clock-outline</v-icon>
            <span class="text-body-2">{{ formatDate(processo.prazoProximo) }}</span>
          </div>
          <p v-else class="text-body-2 text-medium-emphasis">Nenhum prazo cadastrado</p>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { computed } from 'vue'
import { isAfter, addDays, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const props = defineProps({
  processo: { type: Object, required: true }
})

const prazoColor = computed(() => {
  if (!props.processo?.prazoProximo) return 'default'
  const prazo = new Date(props.processo.prazoProximo)
  if (isAfter(new Date(), prazo)) return 'error'
  if (isAfter(addDays(new Date(), 3), prazo)) return 'warning'
  return 'success'
})

function formatDate(d) {
  return format(new Date(d), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
}

function formatCurrency(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}
</script>
