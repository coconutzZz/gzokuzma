<template>
  <div
    v-show="status !== 'success' || images.length"
    ref="placeholder"
    class="history-gallery mt-3"
    :data-history-gallery="slug"
    :aria-busy="status === 'pending'"
  >
    <Gallery v-if="status === 'success' && images.length" :images="images" />
    <div v-else class="aspect-[4/3] flex items-center justify-center bg-slate-50 rounded-lg text-sm text-center p-3">
      <p v-if="status === 'pending'" role="status">Nalaganje fotografij...</p>
      <div v-else-if="status === 'error'" role="alert">
        <p>Fotografij trenutno ni mogo&#269;e nalo&#382;iti.</p>
        <button type="button" class="mt-2 text-primary-500 underline" @click="load">Poskusi znova</button>
      </div>
      <button v-else-if="!canObserve" type="button" class="text-primary-500 underline" @click="load">
        Prika&#382;i fotografije
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HistoryImage } from '~/types/history'

const props = defineProps<{ slug: string }>()
const loadGallery = useHistoryGallery()
const placeholder = ref<HTMLElement>()
const images = ref<HistoryImage[]>([])
const status = ref<'idle' | 'pending' | 'success' | 'error'>('idle')
const canObserve = ref(true)
let observer: IntersectionObserver | undefined
let generation = 0
let mounted = false

async function load() {
  if (status.value === 'pending' || status.value === 'success') return

  observer?.disconnect()
  status.value = 'pending'
  const requestGeneration = generation
  try {
    const result = await loadGallery(props.slug)
    if (!mounted || requestGeneration !== generation) return
    images.value = result
    status.value = 'success'
  } catch {
    if (mounted && requestGeneration === generation) status.value = 'error'
  }
}

function observe() {
  if (!mounted || !placeholder.value) return
  canObserve.value = typeof IntersectionObserver !== 'undefined'
  if (!canObserve.value) return

  observer = new IntersectionObserver((entries) => {
    if (entries.some(entry => entry.isIntersecting)) void load()
  }, { rootMargin: '0px', threshold: 0.01 })
  observer.observe(placeholder.value)
}

onMounted(() => {
  mounted = true
  observe()
})

watch(() => props.slug, async () => {
  generation++
  observer?.disconnect()
  images.value = []
  status.value = 'idle'
  await nextTick()
  observe()
})

onBeforeUnmount(() => {
  mounted = false
  generation++
  observer?.disconnect()
})
</script>

<style scoped>
.history-gallery :deep(.embla__viewport) {
  aspect-ratio: 4 / 3;
}

.history-gallery :deep(.embla__container),
.history-gallery :deep(.embla__slide__wrapper) {
  height: 100%;
}

.history-gallery :deep(.embla__slide__wrapper) {
  width: 100%;
}

.history-gallery :deep(.glightbox) {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.history-gallery :deep(.glightbox .app-image) {
  flex: 1;
  min-height: 0;
  width: 100%;
  object-fit: contain;
}

.history-gallery :deep(.embla-thumbs .app-image) {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

.history-gallery :deep(.embla-thumbs__slide) {
  min-width: 44px;
}

.history-gallery :deep(.embla-thumbs button) {
  width: 100%;
  min-height: 44px;
}
</style>
