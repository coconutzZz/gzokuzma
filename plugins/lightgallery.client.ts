import Lightgallery from 'lightgallery/vue';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('Lightgallery', Lightgallery);
  nuxtApp.provide('lgThumbnail', lgThumbnail);
  nuxtApp.provide('lgZoom', lgZoom);
});