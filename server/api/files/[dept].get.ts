import type { DownloadableAsset } from '../../types/supabase'
import { getDepartmentFileStorage } from '../../utils/department-files'

export default defineEventHandler(async (event) => {
  const department = event.context.params?.dept
  const storage = getDepartmentFileStorage(department)
  const { data, error } = await storage.list('public', { limit: 100, offset: 0 })

  if (error) {
    throw createError({ statusCode: 502, statusMessage: 'Documents could not be loaded' })
  }

  // Prerender stable links; signed URLs are created only when a document is opened.
  return (data ?? [])
    .filter(file => !file.name.endsWith('.emptyFolderPlaceholder'))
    .map((file): DownloadableAsset => ({
      id: file.id,
      name: file.name,
      created_at: file.created_at,
      type: file.metadata?.mimetype ?? 'application/octet-stream',
      url: `/api/files/${encodeURIComponent(department!)}/download?file=${encodeURIComponent(file.name)}`,
    }))
})
