export const useMainMenuStories = () => {
  const version = import.meta.env.DEV ? 'draft' : 'published'
  const storyblokApi = useStoryblokApi()

  return useAsyncData('main-menu', async () => {
    const { data } = await storyblokApi.get('cdn/stories/config', {
      version,
      resolve_links: 'url',
    })

    return data.story.content.header_menu || []
  })
}
