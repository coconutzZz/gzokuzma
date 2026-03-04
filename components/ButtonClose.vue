<template>
  <button class="text-primary-500" @click="$emit('click')">
    <svg class="fill-current h-10 w-10" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  </button>
</template>
<script setup>
defineEmits(['click']);
</script>