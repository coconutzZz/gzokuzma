<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 my-5 sm:gap-5 md:my-16">
    <NewsCards />
  </div>
</template>
 
<script setup>
import NewsCards from '~/components/NewsCards.vue'
defineProps({ blok: Object });
</script>
