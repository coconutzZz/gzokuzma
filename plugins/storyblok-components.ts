// plugins/storyblok-components.ts
import { defineNuxtPlugin } from '#app'
import History from '~/storyblok/History.vue'
import HistoryEntry from '~/storyblok/HistoryEntry.vue'
export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.component('history', History);
  nuxtApp.vueApp.component('history_entry', HistoryEntry);
})