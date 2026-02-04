<template>
  <StoryblokComponent v-if="story" :blok="story.content" :posted-on="story.created_at" :tag-list="story.tag_list" />
</template>
<script setup lang="ts">
const route = useRoute()

let slug = Array.isArray(route.params.slug) ? route.params.slug : [route.params.slug]

// remove 'index' at the end if present
if (slug[slug.length - 1] === 'index') slug.pop()

const story = await useAsyncStoryblok(  
  slug.join('/'),
  { 
    version: 'draft', 
    resolve_relations: 'AssociationPage.association'
  },
)

if (!story) {
  showError({ statusCode: 404, statusMessage: 'Stran ne obstaja' })
}
</script>
 
