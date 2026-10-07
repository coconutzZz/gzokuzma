<template>
  <NuxtLayout>
    <Breakpoints />
    <NuxtPage />
  </NuxtLayout>
  <ScrollToTop />
</template>
<script setup>
import Breakpoints from './components/dev/Breakpoints.vue';
import ScrollToTop from './components/ui/ScrollToTop.vue';
usePageSeo()
</script>
