// plugins/storyblok-components.ts
import { defineNuxtPlugin } from '#app'
import Person from '~/storyblok/Person.vue'

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.component('Person', Person)
})