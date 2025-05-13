export default defineNuxtPlugin(async (nuxtApp) => {
  const storyblokApi = useStoryblokApi();
  const menu = useState('main-menu', () => null)

  if (!menu.value) {
    const { data } = await storyblokApi.get('cdn/stories/config', {
      version: 'draft',
      resolve_links: 'url',
    })
    menu.value = data.story.content.header_menu;
  }
})
