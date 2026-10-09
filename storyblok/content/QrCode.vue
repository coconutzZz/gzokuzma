<template>
    <div v-if="qrCode && qrCode.filename" 
        class="p-5 border-4 border-red-600 rounded-2xl">
        <p>Za nakazilo prostovoljnih prispevkov, lahko uporabite QR kodo:</p>
        <AppImage :src="qrCode.filename" :alt="qrCode.alt || 'QR koda za nakazilo'"
          class="w-full max-w-xs mx-auto sm:mx-0 object-contain" sizes="320px" />
    </div>
</template> 
<script setup>
defineProps({
  qrCode: {
    default: null
  }
});
</script>
