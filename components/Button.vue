<template>
  <component
    :is="to ? NuxtLink : 'button'"
    :to="to"
    class="inline-block bg-secondary text-white font-bold rounded-full mt-4 lg:mt-0 py-4 px-8 shadow opacity-75 focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
  >
    <slot />
  </component>
</template>

<script setup>
import { NuxtLink } from '#components'

defineProps({
  to: {
    type: [String, Object],
    default: null
  }
})
</script>
