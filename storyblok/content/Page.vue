<template>
  <div v-editable="blok" :class="blok.css_class" class="px-2 lg:px-0 mt-5">
      <Breadcrumbs v-if="blok.show_breadcrumbs" />
      <SectionTitle v-if="blok.title">{{ blok.title }}</SectionTitle>
      <StoryblokComponent v-for="blok in blok.body" :key="blok._uid" :blok="blok" />    
  </div>

</template>
 
<script setup>
import SectionTitle from '~/components/ui/SectionTitle.vue';
defineProps({ blok: Object })
</script>