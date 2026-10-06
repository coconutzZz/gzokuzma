import { computed, toValue, type MaybeRefOrGetter } from 'vue'

export interface StoryblokLink {
  id?: string
  linktype?: string
  url?: string
  cached_url?: string
  story?: { full_slug?: string }
  anchor?: string
}

export function useStoryblokButtonUrlResolver(link: MaybeRefOrGetter<StoryblokLink | null | undefined>) {
  return computed(() => {
    const resolvedLink = toValue(link)
    if (!resolvedLink) return undefined

    let url = (resolvedLink.linktype === 'story'
      ? resolvedLink.story?.full_slug || resolvedLink.cached_url
      : resolvedLink.url || resolvedLink.cached_url)?.trim() || ''

    if (resolvedLink.linktype === 'story') {
      if (!url && !resolvedLink.id) return undefined
      url = `/${url.replace(/^\/+/, '')}`
    } else if (resolvedLink.linktype === 'email') {
      if (!url) return undefined
      return url.startsWith('mailto:') ? url : `mailto:${url}`
    }

    if (resolvedLink.anchor) {
      url = `${url.split('#')[0]}#${resolvedLink.anchor.replace(/^#/, '')}`
    }

    return url || undefined
  })
}
