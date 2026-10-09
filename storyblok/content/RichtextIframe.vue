<!-- Copyright (C) 2026 gzokuzma contributors. SPDX-License-Identifier: GPL-3.0-or-later -->
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

  const iframeUrl = new URL(iframe.value.src, window.location.href);
  const isLegacyCnvosEmbed =
    ['cnvos.si', 'www.cnvos.si'].includes(iframeUrl.hostname) &&
    iframeUrl.pathname.startsWith('/enprocent/embed/');

  [resizedIframe] = iframeResize(
    {
      license: 'GPLv3',
      log: false,
      checkOrigin: false,
      direction: 'vertical',
      // CNVOS uses a v4 child; remove these overrides when it upgrades to v5.
      ...(isLegacyCnvosEmbed ? {
        heightCalculationMethod: 'bodyOffset',
        widthCalculationMethod: 'scroll',
      } : {}),
    },
    iframe.value,
  );
});

onBeforeUnmount(() => {
  resizedIframe?.iFrameResizer?.disconnect();
});
</script>
