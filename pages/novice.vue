<template>
  <SectionTitle>Aktualno</SectionTitle>  
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 my-5 sm:gap-5 md:my-16">
    <NewsCards :with_tag="with_tag" />
  </div>
</template>
 
<script setup>
import NewsCards from '~/components/NewsCards.vue'
const route = useRoute();
const with_tag = route.query.with_tag;

defineProps({ blok: Object });
</script>
