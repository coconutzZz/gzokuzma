<template>
  <component :is="titleTag" class="w-full my-2 text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-center">
    <slot />
  </component>
  <div class="w-full mt-5">
    <div class="h-1 mx-auto gradient2 w-64 opacity-50 my-0 py-0 rounded-t"></div>
  </div>
</template>
<script setup>
defineProps({
  titleTag: {
    type: String,
    default: "h2"
  }
})
</script>