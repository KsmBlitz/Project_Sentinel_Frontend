<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { urlsService } from '../services/api.js'
import StatusBadge from '../components/StatusBadge.vue'

const props = defineProps({ id: String })
const router = useRouter()

const status = ref(null)
const stats = ref([])
const incidents = ref([])
const loading = ref(true)
const error = ref(null)

const uptimeAvg = computed(() => {
  if (stats.value.length === 0) return null
  const avg = stats.value.reduce((acc, s) => acc + s.uptime_pct, 0) / stats.value.length
  return avg.toFixed(1)
})

const avgResponseMs = computed(() => {
  const valid = stats.value.filter(s => s.avg_response_ms != null)
  if (valid.length === 0) return null
  return Math.round(valid.reduce((acc, s) => acc + s.avg_response_ms, 0) / valid.length)
})

async function fetchAll() {
  loading.value = true
  error.value = null
  try {
    const [s, st, inc] = await Promise.all([
      urlsService.getStatus(props.id),
      urlsService.getStats(props.id, 7),
      urlsService.getIncidents(props.id),
    ])
    status.value = s
    stats.value = st
    incidents.value = inc
  } catch {
    error.value = 'No se pudo cargar la información'
  } finally {
    loading.value = false
  }
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('es-CL', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso))
}

function formatHour(iso) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('es-CL', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

function uptimeColor(pct) {
  if (pct >= 99) return 'text-emerald-600'
  if (pct >= 95) return 'text-yellow-600'
  return 'text-red-600'
}

onMounted(fetchAll)
</script>

<template>
  <div>
    <button
      @click="router.push('/')"
      class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-6"
    >
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Volver al dashboard
    </button>

    <div v-if="loading" class="space-y-4">
      <div class="h-16 bg-gray-200/60 rounded-xl animate-pulse"></div>
      <div class="grid grid-cols-3 gap-3">
        <div v-for="n in 3" :key="n" class="h-20 bg-gray-200/60 rounded-xl animate-pulse"></div>
      </div>
      <div class="h-56 bg-gray-200/60 rounded-xl animate-pulse"></div>
    </div>

    <div v-else-if="error" class="text-center py-16 text-red-500 text-sm">{{ error }}</div>

    <div v-else class="space-y-6">
      <div class="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
        <StatusBadge :is-up="status?.is_up ?? null" />
        <div class="flex-1">
          <p class="text-sm text-gray-600">
            Último chequeo:
            <span class="text-gray-900 font-medium">{{ formatDate(status?.last_checked_at) }}</span>
          </p>
          <p v-if="status?.last_response_time_ms" class="text-xs text-gray-400 mt-0.5">
            Tiempo de respuesta: {{ status.last_response_time_ms }} ms
          </p>
        </div>
      </div>

      <div v-if="stats.length > 0" class="grid grid-cols-3 gap-3">
        <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p class="text-xs text-gray-500 mb-1">Uptime promedio</p>
          <p class="text-2xl font-semibold" :class="uptimeColor(Number(uptimeAvg))">{{ uptimeAvg }}%</p>
          <p class="text-xs text-gray-400 mt-1">últimos 7 días</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p class="text-xs text-gray-500 mb-1">Respuesta prom.</p>
          <p class="text-2xl font-semibold text-gray-900">{{ avgResponseMs ?? '—' }}</p>
          <p class="text-xs text-gray-400 mt-1">milisegundos</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p class="text-xs text-gray-500 mb-1">Incidentes</p>
          <p class="text-2xl font-semibold" :class="incidents.length > 0 ? 'text-red-600' : 'text-gray-900'">
            {{ incidents.length }}
          </p>
          <p class="text-xs text-gray-400 mt-1">registrados</p>
        </div>
      </div>

      <section>
        <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Historial por hora — últimos 7 días
        </h2>
        <div v-if="stats.length === 0" class="text-center py-10 text-sm text-gray-400 bg-white border border-gray-200 rounded-xl shadow-sm">
          Sin estadísticas aún. El worker de chequeos debe correr al menos una vez.
        </div>
        <div v-else class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-xs text-gray-500 border-b border-gray-100 bg-gray-50">
                <th class="px-4 py-3 font-medium">Hora</th>
                <th class="px-4 py-3 font-medium">Uptime</th>
                <th class="px-4 py-3 font-medium hidden sm:table-cell">Chequeos</th>
                <th class="px-4 py-3 font-medium hidden sm:table-cell">Prom.</th>
                <th class="px-4 py-3 font-medium">P95</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="row in stats" :key="row.hour" class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{{ formatHour(row.hour) }}</td>
                <td class="px-4 py-3 font-semibold" :class="uptimeColor(row.uptime_pct)">{{ row.uptime_pct }}%</td>
                <td class="px-4 py-3 text-gray-600 hidden sm:table-cell">{{ row.successful }}/{{ row.total_checks }}</td>
                <td class="px-4 py-3 text-gray-600 hidden sm:table-cell">{{ row.avg_response_ms ?? '—' }} ms</td>
                <td class="px-4 py-3 text-gray-600">{{ row.p95_response_ms ?? '—' }} ms</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Incidentes</h2>
        <div v-if="incidents.length === 0" class="text-center py-10 text-sm text-gray-400 bg-white border border-gray-200 rounded-xl shadow-sm">
          Sin incidentes registrados
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="inc in incidents"
            :key="inc.id"
            class="p-4 rounded-xl border bg-white shadow-sm"
            :class="inc.resolved_at ? 'border-gray-200' : 'border-red-200 bg-red-50'"
          >
            <div class="flex items-center justify-between mb-2">
              <span
                class="text-xs font-medium px-2 py-0.5 rounded-full"
                :class="inc.resolved_at ? 'bg-gray-100 text-gray-500' : 'bg-red-100 text-red-700'"
              >
                {{ inc.resolved_at ? 'Resuelto' : '● Activo' }}
              </span>
              <span class="text-xs text-gray-400">{{ inc.checks_failed }} chequeos fallidos</span>
            </div>
            <div class="text-xs text-gray-500 space-y-1">
              <p>Inicio: <span class="text-gray-700">{{ formatDate(inc.started_at) }}</span></p>
              <p v-if="inc.resolved_at">Fin: <span class="text-gray-700">{{ formatDate(inc.resolved_at) }}</span></p>
              <p v-if="inc.duration_min">Duración: <span class="text-gray-700">{{ inc.duration_min }} minutos</span></p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
