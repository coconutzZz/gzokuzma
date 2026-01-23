<template>      
    <EventsSlider />

    <SectionTitle>Aktualno</SectionTitle>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 my-5 sm:gap-5 md:my-16">
      <NewsCards :count="3" />      
    </div>
    
  <!-- <template #above-footer>
    
  </template> -->


</template>
<script setup>
definePageMeta({
  layout: 'default',
  hero: 'associations',
  footerStats: true
})

import NewsCards from '~/components/NewsCards.vue';
import EventsSlider from '~/components/EventsSlider.vue';
import SectionTitle from '~/components/SectionTitle.vue';
</script>
