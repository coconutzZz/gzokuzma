<template>
  <div ref="container" class="w-full mx-auto relative" :style="{ maxWidth: `${requestedWidth}px` }">
    <div v-if="!isRendered && !hasFailed" class="rounded-md p-4 border border-gray-200" aria-hidden="true">
      <div class="flex items-center space-x-3 mb-4">
        <div class="w-10 h-10 rounded-full animate-pulse bg-gray-300"></div>
        <div class="h-4 w-24 animate-pulse bg-gray-300"></div>
      </div>
      <div class="space-y-3">
        <div class="w-full h-4 animate-pulse bg-gray-300"></div>
        <div class="w-full h-64 animate-pulse bg-gray-200 rounded-md"></div>
        <div class="w-3/4 h-4 animate-pulse bg-gray-300"></div>
      </div>
    </div>

    <!-- Keep the SDK target visible so Facebook can measure and size the post. -->
    <div ref="embedRoot" :key="renderKey">
      <div class="fb-post" :data-href="url" :data-width="embedWidth" :data-show-text="showText"></div>
    </div>
    <a v-if="hasFailed" :href="url" target="_blank" rel="noopener noreferrer">Oglej si objavo na Facebooku</a>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { loadFacebookSDK } from '~/utils/facebook-sdk';

const props = defineProps({
  url: { type: String, required: true },
  width: { type: [Number, String], default: 500 },
  showText: { type: Boolean, default: true },
});

const requestedWidth = computed(() => {
  const width = Number(props.width);
  return Number.isFinite(width) && width > 0 ? Math.min(750, Math.max(350, width)) : 500;
});
const container = ref<HTMLElement | null>(null);
const embedRoot = ref<HTMLElement | null>(null);
const embedWidth = ref(requestedWidth.value);
const renderKey = ref(0);
const isRendered = ref(false);
const hasFailed = ref(false);
let mounted = false;
let observer: ResizeObserver | undefined;
let resizeTimer: ReturnType<typeof setTimeout> | undefined;
let renderTimeout: ReturnType<typeof setTimeout> | undefined;

async function renderPost() {
  if (!mounted) return;
  const key = ++renderKey.value;
  const isCurrent = () => mounted && key === renderKey.value;
  isRendered.value = false;
  hasFailed.value = false;
  clearTimeout(renderTimeout);
  embedWidth.value = Math.min(requestedWidth.value, container.value?.clientWidth || requestedWidth.value);
  await nextTick();
  const root = embedRoot.value;
  if (!root || !isCurrent()) return;

  renderTimeout = setTimeout(() => {
    if (isCurrent()) hasFailed.value = true;
  }, 20000);

  try {
    const FB = await loadFacebookSDK();
    if (!isCurrent()) return;
    FB.XFBML.parse(root, () => {
      if (!isCurrent()) return;
      clearTimeout(renderTimeout);
      isRendered.value = true;
      hasFailed.value = false;
    });
  } catch {
    if (isCurrent()) {
      clearTimeout(renderTimeout);
      hasFailed.value = true;
    }
  }
}

onMounted(() => {
  mounted = true;
  void renderPost();
  if (typeof ResizeObserver !== 'undefined' && container.value) {
    observer = new ResizeObserver(() => {
      const width = Math.min(requestedWidth.value, container.value?.clientWidth || requestedWidth.value);
      if (width === embedWidth.value) return;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { void renderPost(); }, 150);
    });
    observer.observe(container.value);
  }
});

watch(() => [props.url, props.width, props.showText], () => { void renderPost(); });

onBeforeUnmount(() => {
  mounted = false;
  observer?.disconnect();
  clearTimeout(resizeTimer);
  clearTimeout(renderTimeout);
});
</script>
