<template>
  <section
    v-if="hasContent || hasImage"
    v-editable="blok"
    class="split-content my-6 grid gap-6 sm:gap-8"
    :class="{ 'sm:grid-cols-2': hasContent && hasImage }"
  >
    <div
      v-if="hasContent"
      class="contents sm:flex sm:min-w-0 sm:flex-col sm:justify-center sm:gap-4"
      :class="imageOnRight ? 'sm:order-1' : 'sm:order-2'"
    >
      <h2 v-if="title" class="order-1 mb-0">{{ title }}</h2>

      <div v-if="hasText" class="split-content__text order-2 min-w-0">
        <StoryblokRichText :document="blok.text" :components="richTextComponents" />
      </div>

      <div v-if="buttonUrl" class="order-4">
        <Button
          :to="buttonUrl"
          :target="blok.button.target || undefined"
          :rel="blok.button.target === '_blank' ? 'noopener noreferrer' : undefined"
          :external="blok.button.linktype === 'asset' || undefined"
          class="!mt-0"
        >
          {{ blok.button_text?.trim() || 'Preberi več' }}
        </Button>
      </div>
    </div>

    <AppImage
      v-if="hasImage"
      :src="blok.image.filename"
      :alt="blok.image.alt || ''"
      class="order-3 min-w-0 w-full self-center rounded-xl"
      :class="imageOnRight ? 'sm:order-2' : 'sm:order-1'"
      :style="imageStyle"
      sizes="100vw sm:50vw"
      loading="lazy"
    />
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { StoryblokRichText } from '@storyblok/vue';
import Button from '~/components/ui/Button.vue';
import { useStoryblokRichTextComponents } from '~/composables/useStoryblokRichTextComponents';
import { useStoryblokButtonUrlResolver } from '~/composables/useStoryblokButtonUrlResolver';

const props = defineProps({
  blok: {
    type: Object,
    default: () => ({})
  }
});

const richTextComponents = useStoryblokRichTextComponents();

const title = computed(() => props.blok?.title?.trim() || '');
const hasImage = computed(() => Boolean(props.blok?.image?.filename));
const imageOnRight = computed(() => props.blok?.image_position === 'right');

const toCssDimension = (value) => {
  const dimension = String(value ?? '').trim();
  if (!dimension) return undefined;
  return /^\d+(?:\.\d+)?$/.test(dimension) ? `${dimension}px` : dimension;
};

const imageStyle = computed(() => ({
  width: toCssDimension(props.blok?.image_width),
  height: toCssDimension(props.blok?.image_height)
}));

const hasRichTextContent = (node) => {
  if (!node) return false;
  if (node.text?.trim()) return true;
  if (node.type === 'image') return Boolean(node.attrs?.src);
  if (node.type === 'blok') return Boolean(node.attrs?.body?.length);
  if (node.type === 'emoji' || node.type === 'horizontal_rule') return true;
  return node.content?.some(hasRichTextContent) || false;
};

const hasText = computed(() => hasRichTextContent(props.blok?.text));

const buttonUrl = useStoryblokButtonUrlResolver(() => props.blok?.button);

const hasContent = computed(() => Boolean(title.value || hasText.value || buttonUrl.value));
</script>

<style scoped>
.split-content__text :deep(ul) {
  list-style: disc;
  padding-left: 1.5rem;
}

.split-content__text :deep(ol) {
  list-style: decimal;
  padding-left: 1.5rem;
}

.split-content__text :deep(> :last-child) {
  margin-bottom: 0;
}
</style>
