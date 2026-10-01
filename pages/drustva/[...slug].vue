<template>
  <StoryblokComponent
    v-show="!isLoading"
    :blok="story?.data?.story?.content"
    :posted-on="story?.data?.story?.created_at"
    :tag-list="story?.data?.story?.tag_list"
  />
</template>
<script setup lang="ts">
import { getStorySeo } from '~/utils/seo'

const route = useRoute();
const storyblokApi = useStoryblokApi();
const version = import.meta.env.DEV ? 'draft' : 'published'
const isLoading = ref(true)

let slug = Array.isArray(route.params.slug) ? route.params.slug : [route.params.slug]

const normalizeStoryblokSlug = (slugArray: string[]) => {
  return (slug.length === 1 ? ['drustva', ...slugArray, 'index'] : ['drustva', ...slugArray]).join('/')
}

let sbSlug = normalizeStoryblokSlug(slug);


const { data: story, error } = await useAsyncData(
  `story-${sbSlug}`,
  () =>
    storyblokApi.get(`cdn/stories/${sbSlug}`, {
      version
    })
)

const { data: departments } = await useDepartments()
usePageSeo(() => {
  const department = departments.value?.find(item => item.slug === slug[0])
  const currentStory = story.value?.data?.story
  const isDepartmentHome = slug.length === 1 || (slug.length === 2 && slug[1] === 'index')
  return getStorySeo(currentStory, {
    title: department && (isDepartmentHome || !currentStory?.name
      ? department.name : `${currentStory.name} | ${department.name}`),
    description: department ? `Predstavitev, novice in zgodovina društva ${department.name}.` : undefined
  })
})

watchEffect(() => {
  if (story.value || error.value) {
    // Delay hiding loader by 500ms
    setTimeout(() => {
      isLoading.value = false
    }, 1500)
  }
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
