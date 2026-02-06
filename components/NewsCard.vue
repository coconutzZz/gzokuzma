<template>
  <div>
    <div class="shadow-lg rounded-b-lg flex flex-row  md:flex-col">
      <div class="w-1/2 sm:w-1/3 md:w-full relative overflow-hidden rounded-l-lg md:rounded-l-none md:rounded-t-lg group">
          <div v-if="isLoading" class="w-full h-40 object-cover md:rounded-t-lg animate-pulse bg-gray-300"></div>
          <NuxtLink v-else-if="article.content.image && article.content.image.filename" :to="`/novice/${article.slug}`">
              <img :src="article.content.image.filename" alt="News" 
              class="w-full h-40 object-cover transform transition-transform duration-300 ease-out group-hover:scale-110">
          </NuxtLink>
      </div>
      <div class="w-1/2 sm:w-2/3 md:w-full">
        <div class="max-h-[160px] px-2 py-4 sm:px-4 md:py-2 lg:px-6 lg:py-4 mb-auto">
            <template v-if="isLoading">
              <div class="w-[50%] h-5 animate-pulse bg-gray-300"></div>
            </template>
            <template v-else>
                <NuxtLink :to="`/novice/${article.slug}`"
                    class="font-medium text-secondary text-sm sm:text-lg inline-block transition duration-500 ease-in-out mb-2">
                  {{ article.content.title }}
                </NuxtLink>
                <p class="text-gray-500 text-xs sm:text-sm overflow-hidden line-clamp-[5]">
                  {{ article.content.teaser }}
                </p>
            </template>
        </div>
        <div class="hidden px-6 py-3 md:flex flex-row items-center justify-between bg-gray-100 rounded-b-lg">
            <span v-if="!isLoading" href="#" class="py-1 text-xs font-regular text-gray-900 mr-1 flex flex-row items-center">
                {{ formatPostedOn(article.created_at) }}
            </span>
      
            <span v-if="!isLoading" class="py-1 text-xs font-regular text-gray-900 mr-1">                
                <span class="ml-1">{{ article.content.author }}</span>
            </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { DateTime } from "luxon";

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: true   
  },
  article: {
    required: true
  },
  paging: {
    type: Boolean,
    default: true
  }
});

const formatPostedOn = (date) => {
  const now = DateTime.now();
  const then = DateTime.fromISO(date);

  const diff = now.diff(then, ['minutes']).minutes;

  return diff < 30 ? `${Math.round(diff)} minutes ago` : then.setLocale("sl-si").toLocaleString(DateTime.DATE_MED);
}
</script>