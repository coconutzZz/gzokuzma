<template>
  <div v-for="article in articles" :key="isLoading ? article : article.uuid">
    <div class="shadow-lg rounded-b-lg">

      <div class="relative">
        <div v-if="isLoading" class="w-full h-40 object-cover rounded-t-lg animate-pulse bg-gray-300"></div>
        <img v-else-if="article.content.image && article.content.image.filename" :src="article.content.image.filename" alt="News" 
        class="w-full h-40 object-cover rounded-t-lg">
        <div class="hover:bg-transparent transition duration-300 absolute bottom-0 top-0 right-0 left-0 bg-gray-900 opacity-25 rounded-t-lg">
        </div>        
      </div>
      <div class="px-6 py-4 mb-auto">
        <template v-if="isLoading">
          <div class="w-[50%] h-5 animate-pulse bg-gray-300"></div>
        </template>
        <template v-else>
          <a :href="article.full_slug"
              class="font-medium text-lg inline-block transition duration-500 ease-in-out mb-2">
            <h3>{{ article.content.title }}</h3>
          </a>
          <p class="text-gray-500 text-sm">
            {{ article.content.teaser }}
          </p>
        </template>
      </div>
      <div class="px-6 py-3 flex flex-row items-center justify-between bg-gray-100 rounded-b-lg">
          <span v-if="!isLoading" href="#" class="py-1 text-xs font-regular text-gray-900 mr-1 flex flex-row items-center">
              <svg height="13px" width="13px" version="1.1" id="Layer_1"
                  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px"
                  y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;"
                  xml:space="preserve">
                  <g>
                      <g>
                          <path
                              d="M256,0C114.837,0,0,114.837,0,256s114.837,256,256,256s256-114.837,256-256S397.163,0,256,0z M277.333,256 c0,11.797-9.536,21.333-21.333,21.333h-85.333c-11.797,0-21.333-9.536-21.333-21.333s9.536-21.333,21.333-21.333h64v-128 c0-11.797,9.536-21.333,21.333-21.333s21.333,9.536,21.333,21.333V256z">
                          </path>
                      </g>
                  </g>
              </svg>
              <span class="ml-1">{{ formatPostedOn(article.created_at) }}</span>
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
  with_tag: {
    type: String,
    default: ""
  }
});

const articles = ref(new Array(props.count));

onBeforeMount(async () => {
  await loadArticles();
});

watch(() => props.with_tag, async () => {
  isLoading.value = true;
  await loadArticles();
});

const loadArticles = async () => {
  const { data } = await storyblokApi.get('cdn/stories', {
    version: 'draft',
    starts_with: 'novice',
    sort_by: "created_at:desc",
    per_page: props.count,
    page: 1,
    with_tag: props.with_tag
  });
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