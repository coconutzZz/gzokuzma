<template>
  <NewsCard v-for="(article, index) in articles"
    :key="isLoading ? index : article.uuid"
    :article="article"
    :is-loading="isLoading" />
  <div v-if="!isLoading && (loadError || (paging && hasMore))"
    class="col-span-full flex flex-col items-center gap-3 mt-4">
    <p v-if="loadError" role="alert" class="text-sm text-danger">{{ loadError }}</p>
    <Button type="button" :disabled="isLoadingMore" :aria-busy="isLoadingMore"
      class="disabled:cursor-wait disabled:transform-none"
      @click="loadArticles(currentPage > 0)">
      {{ isLoadingMore ? 'Nalaganje...' : loadError ? 'Poskusi znova' : 'Naloži več' }}
    </Button>
  </div>
</template>
<script setup>
const version = import.meta.env.DEV ? 'draft' : 'published'
const isLoading = ref(true);
const storyblokApi = useStoryblokApi();
const props = defineProps({
  count: {
    type: Number,
    default: 9
  },
  paging: {
    type: Boolean,
    default: true
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
const currentPage = ref(0);
const hasMore = ref(false);
const isLoadingMore = ref(false);
const loadError = ref('');
let requestId = 0;

onBeforeMount(async () => {
  await loadArticles();
});


watch(() => [props.withTag, props.byAuthor, props.count], async () => {
  await loadArticles();
});

onBeforeUnmount(() => {
  requestId++;
});

const loadArticles = async (append = false) => {
  if (append && (isLoading.value || isLoadingMore.value || !hasMore.value)) return;

  const id = ++requestId;
  const page = append ? currentPage.value + 1 : 1;
  loadError.value = '';

  if (append) {
    isLoadingMore.value = true;
  } else {
    isLoading.value = true;
    isLoadingMore.value = false;
    articles.value = new Array(props.count);
    currentPage.value = 0;
    hasMore.value = false;
  }

  let filter_query = {};

  let req = {
    version,
    starts_with: 'novice',
    sort_by: "created_at:desc",
    per_page: props.count,
    page,
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

  try {
    const { data, total } = await storyblokApi.get('cdn/stories', {...req, filter_query});
    if (id !== requestId) return;

    articles.value = append ? [...articles.value, ...data.stories] : data.stories;
    currentPage.value = page;
    hasMore.value = Number.isFinite(total)
      ? articles.value.length < total
      : data.stories.length === props.count;
  } catch {
    if (id !== requestId) return;
    if (!append) articles.value = [];
    loadError.value = 'Novic trenutno ni mogoče naložiti.';
  } finally {
    if (id === requestId) {
      isLoading.value = false;
      isLoadingMore.value = false;
    }
  }
}
</script>
