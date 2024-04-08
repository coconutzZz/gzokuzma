<template>
  <header class="mx-auto landscape:p-3 py-4 px-4 sm:px-6 lg:px-8 flex justify-center bg-[#273373] border-b-red-700 border-b-4">
    <NuxtLink to="/">
      <img src="/assets/img/gzo-znak.png" class="h-40 landscape:h-40 mr-3 sm:h-40" />
    </NuxtLink>
    <nav v-if="headerMenu">
        <ul class="flex space-x-8 text-lg font-bold">
          <li v-for="blok in headerMenu" :key="blok._uid">
            <NuxtLink :to="`/${(blok.link.url.length > 0 ? blok.link.url : blok.link.cached_url)}`" class="hover:text-[#50b0ae]">
              {{ blok.link.story.name }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
  </header>
</template>
<script setup>
const storyblokApi = useStoryblokApi()
const { data } = await storyblokApi.get('cdn/stories/config', {
  version: 'draft',
  resolve_links: 'url',
})
 
const headerMenu = ref(null)
headerMenu.value = data.story.content.header_menu
</script>
 