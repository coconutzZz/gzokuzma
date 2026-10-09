<template>
  <span
    ref="container"
    class="app-image"
    :class="attrs.class"
    :style="[{ aspectRatio: ratio, '--app-image-placeholder-background': placeholderBackground }, attrs.style]"
    :data-image-state="hasError ? 'error' : isLoaded ? 'loaded' : shouldLoad ? 'loading' : 'waiting'"
    :aria-busy="!isLoaded && !hasError"
  >
    <span
      v-if="preview"
      class="app-image__preview"
      :class="{ 'app-image__preview--hidden': isLoaded }"
      :style="{ backgroundImage: `url(${JSON.stringify(preview)})` }"
      aria-hidden="true"
    />
    <NuxtImg
      v-if="shouldLoad && src"
      :key="imageKey"
      ref="image"
      v-bind="imageAttrs()"
      :src="src"
      :alt="alt"
      :width="dimensions?.width || width"
      :height="dimensions?.height || height"
      :sizes="isStoryblok ? sizes : undefined"
      :densities="densities"
      :provider="isStoryblok ? 'storyblok' : 'none'"
      :modifiers="modifiers"
      :format="format"
      :quality="quality"
      :fit="fit"
      loading="eager"
      decoding="async"
      class="app-image__image"
      :class="{ 'app-image__image--loaded': isLoaded || loading === 'eager' }"
      @load="onLoad"
      @error="onError"
    />
    <span v-if="hasError" class="app-image__error" aria-hidden="true">
      {{ alt || 'Slike ni mogoče naložiti.' }}
    </span>
    <noscript v-html="fallbackHtml" />
  </span>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue'
import { canTransformStoryblokImage, getImageDimensions } from '~/utils/image-source'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  src: string
  alt?: string
  width?: number | string
  height?: number | string
  sizes?: string
  densities?: string
  loading?: 'lazy' | 'eager'
  aspectRatio?: string | number
  placeholder?: string | false
  placeholderBackground?: string
  modifiers?: Record<string, any>
  format?: string
  quality?: string | number
  fit?: string
}>(), { alt: '', sizes: '100vw', loading: 'lazy', quality: 80, format: 'webp', placeholder: '', placeholderBackground: '#e2e8f0' })

const emit = defineEmits<{ load: [event: Event]; error: [event: Event | string] }>()
const attrs = useAttrs()
const img = useImage()
const container = ref<HTMLElement>()
const image = ref<{ imgEl?: HTMLImageElement }>()
const isLoaded = ref(false)
const hasError = ref(false)
const shouldLoad = ref(props.loading === 'eager')
let observer: IntersectionObserver | undefined
let mounted = false
let generation = 0

const isStoryblok = computed(() => canTransformStoryblokImage(props.src))
const dimensions = computed(() => getImageDimensions(props.src, props.width, props.height))
const ratio = computed(() => props.aspectRatio || (dimensions.value
  ? `${dimensions.value.width} / ${dimensions.value.height}`
  : '4 / 3'))
// Browsers parse noscript contents as text when scripting is enabled. v-html
// leaves that content alone during hydration; escape every dynamic attribute.
const fallbackHtml = computed(() => {
  const attributes = {
    src: props.src,
    alt: props.alt,
    width: dimensions.value?.width || props.width,
    height: dimensions.value?.height || props.height,
    loading: props.loading,
    fetchpriority: attrs.fetchpriority
  }
  const escape = (value: string | number) => String(value)
    .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const htmlAttributes = Object.entries(attributes)
    .filter(([, value]) => value !== undefined)
    .map(([name, value]) => `${name}="${escape(value!)}"`).join(' ')
  return `<img ${htmlAttributes} class="app-image__fallback">`
})
const preview = computed(() => {
  if (props.placeholder === false) return
  if (props.placeholder) return props.placeholder
  if (!isStoryblok.value) return

  const height = dimensions.value
    ? Math.max(1, Math.round(32 * dimensions.value.height / dimensions.value.width))
    : 0
  return img(props.src, {
    ...props.modifiers,
    width: 32,
    height,
    quality: 30,
    fit: props.fit,
    filters: { ...props.modifiers?.filters, format: 'webp', quality: 30, blur: 4 }
  }, { provider: 'storyblok' })
})
const imageKey = computed(() => JSON.stringify([
  props.src, props.width, props.height, props.sizes, props.densities,
  props.modifiers, props.format, props.quality, props.fit
]))

function imageAttrs() {
  const { class: _class, style: _style, provider: _provider, ...rest } = attrs
  return rest
}

function observe() {
  observer?.disconnect()
  if (!mounted || shouldLoad.value || !container.value) return
  if (typeof IntersectionObserver === 'undefined') {
    shouldLoad.value = true
    return
  }
  observer = new IntersectionObserver((entries) => {
    if (entries.some(entry => entry.isIntersecting)) {
      shouldLoad.value = true
      observer?.disconnect()
    }
  }, { rootMargin: '200px', threshold: 0 })
  observer.observe(container.value)
}

async function onLoad(event: Event) {
  if (isLoaded.value) return
  const currentGeneration = generation
  const element = image.value?.imgEl
  if (!element?.naturalWidth) return
  try {
    await element.decode?.()
    if (!mounted || generation !== currentGeneration || isLoaded.value) return
    isLoaded.value = true
    hasError.value = false
    emit('load', event)
  } catch {
    if (mounted && generation === currentGeneration) onError(new Event('error'))
  }
}

function onError(event: Event | string) {
  hasError.value = true
  emit('error', event)
}

// NuxtImg only checks cached images during hydration; also handle later mounts.
watch(image, async () => {
  await nextTick()
  if (image.value?.imgEl?.complete && image.value.imgEl.naturalWidth) {
    void onLoad(new Event('load'))
  }
})

watch(imageKey, async () => {
  generation++
  isLoaded.value = false
  hasError.value = false
  shouldLoad.value = props.loading === 'eager'
  await nextTick()
  observe()
})

watch(() => props.loading, () => {
  if (props.loading === 'eager') {
    shouldLoad.value = true
    observer?.disconnect()
  }
})

onMounted(() => {
  mounted = true
  observe()
})

onBeforeUnmount(() => {
  mounted = false
  generation++
  observer?.disconnect()
})
</script>

<style scoped>
.app-image {
  position: relative;
  display: inline-block;
  overflow: hidden;
  vertical-align: middle;
  background-color: var(--app-image-placeholder-background);
}

.app-image[data-image-state='loaded'] {
  background-color: transparent;
}

.app-image__preview,
.app-image__image,
.app-image :deep(.app-image__fallback) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  object-fit: inherit;
  object-position: inherit;
}

.app-image__preview {
  background-position: center;
  background-size: cover;
  transition: opacity 200ms ease;
}

.app-image__preview--hidden {
  opacity: 0;
}

.app-image__image {
  opacity: 0;
  transition: opacity 200ms ease;
}

.app-image__image--loaded {
  opacity: 1;
}

.app-image__error {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  font-size: 0.875rem;
  color: #475569;
  background-color: #e2e8f0;
}

@media (prefers-reduced-motion: reduce) {
  .app-image__image, .app-image__preview { transition: none; }
}
</style>
