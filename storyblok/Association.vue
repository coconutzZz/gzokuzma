<template>
  <div class="relative">
    <div class="absolute select-none
    text-gray-100
      -z-0 pointer-events-none
      font-extrabold
      -top-20
      -right-8
      text-[150px]
      sm:-top-26
      sm:text-[200px]
      md:-top-32
      md:text-[250px]
      lg:-top-30
      lg:right-10
      ">
      {{ department?.year_founded }}
    </div>
  </div>
  <div class="relative z-10 flex items-center justify-center sm:my-8">
    <NuxtImg :src="`/img/${department?.slug}.png`" 
      :class="department?.is_main_unit ? 'h-28' : 'h-20'" 
      placeholder="/img/pgddefault.png"
    />
   
    <h1 class="text-left pl-2">
      <span class="text-xs sm:text-lg">{{ department?.name_prefix }}</span><br/>
      <span class="text-md sm:text-6xl md:text-7xl uppercase">{{ cleanName }}</span>
    </h1>
  </div>
</template>
<script setup lang="ts">
import type { Department } from '~/server/types/supabase'
const props = defineProps({ 
  blok: {
    type: Object,
    required: true
  },
  postedOn: String, 
  tagList: Array,
  department: {
    type: Object as PropType<Department>,
  }
})

const cleanName = computed(() => props.department?.name.slice(3))
</script>