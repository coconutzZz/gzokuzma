<template>
  <NuxtLink
    v-if="to"
    :to="to"
    :class="buttonClasses"
  >
    <slot />
  </NuxtLink>
  <button v-else :class="buttonClasses">
    <slot />
  </button>
</template>

<script setup>
import { NuxtLink } from '#components'

const buttonClasses = 'inline-block bg-secondary text-white font-bold rounded-full mt-4 lg:mt-0 py-2 px-4 md:py-4 md:px-8 shadow opacity-75 focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out'

defineProps({
  to: {
    type: [String, Object],
    default: null
  }
})
</script>
