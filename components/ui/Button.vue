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
import { computed } from 'vue'
import { NuxtLink } from '#components'

const props = defineProps({
  to: {
    type: [String, Object],
    default: null
  },
  primary: {
    type: Boolean,
    default: false
  },
  rounded: {
    type: Boolean,
    default: true
  }
})

const buttonClasses = computed(() => [
  'inline-block text-white font-bold mt-4 lg:mt-0 py-2 px-4 md:py-4 md:px-8 shadow opacity-75 focus:outline-none focus:shadow-outline transform transition hover:scale-105 hover:brightness-110 duration-300 ease-in-out',
  props.primary ? 'bg-primary-500' : 'bg-secondary',
  props.rounded ? 'rounded-full' : 'rounded'
])
</script>
