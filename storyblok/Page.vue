<template>
  <div v-editable="blok" class="px-4">
    <SectionTitle v-if="blok.title">{{ blok.title }}</SectionTitle>
    <StoryblokComponent v-for="blok in blok.body" :key="blok._uid" :blok="blok" />
  </div>
</template>
 
<script setup>
import SectionTitle from '~/components/SectionTitle.vue';
defineProps({ blok: Object })
</script>