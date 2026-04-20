<template>
  <v-container class="py-6">
    <h1 class="text-h5 font-weight-bold mb-6">Dashboard</h1>

    <v-row>
      <v-col v-for="group in groups" :key="group.id" cols="12" sm="6" md="4">
        <v-card border rounded="xl" hover :to="{ name: 'kanban', params: { groupId: group.id } }">
          <v-card-text>
            <v-icon size="32" :color="group.cor || 'primary'">mdi-folder</v-icon>
            <h3 class="text-h6 mt-2">{{ group.nome }}</h3>
            <p class="text-body-2 text-medium-emphasis">{{ group.descricao || 'Sem descrição' }}</p>
          </v-card-text>
          <v-card-actions>
            <v-btn variant="text" size="small">Abrir Board</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col v-if="groups.length === 0 && !loading" cols="12">
        <v-card border rounded="xl" class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-1">mdi-folder-open-outline</v-icon>
          <h3 class="text-h6 mt-4">Nenhum grupo ainda</h3>
          <p class="text-body-2 text-medium-emphasis">
            Use o menu lateral para criar seu primeiro grupo
          </p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useGroupsStore } from '@/stores/groups'

const groupsStore = useGroupsStore()
const groups = computed(() => groupsStore.groups)
const loading = computed(() => groupsStore.loading)

onMounted(() => groupsStore.fetchGroups())
</script>
