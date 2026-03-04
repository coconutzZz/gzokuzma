export const useMainMenuStories = () => {
  const storyblokApi = useStoryblokApi()

  return useAsyncData('main-menu', async () => {
    const { data } = await storyblokApi.get('cdn/stories/config', {
      version: 'draft',
      resolve_links: 'url',
    })

    return data.story.content.header_menu || []
  })
}
