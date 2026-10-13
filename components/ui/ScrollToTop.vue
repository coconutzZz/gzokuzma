<template>
  <Button
    primary
    rounded
    type="button"
    aria-label="Na vrh strani"
    title="Na vrh strani"
    class="!mt-0 !flex h-12 w-12 shrink-0 items-center justify-center !p-0 !opacity-100 !shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
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
  </Button>
</template>

<script setup lang="ts">
import Button from '~/components/ui/Button.vue'
import { usePageScroll } from '~/composables/usePageScroll'

const { scrollToTop } = usePageScroll()
</script>
