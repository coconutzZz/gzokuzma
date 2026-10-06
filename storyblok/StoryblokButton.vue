<template>
  <a
    v-if="blok.is_link"
    v-editable="blok"
    :href="linkUrl"
    :target="blok.link?.target"
    :rel="blok.link?.target === '_blank' ? 'noopener noreferrer' : undefined"
    :class="buttonClasses"
  >
    {{ blok.text }}
  </a>
  <Button
    v-else
    v-editable="blok"
    :to="linkUrl"
    :type="linkUrl ? undefined : 'button'"
    :target="blok.link?.target"
    :rel="blok.link?.target === '_blank' ? 'noopener noreferrer' : undefined"
    :external="blok.link?.linktype === 'asset' || undefined"
    :class="buttonClasses"
  >
    {{ blok.text }}
  </Button>
</template>

<script setup>
import { computed } from 'vue';
import Button from '~/components/Button.vue';
import { useStoryblokButtonUrlResolver } from '~/composables/useStoryblokButtonUrlResolver';

const props = defineProps({
  blok: {
    type: Object,
    default: () => ({})
  }
});

const buttonClasses = computed(() => [
  'inline-block text-white font-bold rounded-full py-2 px-4 md:py-4 md:px-8 shadow transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
  props.blok.type === 'secondary'
    ? '!bg-secondary focus-visible:outline-secondary'
    : '!bg-primary-500 focus-visible:outline-primary-500'
]);

const linkUrl = useStoryblokButtonUrlResolver(() => props.blok.link);
</script>
