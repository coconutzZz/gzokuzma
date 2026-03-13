<template> 
  <AssociationPage v-if="isLoading" :is-loading="isLoading"/>
  <StoryblokComponent
    v-else
    :blok="story?.data?.story?.content ?? null"
    :posted-on="story?.data?.story?.created_at ?? ''"
    :tag-list="story?.data?.story?.tag_list ?? []"
    :is-loading="isLoading"
  />
</template>
<script setup lang="ts">
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
      version,
      resolve_relations: 'AssociationPage.association'
    })
)

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
 
