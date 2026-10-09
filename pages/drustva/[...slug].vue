<template>
  <StoryblokComponent
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


if (error.value) {
  showError({ statusCode: 404, statusMessage: 'Stran ne obstaja' })
}
</script>
