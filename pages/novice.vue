<template>
  <div class="px-5">
    <SectionTitle>Aktualno</SectionTitle>

    <div class="hidden sm:block">        
      <button v-for="tag in tags" :key="tag.name" type="button"
        :aria-pressed="selectedTags.has(tag.name)"
        @click="toggleTag(tag.name)"
        class="mx-1 mt-4"
        :class="[
        'inline-flex items-center sm:gap-1.5 cursor-pointer text-sm px-3 py-1 rounded-full transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
        selectedTags.has(tag.name) 
          ? 'bg-blue-600 text-white shadow-sm' 
          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
        ]">
        #{{ tag.name }} ({{ tag.taggings_count }})
      </button>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 my-5 sm:gap-5 md:my-16">
      <NewsCards :with-tag="withTag" priority-image />
    </div>
  </div>
</template>
 
<script setup>
usePageSeo({
  title: 'Novice',
  description: 'Aktualne novice, dogodki in dejavnosti Gasilske zveze Občine Kuzma in lokalnih gasilskih društev.'
})

import NewsCards from '~/components/news/NewsCards.vue'
import { useNewsFilters } from '~/composables/useNewsFilters'
const version = import.meta.env.DEV ? 'draft' : 'published'
const storyblokApi = useStoryblokApi()

const { selectedTags, withTag, toggleTag } = useNewsFilters()
const tags = ref([]);

defineProps({ blok: Object });

onBeforeMount(async () => {
  await loadTags();
});

const loadTags = async () => {
  const { data } = await storyblokApi.get('cdn/tags', {
    version    
  });
  tags.value = data.tags;
}

</script>
