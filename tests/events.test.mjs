import assert from 'node:assert/strict'
import test from 'node:test'
import { defineComponent, flush, h, loadComponent, mount, window } from './helpers/components.mjs'

const Slider = await loadComponent('components/events/EventsSlider.vue', source =>
  source.replace("import('~/utils/events-swiper')", 'globalThis.loadTestSwiper()'))
const Button = defineComponent({ setup: (_props, { attrs, slots }) => () => h('button', attrs, slots.default?.()) })
let initialize
window.customElements.define('swiper-container', class extends window.HTMLElement {
  initialize() { initialize(this) }
})

function event(uuid, date) {
  return { uuid, content: { date, title: uuid, location: 'Kuzma' } }
}
function setup(t, getStories, loadSwiper = async () => ({})) {
  const requests = []
  const initialized = []
  let imports = 0
  let registrations = 0
  initialize = element => { initialized.push(element) }
  globalThis.useStoryblokApi = () => ({ get: async (endpoint, params) => {
    requests.push({ endpoint, params })
    return { data: { stories: await getStories() } }
  } })
  globalThis.loadTestSwiper = async () => {
    imports++
    return { register: () => { registrations++ }, Navigation: {}, FreeMode: {}, freeModeStyles: '', ...await loadSwiper() }
  }
  const fixture = mount(t, Slider, {}, { Button })
  return { ...fixture, requests, initialized, imports: () => imports, registrations: () => registrations }
}

test('a CMS failure stops loading and a single retry restores the timeline', async t => {
  let attempts = 0
  let finishRetry
  const fixture = setup(t, () => {
    if (++attempts === 1) throw new Error('CMS unavailable')
    return new Promise(resolve => { finishRetry = resolve })
  })
  await flush()
  assert.match(fixture.target.querySelector('[role="alert"]').textContent, /ni mogoče naložiti/)
  assert.equal(fixture.target.querySelector('[aria-busy]').getAttribute('aria-busy'), 'false')
  assert.equal(fixture.imports(), 0)
  const retry = fixture.target.querySelector('button')
  retry.click()
  retry.click()
  await flush()
  assert.equal(attempts, 2)
  assert.equal(fixture.target.querySelector('[aria-busy]').getAttribute('aria-busy'), 'true')
  finishRetry([event('future', '2099-01-01 12:00'), event('past', '2000-01-01 12:00')])
  await flush()
  assert.equal(fixture.target.querySelector('[role="alert"]'), null)
  assert.deepEqual([...fixture.target.querySelectorAll('h3')].map(element => element.textContent), ['past', 'future'])
  assert.ok(fixture.target.querySelector('h3').classList.contains('text-gray-500'))
  assert.equal(fixture.initialized.length, 1)
  assert.equal(fixture.initialized[0].initialSlide, 1)
  assert.equal(fixture.requests[0].params.starts_with, 'dogodki/')
  assert.equal(fixture.requests[0].params.per_page, 5)
  assert.deepEqual(fixture.errors, [])
})

test('an empty timeline shows the empty state without loading Swiper', async t => {
  const fixture = setup(t, () => [])
  await flush()
  assert.match(fixture.target.querySelector('[role="status"]').textContent, /ni objavljenih dogodkov/)
  assert.equal(fixture.imports(), 0)
  assert.equal(fixture.target.querySelector('[aria-busy]').getAttribute('aria-busy'), 'false')
})

test('a failed Swiper import can be retried', async t => {
  let attempts = 0
  const fixture = setup(t, () => [event('meeting', '2099-01-01 12:00')], async () => {
    if (++attempts === 1) throw new Error('Bundle unavailable')
    return {}
  })
  await flush()
  assert.ok(fixture.target.querySelector('[role="alert"]'))
  fixture.target.querySelector('button').click()
  await flush()
  assert.equal(fixture.target.querySelector('[role="alert"]'), null)
  assert.equal(fixture.initialized.length, 1)
  assert.equal(fixture.imports(), 2)
  assert.deepEqual(fixture.errors, [])
})

test('a failed Swiper initialization removes raw slides and permits retry', async t => {
  const fixture = setup(t, () => [event('meeting', '2099-01-01 12:00')])
  initialize = () => { throw new Error('Initialization failed') }
  await flush()
  assert.ok(fixture.target.querySelector('[role="alert"]'))
  assert.equal(fixture.target.querySelector('swiper-container'), null)
  initialize = element => fixture.initialized.push(element)
  fixture.target.querySelector('button').click()
  await flush()
  assert.equal(fixture.target.querySelector('[role="alert"]'), null)
  assert.equal(fixture.initialized.length, 1)
  assert.deepEqual(fixture.errors, [])
})

test('unmounting while the CMS request is pending prevents later slider work', async t => {
  let resolve
  const fixture = setup(t, () => new Promise(done => { resolve = done }))
  fixture.unmount()
  resolve([event('meeting', '2099-01-01 12:00')])
  await flush()
  assert.equal(fixture.imports(), 0)
  assert.equal(fixture.initialized.length, 0)
  assert.deepEqual(fixture.errors, [])
})

test('unmounting while Swiper loads prevents registration and initialization', async t => {
  let resolve
  const fixture = setup(t, () => [event('meeting', '2099-01-01 12:00')], () => new Promise(done => { resolve = done }))
  await flush()
  fixture.unmount()
  resolve({})
  await flush()
  assert.equal(fixture.registrations(), 0)
  assert.equal(fixture.initialized.length, 0)
  assert.deepEqual(fixture.errors, [])
})
