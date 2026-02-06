<template>
  <NewsCard v-for="article in articles" 
    :key="isLoading ? article : article.uuid" 
    :article="article" 
    :is-loading="isLoading" />
</template>
<script setup>
const isLoading = ref(true);
const storyblokApi = useStoryblokApi()
const props = defineProps({
  count: {
    type: Number,
    default: 6   
  },
  withTag: {
    type: String,
    default: ""
  },
  byAuthor: {
    type: String,
    default: null
  }
});

const articles = ref(new Array(props.count));

onBeforeMount(async () => {
  await loadArticles();
});


watch(() => props.withTag, async () => {
  isLoading.value = true;
  await loadArticles();
});

const loadArticles = async () => {
  let filter_query = {};

  let req = {
    version: 'draft',
    starts_with: 'novice',
    sort_by: "created_at:desc",
    per_page: props.count,
    page: 1,
    with_tag: props.withTag        
  }

  if (props.byAuthor) {
    filter_query = {
      ...filter_query, 
      'author': {
        in: props.byAuthor
      }
    }
  }

  const { data } = await storyblokApi.get('cdn/stories', {...req, filter_query});
  articles.value = data.stories;
  isLoading.value = false;
}
</script>