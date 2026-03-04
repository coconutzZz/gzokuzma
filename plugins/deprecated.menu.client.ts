export default defineNuxtPlugin(async () => {
  const storyblokApi = useStoryblokApi();  
  const menu = useState('main-menu', () => [])
  
  if (menu.value.length === 0) {
    const { data } = await storyblokApi.get('cdn/stories/config', {
      version: 'draft',
      resolve_links: 'url',
    })
    menu.value = data.story.content.header_menu || [];
  }
})
