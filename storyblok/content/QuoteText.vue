<template>

    
<figure  v-if="props.blok?.text" class="max-w-screen-md mx-auto text-center">
    <blockquote>
        <p class="text-lg lg:text-2xl italic tracking-tight text-heading">
            <q>{{ props.blok?.text }}</q>
        </p>
    </blockquote>
</figure>


</template>
<script setup lang="ts">
const props = defineProps({ blok: Object });
</script>