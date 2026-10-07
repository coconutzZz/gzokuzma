<template>
  <div class="w-full text-center mx-auto min-h-[500px] relative">
    <div v-if="!isRendered" class="max-w-[500px] mx-auto rounded-md p-4 border border-gray-200">
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

    <div 
      v-show="isRendered" 
      class="fb-post mx-auto" 
      :data-href="url" 
      data-width="500"
      data-show-text="true"      
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const props = defineProps({
  url: { type: String, required: true },
});

const isRendered = ref(false);
let fbSdkPromise;

const loadFacebookSDK = () => {
  if (fbSdkPromise) return fbSdkPromise;

  fbSdkPromise = new Promise((resolve) => {
    if (window.FB) return resolve(window.FB);

    if (!document.getElementById("fb-root")) {
      const fbRoot = document.createElement("div");
      fbRoot.id = "fb-root";
      document.body.appendChild(fbRoot);
    }

    const script = document.createElement("script");
    // Version 19.0 is current standard, but 16.0 works too
    script.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v19.0";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";

    script.onload = () => resolve(window.FB);
    document.body.appendChild(script);
  });

  return fbSdkPromise;
};

onMounted(async () => {
  if (!props.url) return;

  const FB = await loadFacebookSDK();

  if (FB) {
    // 1. Subscribe to the 'render' event
    FB.Event.subscribe('xfbml.render', (response) => {
      // This triggers once the iframe is fully injected and sized
      isRendered.value = true;
    });

    // 2. Parse the DOM
    FB.XFBML.parse();
  }
});
</script>