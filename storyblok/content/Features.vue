<template>
  <section class="py-8 md:py-12">
    <div class="mb-8 md:mb-10">
        <h2>
        {{ blok.title }}
        </h2>
    </div>

     <div class="grid grid-cols-2 gap-x-6 gap-y-8 md:gap-x-10 md:gap-y-10 lg:grid-cols-4">
        <StoryblokComponent
            v-for="feature in blok.features"
            :key="feature._uid"
            :blok="feature"
        />
     </div>
  </section>
</template>
 
<script setup>
defineProps({ blok: Object });
</script>
