<template>
  <component :is="titleTag" class="w-full my-2 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight"
    :class="{ 'text-center': textCenter }">
    <slot />
  </component>
  <div class="w-full mt-2 mb-2">
    <div class="h-1 gradient2 w-64 opacity-50 my-0 py-0 rounded-t" 
    :class="{ 'mx-auto': textCenter }"/>
  </div>
</template>
<script setup>
defineProps({
  titleTag: {
    type: String,
    default: "h2"
  },
  textCenter: {
    type: Boolean,
    default: true
  }
})
</script>