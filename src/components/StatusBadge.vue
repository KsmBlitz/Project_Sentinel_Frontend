<script setup>
defineProps({
  isUp: { type: Boolean, default: null },
})
</script>

<template>
  <span
    v-if="isUp === null || isUp === undefined"
    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200"
  >
    <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
    Sin datos
  </span>
  <span
    v-else-if="isUp"
    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
  >
    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
    Activo
  </span>
  <span
    v-else
    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200"
  >
    <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
    Caído
  </span>
</template>
