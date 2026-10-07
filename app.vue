<template>
  <NuxtLayout>
    <Breakpoints />
    <NuxtPage />
  </NuxtLayout>
  <FloatingActions />
</template>
<script setup>
import Breakpoints from './components/dev/Breakpoints.vue';
import FloatingActions from './components/ui/FloatingActions.vue';
import { provideFloatingActions } from './composables/useFloatingActions';
import { providePageScroll } from './composables/usePageScroll';

providePageScroll()
provideFloatingActions()
usePageSeo()
</script>
