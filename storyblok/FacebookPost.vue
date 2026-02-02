<template>
    <div class="w-full text-center">
        <div v-if="url" class="fb-post" :data-href="url" data-width="500"></div>
    </div>
</template>

<script setup>
import { onMounted } from "vue";

const props = defineProps({
  url: { type: String },
});

// Singleton promise to ensure SDK loads only once
let fbSdkPromise;

const loadFacebookSDK = () => {
  if (fbSdkPromise) return fbSdkPromise;

  fbSdkPromise = new Promise((resolve) => {
    if (window.FB) return resolve(window.FB);

    // Create fb-root div if it doesn't exist
    if (!document.getElementById("fb-root")) {
      const fbRoot = document.createElement("div");
      fbRoot.id = "fb-root";
      document.body.appendChild(fbRoot);
    }

    // Inject the SDK script
    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v16.0";
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

  // Delay slightly to ensure the div is in DOM
  requestAnimationFrame(() => {
    if (FB) {
      try {
        FB.XFBML.parse(); // Render all fb-post divs currently in DOM
      } catch (err) {
        console.warn("Facebook XFBML.parse failed", err);
      }
    }
  });
});
</script>

<style scoped>
.fb-post {
  margin: 1rem 0;
}
</style>
