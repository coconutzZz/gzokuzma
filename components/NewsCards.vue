<template>
  <div v-for="article in articles" :key="isLoading ? article : article.uuid">
    <div class="shadow-lg rounded-b-lg">
      <div class="relative overflow-hidden rounded-t-lg group">
        <div v-if="isLoading" class="w-full h-40 object-cover rounded-t-lg animate-pulse bg-gray-300"></div>
        <NuxtLink v-else-if="article.content.image && article.content.image.filename" :to="`/novice/${article.slug}`">
          <img :src="article.content.image.filename" alt="News" 
          class="w-full h-40 object-cover transform transition-transform duration-300 ease-out group-hover:scale-110">
          <!-- <div class="hover:bg-transparent transition duration-300 absolute bottom-0 top-0 right-0 left-0 bg-gray-900 opacity-25 rounded-t-lg">
          </div> -->
        </NuxtLink>
      </div>
      <div class="px-6 py-4 mb-auto">
        <template v-if="isLoading">
          <div class="w-[50%] h-5 animate-pulse bg-gray-300"></div>
        </template>
        <template v-else>
          <NuxtLink :to="`/novice/${article.slug}`"
              class="font-medium text-lg inline-block transition duration-500 ease-in-out mb-2">
            <h3>{{ article.content.title }}</h3>
          </NuxtLink>
          <p class="text-gray-500 text-sm">
            {{ article.content.teaser }}
          </p>
        </template>
      </div>
      <div class="px-6 py-3 flex flex-row items-center justify-between bg-gray-100 rounded-b-lg">
          <span v-if="!isLoading" href="#" class="py-1 text-xs font-regular text-gray-900 mr-1 flex flex-row items-center">
              {{ formatPostedOn(article.created_at) }}
          </span>

          <span v-if="!isLoading" class="py-1 text-xs font-regular text-gray-900 mr-1">                
              <span class="ml-1">{{ article.content.author }}</span>
          </span>
      </div>
    </div>
  </div>
</template>
<script setup>
import { DateTime } from "luxon";

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

const formatPostedOn = (date) => {
  const now = DateTime.now();
  const then = DateTime.fromISO(date);

  const diff = now.diff(then, ['minutes']).minutes;

  return diff < 30 ? `${Math.round(diff)} minutes ago` : then.setLocale("sl-si").toLocaleString(DateTime.DATE_MED);
}
</script>