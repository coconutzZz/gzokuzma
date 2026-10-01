<template>
  <div v-editable="blok" class="pt-5">
    <div class="flex justify-end">
      <DropdownButton
        v-model="sortOrder"
        :items="[
          { value: 'desc', title: 'novejši naprej' },
          { value: 'asc', title: 'starejši naprej' }
        ]"
        prefix="Razvrsti po: "
        @change="handleChange"
      />
    </div>
    <p v-if="!hasInlineEntries && status === 'pending'" role="status" class="py-4">Nalaganje zgodovine...</p>
    <div v-else-if="!hasInlineEntries && error" role="alert" class="py-4">
      <p>Zgodovine trenutno ni mogo&#269;e nalo&#382;iti.</p>
      <button type="button" class="mt-2 text-primary-500 underline" @click="refresh()">Poskusi znova</button>
    </div>
    <div v-else-if="entries.length" class="space-y-0 md:space-y-8 relative before:absolute before:inset-0 before:ml-12 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1.5 before:bg-gradient-to-b before:from-slate-100 before:via-slate-300 before:to-slate-100">      
      <HistoryEntry v-for="entry in entriesSorted" :key="entry.id" :entry="entry" />
    </div>
    <p v-else class="py-4">Zgodovina &#353;e ni na voljo.</p>
  </div>
</template>
<script setup lang="ts">
import type { StoryblokHistory } from '~/types/history'
import { normalizeHistoryEntry } from '~/utils/history-entry'
import DropdownButton from '~/components/DropdownButton.vue'

const sortOrder = ref('desc');

const props = defineProps<{ blok?: StoryblokHistory; postedOn?: string; tagList?: string[] }>()
const route = useRoute()
const department = computed(() => {
  if (!route.path.startsWith('/drustva/')) return undefined
  return Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug
})
const hasInlineEntries = computed(() => Boolean(props.blok?.entries?.length))
const { data, status, error, refresh } = await useHistory(
  department,
  () => !hasInlineEntries.value,
  props.blok?._uid
)
const entries = computed(() => {
  if (hasInlineEntries.value) {
    return (props.blok?.entries ?? []).map((entry, index) => normalizeHistoryEntry(entry, `${props.blok?._uid || 'history'}/${index}`))
  }

  return data.value?.department === department.value ? data.value?.entries ?? [] : []
})

const entriesSorted = computed(() => {
  return sortOrder.value === 'asc' ? entries.value : [...entries.value].reverse()
});

function handleChange(newValue: string) {
  sortOrder.value = newValue;  
}
</script>
