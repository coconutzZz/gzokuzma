<template>
  <article class="article-detail max-w-3xl mx-auto p-0 md:p-6 bg-white rounded-2xl">
    <Breadcrumbs />
    <SectionTitle title-tag="h1">{{ blok.title }}</SectionTitle>
    <!-- Author and date -->
    <div class="flex items-center space-x-4 mb-6 mt-10 text-sm text-gray-500">
      <div>
        <p class="font-medium text-gray-800">Avtor: {{ blok.author }}</p>
        <p>Objavljeno: {{ formatPostedOn(postedOn) }}</p>
      </div>
    </div>

    <!-- Featured image -->
    <img
      v-if="hasFeaturedImage"
      :src="blok.image.filename"
      alt="Featured"
      class="w-full h-64 object-cover rounded-xl mb-6"
    />

    <!-- Article content -->
    <div class="prose max-w-none prose-lg text-gray-800" v-html="resolvedRichText"></div>

    {{ props.blok }}

    <!-- Tags -->
    <div class="mt-8 flex flex-wrap gap-2">
      <NuxtLink :to="`/novice?with_tag=${tag}`" v-for="tag in tagList" class="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">#{{ tag }}</NuxtLink>
    </div>
  </article>
</template>
 
<script setup>
import { DateTime } from "luxon";
import SectionTitle from '~/components/SectionTitle.vue';
import Breadcrumbs from "~/components/Breadcrumbs.vue";

const storyblokApi = useStoryblokApi()

const props = defineProps({ blok: Object, postedOn: String, tagList: Array })
 
const resolvedRichText = computed(() => renderRichText(props.blok.content));

const hasFeaturedImage = computed(() => props.blok.image && props.blok.image.filename);

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

    console.log(data);
  }
})

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
</style>