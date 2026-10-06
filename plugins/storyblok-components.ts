// plugins/storyblok-components.ts
import { defineNuxtPlugin } from '#app'
import History from '~/storyblok/History.vue'
import HistoryEntry from '~/storyblok/HistoryEntry.vue'
import SplitContent from '~/storyblok/SplitContent.vue'
import StoryblokButton from '~/storyblok/StoryblokButton.vue'
import CallToAction from '~/storyblok/CallToAction.vue'
import Features from '~/storyblok/Features.vue'
import Feature from '~/storyblok/Feature.vue'
export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.component('history', History);
  nuxtApp.vueApp.component('history_entry', HistoryEntry);
  nuxtApp.vueApp.component('splitcontent', SplitContent);
  nuxtApp.vueApp.component('split_content', SplitContent);
  nuxtApp.vueApp.component('Button', StoryblokButton);
  nuxtApp.vueApp.component('calltoaction', CallToAction);
  nuxtApp.vueApp.component('features', Features);
  nuxtApp.vueApp.component('feature', Feature);
})
