<template>
  <div>
    <img src="/img/gzo-znak.png" alt="Gasilska Zveza Občine Kuzma" />
  </div>
  <StoryblokComponent v-if="story" :blok="story.content" />
</template>
<script setup>
const story = await useAsyncStoryblok('home', { version: 'draft' })
console.log(story);
</script>
<style>
body {
  background-color: green;
}
</style>