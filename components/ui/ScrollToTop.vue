<template>
  <button
    type="button"
    aria-label="Na vrh strani"
    title="Na vrh strani"
    class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
    @click="scrollToTop"
  >
    <svg
      aria-hidden="true"
      class="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="m5 12 7-7 7 7M12 5v14" />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { usePageScroll } from '~/composables/usePageScroll'

const { scrollToTop } = usePageScroll()
</script>
