<template>
  <div class="container mx-auto" v-editable="blok">
    <img
      v-if="blok.image?.filename"
      :src="blok.image.filename + '/m/1600x0'"
      :alt="blok.image.alt"
      class="w-full h-[360px] lg:h-[450px] object-cover"
      />
    <div class="max-w-xl mx-auto mb-12">
      <h1 class="text-6xl text-[#273373] font-bold mt-12 mb-4">{{ blok.title }}</h1>
      <div v-html="resolvedRichText" class="prose"></div>
    </div>
  </div>
</template>
 
<script setup>
const props = defineProps({ blok: Object })
 
const resolvedRichText = computed(() => renderRichText(props.blok.content))
</script>
<style>
p {
  margin-bottom:10px;
}
ol {
  list-style: auto;
  padding-left: 40px;
  margin: auto;
}
ul {
  list-style: circle;
  padding-left: 40px;
}
</style>