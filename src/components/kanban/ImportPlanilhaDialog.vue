<template>
  <v-card rounded="xl" :elevation="0" border>
    <v-card-title class="d-flex align-center pa-5 pb-2">
      Importar de Planilhas
      <v-spacer />
      <v-btn icon variant="text" @click="$emit('close')">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>

    <v-divider />

    <v-card-text class="pa-5">
      <template v-if="!result">
        <div class="d-flex justify-end mb-4">
          <v-btn variant="text" size="small" :loading="downloadingTemplate" @click="downloadTemplate">
            <app-icon name="download" :size="14" class="mr-1" /> Baixar planilha de exemplo
          </v-btn>
        </div>

        <div
          class="dropzone"
          :class="{ 'dropzone--active': isDragOver, 'dropzone--filled': !!selectedFile }"
          @dragover.prevent="isDragOver = true"
          @dragleave.prevent="isDragOver = false"
          @drop.prevent="onDrop"
        >
          <template v-if="!selectedFile">
            <app-icon name="upload" :size="32" />
            <p class="text-body-2 text-medium-emphasis mt-3 mb-3">Arraste o arquivo Excel aqui</p>
            <v-btn color="primary" @click="fileInput?.click()">Selecionar arquivo</v-btn>
            <p class="text-caption text-medium-emphasis mt-3">.xlsx ou .xls</p>
          </template>
          <template v-else>
            <app-icon name="file" :size="32" />
            <p class="text-body-2 font-weight-medium mt-2 mb-1">{{ selectedFile.name }}</p>
            <v-btn variant="text" size="small" @click="selectedFile = null">Trocar arquivo</v-btn>
          </template>
          <input
            ref="fileInput"
            type="file"
            accept=".xlsx,.xls"
            style="display: none"
            @change="onFileSelected"
          />
        </div>

        <p v-if="errorMsg" class="text-error text-body-2 mt-3">{{ errorMsg }}</p>
      </template>

      <template v-else>
        <div class="text-center py-2">
          <app-icon name="check" :size="32" style="color: var(--green)" />
          <p class="text-h6 mt-2 mb-1">Importação concluída</p>
          <p class="text-body-2 text-medium-emphasis">
            {{ result.colunasCriadas }} coluna(s) criada(s) · {{ result.processosCriados }} processo(s) importado(s)
          </p>
        </div>

        <v-alert v-if="result.erros.length" type="warning" variant="tonal" density="compact" class="mt-3">
          <p class="text-body-2 font-weight-medium mb-1">{{ result.erros.length }} linha(s) não importada(s):</p>
          <ul class="text-body-2 pl-4">
            <li v-for="(erro, i) in result.erros" :key="i">{{ erro }}</li>
          </ul>
        </v-alert>
      </template>
    </v-card-text>

    <v-divider />

    <v-card-actions class="pa-5 pt-3">
      <v-spacer />
      <template v-if="!result">
        <v-btn variant="text" @click="$emit('close')">Cancelar</v-btn>
        <v-btn color="primary" :loading="importing" :disabled="!selectedFile" @click="doImport">
          Importar
        </v-btn>
      </template>
      <template v-else>
        <v-btn color="primary" @click="finish">Concluir</v-btn>
      </template>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import { importService } from '@/services/importService'
import AppIcon from '@/components/AppIcon.vue'

const props = defineProps({
  groupId: { type: String, required: true }
})
const emit = defineEmits(['close', 'imported'])

const fileInput = ref(null)
const selectedFile = ref(null)
const isDragOver = ref(false)
const downloadingTemplate = ref(false)
const importing = ref(false)
const errorMsg = ref('')
const result = ref(null)

function onFileSelected(e) {
  const file = e.target.files?.[0]
  if (file) selectedFile.value = file
  e.target.value = ''
}

function onDrop(e) {
  isDragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) selectedFile.value = file
}

async function downloadTemplate() {
  downloadingTemplate.value = true
  try {
    const response = await importService.downloadTemplate(props.groupId)
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.download = 'modelo-importacao-processos.xlsx'
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } finally {
    downloadingTemplate.value = false
  }
}

async function doImport() {
  if (!selectedFile.value) return
  importing.value = true
  errorMsg.value = ''
  try {
    const response = await importService.upload(props.groupId, selectedFile.value)
    result.value = response.data
  } catch (err) {
    errorMsg.value = err.response?.data?.detail
      || 'Não foi possível importar a planilha. Verifique o arquivo e tente novamente.'
  } finally {
    importing.value = false
  }
}

function finish() {
  emit('imported', result.value)
  emit('close')
}
</script>

<style scoped>
.dropzone {
  border: 2px dashed var(--line-2);
  border-radius: 12px;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: border-color 120ms, background 120ms;
}
.dropzone--active {
  border-color: var(--navy);
  background: var(--navy-soft);
}
.dropzone--filled {
  border-style: solid;
}
</style>
