<template>
  <div class="my-6 aspect-video w-full m-auto">
    <iframe
      :src="props.url"
      class="h-full w-full border-0"
      loading="lazy"
      allowfullscreen
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  url: { type: String, required: true },
});
</script>