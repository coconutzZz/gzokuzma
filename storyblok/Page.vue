<template>
  <div v-editable="blok" class="grid grid-cols-12 gap-4">
    <div class="col-span-12">
      <Breadcrumbs />
      <SectionTitle v-if="blok.title">{{ blok.title }}</SectionTitle>
      <StoryblokComponent v-for="blok in blok.body" :key="blok._uid" :blok="blok" />
    </div>
  </div>
</template>
 
<script setup>
import SectionTitle from '~/components/SectionTitle.vue';
defineProps({ blok: Object })
</script>