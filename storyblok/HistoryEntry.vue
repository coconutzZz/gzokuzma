<template>
  
<!-- Timeline Item -->
    <div class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse mt-4">
        <!-- Icon -->
        <div class="flex text-bold justify-center items-center text-xl md:text-2xl w-20 md:w-20 h-10 rounded-full bg-slate-300 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
            {{ blok.year }}
        </div>
        <!-- Card -->
        <div class="w-[calc(100%-2rem)] md:w-[calc(50%-2.5rem)] px-2 md:px-10">
            <div class="font-bold text-xl md:text-3xl text-primary-500 mb-2">{{ blok.title }}</div>
            <div v-html="resolvedRichText" />
        </div>
    </div>
</template>
<script setup lang="ts">
const props = defineProps({ blok: {
    type: Object,
    required: true
}, postedOn: String, tagList: Array })


const resolvedRichText = computed(() => renderRichText(props.blok.description));
</script>