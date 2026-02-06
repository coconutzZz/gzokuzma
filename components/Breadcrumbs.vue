<template>
  <nav class="text-sm my-4 text-gray-600 space-x-2">
    <NuxtLink to="/" class="hover:underline">Domov</NuxtLink>
    <span>/</span>
    <template v-for="(crumb, index) in breadcrumbs" :key="index">
      <NuxtLink
        :to="crumb.path"
        class="hover:underline"
        v-if="index !== breadcrumbs.length - 1"
      >
        {{ crumb.name }}
      </NuxtLink>
      <span v-else class="font-semibold">{{ crumb.name }}</span>
      <span v-if="index !== breadcrumbs.length - 1">/</span>
    </template>
  </nav>
</template>
<script setup>
import { computed } from 'vue'
const route = useRoute()

const breadcrumbs = computed(() => {
  const segments = route.path.split('/').filter(Boolean)
  let path = ''
  return segments.map((segment, index) => {
    path += `/${segment}`
    return {
      name: decodeURIComponent(segment.replace(/-/g, ' ')),
      path,
    }
  })
})
</script>
