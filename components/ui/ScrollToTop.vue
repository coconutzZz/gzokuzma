<template>
  <Transition
    enter-active-class="transition-transform duration-300 ease-out motion-reduce:transition-none"
    leave-active-class="transition-transform duration-300 ease-in motion-reduce:transition-none"
    enter-from-class="translate-y-[calc(100%+5rem+env(safe-area-inset-bottom,0px))] motion-reduce:transform-none"
    leave-to-class="translate-y-[calc(100%+5rem+env(safe-area-inset-bottom,0px))] motion-reduce:transform-none"
  >
    <button
      v-if="isVisible"
      type="button"
      aria-label="Na vrh strani"
      title="Na vrh strani"
      class="fixed right-4 sm:right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      :class="{ 'mb-10': isDev }"
      style="bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px))"
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
  </Transition>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ threshold?: number }>(), {
  threshold: 100
})

const isDev = import.meta.dev
const scrollY = ref(0)
const isVisible = computed(() => scrollY.value > props.threshold)

function updateScrollPosition() {
  scrollY.value = window.scrollY
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  updateScrollPosition()
  window.addEventListener('scroll', updateScrollPosition, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateScrollPosition)
})
</script>
