<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { urlsService } from '../services/api.js'
import StatusBadge from '../components/StatusBadge.vue'
import AddURLModal from '../components/AddURLModal.vue'

const router = useRouter()
const urls = ref([])
const statuses = ref({})
const loading = ref(true)
const error = ref(null)
const showModal = ref(false)

async function fetchURLs() {
  loading.value = true
  error.value = null
  try {
    urls.value = await urlsService.list()
    await fetchStatuses()
  } catch (e) {
    error.value = 'No se pudo conectar con la API'
  } finally {
    loading.value = false
  }
}

async function fetchStatuses() {
  const results = await Promise.allSettled(
    urls.value.map(u => urlsService.getStatus(u.id))
  )
  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      statuses.value[urls.value[i].id] = result.value
    }
  })
}

function onURLCreated(newURL) {
  urls.value.push(newURL)
  showModal.value = false
  urlsService.getStatus(newURL.id).then(s => {
    statuses.value[newURL.id] = s
  })
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(iso))
}

onMounted(fetchURLs)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-semibold">URLs monitoreadas</h1>
        <p class="text-sm text-gray-500 mt-0.5">
          {{ urls.length }} URL{{ urls.length !== 1 ? 's' : '' }} en seguimiento
        </p>
      </div>
      <button
        @click="showModal = true"
        class="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium transition-colors"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Agregar URL
      </button>
    </div>

    <div v-if="loading" class="space-y-3">
      <div v-for="n in 3" :key="n" class="h-16 bg-gray-800/50 rounded-xl animate-pulse"></div>
    </div>

    <div v-else-if="error" class="text-center py-16 text-gray-500">
      <p class="text-red-400 mb-2">{{ error }}</p>
      <button @click="fetchURLs" class="text-sm text-emerald-400 hover:underline">Reintentar</button>
    </div>

    <div v-else-if="urls.length === 0" class="text-center py-20 text-gray-500">
      <div class="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-3">
        <svg class="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </div>
      <p class="text-sm">No hay URLs registradas todavía</p>
      <button @click="showModal = true" class="mt-3 text-sm text-emerald-400 hover:underline">
        Agregar la primera
      </button>
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="url in urls"
        :key="url.id"
        @click="router.push(`/urls/${url.id}`)"
        class="group flex items-center gap-4 p-4 bg-gray-900 border border-gray-800 rounded-xl cursor-pointer hover:border-gray-600 hover:bg-gray-800/80 transition-all"
      >
        <StatusBadge :is-up="statuses[url.id]?.is_up ?? null" />

        <div class="flex-1 min-w-0">
          <p class="font-medium text-sm truncate">{{ url.name }}</p>
          <p class="text-xs text-gray-500 truncate mt-0.5">{{ url.url }}</p>
        </div>

        <div class="text-right text-xs text-gray-500 hidden sm:block shrink-0">
          <p v-if="statuses[url.id]?.last_checked_at">
            Último chequeo
          </p>
          <p v-if="statuses[url.id]?.last_checked_at" class="text-gray-400 mt-0.5">
            {{ formatDate(statuses[url.id].last_checked_at) }}
          </p>
          <p v-if="statuses[url.id]?.last_response_time_ms" class="mt-0.5">
            {{ statuses[url.id].last_response_time_ms }} ms
          </p>
        </div>

        <svg
          class="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors shrink-0"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>

    <AddURLModal v-if="showModal" @created="onURLCreated" @close="showModal = false" />
  </div>
</template>
