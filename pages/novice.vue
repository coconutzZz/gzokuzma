<template>
  <div class="px-5">
    <SectionTitle>Aktualno</SectionTitle>

    <span :to="`/novice?with_tag=${tag.name}`" v-for="tag in tags" :key="tag.name"
      @click="toggleTag(tag.name)"
      class="mx-1 mt-4"
      :class="[
      'inline-flex items-center sm:gap-1.5 cursor-pointer text-sm px-3 py-1 rounded-full transition-all duration-200',
      selectedTags.has(tag.name) 
        ? 'bg-blue-600 text-white shadow-sm' 
        : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      ]">
      #{{ tag.name }} ({{ tag.taggings_count }})
    </span>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 my-5 sm:gap-5 md:my-16">
      <NewsCards :with-tag="withTag"/>
    </div>
  </div>
</template>
 
<script setup>
import NewsCards from '~/components/NewsCards.vue'
const version = import.meta.env.DEV ? 'draft' : 'published'
const route = useRoute();
const storyblokApi = useStoryblokApi()

const selectedTags = ref(new Set(route.query.with_tag ? [route.query.with_tag] : []));
const tags = ref([]);

const withTag = computed(() => Array.from(selectedTags.value).join(','));

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

const toggleTag = (tagName) => {
  if (selectedTags.value.has(tagName)) {
    selectedTags.value.delete(tagName);
  } else {
    selectedTags.value.add(tagName);
  }
};

</script>
