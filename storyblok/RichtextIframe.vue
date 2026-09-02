<template>
  <div class="w-full text-center mx-auto min-h-[500px] relative">  
    <div 
      class="fb-post mx-auto"     
    > 
      <iframe
        :src="props.url"
        class="h-full w-full border-0"
        loading="lazy"
        allowfullscreen
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  url: { type: String, required: true },
});
</script>