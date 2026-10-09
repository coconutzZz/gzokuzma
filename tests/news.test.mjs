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
const { computed, createApp, createSSRApp, defineComponent, h, nextTick, onBeforeUnmount, reactive, ref, Suspense, watch } = await import('vue')
const { renderToString } = await import('vue/server-renderer')
const { parse, compileScript } = await import('@vue/compiler-sfc')
Object.assign(globalThis, { computed, onBeforeUnmount, ref, watch })
const jiti = createJiti(import.meta.url, { alias: { '~': fileURLToPath(new URL('../', import.meta.url)) } })

async function loadComponent(relativePath, id) {
  const filename = fileURLToPath(new URL(relativePath, import.meta.url))
  const source = (await readFile(filename, 'utf8')).replaceAll('import.meta.env.DEV', 'false')
  const { descriptor } = parse(source, { filename })
  return (await jiti.evalModule(compileScript(descriptor, {
    id, inlineTemplate: true
  }).content, { filename: filename.replace(/\.vue$/, '.ts'), async: true })).default
}
const NewsCards = await loadComponent('../components/news/NewsCards.vue', 'news-cards-test')
const NewsCard = await loadComponent('../components/news/NewsCard.vue', 'news-card-test')
const AppImage = await loadComponent('../components/ui/AppImage.vue', 'news-image-test')

let api
let payload
let keys
let deferredInitial
globalThis.useStoryblokApi = () => api
globalThis.useImage = () => src => src
// Model Nuxt's SSR payload reuse while exercising the actual news components.
globalThis.useAsyncData = async (key, handler) => {
  keys.push(key)
  if (deferredInitial) {
    const data = ref()
    const error = ref()
    const status = ref('idle')
    deferredInitial.start = async () => {
      status.value = 'pending'
      try {
        data.value = await handler()
        status.value = 'success'
      } catch (cause) {
        error.value = cause
        status.value = 'error'
      }
    }
    return { data, error, status }
  }
  if (!payload.has(key)) {
    try {
      payload.set(key, { data: await handler(), error: undefined })
    } catch (error) {
      payload.set(key, { data: undefined, error })
    }
  }
  const result = payload.get(key)
  return { data: ref(result.data), error: ref(result.error), status: ref(result.error ? 'error' : 'success') }
}

function configureApi(handler) {
  payload = new Map()
  keys = []
  deferredInitial = undefined
  const requests = []
  api = { async get(endpoint, params) {
    requests.push({ endpoint, params })
    return handler(params)
  } }
  return requests
}

const NuxtLink = defineComponent({
  props: ['to'],
  setup(props, { attrs, slots }) {
    return () => h('a', { ...attrs, href: props.to }, slots.default?.())
  }
})
const NuxtImg = defineComponent({
  props: ['src', 'alt', 'width', 'height', 'sizes', 'densities', 'provider', 'modifiers', 'format', 'quality', 'fit'],
  setup(props, { attrs }) {
    return () => h('img', { ...attrs, src: props.src, alt: props.alt })
  }
})
const Button = defineComponent({
  setup(_, { attrs, slots }) {
    return () => h('button', attrs, slots.default?.())
  }
})

function registerComponents(app) {
  for (const [name, component] of Object.entries({ NewsCard, AppImage, NuxtLink, NuxtImg, Button })) {
    app.component(name, component)
  }
  return app
}

function story(slug, hasImage = true) {
  return {
    uuid: slug, slug, created_at: '2026-01-01',
    content: { title: slug, teaser: '', author: '', image: { filename: hasImage ? `/img/${slug}.jpg` : '' } }
  }
}
function page(stories, total) {
  return { data: { stories }, total }
}
async function flush() {
  await new Promise(resolve => setImmediate(resolve))
  await nextTick()
}
async function mountList(t, initialProps = {}) {
  const props = reactive(initialProps)
  const target = document.createElement('div')
  document.body.append(target)
  const app = registerComponents(createApp({
    render: () => h(Suspense, null, { default: () => h(NewsCards, props) })
  }))
  app.mount(target)
  t.after(() => { app.unmount(); target.remove() })
  await flush()
  return { target, props }
}

