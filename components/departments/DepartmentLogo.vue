<template>
  <AppImage
    :src="getDepartmentImage(departmentSlug)"
    :class="[height, 'object-contain']"
    aspect-ratio="1"
    loading="eager"
    placeholder="/img/pgddefault.png"
    placeholder-background="transparent"
    :alt="departmentName ? `Logotip ${departmentName}` : 'Logotip društva'"
  />
</template>

<script setup lang="ts">
defineProps({
  height: {
    // Tailwind height classes, including responsive variants.
    type: String,
    default: 'h-20'
  },
  departmentSlug: {
    type: String,
    default: ''
  },
  departmentName: {
    type: String,
    default: ''
  }
})

const getDepartmentImage = useDepartmentImage()
</script>
