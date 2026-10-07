<template>
  <div class="relative pl-4">
    <div class="absolute inset-y-0 left-0 w-1 rounded-full bg-red-600"></div>
    <div class="text-3xl font-black uppercase leading-none tracking-tight text-gray-900 md:text-4xl">
    {{ blok.title }}
    </div>
    <p class="mt-2 text-sm font-medium leading-relaxed">
    {{ blok.short_text }}
    </p>
</div>
</template>
 
<script setup>
defineProps({ blok: Object });
</script>
