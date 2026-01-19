// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [['@storyblok/nuxt', { accessToken: 'DPD4LZv5qY7kAXi13qj3HQtt' }],  '@nuxtjs/tailwindcss'],
  compatibilityDate: '2025-04-15',
  css: [
    '@/assets/css/swiper.css',
    '@/assets/css/main.css',
    'lightgallery/css/lightgallery.css',
    'lightgallery/css/lg-thumbnail.css',
    'lightgallery/css/lg-zoom.css',
  ],
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => ['swiper-container', 'swiper-slide'].includes(tag)
    }
  },
  components: true,
  ssr: true,
  nitro: {
    preset: 'netlify'
  },
  generate: {
    routes: [
      '/',
    ]
  }
})