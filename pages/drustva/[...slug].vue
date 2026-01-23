<template>    
  <div class="text-black">
    {{ firemen }}
  </div>
  <StoryblokComponent v-if="story" :blok="story.content" :posted-on="story.created_at" :tag-list="story.tag_list" />
</template>
<script setup lang="ts">
import type { Fireman } from '~/server/types/supabase'

    
const route = useRoute()

let slug = Array.isArray(route.params.slug) ? route.params.slug : [route.params.slug]

// remove 'index' at the end if present
if (slug[slug.length - 1] === 'index') slug.pop()

const normalizeStoryblokSlug = (slugArray: string[]) => {
  // If the page corresponds to an index story, append 'index' at the end
  return ['drustva', ...slugArray, 'index'].join('/')
}

let sbSlug = normalizeStoryblokSlug(slug);

const { data: firemen, pending, error } = await useFetch<Fireman[]>(
  `/api/firemen/${route.params.slug}`
)


const story = await useAsyncStoryblok(  
  sbSlug,
  { 
    version: 'draft', 
    resolve_relations: 'AssociationPage.association'
  },
)

if (!story) {
  showError({ statusCode: 404, statusMessage: 'Stran ne obstaja' })
}
</script>
 
