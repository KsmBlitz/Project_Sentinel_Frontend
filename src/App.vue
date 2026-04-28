<template>
  <div class="min-h-screen bg-gray-50 text-gray-900">
    <header class="border-b border-gray-200 bg-white shadow-sm">
      <div class="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
        <div class="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center">
          <span class="text-xs font-bold text-white">S</span>
        </div>
        <span class="text-lg font-semibold tracking-tight">Sentinel</span>
        <span class="text-xs text-gray-400 ml-auto">Monitor de disponibilidad</span>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-8">
      <RouterView />
    </main>
  </div>
</template>
