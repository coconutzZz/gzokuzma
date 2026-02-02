// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [['@storyblok/nuxt', { accessToken: process.env.STORYBLOK_ACCESS_TOKEN }],  '@nuxtjs/tailwindcss'],
  compatibilityDate: '2025-04-15',
  css: [
    '@/assets/css/swiper.css',
    '@/assets/css/main.css'
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
  },
  runtimeConfig: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }
})