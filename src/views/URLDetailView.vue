<script setup>
import { ref, onMounted } from 'vue'
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
  } catch (e) {
    error.value = 'No se pudo cargar la información'
  } finally {
    loading.value = false
  }
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(iso))
}

function formatHour(iso) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('es-CL', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

onMounted(fetchAll)
</script>

<template>
  <div>
    <button
      @click="router.push('/')"
      class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-6"
    >
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Volver
    </button>

    <div v-if="loading" class="space-y-4">
      <div class="h-24 bg-gray-800/50 rounded-xl animate-pulse"></div>
      <div class="h-48 bg-gray-800/50 rounded-xl animate-pulse"></div>
    </div>

    <div v-else-if="error" class="text-center py-16 text-red-400">
      <p>{{ error }}</p>
    </div>

    <div v-else class="space-y-6">
      <div class="flex items-center gap-3">
        <StatusBadge :is-up="status?.is_up ?? null" />
        <div>
          <p class="text-sm text-gray-400">Último chequeo: {{ formatDate(status?.last_checked_at) }}</p>
          <p v-if="status?.last_response_time_ms" class="text-xs text-gray-500">
            Tiempo de respuesta: {{ status.last_response_time_ms }} ms
          </p>
        </div>
      </div>

      <section>
        <h2 class="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">
          Estadísticas — últimos 7 días
        </h2>
        <div v-if="stats.length === 0" class="text-sm text-gray-600 py-4 text-center">
          Sin datos de estadísticas aún
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-gray-500 text-xs border-b border-gray-800">
                <th class="pb-2 pr-4 font-medium">Hora</th>
                <th class="pb-2 pr-4 font-medium">Uptime</th>
                <th class="pb-2 pr-4 font-medium">Chequeos</th>
                <th class="pb-2 pr-4 font-medium">Prom. respuesta</th>
                <th class="pb-2 font-medium">P95</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800/50">
              <tr v-for="row in stats" :key="row.hour" class="text-gray-300">
                <td class="py-2.5 pr-4 text-gray-400 whitespace-nowrap">{{ formatHour(row.hour) }}</td>
                <td class="py-2.5 pr-4">
                  <span
                    :class="row.uptime_pct >= 99 ? 'text-emerald-400' : row.uptime_pct >= 95 ? 'text-yellow-400' : 'text-red-400'"
                    class="font-medium"
                  >
                    {{ row.uptime_pct }}%
                  </span>
                </td>
                <td class="py-2.5 pr-4">{{ row.successful }}/{{ row.total_checks }}</td>
                <td class="py-2.5 pr-4">{{ row.avg_response_ms ?? '—' }} ms</td>
                <td class="py-2.5">{{ row.p95_response_ms ?? '—' }} ms</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 class="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">
          Incidentes
        </h2>
        <div v-if="incidents.length === 0" class="text-sm text-gray-600 py-4 text-center bg-gray-900 rounded-xl border border-gray-800">
          Sin incidentes registrados
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="inc in incidents"
            :key="inc.id"
            class="p-4 rounded-xl border bg-gray-900"
            :class="inc.resolved_at ? 'border-gray-800' : 'border-red-900/50 bg-red-950/20'"
          >
            <div class="flex items-center justify-between">
              <span
                class="text-xs font-medium px-2 py-0.5 rounded-full"
                :class="inc.resolved_at ? 'bg-gray-700 text-gray-400' : 'bg-red-900/50 text-red-400'"
              >
                {{ inc.resolved_at ? 'Resuelto' : 'Activo' }}
              </span>
              <span class="text-xs text-gray-500">{{ inc.checks_failed }} chequeos fallidos</span>
            </div>
            <div class="mt-2 text-xs text-gray-400 space-y-0.5">
              <p>Inicio: {{ formatDate(inc.started_at) }}</p>
              <p v-if="inc.resolved_at">Fin: {{ formatDate(inc.resolved_at) }}</p>
              <p v-if="inc.duration_min">Duración: {{ inc.duration_min }} minutos</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
