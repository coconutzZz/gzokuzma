<template>
  <article class="article-detail mx-auto p-0  bg-white rounded-2xl">    
    <div class="grid grid-cols-12 gap-4">      
      <main class="col-span-12" :class="tagList.length > 0 ? 'lg:col-span-9' : 'lg:col-start-3 lg:col-span-9'">       

        <div class="hidden lg:block absolute w-200px ">        
          <div class="my-4 text-sm text-gray-500">
            <div>Avtor: {{ blok.author }}</div>
            <div>{{ formatPostedOn(postedOn) }}</div>
          </div>
          <ShareButtons :title="blok.title" />
        </div>

        <div class="lg:ml-[200px]">
          <div class="px-2 lg:px-0">
            <Breadcrumbs />       
            
            <SectionTitle title-tag="h1" :text-center="false">{{ blok.title }}</SectionTitle>
    
            <div class="py-2 lg:hidden">
              <div class="flex items-center mb-2 sm:mb-6 text-sm text-gray-500">
                <span>Avtor: {{ blok.author }} | {{ formatPostedOn(postedOn) }}</span>
              </div>
            </div>
          </div>
  
          <NuxtImg
            v-if="hasFeaturedImage"
            :src="blok.image.filename "
            :alt="blok.title"
            class="w-full h-auto md:max-h-72 md:h-68 object-cover sm:rounded-xl mb-2 lg:my-6"
            provider="storyblok" :modifiers="{ filters: { format: 'webp', quality: 80 }}" />
  
          <div id="article-content" class="px-2 lg:px-0">
            <StoryblokRichText :doc="props.blok.content" :resolvers="resolvers" />

            <template v-if="props.blok?.gallery.length > 0 && isGalleryLoaded">
              <Gallery v-for="gallery in galleryList" :key="gallery.title" :images="gallery.images" />
           </template>
          </div> 
          
          <ShareButtons class="my-4 px-2 lg:px-5" :title="blok.title" />
        </div>
      </main>

      <aside v-if="tagList.length > 0" class="col-span-12 lg:col-span-3 mt-4 lg:mt-14">
        <div class="flex flex-wrap gap-2">
          <NuxtLink :to="`/novice?with_tag=${tag}`" v-for="tag in tagList" class="bg-blue-100 text-blue-800 hover:bg-blue-200 text-sm px-3 py-1 rounded-full">#{{ tag }}</NuxtLink>
        </div>
      </aside>

    </div>
    
  </article>  
</template>
 
<script setup>
import { DateTime } from "luxon";
import SectionTitle from '~/components/ui/SectionTitle.vue';
import { StoryblokRichText } from "@storyblok/vue";
import { useStoryblokRichTextResolvers } from '~/composables/useStoryblokRichTextResolvers';
import Gallery from "~/components/content/Gallery.vue";
const version = import.meta.env.DEV ? 'draft' : 'published';

const storyblokApi = useStoryblokApi()

const isGalleryLoaded = ref(false);

const props = defineProps({ blok: Object, postedOn: String, tagList: Array });
const resolvers = useStoryblokRichTextResolvers();
 
const hasFeaturedImage = computed(() => props.blok?.image && props.blok.image.filename);

const galleryList = ref([]);

const formatPostedOn = (date) => {
  const now = DateTime.now();
  const then = DateTime.fromISO(date);

  const diff = now.diff(then, ['minutes']).minutes;

  return diff < 30 ? `${Math.round(diff)} minutes ago` : then.setLocale("sl-si").toLocaleString(DateTime.DATE_MED);
}

onMounted(async () => {
  if (props.blok?.gallery.length > 0) {

    const { data } = await storyblokApi.get("cdn/stories", {
      version,
      by_uuids: props.blok?.gallery.join(",")
    });

    isGalleryLoaded.value = true;
    
    galleryList.value = data.stories.map(item => ({
        title: item.content.title,
        images: item.content.images.map(img => ({ filename: img.filename }))
    }));
  }
})

</script>
<style lang="scss">
@media (max-width: 375px) {
  #article-content {
    padding: 0 5px;
  }
}
.article-detail {
  ol {
    color: #000;
    list-style: auto;
    padding-left: 40px;
    margin: auto;
  }
  ul {
    color: #000;
    list-style: circle;
    padding-left: 40px;
  }
}
</style>
