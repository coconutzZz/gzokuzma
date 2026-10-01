import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { createJiti } from 'jiti'
import { createApp, createError, defineEventHandler, getQuery, toWebHandler } from 'h3'

const jiti = createJiti(import.meta.url)
const { generateHistoryManifest, parseHistoryEntry, readHistoryManifest } = await jiti.import('../scripts/history.ts')
const { normalizeHistoryEntry } = await jiti.import('../utils/history-entry.ts')
const { createHistoryGalleryLoader, normalizeHistoryGalleryImages } = await jiti.import('../utils/history-gallery.ts')

const frontmatter = (year, extra = '') => `---\nyear: "${year}"\ntitle: History\ndescription: >-\n  First line\n  second line.\n${extra}---\n`

test('parses folded descriptions, range labels, and exact gallery slugs', () => {
  const entry = parseHistoryEntry(frontmatter('2021-2024', 'gallery-slug: pgd-kuzma/history/2021\n'), 'pgdkuzma', '2021')
  assert.equal(entry.description.value, 'First line second line.')
  assert.equal(entry.year, '2021-2024')
  assert.equal(entry.sortYear, 2021)
  assert.equal(entry.gallerySlug, 'pgd-kuzma/history/2021')
  assert.equal(entry.id, 'pgdkuzma/2021')
})

test('accepts CRLF and numeric years without a gallery', () => {
  const source = frontmatter('1925').replace('"1925"', '1925').replace(/\n/g, '\r\n')
  const entry = parseHistoryEntry(source, 'pgdkuzma', '1925')
  assert.equal(entry.year, '1925')
  assert.equal(entry.gallerySlug, undefined)
})

test('reports invalid YAML and metadata with the offending file', () => {
  assert.throws(() => parseHistoryEntry('year: 1925', 'pgdkuzma', '1925'), /pgdkuzma\/1925\/index.md: YAML/)
  assert.throws(() => parseHistoryEntry(frontmatter('1925', 'title: Duplicate\n'), 'pgdkuzma', '1925'), /invalid YAML/)
  assert.throws(() => parseHistoryEntry(frontmatter('1927'), 'pgdkuzma', '1925'), /folder year/)
  assert.throws(() => parseHistoryEntry(frontmatter('1925-1924'), 'pgdkuzma', '1925'), /chronological/)
  assert.throws(() => parseHistoryEntry(frontmatter('1925').replace('title: History', 'title: ""'), 'pgdkuzma', '1925'), /title is required/)
})

test('generates a sorted manifest for multiple departments without reading images', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'gzokuzma-history-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const source = join(root, 'history')
  for (const [department, year] of [['pgdkuzma', '2021'], ['pgdkuzma', '1925'], ['pgdother', '1980']]) {
    const directory = join(source, department, year)
    await mkdir(directory, { recursive: true })
    await writeFile(join(directory, 'index.md'), frontmatter(year))
    await writeFile(join(directory, 'image.jpg'), 'not an image')
  }

  const manifest = await readHistoryManifest(source)
  assert.deepEqual(manifest.pgdkuzma.entries.map(entry => entry.year), ['1925', '2021'])
  assert.equal(manifest.pgdother.entries.length, 1)
  assert.equal(manifest.pgdkuzma.entries[0].images, undefined)

  const output = join(root, 'assets')
  await generateHistoryManifest(source, output)
  assert.deepEqual(JSON.parse(await readFile(join(output, 'index.json'), 'utf8')), manifest)
})

test('preserves Storyblok rich text, identity, and existing inline images', () => {
  const description = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'History' }] }] }
  const images = [{ filename: 'https://a.storyblok.com/example.jpg', alt: 'Historical photo' }]
  const entry = normalizeHistoryEntry({ _uid: 'entry-uid', year: '1925', title: 'History', description, images }, 'fallback')
  assert.equal(entry.id, 'entry-uid')
  assert.deepEqual(entry.description, { type: 'richtext', value: description })
  assert.equal(entry.images, images)
})

