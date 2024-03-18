<template>
  <div class="container mx-auto">
    <div v-if="articles && articles.length > 0" class="flex flex-col p-5 lg:px-48 lg:py-11">
      <h2 class="text-6xl text-[#273373] font-bold text-center mb-12">{{ blok.headline }}</h2>
      <div v-for="article in articles"
          :key="article.uuid" class="bg-gray-100 p-5 mb-10">
          <h2 class="font-bold text-2xl mb-2">{{ article.content.title }}</h2>
          <p class="my-3">{{ article.content.teaser }}</p>
          <a :href="article.full_slug" class="text-white font-semibold bg-[#273373] hover:bg-blue-800 p-2 my-1 rounded">Preberite več</a>
      </div>
    </div>
  </div>
</template>
 
<script setup>
defineProps({ blok: Object })
 
const articles = ref(null)
const storyblokApi = useStoryblokApi()
const { data } = await storyblokApi.get('cdn/stories', {
  version: 'draft',
  starts_with: 'novice'
})
articles.value = data.stories
</script>
