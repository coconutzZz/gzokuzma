import type { HistoryManifest } from '../../types/history'

export default defineEventHandler(async (event) => {
  const department = getQuery(event).department

  if (typeof department !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(department)) {
    throw createError({ statusCode: 400, statusMessage: 'A valid department slug is required' })
  }

  const manifest = await useStorage('assets:history').getItem<HistoryManifest>('index.json')
  if (!manifest) {
    throw createError({ statusCode: 500, statusMessage: 'History data is unavailable' })
  }
  if (!Object.hasOwn(manifest, department)) {
    throw createError({ statusCode: 404, statusMessage: 'Department history not found' })
  }

  return manifest[department]
})
