<template>
  <div v-if="shareUrl" class="share-buttons">
    <div role="group" :aria-label="label || 'Deli'" class="flex flex-wrap items-center gap-2">
      <a
        v-for="link in shareLinks"
        :key="link.name"
        :href="link.href"
        :aria-label="link.ariaLabel"
        :title="link.name"
        :class="buttonClass"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span :style="{ '--share-icon': `url('${link.icon}')` }" aria-hidden="true" class="share-icon h-4 w-4 shrink-0" />
      </a>

      <button
        type="button"
        :class="buttonClass"
        :disabled="copyState === 'copying'"
        :aria-label="copyState === 'copied' ? 'Povezava kopirana' : 'Kopiraj povezavo'"
        :title="copyState === 'copied' ? 'Povezava kopirana' : 'Kopiraj povezavo'"
        @click="copyLink"
      >
        <span style="--share-icon: url('/img/copy.svg')" aria-hidden="true" class="share-icon h-4 w-4 shrink-0" />
      </button>
    </div>

    <p role="status" aria-live="polite" aria-atomic="true" class="!mb-0 text-sm text-gray-600">
      <span v-if="copyState === 'copied'" class="sr-only">Povezava kopirana.</span>
      <span v-else-if="copyState === 'manual'" class="mt-2 block">
        Samodejno kopiranje ni uspelo. Kopirajte povezavo spodaj.
      </span>
    </p>

    <input
      v-if="copyState === 'manual'"
      ref="manualCopyInput"
      type="text"
      :value="shareUrl"
      readonly
      aria-label="Povezava za ročno kopiranje"
      class="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
      @focus="$event.target.select()"
      @click="$event.target.select()"
    />
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { resolvePageSeo } from '~/utils/seo'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  url: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: 'Deli'
  }
})

const route = useRoute()
const config = useRuntimeConfig()
const requestUrl = useRequestURL()
const siteUrl = config.public.siteUrl || requestUrl.origin
const copyState = ref('idle')
const manualCopyInput = ref(null)
const buttonClass = 'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-200 text-primary-500 transform transition hover:scale-110 duration-300 ease-in-out hover:bg-primary-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60'

const shareUrl = computed(() => {
  try {
    // Match page SEO by default; explicit URLs may retain meaningful queries or fragments.
    const url = new URL(props.url.trim() || resolvePageSeo({}, route.path, siteUrl).ogUrl, siteUrl)
    return ['https:', 'http:'].includes(url.protocol) ? url.href : ''
  } catch {
    return ''
  }
})

const shareLinks = computed(() => {
  const url = encodeURIComponent(shareUrl.value)
  const title = props.title.trim()
  const message = encodeURIComponent([title, shareUrl.value].filter(Boolean).join('\n'))

  return [
    {
      name: 'Facebook',
      ariaLabel: 'Deli na Facebooku (odpre se v novem zavihku)',
      icon: '/img/facebook.svg',
      href: `https://www.facebook.com/sharer/sharer.php?u=${url}`
    },
    {
      name: 'WhatsApp',
      ariaLabel: 'Deli prek WhatsAppa (odpre se v novem zavihku)',
      icon: '/img/whatsapp.svg',
      href: `https://wa.me/?text=${message}`
    },
    {
      name: 'Twitter / X',
      ariaLabel: 'Deli na Twitterju / X (odpre se v novem zavihku)',
      icon: '/img/twitter-x.svg',
      href: `https://twitter.com/intent/tweet?url=${url}&text=${encodeURIComponent(title)}`
    }
  ]
})

watch(shareUrl, () => {
  copyState.value = 'idle'
})

async function copyLink() {
  if (!shareUrl.value || copyState.value === 'copying') return

  const url = shareUrl.value
  copyState.value = 'copying'

  try {
    await navigator.clipboard.writeText(url)
    if (url === shareUrl.value) copyState.value = 'copied'
  } catch {
    if (url !== shareUrl.value) return
    copyState.value = 'manual'
    await nextTick()
    manualCopyInput.value?.focus()
    manualCopyInput.value?.select()
  }
}
</script>

<style scoped>
.share-icon {
  background-color: currentColor;
  -webkit-mask: var(--share-icon) center / contain no-repeat;
  mask: var(--share-icon) center / contain no-repeat;
}
</style>
