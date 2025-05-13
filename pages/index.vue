<template>
  <NuxtLayout name="default">
    <template #hero>
      <div class="container max-w-2xl mx-auto">
        <div class="sm:flex flex-row justify-between justify-items-center items-end hidden">
          <NuxtLink v-for="association in associations" :to="`/drustva/${association.slug}`" class="flex flex-col items-center">
            <img :src="association.content.logo.filename" :class="association.content.is_main_unit ? 'h-10 md:h-16' : 'h-8 md:h-10'" class="transition-transform duration-300 hover:scale-125 " />
            <span :class="association.content.is_main_unit ? 'font-bold' : 'font-semibold'" class="text-primary text-xs sm:text-md mt-2">{{ association.content.short_name}}</span>
          </NuxtLink>
        </div>
        
      </div>
    </template>
      
    <EventsSlider />

    <SectionTitle>Aktualno</SectionTitle>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 my-5 sm:gap-5 md:my-16">
      <NewsCards :count="3" />      
    </div>
    
  <template #above-footer>
    <section class="bg-primary-200 py-16">
      <div class="max-w-7xl mx-auto  sm:px-6 lg:px-8 text-center">
        <SectionTitle title-tag="h2" >Zveza v številkah</SectionTitle>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mt-10">
          
          <div>
            <p class="text-5xl font-extrabold text-secondary">25+</p>
            <p class="mt-2">let delovanja</p>
          </div>
          
          <div>
            <p class="text-5xl font-extrabold text-secondary">5</p>
            <p class="mt-2">Prostovoljnih društev</p>
          </div>

          <div>
            <p class="text-5xl font-extrabold text-secondary">339+</p>
            <p class="mt-2">Članov in članic</p>
          </div>
          
          <div>
            <p class="text-5xl font-extrabold text-secondary">95+</p>
            <p class="mt-2">Operativnih gasilcev</p>
          </div>
        
        </div>
      </div>
    </section>    
  </template>


  </NuxtLayout>
</template>
<script setup>
import NewsCards from '~/components/NewsCards.vue';
import EventsSlider from '~/components/EventsSlider.vue';
import SectionTitle from '~/components/SectionTitle.vue';

const storyblokApi = useStoryblokApi();
const associations = ref([]);

definePageMeta({
  layout: false,
})

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
