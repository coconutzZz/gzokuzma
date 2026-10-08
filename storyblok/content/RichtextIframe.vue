<template>
  <div class="my-6 aspect-video m-auto" >
    <iframe
      :src="blok.url"
      class="h-full w-full border-0"
      loading="lazy"
      allowfullscreen
      :width="blok.width"
      :height="blok.height"
    />
  </div>
</template>

<script setup lang="ts">
defineProps({
  blok: {
    type: Object,
    default: () => ({})
  }
});

</script>