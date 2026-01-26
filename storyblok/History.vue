<template>
   <div class="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
      <HistoryEntry v-for="h in blok?.entries" :key="h.oid" :blok="h" />
   </div>
</template>
<script setup lang="ts">
const props = defineProps({ blok: Object, postedOn: String, tagList: Array })


</script>