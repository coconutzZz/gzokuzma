<template>
  <div v-if="isDev" class="fixed bottom-4 right-4 bg-black text-white text-sm px-3 py-1 rounded z-50">
    <span class="block sm:hidden">xs (&lt;640px)</span>
    <span class="hidden sm:block md:hidden">sm (≥640px)</span>
    <span class="hidden md:block lg:hidden">md (≥768px)</span>
    <span class="hidden lg:block xl:hidden">lg (≥1024px)</span>
    <span class="hidden xl:block 2xl:hidden">xl (≥1280px)</span>
    <span class="hidden 2xl:block">2xl (≥1536px)</span>
  </div>
</template>
<script setup>
const isDev = import.meta.dev
</script>