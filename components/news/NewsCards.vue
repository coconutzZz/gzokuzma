<template>
  <NewsCard v-for="(article, index) in articles"
    :key="isLoading ? index : article.uuid"
    :article="article"
    :priority="priorityImage && index === priorityImageIndex"
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
  },
  priorityImage: {
    type: Boolean,
    default: false
  }
});

const articles = ref(new Array(props.count));
const currentPage = ref(0);
const hasMore = ref(false);
const isLoadingMore = ref(false);
const loadError = ref('');
let requestId = 0;

const priorityImageIndex = computed(() => articles.value.findIndex(article => article?.content?.image?.filename));

watch(() => [props.withTag, props.byAuthor, props.count], async () => {
  await loadArticles();
});

onBeforeUnmount(() => {
  requestId++;
});

const fetchArticles = async (page) => {
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

  const { data, total } = await storyblokApi.get('cdn/stories', {...req, filter_query});
  return { articles: data.stories, total };
}

const applyPage = (result, page, append = false) => {
  articles.value = append ? [...articles.value, ...result.articles] : result.articles;
  currentPage.value = page;
  hasMore.value = Number.isFinite(result.total)
    ? articles.value.length < result.total
    : result.articles.length === props.count;
}

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

  try {
    const result = await fetchArticles(page);
    if (id !== requestId) return;

    applyPage(result, page, append);
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

// Include the first page in SSR and reuse its payload during hydration.
const { data: initialPage, error: initialError, status: initialStatus } = await useAsyncData(
  `news:${JSON.stringify([version, props.count, props.withTag, props.byAuthor])}`,
  () => fetchArticles(1)
);

// A filtered URL can fetch after hydration when its key is absent from the
// prerendered payload. Follow that result as well as immediately cached data.
watch([initialPage, initialError, initialStatus], ([result, error, status]) => {
  if (requestId !== 0) return;
  if (result) {
    applyPage(result, 1);
  } else {
    articles.value = status === 'error' ? [] : new Array(props.count);
  }
  loadError.value = error ? 'Novic trenutno ni mogoče naložiti.' : '';
  isLoading.value = status === 'pending' || status === 'idle';
}, { immediate: true });
</script>
