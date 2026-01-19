<script setup>
// const fixedHeader = useState('fixedHeader')
// fixedHeader.value = true;

const { slug } = useRoute().params

const story = await useAsyncStoryblok(
  slug.join('/'),
  { 
    version: 'draft', 
    resolve_relations: 'AssociationPage.association'
  },
)

if (story.value == undefined) {
  showError({ statusCode: 404, statusMessage: 'Stran ne obstaja' })
}
</script>
 
<template>
  <StoryblokComponent v-if="story" :blok="story.content" :posted-on="story.created_at" :tag-list="story.tag_list" />
</template>