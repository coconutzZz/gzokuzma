<template>
    <ClientOnly>
        <lightgallery :settings="{ plugins: [lgThumbnail, lgZoom] }">
            <a v-for="img in images" :key="img.filename" :href="img.filename" >
                <img alt="img1" :src="img.filename" class="img-responsive" />
            </a>
        </lightgallery>
    </ClientOnly>
</template>
<script setup>
import Lightgallery from 'lightgallery/vue';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';

defineProps({
    images: {
        type: Array,
        default: []
    }
});
</script>
<style lang="css" scoped>
    @import 'lightgallery/css/lightgallery.css';
    @import 'lightgallery/css/lg-thumbnail.css';
    @import 'lightgallery/css/lg-zoom.css';
    .img-responsive {
        max-width: 200px;
        height: auto;
    }
</style>
