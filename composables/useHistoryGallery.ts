import { createHistoryGalleryLoader, normalizeHistoryGalleryImages } from '../utils/history-gallery'

// Share requests within this app, without sharing CMS data between SSR requests.
const loaders = new WeakMap<object, ReturnType<typeof createHistoryGalleryLoader>>()

export function useHistoryGallery() {
  const nuxtApp = useNuxtApp()
  const storyblokApi = useStoryblokApi()
  const version = import.meta.env.DEV ? 'draft' : 'published'
  const loader = loaders.get(nuxtApp) ?? createHistoryGalleryLoader(async (slug, version) => {
    const { data } = await storyblokApi.get(`cdn/stories/${slug}`, { version })
    return normalizeHistoryGalleryImages(data.story.content.images)
  })

  loaders.set(nuxtApp, loader)
  return (slug: string) => loader(slug, version)
}
