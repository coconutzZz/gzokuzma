import assert from 'node:assert/strict'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { createJiti } from 'jiti'
import { defineComponent, flush, h, loadComponent, mount, reactive, ref, Suspense } from './helpers/components.mjs'

const { createSSRApp, toValue } = await import('vue')
const { renderToString } = await import('vue/server-renderer')
const jiti = createJiti(import.meta.url, {
  fsCache: false, alias: { '~': fileURLToPath(new URL('../', import.meta.url)) },
})
const { useDepartmentProfile } = await jiti.import('../composables/useDepartmentProfile.ts')
const AssociationPage = await loadComponent('storyblok/departments/AssociationPage.vue', source =>
  source.replace(/^import \{ useFloatingActions \}.*$/m, ''))
const components = {}
for (const name of ['DepartmentContact', 'DepartmentLeadership', 'DepartmentDocuments', 'DepartmentDonationModal', 'DepartmentFeaturedImage', 'PersonCard', 'Association']) {
  components[name] = await loadComponent(`components/departments/${name}.vue`)
}
components.BaseModal = await loadComponent('components/ui/BaseModal.vue')
components.ButtonClose = await loadComponent('components/ui/ButtonClose.vue')
components.Button = defineComponent({ setup: (_props, { attrs, slots }) => () => h('button', attrs, slots.default?.()) })
components.AppImage = components.NuxtImg = defineComponent({
  props: ['src', 'alt'], setup: (props, { attrs }) => () => h('img', { ...attrs, src: props.src, alt: props.alt }),
})
components.DepartmentLogo = defineComponent({ render: () => h('span') })
components.StoryblokComponent = defineComponent({
  props: ['blok'], setup: props => () => h('p', props.blok.title),
})

const department = {
  id: 'kuzma', slug: 'pgdkuzma', name: 'PGD Kuzma', name_prefix: 'Prostovoljno gasilsko društvo',
  street: 'Kuzma 24', email: 'department@example.com', year_founded: 1925,
  company_register_number: 123, tax_number: 456, iban: 'SI56 TEST', facebook_url: 'https://www.facebook.com/pgdkuzma',
}
const people = [
  { id: 'commander', first_name: 'Commander', last_name: 'Example', department_role: 'poveljnik' },
  { id: 'president', first_name: 'President', last_name: 'Example', department_role: 'predsednik' },
]
const files = [{ id: 'report', name: 'Report.pdf', url: '/api/files/pgdkuzma/download?file=Report.pdf' }]
const blok = {
  _uid: 'department-block', component: 'AssociationPage',
  featured_image: { filename: '/photo.jpg', alt: 'Department photo' },
  qr_code_bank_transfer: { filename: '/donation.png', alt: 'Donation QR code' },
  body: [{ _uid: 'extra', component: 'content', title: 'Additional CMS content' }],
}

// Control Nuxt request results without replacing the composable's data derivation.
function configureFetch(cache = {}) {
  const requests = []
  const resources = []
  const nuxtApp = { payload: { data: cache }, static: { data: {} } }
  globalThis.useFetch = (url, options) => {
    const data = ref()
    const error = ref()
    const status = ref('idle')
    function execute(cause) {
      if (!toValue(options.enabled)) return Promise.resolve()
      const key = toValue(options.key)
      const cached = options.getCachedData(key, nuxtApp, { cause })
      if (cached !== undefined) {
        data.value = cached
        status.value = 'success'
        return Promise.resolve()
      }
      status.value = 'pending'
      error.value = undefined
      return new Promise(resolve => requests.push({
        url: toValue(url), key, cause,
        succeed(value) { data.value = value; status.value = 'success'; resolve() },
        fail() { data.value = undefined; error.value = new Error('Request unavailable'); status.value = 'error'; resolve() },
      }))
    }
    const state = { data, error, status, refresh: () => execute('refresh:manual') }
    resources.push({ ...state, url, options })
    return Object.assign(execute('initial').then(() => state), state)
  }
  return { requests, resources }
}

function fulfill(requests) {
  requests[0].succeed(department)
  requests[1].succeed(people)
  requests[2].succeed(files)
}

async function mountProfile(t, content = blok, cache) {
  const fetch = configureFetch(cache)
  const route = reactive({ params: { slug: ['pgdkuzma'] } })
  const actions = []
  globalThis.useRoute = () => route
  globalThis.useFloatingActions = () => ({ registerAction: action => actions.push(action) })
  const props = reactive({ blok: content })
  const Host = defineComponent({ render: () => h(Suspense, null, { default: () => h(AssociationPage, props) }) })
  const fixture = mount(t, Host, {}, components)
  return { ...fixture, ...fetch, actions, props, route }
}

