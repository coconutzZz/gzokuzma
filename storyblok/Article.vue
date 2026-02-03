<template>
  <article class="article-detail mx-auto p-0  bg-white rounded-2xl">
    <SectionTitle title-tag="h1">{{ blok.title }}</SectionTitle>
    
    <Breadcrumbs />
    <div class="flex items-center space-x-4 mb-6 text-sm text-gray-500">
      <span>Avtor: {{ blok.author }} | {{ formatPostedOn(postedOn) }}</span>
    </div>

    <div class="grid grid-cols-12 gap-4">
      <main class="col-span-12" :class="tagList.length > 0 ? 'lg:col-span-9' : 'lg:col-span-8 lg:col-start-3'">
        <img
          v-if="hasFeaturedImage"
          :src="blok.image.filename"
          alt="Featured"
          class="w-full h-64 object-cover rounded-xl mb-6"
        />       
        <!-- <div class="prose max-w-none prose-lg text-gray-800" v-html="resolvedRichText"></div> -->
         <StoryblokRichText :doc="props.blok.content" :resolvers="resolvers" />
         <template v-if="props.blok?.gallery.length > 0 && isGalleryLoaded">
          <Gallery v-for="gallery in galleryList" :key="gallery.title" :images="gallery.images" />
        </template>
      </main>

      <aside v-if="tagList.length > 0" class="col-span-12 lg:col-span-3">
        <div class="flex flex-wrap gap-2">
          <NuxtLink :to="`/novice?with_tag=${tag}`" v-for="tag in tagList" class="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">#{{ tag }}</NuxtLink>
        </div>
      </aside>
    </div>
    
  </article>  
</template>
 
<script setup>
import { DateTime } from "luxon";
import SectionTitle from '~/components/SectionTitle.vue';
//import Breadcrumbs from "~/components/Breadcrumbs.vue";
import { StoryblokRichText } from "@storyblok/vue";
import FacebookPost from "./FacebookPost.vue";
import Gallery from "~/components/Gallery.vue";

const storyblokApi = useStoryblokApi()

const isGalleryLoaded = ref(false);

const props = defineProps({ blok: Object, postedOn: String, tagList: Array });
 
//const resolvedRichText = computed(() => renderRichText(props.blok.content));

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
      by_uuids: props.blok?.gallery.join(",")
    });

    isGalleryLoaded.value = true;
    
    galleryList.value = data.stories.map(item => ({
        title: item.content.title,
        images: item.content.images.map(img => ({ filename: img.filename }))
    }));
  }
})

const resolvers = {
  [BlockTypes.COMPONENT]: (node) => {
    const nodeBody = node.attrs.body[0];    
    if (nodeBody && nodeBody.component === "FacebookPost" && nodeBody.url) {
      return h(FacebookPost, { url: nodeBody.url });
    }
    return null;
  },
};
</script>
<style lang="scss">
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
h1 {
  font-size: 2em !important;
}
</style>