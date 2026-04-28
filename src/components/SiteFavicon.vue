<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  url: { type: String, required: true },
  size: { type: Number, default: 20 },
})

const failed = ref(false)

const faviconUrl = computed(() => {
  try {
    const domain = new URL(props.url).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
  } catch {
    return null
  }
})

const initial = computed(() => {
  try {
    return new URL(props.url).hostname.replace('www.', '')[0].toUpperCase()
  } catch {
    return '?'
  }
})
</script>

<template>
  <div
    class="rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0"
    :style="{ width: `${size + 16}px`, height: `${size + 16}px` }"
  >
    <img
      v-if="faviconUrl && !failed"
      :src="faviconUrl"
      :width="size"
      :height="size"
      :alt="initial"
      @error="failed = true"
    />
    <span v-else class="text-xs font-semibold text-gray-500">{{ initial }}</span>
  </div>
</template>
