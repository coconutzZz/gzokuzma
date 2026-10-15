<script setup lang="ts">
import type { DepartmentAsset } from '~/types/departments'
import { useImageLightbox } from '~/composables/useImageLightbox'

const props = withDefaults(defineProps<{
  image?: DepartmentAsset
  departmentName?: string
  isLoading?: boolean
}>(), { departmentName: '', isLoading: false })
const { openLightbox } = useImageLightbox(() => props.image?.filename ? [props.image] : [])
</script>

<template>
  <div class="mt-4 sm:mt-8">
    <div v-if="isLoading" class="w-full h-72 object-cover sm:rounded-xl animate-pulse bg-gray-300" aria-hidden="true"></div>
    <a v-else-if="image?.filename" :href="image.filename"
      class="block sm:rounded-xl cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      :aria-label="`Odpri fotografijo: ${image.alt || departmentName || 'Društvo'}`"
      aria-haspopup="dialog" @click="openLightbox">
      <AppImage :src="image.filename" :alt="image.alt || departmentName"
        class="sm:rounded-xl w-full h-72 object-cover"
        sizes="100vw md:50vw lg:640px" loading="eager" fetchpriority="high" />
    </a>
  </div>
</template>
