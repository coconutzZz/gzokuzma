<template>
  <div v-if="!isLoading" class="relative">
    <div class="absolute select-none
    text-gray-100
      -z-0 pointer-events-none
      font-extrabold
      -top-16
      -right-4
      text-[150px]
      sm:-top-26
      sm:text-[200px]
      md:-top-32
      md:text-[250px]
      lg:-top-30
      lg:right-4
      ">
      {{ department?.year_founded }}
    </div>
  </div>
  <div class="relative z-10 flex items-center justify-center sm:my-8">
    <NuxtImg :src="`/img/${department?.slug}.png`" 
      :class="department?.is_main_unit ? 'h-28' : 'h-20'" 
      placeholder="/img/pgddefault.png"
      :alt="`Logotip ${department?.name}`"
    />
   
    <h1 v-if="!isLoading" class="text-left pl-2">
      <span class="text-xs sm:text-lg">{{ department?.name_prefix }}</span><br/>
      <span class="text-md sm:text-6xl md:text-7xl uppercase">{{ cleanName }}</span>
    </h1>
    <h1 v-else class="text-left pl-2">
      <span class="text-md sm:text-6xl md:text-7xl uppercase">
        <div class="w-24 h-8 mt-2 bg-gray-300 animate-pulse mb-2"></div>
        <div class="w-64 h-12 bg-gray-300 animate-pulse"></div>
      </span>
    </h1>
  </div>
</template>
<script setup lang="ts">
import type { Department } from '~/server/types/supabase'
const props = defineProps({ 
  department: {
    type: Object as PropType<Department | null>,
    default: null
  },
  isLoading: Boolean
})

const cleanName = computed(() => props.department?.name.slice(3))
</script>