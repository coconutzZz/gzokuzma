import assert from 'node:assert/strict'
import test from 'node:test'
import { createJiti } from 'jiti'
import { createApp, createError, createRouter, defineEventHandler, getQuery, sendRedirect, setHeader, toWebHandler } from 'h3'

Object.assign(globalThis, {
  createError, defineEventHandler, getQuery, sendRedirect, setHeader,
  useRuntimeConfig: () => ({ public: {
    supabaseUrl: 'https://storage.example.test', supabasePublishableKey: 'test-public-key',
  } }),
})
const jiti = createJiti(import.meta.url, { fsCache: false })
const { default: listFiles } = await jiti.import('../server/api/files/[dept].get.ts')
const { default: downloadFile } = await jiti.import('../server/api/files/[dept]/download.get.ts')
const router = createRouter()
router.get('/api/files/:dept', listFiles)
router.get('/api/files/:dept/download', downloadFile)
const app = toWebHandler(createApp().use(router))
const request = path => app(new Request(`http://localhost${path}`))

function mockStorage(t, handler) {
  const calls = []
  t.mock.method(globalThis, 'fetch', async (input, init) => {
    const req = new Request(input, init)
    const call = { url: req.url, body: await req.json() }
    calls.push(call)
    const { data, status = 200 } = handler(call, calls.length)
    return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
  })
  return calls
}

test('document lists contain stable, encoded links and never request signed URLs', async t => {
  const name = 'Letno poročilo & plan.pdf'
  const calls = mockStorage(t, () => ({ data: [
    { id: 'report', name, created_at: '2026-01-01', metadata: { mimetype: 'application/pdf' } },
    { name: '.emptyFolderPlaceholder' },
  ] }))
  const response = await request('/api/files/pgdkuzma')
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), [{
    id: 'report', name, created_at: '2026-01-01', type: 'application/pdf',
    url: `/api/files/pgdkuzma/download?file=${encodeURIComponent(name)}`,
  }])
  assert.equal(calls.length, 1)
  assert.ok(calls[0].url.endsWith('/storage/v1/object/list/pgdkuzma'))
  assert.equal(calls[0].body.prefix, 'public')
})

test('the same saved download link creates a fresh, uncacheable redirect on every visit', async t => {
  const calls = mockStorage(t, (_call, count) => ({ data: {
    signedURL: `/object/sign/pgdkuzma/public/report.pdf?token=fresh-${count}`,
  } }))
  const link = '/api/files/pgdkuzma/download?file=report.pdf'
  const first = await request(link)
  // A deployed page can outlive the expiry of the first URL.
  const later = Date.now() + 24 * 60 * 60 * 1000
  t.mock.method(Date, 'now', () => later)
  const second = await request(link)
  for (const response of [first, second]) {
    assert.equal(response.status, 302)
    assert.equal(response.headers.get('cache-control'), 'private, no-store, max-age=0')
  }
  assert.ok(first.headers.get('location').endsWith('token=fresh-1'))
  assert.ok(second.headers.get('location').endsWith('token=fresh-2'))
  assert.equal(calls.length, 2)
  assert.ok(calls.every(call => call.url.endsWith('/storage/v1/object/sign/pgdkuzma/public/report.pdf')))
  assert.ok(calls.every(call => call.body.expiresIn === 3600))
})

test('invalid filenames and department slugs are rejected before contacting storage', async t => {
  const calls = mockStorage(t, () => { throw new Error('Storage must not be contacted') })
  for (const query of ['', '?file=', '?file=..', '?file=folder%2Fsecret.pdf', '?file=..%5Csecret', '?file=%00', '?file=one&file=two']) {
    assert.equal((await request(`/api/files/pgdkuzma/download${query}`)).status, 400, query)
  }
  assert.equal((await request('/api/files/INVALID')).status, 400)
  assert.equal((await request('/api/files/INVALID/download?file=report.pdf')).status, 400)
  assert.equal(calls.length, 0)
})

test('storage failures are reported rather than returning empty lists or broken redirects', async t => {
  mockStorage(t, () => ({ status: 403, data: { statusCode: '403', error: 'Forbidden', message: 'Storage unavailable' } }))
  assert.equal((await request('/api/files/pgdkuzma')).status, 502)
  const response = await request('/api/files/pgdkuzma/download?file=report.pdf')
  assert.equal(response.status, 502)
  assert.equal(response.headers.get('location'), null)
})

test('an empty document folder remains a successful empty list', async t => {
  mockStorage(t, () => ({ data: [] }))
  const response = await request('/api/files/pgdkuzma')
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), [])
})
