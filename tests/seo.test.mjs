import assert from 'node:assert/strict'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { createJiti } from 'jiti'
import { createSSRApp, effectScope, h, nextTick, reactive, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { useHead, useSeoMeta } from '@unhead/vue'
import { createHead, renderSSRHead } from '@unhead/vue/server'
import { createHead as createClientHead } from '@unhead/vue/client'
import { resolveTags } from 'unhead/utils'

const jiti = createJiti(import.meta.url, { alias: { '~': fileURLToPath(new URL('../', import.meta.url)) } })
const { getStorySeo, resolvePageSeo, SITE_NAME, SITE_DESCRIPTION } = await jiti.import('../utils/seo.ts')
const { usePageSeo } = await jiti.import('../composables/usePageSeo.ts')
const siteUrl = 'https://gzo-kuzma.si'
const richText = text => ({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] })

test('existing articles get a plain-text description and featured image without CMS changes', () => {
  const story = { name: 'Internal name', content: {
    component: 'Article', title: 'Gasilska vaja', content: richText('Skupna vaja gasilskih društev.'),
    image: { filename: '//a.storyblok.com/photo.jpg', alt: 'Gasilci na vaji' }
  } }
  const metadata = resolvePageSeo(getStorySeo(story), '/novice/vaja', siteUrl)
  assert.equal(metadata.ogTitle, 'Gasilska vaja')
  assert.equal(metadata.ogDescription, 'Skupna vaja gasilskih društev.')
  assert.equal(metadata.ogType, 'article')
  assert.equal(metadata.ogImage, 'https://a.storyblok.com/photo.jpg')
  assert.equal(metadata.ogImageAlt, 'Gasilci na vaji')
  assert.equal(getStorySeo({ content: { component: 'article' } }).type, 'article')
})

test('optional sharing fields override regular content', () => {
  const metadata = resolvePageSeo(getStorySeo({ content: {
    title: 'Original', description: 'Original description',
    seo_title: 'Sharing title', seo_description: 'Sharing description',
    image: { filename: '/original.jpg' }, seo_image: { filename: '/sharing.jpg', alt: 'Sharing photo' }
  } }), '/zveza', siteUrl)
  assert.equal(metadata.title, `Sharing title | ${SITE_NAME}`)
  assert.equal(metadata.ogDescription, 'Sharing description')
  assert.equal(metadata.ogImage, `${siteUrl}/sharing.jpg`)
  assert.equal(metadata.twitterImageAlt, 'Sharing photo')
})

test('empty overrides fall back to rich text, featured image and contextual department title', () => {
  const options = getStorySeo({ name: 'O nas', content: {
    seo_title: ' ', seo_description: '', seo_image: { filename: '' },
    featured_text: richText('Predstavitev društva.'),
    image: { filename: '' }, featured_image: { filename: '/department.jpg' }
  } }, { title: 'PGD Kuzma' })
  assert.equal(options.title, 'PGD Kuzma')
  assert.equal(options.description, 'Predstavitev društva.')
  assert.equal(resolvePageSeo(options, '/drustva/pgdkuzma', siteUrl).ogImage, `${siteUrl}/department.jpg`)
})

test('rich-text excerpts skip embedded components and remain short', () => {
  const text = 'Opis gasilske vaje. '.repeat(30)
  const content = { ...richText(text), attrs: { body: [{ text: 'Do not include' }] } }
  const { description } = getStorySeo({ content: { content } })
  assert.ok(description.length <= 200)
  assert.ok(description.endsWith('…'))
  assert.ok(!description.includes('Do not include'))
})

test('missing content and unsafe image URLs use site defaults', () => {
  for (const image of [undefined, { filename: '' }, 'javascript:alert(1)']) {
    const metadata = resolvePageSeo({ ...getStorySeo(), image }, '/', siteUrl)
    assert.equal(metadata.title, SITE_NAME)
    assert.equal(metadata.description, SITE_DESCRIPTION)
    assert.equal(metadata.ogImage, `${siteUrl}/img/share-default.png`)
    assert.equal(metadata.ogImageAlt, SITE_NAME)
    assert.equal(metadata.twitterCard, 'summary_large_image')
  }
})

