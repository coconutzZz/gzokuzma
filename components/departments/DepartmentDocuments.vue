<script setup lang="ts">
import type { DownloadableAsset } from '~/server/types/supabase'

withDefaults(defineProps<{
  files: readonly DownloadableAsset[]
  isLoading?: boolean
  hasError?: boolean
}>(), { isLoading: false, hasError: false })
defineEmits<{ retry: [] }>()
</script>

<template>
  <section v-if="isLoading || hasError || files.length" class="mt-4 px-6 sm:px-2 md:col-span-2" :aria-busy="isLoading">
    <h2 class="text-2xl font-semibold">Dokumenti</h2>
    <p v-if="isLoading" role="status">Nalaganje dokumentov...</p>
    <div v-else-if="hasError" role="alert">
      <p>Dokumentov trenutno ni mogoče naložiti.</p>
      <Button type="button" @click="$emit('retry')">Poskusi znova</Button>
    </div>
    <ul v-else>
      <li v-for="file in files" :key="file.id">
        <a class="text-blue-600 hover:underline" :href="file.url" :title="file.name" target="_blank" rel="noopener noreferrer">{{ file.name }}</a>
      </li>
    </ul>
  </section>
</template>
