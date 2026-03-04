<template>
  <footer class="bg-gray-100 text-center p-4 text-sm text-gray-500 mt-auto">
    &copy; {{ copyrightYear }}, Gasilska zveza Občine Kuzma
  </footer>
</template>
<script setup>  
const copyrightYear = computed(() => {
  const today = new Date();
  return today.getFullYear();
})
</script>