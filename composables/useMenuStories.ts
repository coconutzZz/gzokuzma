export const useMenuStories = () => {
  const storyblokApi = useStoryblokApi()

  return useAsyncData('menu-stories', async () => {
    const { data } = await storyblokApi.get('cdn/stories', {
      starts_with: 'drustva/pgd',
      sort_by: 'position:asc',
      //version: 'published',
    })

    return data.stories || []
  })
}
