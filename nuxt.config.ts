// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [['@storyblok/nuxt', { accessToken: 'DPD4LZv5qY7kAXi13qj3HQtt' }],  '@nuxtjs/tailwindcss'],  
})
