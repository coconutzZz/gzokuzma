<!-- Copyright (C) 2026 gzokuzma contributors. SPDX-License-Identifier: GPL-3.0-or-later -->
<template>
  <div class="my-6 m-auto aspect-video max-w-2xl">
    <iframe
      ref="iframe"
      :src="`https://www.youtube-nocookie.com/embed/${videoId}`"
      :title="blok.title || 'YouTube video'"
      class="size-full"
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
    />
  </div>
</template>

<script setup lang="ts">
import iframeResize from '@iframe-resizer/parent';
const { blok } = defineProps({
  blok: {
    type: Object,
    default: () => ({})
  }
});

const iframe = ref<HTMLIFrameElement | null>(null);
let resizedIframe: ReturnType<typeof iframeResize>[number] | undefined;

const videoId = computed(() => {
  const url = blok.url || '';
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&?/]+)/
  )

  return match?.[1] ?? null

});

    
onMounted(() => {
  if (!iframe.value) return;
  
  [resizedIframe] = iframeResize(
    {
      license: 'GPLv3',
      log: false,
      checkOrigin: false,
      direction: 'vertical'
    },
    iframe.value,
  );
});

onBeforeUnmount(() => {
  resizedIframe?.iFrameResizer?.disconnect();
});
</script>
