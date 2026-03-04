<template>
  <nav id="header" :class="{ 'fixed': isFixed }, isBackgroundVisible ? 'bg-primary-500' : 'bg-none'" class="w-full z-30 top-0 transition-colors duration-700">
    <div class="w-full container mx-auto flex flex-wrap items-center justify-between mt-0 py-2 max-w-screen-2xl md:max-w-screen-xl">
      <div class="pl-4 flex items-center">
        <NuxtLink to="/" class="text-white no-underline hover:no-underline font-bold text-2xl lg:text-4xl">
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
          <li v-for="blok in menuItems" :key="blok._uid" class="mr-3">
            <NuxtLink 
              :to="`/${(blok.link.url.length > 0 ? blok.link.url : blok.link.cached_url)}`" 
              class="relative inline-block py-2 mx-4 text-white font-bold no-underline group"
              active-class="is-active"
            >
              {{ blok.name }}
              
              <span class="absolute bottom-0 left-0 h-0.5 bg-white transition-all duration-300 w-0 group-hover:w-full group-[.is-active]:w-full"></span>
            </NuxtLink>      
          </li>
        </ul>
      </div>
    </div>    
    <slot />
    <div class="bg-[#FF6347] py-1" v-if="subMenu && subMenu.length > 1">
        <div class="w-full container mx-auto max-w-screen-2xl md:max-w-screen-xl">
          <div class="text-center">
            <NuxtLink
              v-for="item in subMenu"
              :key="item.id"
              :to="`/${item.full_slug}`"
              class="text-white mr-4"
            >
              {{ item.name }}
            </NuxtLink>
          </div>
        </div>
    </div>
  </nav>
  <div :class="isDrawerOpen ? 'translate-x-0' : 'translate-x-full'" class="fixed top-0 right-0 h-full w-full md:w-[50%] bg-white shadow-lg transform transition-transform duration-300 z-50">
    <ButtonClose @click="toggleDrawer()" class="absolute right-2 top-5" />
    <div class="flex flex-col justify-center h-full pb-10">
      <div class="flex justify-center text-center">      
        <ul class="list-reset flex-row text-xl">
          <li v-for="blok in menuItems" :key="blok._uid" class="mr-3">
            <NuxtLink @click="toggleDrawer()" :to="`/${(blok.link.url.length > 0 ? blok.link.url : blok.link.cached_url)}`" class="inline-block py-2 px-4 text-primary-500 font-bold no-underline">
              {{ blok.name }}
            </NuxtLink>
          </li>
        </ul>
      </div>  
      <div class="md:hidden mt-5 force-black">
        <DepartmentLinks @click="toggleDrawer()" />
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
const route = useRoute()
//const slug = ref(Array.isArray(route.params.slug) ? route.params.slug : [route.params.slug]);

const props = defineProps({
  isBackgroundVisible: {
    type: Boolean,
    default: false
  }, 
  isFixed: {
    type: Boolean,
    default: true
  }
});

const { data: menuItems } = useMainMenuStories();
const { data: menuStories, refresh } = await useMenuStories()

watch(() => route.path, (newPath) => {
  if (newPath.startsWith('/drustva')) {
    refresh()
  }
}, { immediate: true })

const subMenu = computed(() => {
  const stories = menuStories.value
  if (!stories || !Array.isArray(stories)) return [];

  const currentSlugPart = route.params.slug?.[0] || route.params.slug;
  if (!currentSlugPart) return [];

  return stories.filter(story => {
    return story.full_slug.includes(currentSlugPart + '/')
  })
});

const current = computed(() =>
  associations.value?.find(a =>
    route.path.includes(a.slug)
  )
)

const isDrawerOpen = ref(false);
const toggleDrawer = () => {
  isDrawerOpen.value = !isDrawerOpen.value;
  if (isDrawerOpen.value) 
    document.body.classList.add('overflow-hidden')
  else 
    document.body.classList.remove('overflow-hidden')
}

</script>
<style lang="scss" scoped>
  .force-black {
    color: black !important;
  }
</style>