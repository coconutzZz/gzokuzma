<template>
  <div class="px-5">
    <EventsSlider />
    <SectionTitle>Aktualno</SectionTitle>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-5 md:gap-5 md:my-16">
      <NewsCards :count="3" />
    </div>
    <div class="w-full text-right my-5">
      <Button :to="{ name: 'novice' }" class="mx-auto">VSE NOVICE</Button>
    </div>
  </div>
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
