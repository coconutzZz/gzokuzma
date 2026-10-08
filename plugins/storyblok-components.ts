// plugins/storyblok-components.ts
import { defineNuxtPlugin } from '#app'
import History from '~/storyblok/history/History.vue'
import SplitContent from '~/storyblok/content/SplitContent.vue'
import StoryblokButton from '~/storyblok/content/StoryblokButton.vue'
import CallToAction from '~/storyblok/content/CallToAction.vue'
import Features from '~/storyblok/content/Features.vue'
import Feature from '~/storyblok/content/Feature.vue'
import RichtextIframe from '~/storyblok/content/RichtextIframe.vue'

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.component('history', History);
  nuxtApp.vueApp.component('splitcontent', SplitContent);
  nuxtApp.vueApp.component('split_content', SplitContent);
  nuxtApp.vueApp.component('Button', StoryblokButton);
  nuxtApp.vueApp.component('calltoaction', CallToAction);
  nuxtApp.vueApp.component('features', Features);
  nuxtApp.vueApp.component('feature', Feature);
  nuxtApp.vueApp.component('richtextiframe', RichtextIframe);
})
