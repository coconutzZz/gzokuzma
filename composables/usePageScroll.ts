import { computed, inject, onBeforeUnmount, onMounted, provide, readonly, ref } from 'vue'
import type { ComputedRef, InjectionKey, Ref } from 'vue'

interface PageScroll {
  scrollY: Readonly<Ref<number>>
  direction: Readonly<Ref<'up' | 'down' | null>>
  isPastThreshold: ComputedRef<boolean>
  scrollToTop: () => void
}

const pageScrollKey: InjectionKey<PageScroll> = Symbol('page-scroll')

export function providePageScroll(threshold = 100) {
  const scrollY = ref(0)
  const direction = ref<'up' | 'down' | null>(null)

  function updateScrollPosition() {
    const nextY = Math.max(0, window.scrollY)
    direction.value = nextY > scrollY.value ? 'down' : nextY < scrollY.value ? 'up' : null
    scrollY.value = nextY
  }

  const state: PageScroll = {
    scrollY: readonly(scrollY),
    direction: readonly(direction),
    isPastThreshold: computed(() => scrollY.value > threshold),
    scrollToTop: () => window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  provide(pageScrollKey, state)

  onMounted(() => {
    updateScrollPosition()
    window.addEventListener('scroll', updateScrollPosition, { passive: true })
  })

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', updateScrollPosition)
  })
}

export function usePageScroll() {
  const state = inject(pageScrollKey)
  if (!state) {
    throw new Error('usePageScroll requires providePageScroll in an ancestor component')
  }
  return state
}
