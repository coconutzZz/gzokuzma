<template>
  <Transition
    enter-active-class="transition-transform transition-opacity duration-300"
    enter-from-class="translate-y-16 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition-transform transition-opacity duration-300"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-16 opacity-0"
  >
    <div
      v-if="isPastThreshold"
      class="fixed right-4 sm:right-6 z-40 flex flex-col items-end gap-3 pointer-events-none"
      :class="{ 'mb-10': isDev }"
      style="bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px))"
    >
      <div class="inline-flex flex-wrap justify-end gap-3 pointer-events-auto">
        <Button
          v-for="action in availableActions"
          :key="action.id"
          type="button"
          class="!mt-0 inline-flex items-center"
          :class="{ 'md:hidden': action.mobileOnly }"
          rounded
          :primary="action.primary"
          @click="action.onClick"
        >
          <NuxtImg v-if="action.icon" :src="action.icon" alt="" class="w-6 h-6"  :class="{ 'mr-2' : action.label != '' }"/>
          {{ action.label }}
        </Button>
      </div>
      <ScrollToTop class="pointer-events-auto" />
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useFloatingActions } from '~/composables/useFloatingActions'
import { usePageScroll } from '~/composables/usePageScroll'

const isDev = import.meta.dev
const { isPastThreshold } = usePageScroll()
const { actions } = useFloatingActions()
const availableActions = computed(() => actions.value.filter(action => action.isAvailable?.() ?? true))
</script>