test('profile requests start in parallel and readiness waits for all three', async () => {
  const { requests } = configureFetch()
  const profile = useDepartmentProfile('pgdkuzma')
  assert.deepEqual(requests.map(request => request.url), ['/api/departments/pgdkuzma', '/api/firemen/pgdkuzma', '/api/files/pgdkuzma'])
  let ready = false
  profile.ready.then(() => { ready = true })
  requests[0].succeed(department)
  requests[1].succeed(people)
  await flush()
  assert.equal(ready, false)
  assert.equal(profile.isDepartmentLoading.value, false)
  assert.equal(profile.isFilesLoading.value, true)
  requests[2].succeed(files)
  await profile.ready
  assert.equal(ready, true)
  assert.equal(profile.department.value.name, 'PGD Kuzma')
})

test('leadership sorting preserves the original API list and empty results stay usable', async () => {
  const { requests } = configureFetch()
  const profile = useDepartmentProfile('pgdkuzma')
  const original = Object.freeze(people.map(person => Object.freeze({ ...person })))
  requests[0].succeed(department)
  requests[1].succeed(original)
  requests[2].succeed([])
  await profile.ready
  assert.deepEqual(profile.firemen.value.map(person => person.id), ['president', 'commander'])
  assert.deepEqual(original.map(person => person.id), ['commander', 'president'])
  assert.deepEqual(profile.files.value, [])
  const empty = profile.refreshFiremen()
  requests.at(-1).succeed(null)
  await empty
  assert.deepEqual(profile.firemen.value, [])
})

test('request URLs and payload keys follow a reactive department and missing slugs stay disabled', async () => {
  const { requests, resources } = configureFetch()
  const slug = ref()
  const profile = useDepartmentProfile(slug)
  await profile.ready
  assert.equal(requests.length, 0)
  assert.equal(profile.isDepartmentLoading.value, false)
  slug.value = 'pgdnovodolic'
  assert.deepEqual(resources.map(resource => toValue(resource.url)), ['/api/departments/pgdnovodolic', '/api/firemen/pgdnovodolic', '/api/files/pgdnovodolic'])
  assert.deepEqual(resources.map(resource => toValue(resource.options.key)), ['dept-pgdnovodolic', 'firemen-pgdnovodolic', 'files-pgdnovodolic'])
  assert.ok(resources.every(resource => toValue(resource.options.enabled)))
})

test('server payloads are reused but a targeted retry bypasses cached data', async () => {
  const { requests, resources } = configureFetch({ 'dept-pgdkuzma': department, 'firemen-pgdkuzma': people, 'files-pgdkuzma': files })
  const profile = useDepartmentProfile('pgdkuzma')
  await profile.ready
  assert.equal(requests.length, 0)
  assert.equal(profile.files.value[0].url, files[0].url)
  const retry = profile.refreshFiles()
  assert.equal(requests.length, 1)
  assert.equal(requests[0].url, '/api/files/pgdkuzma')
  assert.equal(resources[2].options.getCachedData('files-pgdkuzma', { payload: { data: {} }, static: { data: { 'files-pgdkuzma': files } } }, { cause: 'initial' }), files)
  requests[0].succeed([])
  await retry
  assert.deepEqual(profile.files.value, [])
})

test('the page renders extracted contact, leadership, documents and CMS body sections', async t => {
  const fixture = await mountProfile(t)
  fulfill(fixture.requests)
  await flush()
  assert.match(fixture.target.textContent, /Kontaktni podatki/)
  assert.equal(fixture.target.querySelector('a[href="mailto:department@example.com"]').textContent.trim(), department.email)
  assert.match(fixture.target.textContent, /SI56 TEST/)
  assert.deepEqual([...fixture.target.querySelectorAll('h6')].map(element => element.textContent.trim()), ['President Example', 'Commander Example'])
  assert.equal(fixture.target.querySelector('a[title="Report.pdf"]').getAttribute('href'), files[0].url)
  assert.ok(fixture.target.querySelector('a[aria-haspopup="dialog"] img[alt="Department photo"]'))
  assert.match(fixture.target.textContent, /Additional CMS content/)
  assert.deepEqual(fixture.errors, [])
})

test('server HTML includes every profile section, prioritizes the photo, and defers the donation image', async () => {
  const { requests } = configureFetch({ 'dept-pgdkuzma': department, 'firemen-pgdkuzma': people, 'files-pgdkuzma': files })
  globalThis.useRoute = () => ({ params: { slug: 'pgdkuzma' } })
  globalThis.useFloatingActions = () => ({ registerAction() {} })
  const app = createSSRApp({ render: () => h(AssociationPage, { blok }) })
  for (const [name, component] of Object.entries(components)) app.component(name, component)
  const html = await renderToString(app)
  assert.equal(requests.length, 0)
  for (const text of ['Kontaktni podatki', 'department@example.com', 'President Example', 'Dokumenti', 'Additional CMS content']) {
    assert.ok(html.includes(text), text)
  }
  assert.ok(html.includes(files[0].url))
  const target = document.createElement('div')
  target.innerHTML = html
  const photo = target.querySelector('img[src="/photo.jpg"]')
  assert.equal(photo.getAttribute('fetchpriority'), 'high')
  assert.equal(photo.getAttribute('loading'), 'eager')
  assert.equal(html.includes('src="/donation.png"'), false)
})

