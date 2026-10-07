import { inject, onBeforeUnmount, onMounted, provide, readonly, shallowRef } from 'vue'
import type { InjectionKey, Ref } from 'vue'

export interface FloatingAction {
  id: string
  label: string
  icon?: string
  mobileOnly?: boolean
  isAvailable?: () => boolean
  onClick: () => void
}

interface FloatingActions {
  actions: Readonly<Ref<readonly FloatingAction[]>>
  registerAction: (action: FloatingAction) => () => void
}

const floatingActionsKey: InjectionKey<FloatingActions> = Symbol('floating-actions')

export function provideFloatingActions() {
  const actions = shallowRef<FloatingAction[]>([])

  provide(floatingActionsKey, {
    actions: readonly(actions),
    registerAction(action) {
      const entry = { ...action }
      actions.value = [...actions.value.filter(existing => existing.id !== entry.id), entry]

      // An outgoing page must not remove a replacement registered by the next page.
      return () => {
        actions.value = actions.value.filter(existing => existing !== entry)
      }
    }
  })
}

export function useFloatingActions() {
  const registry = inject(floatingActionsKey)
  if (!registry) {
    throw new Error('useFloatingActions requires provideFloatingActions in an ancestor component')
  }

  return {
    actions: registry.actions,
    registerAction(action: FloatingAction) {
      let unregister: (() => void) | undefined
      onMounted(() => {
        unregister = registry.registerAction(action)
      })
      onBeforeUnmount(() => {
        unregister?.()
      })
    }
  }
}
