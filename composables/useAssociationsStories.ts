export const useAssociationStories = () => {
  const storyblokApi = useStoryblokApi()

  return useAsyncData('association-stories', async () => {
    const { data } = await storyblokApi.get('cdn/stories', {
      version: 'draft',
      starts_with: 'drustva/masterdata',
      filter_query: {
        "is_featured": { is: true }
      }
    })

    return data.stories
  })
}
