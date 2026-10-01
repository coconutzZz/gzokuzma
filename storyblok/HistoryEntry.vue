<template>
  
<!-- Timeline Item -->
    <div class="relative md:flex md:odd:flex-row-reverse mt-4 py-2">
        <!-- Icon -->
        <div class="absolute left-0 top-2 md:left-1/2 md:-translate-x-1/2 flex font-bold justify-center items-center text-sm md:text-base w-24 md:w-28 h-10 px-1 whitespace-nowrap rounded-full bg-slate-300">
            {{ historyEntry.year }}
        </div>
        <!-- Card -->
        <div class="ml-28 md:ml-0 md:w-[calc(50%-4rem)] px-2 md:px-4 min-w-0 break-words">
            <div class="font-bold text-xl md:text-3xl text-primary-500 mb-2">{{ historyEntry.title }}</div>
            <p v-if="historyEntry.description.type === 'text'" class="whitespace-pre-line">{{ historyEntry.description.value }}</p>
            <div v-else v-html="resolvedRichText" />
            <Gallery v-if="historyEntry.images?.length" :images="historyEntry.images" />
            <HistoryGallery v-else-if="historyEntry.gallerySlug" :key="historyEntry.gallerySlug" :slug="historyEntry.gallerySlug" />
        </div>
    </div>
</template>
<script setup lang="ts">

import type { HistoryEntryData, StoryblokHistoryEntry } from '~/types/history'
import { normalizeHistoryEntry } from '~/utils/history-entry'
import { renderRichText } from '@storyblok/vue'

const props = defineProps<{
  entry?: HistoryEntryData
  blok?: StoryblokHistoryEntry
  postedOn?: string
  tagList?: string[]
}>()
const historyEntry = computed(() => props.entry ?? normalizeHistoryEntry(props.blok ?? {}, 'history-entry'))
const resolvedRichText = computed(() => historyEntry.value.description.type === 'richtext'
  ? renderRichText(historyEntry.value.description.value)
  : '')
</script>

<style lang="scss" scoped>
.embla {
  --slide-height: 15em;
}
</style>