test('a documents failure leaves contact and leadership available and retries only documents', async t => {
  const fixture = await mountProfile(t)
  fixture.requests[0].succeed(department)
  fixture.requests[1].succeed(people)
  fixture.requests[2].fail()
  await flush()
  assert.match(fixture.target.querySelector('[role="alert"]').textContent, /Dokumentov/)
  assert.ok(fixture.target.querySelector('a[href="mailto:department@example.com"]'))
  assert.match(fixture.target.textContent, /President Example/)
  fixture.target.querySelector('[role="alert"] button').click()
  await flush()
  assert.equal(fixture.requests.length, 4)
  assert.equal(fixture.requests.at(-1).url, '/api/files/pgdkuzma')
  assert.match(fixture.target.querySelector('[role="status"]').textContent, /Nalaganje dokumentov/)
  fixture.requests.at(-1).succeed(files)
  await flush()
  assert.equal(fixture.target.querySelector('[role="alert"]'), null)
  assert.ok(fixture.target.querySelector('a[title="Report.pdf"]'))
  assert.deepEqual(fixture.errors, [])
})

test('a leadership failure has its own retry and does not hide documents', async t => {
  const fixture = await mountProfile(t)
  fixture.requests[0].succeed(department)
  fixture.requests[1].fail()
  fixture.requests[2].succeed(files)
  await flush()
  assert.match(fixture.target.querySelector('[role="alert"]').textContent, /vodstvu/)
  assert.ok(fixture.target.querySelector('a[title="Report.pdf"]'))
  fixture.target.querySelector('[role="alert"] button').click()
  await flush()
  assert.equal(fixture.requests.at(-1).url, '/api/firemen/pgdkuzma')
  fixture.requests.at(-1).succeed(people)
  await flush()
  assert.equal(fixture.target.querySelector('[role="alert"]'), null)
  assert.match(fixture.target.textContent, /President Example/)
  assert.deepEqual(fixture.errors, [])
})

test('a failed department can be retried without rendering undefined contact links', async t => {
  const fixture = await mountProfile(t, undefined)
  fixture.requests[0].fail()
  fixture.requests[1].succeed([])
  fixture.requests[2].succeed([])
  await flush()
  assert.match(fixture.target.querySelector('[role="alert"]').textContent, /Podatkov društva/)
  assert.equal(fixture.target.querySelector('a[href^="mailto:"]'), null)
  fixture.target.querySelector('[role="alert"] button').click()
  await flush()
  assert.equal(fixture.requests.at(-1).url, '/api/departments/pgdkuzma')
  fixture.requests.at(-1).succeed(department)
  await flush()
  assert.equal(fixture.target.querySelector('[role="alert"]'), null)
  assert.ok(fixture.target.querySelector('a[href="mailto:department@example.com"]'))
  assert.deepEqual(fixture.errors, [])
})

test('contact and floating donation actions open the extracted dialog and propagate closing', async t => {
  const fixture = await mountProfile(t)
  fulfill(fixture.requests)
  await flush()
  const donate = [...fixture.target.querySelectorAll('button')].find(button => button.textContent.includes('DONIRAJ DRUŠTVU'))
  donate.click()
  await flush()
  const dialog = fixture.target.querySelector('dialog')
  assert.equal(dialog.open, true)
  assert.equal(dialog.getAttribute('aria-label'), 'Doniraj društvu PGD Kuzma')
  assert.equal(dialog.querySelector('img').getAttribute('src'), '/donation.png')
  dialog.querySelector('button').click()
  await flush()
  assert.equal(dialog.open, false)
  const action = fixture.actions.find(action => action.id === 'association-donation')
  assert.equal(action.isAvailable(), true)
  action.onClick()
  await flush()
  assert.equal(dialog.open, true)
  fixture.unmount()
  assert.equal(document.body.classList.contains('overflow-hidden'), false)
  assert.deepEqual(fixture.errors, [])
})

test('missing optional CMS assets and empty collections render without broken controls', async t => {
  const fixture = await mountProfile(t, {})
  fixture.requests[0].succeed({ ...department, facebook_url: '', email: '' })
  fixture.requests[1].succeed(null)
  fixture.requests[2].succeed([])
  await flush()
  assert.equal(fixture.target.querySelector('a[aria-haspopup="dialog"]'), null)
  assert.equal(fixture.target.querySelector('a[href^="mailto:"]'), null)
  assert.equal(fixture.target.querySelector('h2')?.textContent, 'Kontaktni podatki')
  assert.equal([...fixture.target.querySelectorAll('h2')].some(element => element.textContent === 'Dokumenti'), false)
  assert.equal(fixture.actions.find(action => action.id === 'association-donation').isAvailable(), false)
  assert.match(fixture.target.textContent, /Podatki o vodstvu še niso na voljo/)
  assert.deepEqual(fixture.errors, [])
})
