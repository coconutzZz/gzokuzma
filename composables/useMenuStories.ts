export const useMenuStories = () => {
  const version = import.meta.env.DEV ? 'draft' : 'published';
  const storyblokApi = useStoryblokApi()

  return useAsyncData('menu-stories', async () => {
    const { data } = await storyblokApi.get('cdn/stories', {
      version,
      starts_with: 'drustva/pgd',
      sort_by: 'position:asc'
    })

    return data.stories || []
  })
}