test('canonical URLs drop filters, fragments and index aliases but preserve image parameters', () => {
  const metadata = resolvePageSeo({ image: '/photo.jpg?width=1200' }, '/drustva/pgdkuzma/index/?utm_source=fb#top', siteUrl)
  assert.equal(metadata.ogUrl, `${siteUrl}/drustva/pgdkuzma`)
  assert.equal(metadata.ogImage, `${siteUrl}/photo.jpg?width=1200`)
  assert.equal(resolvePageSeo({}, '/novice/?with_tag=vaja', siteUrl).ogUrl, `${siteUrl}/novice`)
})

function installNuxtContext(t, head, route, publicSiteUrl = siteUrl) {
  const entries = []
  const context = {
    useRoute: () => route,
    useRuntimeConfig: () => ({ public: { siteUrl: publicSiteUrl } }),
    useRequestURL: () => new URL('https://preview.example/'),
    useSeoMeta: input => { const entry = useSeoMeta(input, { head }); entries.push(entry); return entry },
    useHead: input => { const entry = useHead(input, { head }); entries.push(entry); return entry }
  }
  for (const [key, value] of Object.entries(context)) {
    const previous = globalThis[key]
    globalThis[key] = value
    t.after(() => { globalThis[key] = previous })
  }
  return entries
}

test('server HTML contains one page-specific set of social tags and canonical link', async (t) => {
  const head = createHead()
  installNuxtContext(t, head, { path: '/novice/vaja' })
  const Page = { setup() {
    usePageSeo({ title: 'Vaja', description: 'Skupna vaja.', image: '/vaja.jpg', type: 'article' })
    return () => h('article', 'Vaja')
  } }
  await renderToString(createSSRApp({ setup() { usePageSeo(); return () => h(Page) } }).use(head))
  const { headTags } = await renderSSRHead(head)
  assert.match(headTags, /<title>Vaja \| Gasilska zveza Občine Kuzma<\/title>/)
  for (const [property, content] of [['og:title', 'Vaja'], ['og:description', 'Skupna vaja.'],
    ['og:image', `${siteUrl}/vaja.jpg`], ['og:type', 'article'], ['og:url', `${siteUrl}/novice/vaja`]]) {
    assert.equal([...headTags.matchAll(new RegExp(`property="${property}"`, 'g'))].length, 1)
    assert.ok(headTags.includes(`property="${property}" content="${content}"`), headTags)
  }
  assert.ok(headTags.includes(`rel="canonical" href="${siteUrl}/novice/vaja"`))
  assert.ok(headTags.includes('name="twitter:card" content="summary_large_image"'))
  assert.ok(!headTags.includes('property="og:image:width"'))
})

test('client metadata follows story changes and restores defaults after page disposal', async (t) => {
  const head = createClientHead({ render: () => {} })
  const route = reactive({ path: '/novice/vaja' })
  const entries = installNuxtContext(t, head, route)
  const defaults = effectScope()
  const page = effectScope()
  t.after(() => { defaults.stop(); page.stop() })
  defaults.run(() => usePageSeo())
  const story = ref({ content: { title: 'Vaja', component: 'Article', image: { filename: '/vaja.jpg' } } })
  page.run(() => usePageSeo(() => getStorySeo(story.value)))
  const content = async property => resolveTags(head).find(tag => tag.props.property === property)?.props.content
  assert.equal(await content('og:image'), `${siteUrl}/vaja.jpg`)
  story.value = { name: 'Zgodovina', content: {} }
  route.path = '/drustva/pgdkuzma/zgodovina'
  await nextTick()
  assert.equal(await content('og:title'), 'Zgodovina')
  assert.equal(await content('og:type'), 'website')
  assert.equal(await content('og:image'), `${siteUrl}/img/share-default.png`)
  assert.equal(await content('og:url'), `${siteUrl}/drustva/pgdkuzma/zgodovina`)
  page.stop()
  for (const entry of entries.slice(2)) entry.dispose()
  route.path = '/'
  await nextTick()
  assert.equal(await content('og:title'), SITE_NAME)
  assert.equal(await content('og:url'), `${siteUrl}/`)
})

test('an empty configured origin uses the current request origin', async (t) => {
  const head = createHead()
  installNuxtContext(t, head, { path: '/novice' }, '')
  await renderToString(createSSRApp({ setup() { usePageSeo(); return () => h('main') } }).use(head))
  const { headTags } = await renderSSRHead(head)
  assert.ok(headTags.includes('property="og:image" content="https://preview.example/img/share-default.png"'))
})
