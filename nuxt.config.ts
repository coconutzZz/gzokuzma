// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    ['@storyblok/nuxt', { accessToken: process.env.STORYBLOK_ACCESS_TOKEN }],  
    '@nuxtjs/tailwindcss',
    '@nuxt/image'
  ],
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
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY
    }
  }
})