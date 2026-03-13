import StoryblokClient from 'storyblok-js-client'

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
  hooks: {
    async 'nitro:config'(nitroConfig) {
      if (!nitroConfig || nitroConfig.dev) {
        return
      }

      const version = import.meta.env.DEV ? 'draft' : 'published'
      const storyblokApi = new StoryblokClient({ accessToken: process.env.STORYBLOK_ACCESS_TOKEN })
      const { data } = await storyblokApi.get("cdn/links", {
        version,
      });
      
        // Safe conversion to array
      const allLinks = Object.values(data.links ?? {})

      const departments = allLinks.filter(link => link.slug?.startsWith('drustva/'))

       // Initialize prerender routes array
      nitroConfig.prerender = nitroConfig.prerender || {}
      nitroConfig.prerender.routes = nitroConfig.prerender.routes || []

      departments.forEach(dep => {
      nitroConfig.prerender = nitroConfig.prerender || {}
      nitroConfig.prerender.routes = nitroConfig.prerender.routes || []
      nitroConfig.prerender.routes.push(`/${dep.slug}`); })


      console.log('Prerender routes:', nitroConfig.prerender.routes)
    }
  },
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY
    }
  }
})