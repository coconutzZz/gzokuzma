import { onBeforeUnmount } from 'vue'

// Locks belong to the browser document, including when dialogs overlap.
const locks = new WeakMap<HTMLElement, { owners: Set<symbol>; wasLocked: boolean }>()

export function useScrollLock() {
  const owner = Symbol('scroll-lock')
  let body: HTMLElement | undefined

  function lock() {
    if (body || typeof document === 'undefined') return
    body = document.body
    const state = locks.get(body) ?? {
      owners: new Set<symbol>(),
      wasLocked: body.classList.contains('overflow-hidden'),
    }
    state.owners.add(owner)
    locks.set(body, state)
    body.classList.add('overflow-hidden')
  }

  function unlock() {
    if (!body) return
    const state = locks.get(body)
    if (state) {
      state.owners.delete(owner)
      if (!state.owners.size) {
        if (!state.wasLocked) body.classList.remove('overflow-hidden')
        locks.delete(body)
      }
    }
    body = undefined
  }

  onBeforeUnmount(unlock)
  return { lock, unlock }
}
