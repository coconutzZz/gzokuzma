<template>
<NuxtLink v-for="association in associations" :key="association.uuid" :to="`/drustva/${association.slug}`" class="flex flex-col items-center">
  <img :src="association.content.logo.filename" :class="association.content.is_main_unit ? 'h-10 md:h-16' : 'h-8 md:h-10'" class="transition-transform duration-300 hover:scale-125 " />
  <span :class="association.content.is_main_unit ? 'font-bold' : 'font-semibold'" class="text-primary font-semibold text-xs m-2">{{ association.content.short_name}}</span>
</NuxtLink>
</template>
<script setup>
const { data: associations } = useAssociationStories()
</script>