test('keeps plain descriptions as text for escaped Vue rendering', () => {
  const entry = normalizeHistoryEntry({ description: '<script>alert(1)</script>' }, 'fallback')
  assert.deepEqual(entry.description, { type: 'text', value: '<script>alert(1)</script>' })
  assert.equal(entry.id, 'fallback')
})

test('gallery assets preserve image metadata and skip empty or malformed assets', () => {
  assert.deepEqual(normalizeHistoryGalleryImages([
    { filename: 'https://a.storyblok.com/photo.jpg', alt: 'Historical photo', title: '1925' },
    { filename: '', alt: 'Empty asset' },
    null,
    { filename: 42 },
    { filename: 'https://a.storyblok.com/other.jpg', alt: null, title: 42 }
  ]), [
    { filename: 'https://a.storyblok.com/photo.jpg', alt: 'Historical photo', title: '1925' },
    { filename: 'https://a.storyblok.com/other.jpg', alt: undefined, title: undefined }
  ])
  assert.deepEqual(normalizeHistoryGalleryImages(undefined), [])
})

test('gallery loader is lazy, shares pending requests, and caches loaded images', async () => {
  let calls = 0
  let resolve
  const load = createHistoryGalleryLoader(() => {
    calls++
    return new Promise(done => { resolve = done })
  })
  assert.equal(calls, 0)
  const first = load('gallery/1925', 'draft')
  assert.equal(load('gallery/1925', 'draft'), first)
  await Promise.resolve()
  assert.equal(calls, 1)
  const images = [{ filename: 'https://a.storyblok.com/photo.jpg' }]
  resolve(images)
  assert.equal(await first, images)
  assert.equal(await load('gallery/1925', 'draft'), images)
  assert.equal(calls, 1)
})

test('gallery cache separates slugs and versions and also caches empty galleries', async () => {
  const calls = []
  const load = createHistoryGalleryLoader(async (slug, version) => {
    calls.push([slug, version])
    return []
  })
  await load('gallery/1925', 'draft')
  await load('gallery/1925', 'published')
  await load('gallery/1927', 'draft')
  await load('gallery/1925', 'draft')
  assert.deepEqual(calls, [
    ['gallery/1925', 'draft'], ['gallery/1925', 'published'], ['gallery/1927', 'draft']
  ])
})

test('failed gallery requests are not cached and can be retried', async () => {
  let calls = 0
  const load = createHistoryGalleryLoader(() => {
    calls++
    if (calls === 1) throw new Error('Storyblok unavailable')
    return Promise.resolve([])
  })
  await assert.rejects(load('gallery/1925', 'draft'), /Storyblok unavailable/)
  assert.deepEqual(await load('gallery/1925', 'draft'), [])
  assert.equal(calls, 2)
})

test('API selects a department and rejects missing, repeated, and unknown slugs', async (t) => {
  let manifest = { pgdkuzma: { department: 'pgdkuzma', entries: [] } }
  const globals = { defineEventHandler, getQuery, createError, useStorage: () => ({ getItem: async () => manifest }) }
  for (const [name, value] of Object.entries(globals)) {
    const previous = globalThis[name]
    globalThis[name] = value
    t.after(() => { globalThis[name] = previous })
  }

  const { default: handler } = await jiti.import('../server/api/history.get.ts')
  const app = toWebHandler(createApp().use('/api/history', handler))
  const request = query => app(new Request(`http://localhost/api/history${query}`))
  const response = await request('?department=pgdkuzma')
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), manifest.pgdkuzma)

  for (const query of ['', '?department=', '?department=../pgdkuzma', '?department=pgdkuzma&department=other']) {
    assert.equal((await request(query)).status, 400)
  }
  for (const department of ['missing', 'constructor', 'toString']) {
    assert.equal((await request(`?department=${department}`)).status, department === 'toString' ? 400 : 404)
  }

  manifest = null
  assert.equal((await request('?department=pgdkuzma')).status, 500)
})
