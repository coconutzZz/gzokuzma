<template>
  <section
    v-editable="blok"
    class="rounded-xl p-6 sm:p-8"
    :class="blok.css_classes"
  >
    <h2 v-if="blok.title" class="text-inherit">{{ blok.title }}</h2>
    <p v-if="blok.text" class="text-inherit">{{ blok.text }}</p>

    <div v-if="blok.buttons?.length" class="flex flex-wrap gap-4">
      <StoryblokComponent
        v-for="button in blok.buttons"
        :key="button._uid"
        :blok="button"
      />
    </div>
  </section>
</template>

<script setup>
defineProps({
  blok: {
    type: Object,
    default: () => ({})
  }
});
</script>