test('SSR includes the first available news image at high priority and leaves later images deferred', async () => {
  const requests = configureApi(() => page([story('text-only', false), story('lcp'), story('later')], 3))
  const app = registerComponents(createSSRApp({
    render: () => h(NewsCards, { count: 3, priorityImage: true })
  }))
  const html = await renderToString(app)
  const target = document.createElement('div')
  target.innerHTML = html.replace(/<noscript>[\s\S]*?<\/noscript>/g, '')
  const images = target.querySelectorAll('img.app-image__image')
  assert.equal(images.length, 1)
  assert.equal(images[0].getAttribute('src'), '/img/lcp.jpg')
  assert.equal(images[0].getAttribute('fetchpriority'), 'high')
  assert.equal(images[0].getAttribute('loading'), 'eager')
  assert.ok(images[0].classList.contains('app-image__image--loaded'))
  assert.equal(target.querySelector('a[href="/novice/later"]').getAttribute('aria-label'), 'later')
  assert.equal(requests.length, 1)
  assert.equal(requests[0].params.page, 1)
  assert.equal(keys[0], 'news:["published",3,"",null]')
})

test('a list reuses its server payload and appends live pages without refetching page one', async (t) => {
  const requests = configureApi(params => params.page === 1
    ? page([story('one'), story('two')], 3)
    : page([story('three')], 3))
  const app = registerComponents(createSSRApp({ render: () => h(NewsCards, { count: 2 }) }))
  await renderToString(app)
  const { target } = await mountList(t, { count: 2 })
  assert.equal(requests.length, 1)
  assert.equal(target.querySelectorAll('a[aria-label]').length, 2)
  target.querySelector('button').click()
  await flush()
  assert.deepEqual(requests.map(request => request.params.page), [1, 2])
  assert.equal(target.querySelectorAll('a[aria-label]').length, 3)
  assert.equal(target.querySelector('button'), null)
  assert.equal(payload.values().next().value.data.articles.length, 2)
})

test('filter changes reset pagination and ignore an older in-flight page', async (t) => {
  let finishOldPage
  const requests = configureApi(params => {
    if (params.page === 2) return new Promise(resolve => { finishOldPage = resolve })
    return page([story(params.with_tag || 'original')], params.with_tag ? 1 : 2)
  })
  const { target, props } = await mountList(t, { count: 1, withTag: '' })
  target.querySelector('button').click()
  await flush()
  props.withTag = 'filtered'
  await flush()
  finishOldPage(page([story('stale')], 2))
  await flush()
  assert.deepEqual(requests.map(request => [request.params.page, request.params.with_tag]), [[1, ''], [2, ''], [1, 'filtered']])
  assert.ok(target.querySelector('a[href="/novice/filtered"]'))
  assert.equal(target.querySelector('a[href="/novice/stale"]'), null)
  assert.equal(target.querySelector('button'), null)
})

test('a filtered URL receives its initial news when its prerendered payload key is missing', async (t) => {
  const requests = configureApi(() => page([story('filtered')], 1))
  deferredInitial = {}
  const { target } = await mountList(t, { count: 1, withTag: 'filtered', priorityImage: true })
  assert.equal(requests.length, 0)
  assert.equal(target.querySelector('a[href="/novice/filtered"]'), null)
  await deferredInitial.start()
  await flush()
  assert.equal(requests[0].params.with_tag, 'filtered')
  assert.ok(target.querySelector('a[href="/novice/filtered"]'))
  assert.equal(target.querySelector('img.app-image__image').getAttribute('fetchpriority'), 'high')
})

test('initial errors allow retry and append errors preserve articles and the next page', async (t) => {
  let fail = true
  const requests = configureApi(params => {
    if (fail) throw new Error('News request failed')
    return params.page === 1 ? page([story('one')], 2) : page([story('two')], 2)
  })
  const { target } = await mountList(t, { count: 1 })
  assert.ok(target.querySelector('[role="alert"]'))
  fail = false
  target.querySelector('button').click()
  await flush()
  assert.ok(target.querySelector('a[href="/novice/one"]'))
  assert.equal(target.querySelector('[role="alert"]'), null)
  fail = true
  target.querySelector('button').click()
  await flush()
  assert.ok(target.querySelector('a[href="/novice/one"]'))
  assert.ok(target.querySelector('[role="alert"]'))
  fail = false
  target.querySelector('button').click()
  await flush()
  assert.deepEqual(requests.map(request => request.params.page), [1, 1, 2, 2])
  assert.ok(target.querySelector('a[href="/novice/two"]'))
  assert.equal(target.querySelector('button'), null)
})

test('SSR cache keys distinguish different counts, tags, and authors', async () => {
  const requests = configureApi(() => page([story('news')], 1))
  for (const props of [{ count: 1 }, { count: 2 }, { count: 1, withTag: 'tag' }, { count: 1, byAuthor: 'author' }]) {
    const app = registerComponents(createSSRApp({ render: () => h(NewsCards, props) }))
    await renderToString(app)
  }
  assert.equal(new Set(keys).size, 4)
  assert.equal(requests.length, 4)
  assert.deepEqual(requests.at(-1).params.filter_query, { author: { in: 'author' } })
})
