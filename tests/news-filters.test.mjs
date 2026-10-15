import assert from 'node:assert/strict'
import test from 'node:test'
import { defineComponent, flush, h, loadComponent, mount } from './helpers/components.mjs'

const { createRouter, createMemoryHistory, useRoute } = await import('vue-router')

const Page = await loadComponent('pages/novice.vue', source => source.replace(/^import NewsCards.*$/m, ''))
const NewsCards = defineComponent({
  props: ['withTag'],
  setup: props => () => h('output', { 'data-filter': props.withTag }),
})
const SectionTitle = defineComponent({ render: () => h('h1', 'Aktualno') })
globalThis.usePageSeo = () => {}
globalThis.useStoryblokApi = () => ({
  get: async () => ({ data: { tags: ['alpha', 'beta', 'special & tag'].map(name => ({ name, taggings_count: 1 })) } }),
})

async function mountNews(t, url) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/novice', component: Page }],
  })
  await router.push(url)
  globalThis.useRoute = useRoute
  globalThis.navigateTo = location => router.push(location)
  const fixture = mount(t, Page, {}, { NewsCards, SectionTitle }, undefined, [router])
  await flush()
  return { ...fixture, router, filter: () => fixture.target.querySelector('output').dataset.filter }
}

test('query-only navigation and back/forward keep news filters and pressed buttons in sync', async t => {
  const fixture = await mountNews(t, '/novice?with_tag=alpha')
  const alpha = () => [...fixture.target.querySelectorAll('button')].find(button => button.textContent.includes('#alpha'))
  assert.equal(fixture.filter(), 'alpha')
  assert.equal(alpha().getAttribute('aria-pressed'), 'true')
  await fixture.router.push('/novice?with_tag=beta')
  await flush()
  assert.equal(fixture.filter(), 'beta')
  assert.equal(alpha().getAttribute('aria-pressed'), 'false')
  fixture.router.back()
  await flush()
  assert.equal(fixture.filter(), 'alpha')
  fixture.router.forward()
  await flush()
  assert.equal(fixture.filter(), 'beta')
  assert.deepEqual(fixture.errors, [])
})

test('tag buttons update the URL, preserve other query values and remove an empty filter', async t => {
  const fixture = await mountNews(t, '/novice?with_tag=alpha&search=fire#articles')
  const button = tag => [...fixture.target.querySelectorAll('button')].find(element => element.textContent.includes(`#${tag}`))
  button('beta').click()
  await flush()
  assert.equal(fixture.router.currentRoute.value.query.with_tag, 'alpha,beta')
  assert.equal(fixture.filter(), 'alpha,beta')
  assert.equal(fixture.router.currentRoute.value.query.search, 'fire')
  assert.equal(fixture.router.currentRoute.value.hash, '#articles')
  button('alpha').click()
  await flush()
  button('beta').click()
  await flush()
  assert.equal(fixture.router.currentRoute.value.query.with_tag, undefined)
  assert.equal(fixture.filter(), '')
  button('special & tag').click()
  await flush()
  assert.equal(fixture.router.currentRoute.value.query.with_tag, 'special & tag')
})

test('repeated and comma-separated query values normalize to unique tags', async t => {
  const fixture = await mountNews(t, '/novice?with_tag=alpha,beta&with_tag=beta&with_tag=&with_tag')
  assert.equal(fixture.filter(), 'alpha,beta')
  assert.equal(fixture.target.querySelectorAll('button[aria-pressed="true"]').length, 2)
})
