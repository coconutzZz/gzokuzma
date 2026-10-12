<template>
  <StoryblokComponent
    v-if="story?.data?.story?.content"
    :blok="story?.data?.story?.content"
    :posted-on="story?.data?.story?.created_at"
    :tag-list="story?.data?.story?.tag_list"
  />
</template>
<script setup lang="ts">
import { getStorySeo } from '~/utils/seo'

const route = useRoute()
const storyblokApi = useStoryblokApi();
const version = import.meta.env.DEV ? 'draft' : 'published'
const isLoading = ref(true)

// Remove the empty trailing-slash segment before resolving the /index alias.
const slug = (Array.isArray(route.params.slug) ? route.params.slug : [route.params.slug]).filter(Boolean)

if (slug[slug.length - 1] === 'index') slug.pop()

const { data: story, status, error } = await useAsyncData(
  `story-${slug.join('/')}`,
  () =>
    storyblokApi.get(`cdn/stories/${slug.join('/')}`, {
      version
    })
)

usePageSeo(() => getStorySeo(story.value?.data?.story))

watchEffect(() => {
  isLoading.value = !story.value && !error.value
})

if (error.value) {
  showError({ statusCode: 404, statusMessage: 'Stran ne obstaja' })
}

</script>
