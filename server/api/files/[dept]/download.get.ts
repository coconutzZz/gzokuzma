import { getDepartmentFileStorage } from '../../../utils/department-files'

export default defineEventHandler(async (event) => {
  // Neither browsers nor the CDN should reuse an expiring redirect.
  setHeader(event, 'Cache-Control', 'private, no-store, max-age=0')
  const file = getQuery(event).file
  if (typeof file !== 'string' || !file.trim() || file === '.' || file === '..' || /[/\\\u0000-\u001f]/.test(file)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid document filename' })
  }

  const storage = getDepartmentFileStorage(event.context.params?.dept)
  const { data, error } = await storage.createSignedUrl(`public/${file}`, 3600)
  if (error || !data?.signedUrl) {
    throw createError({ statusCode: 502, statusMessage: 'Document could not be loaded' })
  }

  return sendRedirect(event, data.signedUrl, 302)
})
