import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { createJiti } from 'jiti'

const { Window } = await import('happy-dom')
const window = new Window({ url: 'http://localhost' })
for (const name of ['window', 'document', 'HTMLElement', 'SVGElement', 'Element', 'Node', 'Event']) {
  globalThis[name] = name === 'window' ? window : window[name]
}
const { createApp, createSSRApp, defineComponent, h, nextTick, onMounted, reactive, ref } = await import('vue')
const { renderToString } = await import('vue/server-renderer')
const { parse, compileScript } = await import('@vue/compiler-sfc')
const jiti = createJiti(import.meta.url, { alias: { '~': fileURLToPath(new URL('../', import.meta.url)) } })
const { canTransformStoryblokImage, getStoryblokImageUrl, getImageDimensions } = await jiti.import('../utils/image-source.ts')
const { default: setupProvider } = await jiti.import('../providers/storyblok.ts')
const provider = setupProvider()
const storyblokSrc = 'https://a.storyblok.com/f/123/1200x900/hash/photo.jpg'

function resolveImage(src, modifiers = {}, options = {}) {
  return options.provider === 'storyblok' ? provider.getImage(src, { modifiers }, {}).url : src
}
const previewRequests = []
globalThis.useImage = () => (src, modifiers, options) => {
  const url = resolveImage(src, modifiers, options)
  previewRequests.push({ src, modifiers, options, url })
  return url
}

const filename = fileURLToPath(new URL('../components/ui/AppImage.vue', import.meta.url))
const { descriptor } = parse(await readFile(filename, 'utf8'), { filename })
const { default: AppImage } = await jiti.evalModule(compileScript(descriptor, {
  id: 'app-image-test', inlineTemplate: true
}).content, { filename: filename.replace(/\.vue$/, '.ts'), async: true })

class Observer {
  static instances = []
  constructor(callback, options) {
    this.callback = callback
    this.options = options
    Observer.instances.push(this)
  }
  observe(element) { this.element = element }
  disconnect() { this.disconnected = true }
  intersect() { this.callback([{ isIntersecting: true, target: this.element }]) }
}

const NuxtImg = defineComponent({
  inheritAttrs: false,
  props: ['src', 'alt', 'width', 'height', 'sizes', 'densities', 'provider', 'modifiers', 'format', 'quality', 'fit'],
  emits: ['load', 'error'],
  setup(props, { attrs, emit, expose }) {
    const imgEl = ref()
    expose({ imgEl })
    onMounted(() => {
      if (props.src === '/img/cached.png') {
        Object.defineProperty(imgEl.value, 'naturalWidth', { value: 100 })
        Object.defineProperty(imgEl.value, 'complete', { value: true })
        imgEl.value.decode = async () => {}
      }
    })
    return () => h('img', {
      ...attrs,
      ref: imgEl,
      src: resolveImage(props.src, {
        ...props.modifiers, width: props.width, height: props.height,
        format: props.format, quality: props.quality
      }, { provider: props.provider }),
      alt: props.alt,
      width: props.width,
      height: props.height,
      'data-provider': props.provider,
      onLoad: event => emit('load', event),
      onError: event => emit('error', event)
    })
  }
})

async function mountImage(t, initialProps) {
  Observer.instances = []
  globalThis.IntersectionObserver = Observer
  const props = reactive(initialProps)
  const target = document.createElement('div')
  document.body.append(target)
  const app = createApp({ render: () => h(AppImage, props) })
  app.component('NuxtImg', NuxtImg)
  app.mount(target)
  t.after(() => { app.unmount(); target.remove() })
  await nextTick()
  return { props, target, observer: Observer.instances.at(-1), image: () => target.querySelector('img.app-image__image') }
}

async function flush() {
  await new Promise(resolve => setImmediate(resolve))
  await nextTick()
}

