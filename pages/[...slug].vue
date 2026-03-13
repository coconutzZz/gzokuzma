<template>
  <StoryblokComponent
    :blok="story?.data?.story?.content"
    :posted-on="story?.data?.story?.created_at"
    :tag-list="story?.data?.story?.tag_list"
  />
</template>
<script setup lang="ts">
const route = useRoute()
const storyblokApi = useStoryblokApi();
const version = import.meta.env.DEV ? 'draft' : 'published'
const isLoading = ref(true)

let slug = Array.isArray(route.params.slug) ? route.params.slug : [route.params.slug]

if (slug[slug.length - 1] === 'index') slug.pop()

const { data: story, status, error } = await useAsyncData(
  `story-${slug.join('/')}`,
  () =>
    storyblokApi.get(`cdn/stories/${slug.join('/')}`, {
      version
    })
)

watchEffect(() => {
  isLoading.value = !story.value && !error.value
})

if (error.value) {
  showError({ statusCode: 404, statusMessage: 'Stran ne obstaja' })
}

</script>
 
<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>