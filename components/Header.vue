<template>
  <!--Nav-->
  <nav id="header" :class="isBackgroundVisible ? 'bg-primary-500' : 'bg-none'" class="fixed w-full z-30 top-0 transition-colors duration-700">
    <div class="w-full container mx-auto flex flex-wrap items-center justify-between mt-0 py-2 max-w-screen-2xl md:max-w-screen-xl ">
      <div class="pl-4 flex items-center">
        <NuxtLink to="/" class="toggleColour text-white no-underline hover:no-underline font-bold text-2xl lg:text-4xl">
          <img src="/assets/img/gzo-znak.png" class="h-24"/>
        </NuxtLink>
      </div>
      <div class="block lg:hidden pr-4">
        <button @click="toggleDrawer()" class="flex items-center p-1 text-white hover:text-accent focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out">
          <svg class="fill-current h-6 w-6" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <title>Menu</title>
            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
          </svg>
        </button>
      </div>
      <div class="w-full flex-grow lg:flex lg:items-center lg:w-auto hidden mt-2 lg:mt-0 bg-white lg:bg-transparent pr-4 z-20" id="nav-content">
        <ul class="list-reset lg:flex justify-end flex-1 items-center">
          <li v-for="blok in menu" :key="blok._uid" class="mr-3">
            <NuxtLink :to="`/${(blok.link.url.length > 0 ? blok.link.url : blok.link.cached_url)}`" class="inline-block py-2 px-4 text-white font-bold no-underline">
              {{ blok.name }}
            </NuxtLink>        
          </li>
        </ul>
        <!--
        <button
          class="mx-auto lg:mx-0 hover:underline bg-secondary test-white font-bold rounded-full mt-4 lg:mt-0 py-4 px-8 shadow opacity-75 focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
        >
          Kontakt
        </button>-->
      </div>
    </div>
    <!--<hr class="border-b border-gray-100 opacity-25 my-0 py-0" />-->
  </nav>
  <div :class="isDrawerOpen ? 'translate-x-0' : 'translate-x-full'" class="fixed top-0 right-0 h-full w-full md:w-[50%] bg-white shadow-lg transform transition-transform duration-300 z-50">
    <button class="text-primary-500 absolute right-2 top-5" @click="toggleDrawer()">
      <svg class="fill-current h-10 w-10" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
    <div class="flex flex-col justify-between h-full pt-52 pb-10">
      <div class="flex justify-center text-center">      
        <ul class="list-reset flex-row text-xl">
          <li v-for="blok in menu" :key="blok._uid" class="mr-3">
            <NuxtLink @click="toggleDrawer()" :to="`/${(blok.link.url.length > 0 ? blok.link.url : blok.link.cached_url)}`" class="inline-block py-2 px-4 text-primary-500 font-bold no-underline">
              {{ blok.name }}
            </NuxtLink>
          </li>
        </ul>
      </div>  
      <div class="flex justify-center">
        <NuxtLink v-for="association in associations" :to="`/drustva/${association.slug}`" class="flex flex-col items-center text-center" @click="toggleDrawer()">
          <img :src="association.content.logo.filename" class="transition-transform duration-300 hover:scale-125 h-8" />
          <span class="text-primary-500 font-semibold text-xs m-2">{{ association.content.short_name}}</span>
        </NuxtLink>
      </div>
    </div>
  </div>
<div
  v-if="isDrawerOpen"
  @click="toggleDrawer()"
  class="fixed inset-0 bg-black bg-opacity-50 z-40"
/>
</template>
<script setup>
const storyblokApi = useStoryblokApi();
const associations = ref([]);

defineProps({
  isBackgroundVisible: {
    type: Boolean,
    default: false
  }
})

const isDrawerOpen = ref(false);

const menu = useState('main-menu')

const toggleDrawer = () => isDrawerOpen.value = !isDrawerOpen.value;

onBeforeMount(async () => {
  await loadAssociations();
})

const loadAssociations = async () => {
  const { data } = await storyblokApi.get('cdn/stories', {
    version: 'draft',
    starts_with: 'drustva/masterdata',
    filter_query: {
      "is_featured": { is: true }
    },
  })
  associations.value = data.stories
}
</script>
 