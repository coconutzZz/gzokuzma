<!-- Copyright (C) 2026 gzokuzma contributors. SPDX-License-Identifier: GPL-3.0-or-later -->
<template>
  <div class="my-6 m-auto">
    <FacebookPost
      v-if="facebookPost"
      :key="facebookPost.url"
      :url="facebookPost.url"
      :width="blok.width || facebookPost.width"
      :show-text="facebookPost.showText"
    />
    <iframe
      v-else
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
import { computed, ref, watch } from 'vue';
import iframeResize from '@iframe-resizer/parent';
import FacebookPost from '~/components/content/FacebookPost.vue';
import { getFacebookPostEmbed } from '~/utils/facebook-embed';

const props = defineProps({
  blok: {
    type: Object,
    default: () => ({})
  }
});

const facebookPost = computed(() => getFacebookPostEmbed(props.blok.url));
const iframe = ref<HTMLIFrameElement | null>(null);
watch([iframe, () => props.blok.url], ([element], _previous, onCleanup) => {
  if (!element) return;

  const iframeUrl = new URL(element.src, window.location.href);
  const isLegacyCnvosEmbed =
    ['cnvos.si', 'www.cnvos.si'].includes(iframeUrl.hostname) &&
    iframeUrl.pathname.startsWith('/enprocent/embed/');

  const [resizedIframe] = iframeResize(
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
    element,
  );

  onCleanup(() => resizedIframe?.iFrameResizer?.disconnect());
}, { flush: 'post' });
</script>
