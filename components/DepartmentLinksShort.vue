<template>
<NuxtLink v-for="d in filteredDepartments" 
  :key="d.id" 
  :to="`/drustva/${d.slug}`" 
  active-class="is-active"
  @click="$emit('click')"class="group text-xs font-thin mx-2 mb-2 [&.is-active]:font-bold"
>
  {{ d.name }}
</NuxtLink>
</template>
<script setup>
const { data: departments } = useDepartments()

const filteredDepartments = computed(() => {
  return departments.value?.filter(d => !d.hide_menu) || []
});

defineEmits(["click"]);
</script>