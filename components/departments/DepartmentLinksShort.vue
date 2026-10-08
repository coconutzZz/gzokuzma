<template>
<NuxtLink v-for="d in filteredDepartments" 
  :key="d.id" 
  :to="`/drustva/${d.slug}`" 
  :class="{ 'is-active': isDepartmentActive(d.slug) }"
  @click="$emit('click')"class="group text-sm font-semibold text-white/80
         hover:text-white
         [&.is-active]:text-primary-500 [&.is-active]:bg-primary-200 [&.is-active]:rounded-full px-2 py-1 mb-2  ">

  {{ d.name }}
</NuxtLink>
</template>
<script setup>

const props = defineProps({
  showActiveOnly: {
    type: Boolean,
    default: false
  }
});

const route = useRoute()

const { data: departments } = useDepartments()

const filteredDepartments = computed(() => {
  if (props.showActiveOnly) {
    return departments.value?.filter(d => !d.hide_menu && isDepartmentActive(d.slug)) || []
  }
  return departments.value?.filter(d => !d.hide_menu) || []
});

const isDepartmentActive = (slug) => {
  const path = `/drustva/${slug}`
  return route.path === path || route.path.startsWith(`${path}/`)
}


defineEmits(["click"]);
</script>