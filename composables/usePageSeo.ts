import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { resolvePageSeo, type PageSeoOptions } from '~/utils/seo'

export function usePageSeo(options: MaybeRefOrGetter<PageSeoOptions> = {}) {
  const route = useRoute()
  const config = useRuntimeConfig()
  const requestUrl = useRequestURL()
  const metadata = computed(() => resolvePageSeo(
    toValue(options),
    route.path,
    config.public.siteUrl || requestUrl.origin
  ))

  useSeoMeta({
    title: () => metadata.value.title,
    description: () => metadata.value.description,
    ogTitle: () => metadata.value.ogTitle,
    ogDescription: () => metadata.value.ogDescription,
    ogImage: () => metadata.value.ogImage,
    ogImageAlt: () => metadata.value.ogImageAlt,
    ogUrl: () => metadata.value.ogUrl,
    ogType: () => metadata.value.ogType,
    ogSiteName: () => metadata.value.ogSiteName,
    ogLocale: () => metadata.value.ogLocale,
    twitterCard: () => metadata.value.twitterCard,
    twitterTitle: () => metadata.value.twitterTitle,
    twitterDescription: () => metadata.value.twitterDescription,
    twitterImage: () => metadata.value.twitterImage,
    twitterImageAlt: () => metadata.value.twitterImageAlt
  })
  useHead(() => ({ link: [{ rel: 'canonical', href: metadata.value.ogUrl }] }))
}
