<script setup>
import { ref } from 'vue'
import { urlsService } from '../services/api.js'

const emit = defineEmits(['created', 'close'])

const form = ref({ url: '', name: '', interval_minutes: 5 })
const loading = ref(false)
const error = ref(null)

async function submit() {
  error.value = null
  loading.value = true
  try {
    const created = await urlsService.create(form.value)
    emit('created', created)
  } catch (e) {
    error.value = e.response?.data?.detail || 'Error al agregar la URL'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" @click.self="emit('close')">
    <div class="bg-white border border-gray-200 rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-base font-semibold text-gray-900">Agregar URL</h2>
        <button @click="emit('close')" class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input
            v-model="form.name"
            type="text"
            required
            placeholder="Mi sitio web"
            class="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">URL</label>
          <input
            v-model="form.url"
            type="url"
            required
            placeholder="https://ejemplo.com"
            class="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Intervalo de chequeo</label>
          <select
            v-model.number="form.interval_minutes"
            class="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
          >
            <option :value="1">Cada 1 minuto</option>
            <option :value="5">Cada 5 minutos</option>
            <option :value="10">Cada 10 minutos</option>
            <option :value="30">Cada 30 minutos</option>
            <option :value="60">Cada hora</option>
          </select>
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <div class="flex gap-3 pt-1">
          <button
            type="button"
            @click="emit('close')"
            class="flex-1 px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="flex-1 px-4 py-2 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium transition-colors"
          >
            {{ loading ? 'Agregando…' : 'Agregar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
