import StoryblokClient from 'storyblok-js-client'
import { fileURLToPath } from 'node:url'
import { generateHistoryManifest } from './scripts/history'
import { SITE_NAME, SITE_DESCRIPTION } from './utils/seo'

const historySourceDir = fileURLToPath(new URL('./public/history', import.meta.url))
const historyOutputDir = fileURLToPath(new URL('./.cache/history', import.meta.url))

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  app: {
    head: {
      title: SITE_NAME,
      meta: [
        { name: 'description', content: SITE_DESCRIPTION }
      ],
      htmlAttrs: {
        lang: 'sl'
      }
    }
  },
  modules: [
    ['@storyblok/nuxt', { accessToken: process.env.STORYBLOK_ACCESS_TOKEN }],  
    '@nuxtjs/tailwindcss',
    '@nuxt/image'
  ],
  image: {
    providers: {
      storyblok: {
        provider: 'storyblok',
        baseURL: 'https://a.storyblok.com'        
      }
    },
  },
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
  components: [
    { path: '~/components/dev', prefix: 'Dev' },
    { path: '~/components', pathPrefix: false }
  ],
  ssr: true,
  experimental: {
    sharedPrerenderData: true
  },
  watch: ['public/history/**/index.md'],
  nitro: {
    preset: 'netlify',
    prerender: {
      routes: ['/', '/novice'],
      crawlLinks: true,
      failOnError: true,
      ignore: ['/api/**', '/config', '/galerije/**', '/dogodki/**']
    }
  },
  hooks: {
    async 'builder:watch'(_event, path) {
      if (path.replace(/\\/g, '/').includes('public/history/')) {
        await generateHistoryManifest(historySourceDir, historyOutputDir)
      }
    },
    async 'nitro:config'(nitroConfig) {
      await generateHistoryManifest(historySourceDir, historyOutputDir)
      nitroConfig.serverAssets = nitroConfig.serverAssets || []
      nitroConfig.serverAssets.push({ baseName: 'history', dir: historyOutputDir })

      if (nitroConfig.dev) {
        return
      }

      const storyblokApi = new StoryblokClient({ accessToken: process.env.STORYBLOK_ACCESS_TOKEN })
      // Discover every published page, including articles outside the main menu.
      const stories = await storyblokApi.getAll('cdn/stories', {
        version: 'published',
        per_page: 100,
        filter_query: {
          component: { in: 'page,article,AssociationPage' }
        }
      })

      nitroConfig.prerender = nitroConfig.prerender || {}
      const routes = new Set(nitroConfig.prerender.routes || [])
      for (const story of stories) {
        const route = `/${story.full_slug}`.replace(/\/+$/, '')
        routes.add(route)
        // Department start pages are reachable with and without the /index alias.
        if (route.startsWith('/drustva/') && route.endsWith('/index')) {
          routes.add(route.slice(0, -'/index'.length))
        }
      }
      nitroConfig.prerender.routes = [...routes]

      console.log('Prerender routes:', nitroConfig.prerender.routes)
    }
  },
  runtimeConfig: {
    public: {
      siteUrl: 'https://gzo-kuzma.si',
      supabaseUrl: process.env.SUPABASE_URL,
      supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY
    }
  }
})
