import { h } from 'vue'
import { BlockTypes, type StoryblokRichTextNode } from '@storyblok/vue'
import FacebookPost from '~/storyblok/FacebookPost.vue'
import RichtextIframe from '~/storyblok/RichtextIframe.vue'
import SplitContent from '~/storyblok/SplitContent.vue'
import CallToAction from '~/storyblok/CallToAction.vue'

export function useStoryblokRichTextResolvers() {
  return {
    [BlockTypes.COMPONENT]: (node: StoryblokRichTextNode) => {
      const nodeBody = node.attrs?.body?.[0]

      if (nodeBody?.component === 'FacebookPost' && nodeBody.url) {
        return h(FacebookPost, { url: nodeBody.url })
      }
      if (nodeBody?.component === 'RichtextIframe' && nodeBody.url) {
        return h(RichtextIframe, { url: nodeBody.url })
      }
      if (nodeBody && ['SplitContent', 'splitcontent', 'split_content'].includes(nodeBody.component)) {
        return h(SplitContent, { blok: nodeBody })
      }
      if (nodeBody && ['CallToAction', 'calltoaction', 'call_to_action'].includes(nodeBody.component)) {
        return h(CallToAction, { blok: nodeBody })
      }

      return null
    }
  }
}
