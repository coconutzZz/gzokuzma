<template>
  <ClientOnly>
    <!-- Container for the inline gallery -->
    <div ref="containerRef" class="inline-gallery h-[350px] sm:h-[600px]"></div>
  </ClientOnly>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount, nextTick } from 'vue'

// Import LightGallery core and plugins
import lightGallery from 'lightgallery'
import lgThumbnail from 'lightgallery/plugins/thumbnail'

// Props
const props = defineProps({
  images: {
    type: Array,
    required: true,
    default: () => []
  },
  plugins: {
    type: Array,
    default: () => [lgThumbnail]
  },
  showMaximizeIcon: { type: Boolean, default: true },
  closable: { type: Boolean, default: false },
  download: { type: Boolean, default: false }
})

const containerRef = ref(null)
let lgInstance = null

// Initialize LightGallery after the container and images exist
const initGallery = async () => {
  await nextTick()
  if (!containerRef.value || !props.images.length) return

  // Destroy previous instance if exists
  if (lgInstance) lgInstance.destroy()

  lgInstance = lightGallery(containerRef.value, {
    dynamic: true,
    dynamicEl: props.images
      .filter(img => img?.filename)
      .map(img => ({
        src: img.filename,
        thumb: img.filename,
        subHtml: img.caption || ''
      })),
    container: containerRef.value, // inline container
    plugins: props.plugins,
    closable: props.closable,
    download: props.download,
    showMaximizeIcon: props.showMaximizeIcon,
    backgroundColor: "#FFF",
    controls: false,
    counter: false
  })

  // Open the gallery inline
  if (props.images.length) lgInstance.openGallery(0)
}

onMounted(() => {
  initGallery()
})

// Re-init if images change (async support)
watch(
  () => props.images,
  () => {
    initGallery()
  },
  { deep: true }
)

onBeforeUnmount(() => {
  if (lgInstance) lgInstance.destroy()
})
</script>

<style>
.inline-gallery {
  width: 100%;
}
.lg-backdrop,
.lg-outer .lg-thumb-outer {
  background-color: #f5f5f5;
}
</style>
