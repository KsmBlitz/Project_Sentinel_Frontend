<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { urlsService } from '../services/api.js'
import StatusBadge from '../components/StatusBadge.vue'
import AddURLModal from '../components/AddURLModal.vue'
import SiteFavicon from '../components/SiteFavicon.vue'

const router = useRouter()
const urls = ref([])
const statuses = ref({})
const loading = ref(true)
const error = ref(null)
const showModal = ref(false)
let refreshInterval = null

const summary = computed(() => {
  const total = urls.value.length
  const up = urls.value.filter(u => statuses.value[u.id]?.is_up === true).length
  const down = urls.value.filter(u => statuses.value[u.id]?.is_up === false).length
  return { total, up, down }
})

async function fetchURLs() {
  loading.value = true
  error.value = null
  try {
    urls.value = await urlsService.list()
    await fetchStatuses()
  } catch {
    error.value = 'No se pudo conectar con la API'
  } finally {
    loading.value = false
  }
}

async function fetchStatuses() {
  if (urls.value.length === 0) return
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

function formatRelativeTime(iso) {
  if (!iso) return null
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60) return 'hace menos de 1 min'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`
  return `hace ${Math.floor(diff / 86400)} d`
}

onMounted(() => {
  fetchURLs()
  refreshInterval = setInterval(fetchStatuses, 30000)
})
onUnmounted(() => clearInterval(refreshInterval))
</script>

<template>
  <div>
    <div class="flex items-start justify-between mb-6 gap-4">
      <div>
        <h1 class="text-xl font-semibold text-gray-900">URLs monitoreadas</h1>
        <p class="text-sm text-gray-500 mt-0.5">Se actualiza cada 30 segundos</p>
      </div>
      <button
        @click="showModal = true"
        class="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors shrink-0"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Agregar URL
      </button>
    </div>

    <div v-if="!loading && urls.length > 0" class="grid grid-cols-3 gap-3 mb-6">
      <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <p class="text-2xl font-semibold text-gray-900">{{ summary.total }}</p>
        <p class="text-xs text-gray-500 mt-1">Total</p>
      </div>
      <div class="bg-white border border-emerald-200 rounded-xl p-4 shadow-sm">
        <p class="text-2xl font-semibold text-emerald-600">{{ summary.up }}</p>
        <p class="text-xs text-gray-500 mt-1">Activas</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm" :class="summary.down > 0 ? 'border border-red-200' : 'border border-gray-200'">
        <p class="text-2xl font-semibold" :class="summary.down > 0 ? 'text-red-600' : 'text-gray-400'">{{ summary.down }}</p>
        <p class="text-xs text-gray-500 mt-1">Caídas</p>
      </div>
    </div>

    <div v-if="loading" class="space-y-3">
      <div v-for="n in 3" :key="n" class="h-20 bg-gray-200/60 rounded-xl animate-pulse"></div>
    </div>

    <div v-else-if="error" class="text-center py-16">
      <p class="text-red-500 text-sm mb-3">{{ error }}</p>
      <button @click="fetchURLs" class="text-sm text-emerald-600 hover:underline">Reintentar</button>
    </div>

    <div v-else-if="urls.length === 0" class="text-center py-20">
      <div class="w-14 h-14 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto mb-4">
        <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </div>
      <p class="text-gray-500 text-sm">No hay URLs registradas todavía</p>
      <button @click="showModal = true" class="mt-3 text-sm text-emerald-600 hover:underline">
        Agregar la primera
      </button>
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="url in urls"
        :key="url.id"
        @click="router.push({ path: `/urls/${url.id}`, query: { name: url.name, url: url.url } })"
        class="group flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all duration-150"
      >
        <SiteFavicon :url="url.url" :size="20" />

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <p class="font-medium text-sm text-gray-900">{{ url.name }}</p>
            <StatusBadge :is-up="statuses[url.id]?.is_up ?? null" />
          </div>
          <p class="text-xs text-gray-500 truncate mt-0.5">{{ url.url }}</p>
        </div>

        <div class="text-right shrink-0 hidden sm:block">
          <p v-if="statuses[url.id]?.last_response_time_ms" class="text-sm font-medium text-gray-700">
            {{ statuses[url.id].last_response_time_ms }} ms
          </p>
          <p class="text-xs text-gray-400 mt-0.5">
            {{ formatRelativeTime(statuses[url.id]?.last_checked_at) }}
          </p>
        </div>

        <svg
          class="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>

    <AddURLModal v-if="showModal" @created="onURLCreated" @close="showModal = false" />
  </div>
</template>