test('only exact Storyblok asset hosts qualify, including regional and protocol-relative URLs', () => {
  for (const host of ['a.storyblok.com', 'a2.storyblok.com', 'a-us.storyblok.com', 'a2-us.storyblok.com', 'a-ap.storyblok.com', 'a2-ap.storyblok.com', 'a-ca.storyblok.com', 'a.storyblokchina.cn']) {
    assert.ok(getStoryblokImageUrl(`https://${host}/f/photo.jpg`))
  }
  assert.ok(getStoryblokImageUrl('//a.storyblok.com/f/photo.jpg'))
  for (const src of [
    '/img/logo.png', 'data:image/png;base64,AAA', 'blob:http://localhost/image', 'not a URL',
    'https://example.com/a.storyblok.com/photo.jpg',
    'https://a.storyblok.com.example.com/photo.jpg',
    'https://a.storyblok.com@example.com/photo.jpg',
    'https://example.com/photo.jpg?src=https://a.storyblok.com/f/photo.jpg',
    'ftp://a.storyblok.com/f/photo.jpg'
  ]) assert.equal(getStoryblokImageUrl(src), undefined, src)
})

test('provider preserves all other sources, signed assets, SVGs, and animated GIFs', () => {
  for (const src of [
    '/img/logo.png', 'https://example.com/photo.jpg?token=123',
    'https://a.storyblok.com.example.com/photo.jpg',
    `${storyblokSrc}?token=123`, storyblokSrc.replace('.jpg', '.svg'),
    storyblokSrc.replace('.jpg', '.gif'), `${storyblokSrc}/m/200x0`
  ]) {
    assert.equal(canTransformStoryblokImage(src), false)
    assert.equal(provider.getImage(src, { modifiers: { width: 32, format: 'webp', filters: { blur: 4 } } }, {}).url, src)
  }
})

