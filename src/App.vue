<template>
  <div class="min-h-screen bg-gray-950 text-gray-100">
    <header class="border-b border-gray-800 bg-gray-900">
      <div class="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
        <div class="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center">
          <span class="text-xs font-bold text-gray-950">S</span>
        </div>
        <span class="text-lg font-semibold tracking-tight">Sentinel</span>
        <span class="text-xs text-gray-500 ml-auto">Monitor de disponibilidad</span>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-8">
      <RouterView />
    </main>
  </div>
</template>
