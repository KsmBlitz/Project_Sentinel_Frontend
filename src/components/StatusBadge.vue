<script setup>
defineProps({
  isUp: { type: Boolean, default: null },
})
</script>

<template>
  <span
    v-if="isUp === null || isUp === undefined"
    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-400"
  >
    <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
    Sin datos
  </span>
  <span
    v-else-if="isUp"
    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-900/50 text-emerald-400"
  >
    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
    Activo
  </span>
  <span
    v-else
    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-900/50 text-red-400"
  >
    <span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>
    Caído
  </span>
</template>
