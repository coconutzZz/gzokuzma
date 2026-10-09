import { defineProvider } from '@nuxt/image/runtime'
import storyblokProvider from '@nuxt/image/runtime/providers/storyblok'
import { canTransformStoryblokImage, getStoryblokImageUrl } from '../utils/image-source'

const storyblok = storyblokProvider()

export default defineProvider({
  getImage(src, options, ctx) {
    if (!canTransformStoryblokImage(src)) return { url: src }

    return storyblok.getImage(src, {
      ...options,
      // Keep regional CDN hosts and clone filters: the built-in provider mutates them.
      baseURL: getStoryblokImageUrl(src)!.origin,
      modifiers: {
        ...options.modifiers,
        filters: { ...options.modifiers?.filters }
      }
    }, ctx)
  }
})
