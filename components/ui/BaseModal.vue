<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { useScrollLock } from '~/composables/useScrollLock'

const model = defineModel<boolean>({ default: false })
withDefaults(defineProps<{ label?: string }>(), { label: 'Pojavno okno' })
const dialog = ref<HTMLDialogElement>()
const { lock, unlock } = useScrollLock()
let opener: HTMLElement | undefined
let pointerStartedOnBackdrop = false
let disposed = false

function restoreFocus() {
  if (opener?.isConnected) opener.focus()
  opener = undefined
}

function close() {
  model.value = false
  dialog.value?.close()
  unlock()
  restoreFocus()
}

function syncClosed() {
  // Ignore a queued close event if the dialog has already reopened.
  if (disposed || dialog.value?.open) return
  model.value = false
  pointerStartedOnBackdrop = false
  unlock()
  restoreFocus()
}

watch([dialog, model], ([element, isOpen]) => {
  if (!element) return
  if (isOpen && !element.open) {
    opener = document.activeElement instanceof HTMLElement ? document.activeElement : undefined
    element.showModal()
    lock()
  } else if (!isOpen && element.open) {
    element.close()
    unlock()
    restoreFocus()
  }
}, { flush: 'post' })

function wrapFocus(event: KeyboardEvent) {
  const controls = [...(dialog.value?.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  ) ?? [])].filter(element => element.tabIndex >= 0 && element.getClientRects().length && !element.closest('[inert]'))
  const first = controls[0]
  const last = controls[controls.length - 1]
  if (!first) {
    event.preventDefault()
    dialog.value?.focus()
  } else if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

function isBackdropEvent(event: MouseEvent) {
  if (event.target !== dialog.value) return false
  const bounds = dialog.value.getBoundingClientRect()
  return event.clientX < bounds.left || event.clientX > bounds.right ||
    event.clientY < bounds.top || event.clientY > bounds.bottom
}

function onBackdropClick(event: MouseEvent) {
  if (pointerStartedOnBackdrop && isBackdropEvent(event)) close()
  pointerStartedOnBackdrop = false
}

onBeforeUnmount(() => {
  disposed = true
  dialog.value?.close()
  unlock()
  restoreFocus()
})
</script>

<template>
    <dialog
      ref="dialog"
      :aria-label="label"
      aria-modal="true"
      tabindex="-1"
      class="base-modal fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto border-0 bg-white p-6 sm:m-auto sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:max-w-lg sm:rounded-xl"
      @cancel.prevent="close"
      @close="syncClosed"
      @keydown.tab="wrapFocus"
      @pointerdown="pointerStartedOnBackdrop = isBackdropEvent($event)"
      @click="onBackdropClick"
    >
      <template v-if="model">
        <slot />
        <ButtonClose type="button" autofocus @click="close" class="absolute top-3 right-3" />
      </template>
    </dialog>
</template>

<style scoped>
.base-modal::backdrop {
  background: rgb(0 0 0 / 0.5);
}
</style>
