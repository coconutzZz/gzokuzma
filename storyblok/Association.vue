<template>
  <div class="relative">
    <div class="absolute 
    text-gray-100
      -z-0 pointer-events-none
      font-extrabold
      -top-20
      -right-8
      text-[150px]
      sm:-top-30
      sm:text-[200px]
      md:-top-36
      md:text-[250px]
      lg:-top-36
      lg:right-10
      ">
      {{ blok.year_founded }}
    </div>
  </div>
  <div class="relative z-10 flex items-center justify-center">
    <img     
        :src="blok.logo.filename"
        alt="Featured"
        :class="blok.is_main_unit ? 'h-28' : 'h-20'"
      /> 
    <h1 class="text-left pl-2">
      <span class="text-xs sm:text-lg">{{ blok.name_prefix }}</span><br/>
      <span class="text-md sm:text-7xl uppercase">{{ blok.name }}</span>
    </h1>
  </div>
</template>
<script setup>
const props = defineProps({ blok: Object, postedOn: String, tagList: Array })
</script>