test('Storyblok transformations retain the original CDN host and do not mutate caller filters', () => {
  const filters = { focal: '10x20:30x40' }
  const src = storyblokSrc.replace('a.storyblok.com', 'a-us.storyblok.com')
  const url = provider.getImage(src, { modifiers: { width: 32, height: 24, quality: 30, format: 'webp', filters } }, {}).url
  assert.match(url, /^https:\/\/a-us\.storyblok\.com\//)
  assert.ok(url.endsWith('/m/32x24/filters:focal(10x20:30x40):format(webp):quality(30)'))
  assert.deepEqual(filters, { focal: '10x20:30x40' })
})

test('dimensions retain aspect ratio when only one dimension is specified', () => {
  assert.deepEqual(getImageDimensions(storyblokSrc), { width: 1200, height: 900 })
  assert.deepEqual(getImageDimensions(storyblokSrc, 400), { width: 400, height: 300 })
  assert.deepEqual(getImageDimensions(storyblokSrc, undefined, 300), { width: 400, height: 300 })
  assert.deepEqual(getImageDimensions(storyblokSrc, 400, 200), { width: 400, height: 200 })
  assert.deepEqual(getImageDimensions('/img/person.svg', 64, 64), { width: 64, height: 64 })
  assert.equal(getImageDimensions('/img/person.svg'), undefined)
})

test('lazy images keep a blurred preview and defer the full image until approaching the viewport', async (t) => {
  const fixture = await mountImage(t, { src: storyblokSrc, alt: 'Photograph', class: 'w-full rounded-xl', title: 'Photo title' })
  assert.equal(fixture.image(), null)
  assert.equal(fixture.target.firstElementChild.dataset.imageState, 'waiting')
  assert.equal(fixture.observer.options.rootMargin, '200px')
  assert.ok(fixture.target.querySelector('.app-image__preview'))
  // Happy DOM rejects CSS URLs containing parentheses, unlike browsers.
  assert.match(previewRequests.at(-1).url, /32x24\/filters:format\(webp\):quality\(30\):blur\(4\)/)
  assert.equal(fixture.target.firstElementChild.style.aspectRatio, '1200 / 900')
  fixture.observer.intersect()
  await flush()
  assert.equal(fixture.observer.disconnected, true)
  assert.equal(fixture.image().dataset.provider, 'storyblok')
  assert.equal(fixture.image().alt, 'Photograph')
  assert.equal(fixture.image().title, 'Photo title')
  assert.equal(fixture.target.firstElementChild.dataset.imageState, 'loading')

  let finishDecode
  Object.defineProperty(fixture.image(), 'naturalWidth', { value: 1200, configurable: true })
  fixture.image().decode = () => new Promise(resolve => { finishDecode = resolve })
  fixture.image().dispatchEvent(new Event('load'))
  await flush()
  assert.equal(fixture.target.firstElementChild.dataset.imageState, 'loading')
  finishDecode()
  await flush()
  assert.equal(fixture.target.firstElementChild.dataset.imageState, 'loaded')
  assert.ok(fixture.image().classList.contains('app-image__image--loaded'))
})

test('external images use a neutral placeholder and keep their original URL even with a supplied Storyblok provider', async (t) => {
  const src = 'https://example.com/photo.jpg?signature=123'
  const fixture = await mountImage(t, { src, provider: 'storyblok' })
  assert.equal(fixture.target.querySelector('.app-image__preview'), null)
  fixture.observer.intersect()
  await nextTick()
  assert.equal(fixture.image().dataset.provider, 'none')
  assert.equal(fixture.image().getAttribute('src'), src)
  fixture.image().dispatchEvent(new Event('error'))
  await nextTick()
  assert.equal(fixture.target.firstElementChild.dataset.imageState, 'error')
  assert.ok(fixture.target.querySelector('.app-image__error'))
})

test('eager images start immediately', async (t) => {
  const fixture = await mountImage(t, { src: '/img/logo.png', width: 100, height: 100, loading: 'eager' })
  assert.equal(fixture.observer, undefined)
  assert.ok(fixture.image())
  Object.defineProperty(fixture.image(), 'naturalWidth', { value: 100 })
  fixture.image().decode = async () => {}
  fixture.image().dispatchEvent(new Event('load'))
  await flush()
  assert.equal(fixture.target.firstElementChild.dataset.imageState, 'loaded')
})

test('cached images reveal without needing another load event', async (t) => {
  const fixture = await mountImage(t, { src: '/img/cached.png', loading: 'eager' })
  await flush()
  assert.equal(fixture.target.firstElementChild.dataset.imageState, 'loaded')
})

test('SSR reserves space and provides an image fallback when JavaScript is disabled', async () => {
  const app = createSSRApp({ render: () => h(AppImage, { src: storyblokSrc, alt: 'Photograph' }) })
  app.component('NuxtImg', NuxtImg)
  const html = await renderToString(app)
  assert.match(html, /data-image-state="waiting"/)
  assert.ok(!html.includes('class="app-image__image"'))
  assert.ok(html.includes(`<noscript><img src="${storyblokSrc}" alt="Photograph"`))
  assert.match(html, /aspect-ratio:1200 \/ 900/)
})

test('noscript fallback escapes source URLs and alt text as HTML attributes', async () => {
  const app = createSSRApp({ render: () => h(AppImage, {
    src: 'https://example.com/photo.jpg?one=1&two="2"', alt: 'A "photo" <description>'
  }) })
  app.component('NuxtImg', NuxtImg)
  const html = await renderToString(app)
  assert.ok(html.includes('src="https://example.com/photo.jpg?one=1&amp;two=&quot;2&quot;"'))
  assert.ok(html.includes('alt="A &quot;photo&quot; &lt;description&gt;"'))
})

test('source changes reset the placeholder and ignore an earlier image decode', async (t) => {
  const fixture = await mountImage(t, { src: storyblokSrc })
  fixture.observer.intersect()
  await nextTick()
  let finishDecode
  Object.defineProperty(fixture.image(), 'naturalWidth', { value: 1200 })
  fixture.image().decode = () => new Promise(resolve => { finishDecode = resolve })
  fixture.image().dispatchEvent(new Event('load'))
  fixture.props.src = 'https://example.com/new-photo.jpg'
  await flush()
  finishDecode()
  await flush()
  assert.equal(fixture.target.firstElementChild.dataset.imageState, 'waiting')
  assert.equal(fixture.image(), null)
  assert.equal(fixture.target.querySelector('.app-image__preview'), null)
})

test('images still load when IntersectionObserver is unavailable', async (t) => {
  const fixture = await mountImage(t, { src: '/img/logo.png' })
  globalThis.IntersectionObserver = undefined
  fixture.props.src = '/img/other.png'
  await flush()
  assert.ok(fixture.image())
  assert.equal(fixture.image().getAttribute('src'), '/img/other.png')
})
