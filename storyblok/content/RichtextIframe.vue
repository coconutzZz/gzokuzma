<template>
  <div class="my-6 m-auto">
    <iframe
      ref="iframe"
      :src="blok.url"
      class="block w-full max-w-full border-0"
      loading="lazy"
      allowfullscreen
      :width="blok.width"
      :height="blok.height"
    />
  </div>
</template>

<script setup lang="ts">
import iframeResize from '@iframe-resizer/parent';
defineProps({
  blok: {
    type: Object,
    default: () => ({})
  }
});

const iframe = ref<HTMLIFrameElement | null>(null);
let resizedIframe: ReturnType<typeof iframeResize>[number] | undefined;

onMounted(() => {
  if (!iframe.value) return;

  [resizedIframe] = iframeResize(
    {
      license: 'GPLv3',
      log: false,
      checkOrigin: false,
      direction: 'vertical',
    },
    iframe.value,
  );
});

onBeforeUnmount(() => {
  resizedIframe?.iFrameResizer?.disconnect();
});
</script>
