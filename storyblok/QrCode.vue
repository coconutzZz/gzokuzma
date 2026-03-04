<template>
    <div v-if="qrCode && qrCode.filename" 
        class="p-5 border-4 border-red-600 rounded-2xl">
        <p>Za nakazilo prostovoljnih prispevkov, lahko uporabite QR kodo:</p>
        <img :src="qrCode.filename" class="h-52 mx-auto sm:mx-0 sm:h-auto"/>
    </div>
</template> 
<script setup>
defineProps({
  qrCode: {
    default: null
  }
});
</script>