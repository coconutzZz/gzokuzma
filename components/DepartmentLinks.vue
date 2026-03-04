<template>
<NuxtLink v-for="d in filteredDepartments" 
  :key="d.id" 
  :to="`/drustva/${d.slug}`"
  class="flex flex-col items-center text-center group"
  active-class="is-active"
  @click="$emit('click')">
  <NuxtImg :src="`/img/${d.slug}.png`" 
  :class="d.is_main_unit ? 'h-10 md:h-16' : 'h-8 md:h-10'" 
    class="transition-transform duration-300 hover:scale-125" 
    placeholder="/img/pgddefault.png"
    />  
  <span :class="d.is_main_unit ? 'font-bold' : 'font-semibold'" class="text-primary font-semibold text-xs m-2 group-[.is-active]:font-bold">
    {{ d.name }}
  </span>
</NuxtLink>
</template>
<script setup>
const { data: departments } = useDepartments()

const filteredDepartments = computed(() => {
  return departments.value?.filter(d => !d.hide_menu) || []
});

defineEmits(["click"]);
</script>