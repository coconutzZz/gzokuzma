<template>
  <NuxtImg
    :src="getDepartmentImage(departmentSlug)"
    :class="height"
    placeholder="/img/pgddefault.png"
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
