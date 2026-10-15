import { computed } from 'vue'

export function useNewsFilters() {
  const route = useRoute()
  const selectedTags = computed(() => {
    const values = Array.isArray(route.query.with_tag) ? route.query.with_tag : [route.query.with_tag]
    return new Set(values.flatMap(value => typeof value === 'string' ? value.split(',') : [])
      .map(tag => tag.trim()).filter(Boolean))
  })
  const withTag = computed(() => [...selectedTags.value].join(','))

  function toggleTag(tag: string) {
    const next = new Set(selectedTags.value)
    if (next.has(tag)) next.delete(tag)
    else next.add(tag)

    return navigateTo({
      path: route.path,
      query: { ...route.query, with_tag: next.size ? [...next].join(',') : undefined },
      hash: route.hash,
    })
  }

  return { selectedTags, withTag, toggleTag }
}
