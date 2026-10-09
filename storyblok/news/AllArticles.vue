<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 my-5 sm:gap-5 md:my-16">
    <NewsCards priority-image />
  </div>
</template>
 
<script setup>
import NewsCards from '~/components/news/NewsCards.vue'
defineProps({ blok: Object });
</script>
