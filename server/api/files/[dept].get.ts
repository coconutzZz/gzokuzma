import type { DownloadableAsset } from '../../types/supabase'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const deptSlug = event.context.params?.dept

  if (!deptSlug) {
    throw createError({ statusCode: 400, statusMessage: 'Department slug missing' })
  }

  console.log(deptSlug);
  const supabase = createClient(config.public.supabaseUrl, config.public.supabasePublishableKey)

  const { data, error } = await supabase.storage
    .from(deptSlug)
    .list('public', { limit: 100, offset: 0 });

  if (error) {
    console.error('Error listing files:', error);
  } 

if (data == null) {
  throw createError({ statusCode: 400, statusMessage: 'No files found' })
}

 const realFiles = data.filter(
    (file) => !file.name.endsWith('.emptyFolderPlaceholder')
  )

  console.log(realFiles)

const filesWithUrls: DownloadableAsset[] = (
  await Promise.all(
    realFiles.map(async (file) => {
      const { data } = await supabase.storage
        .from(`${deptSlug}/public`)
        .createSignedUrl(file.name, 3600)

      if (!data) return null

      return {
        id: file.id,
        name: file.name.replace('public/', ''),
        created_at: file.created_at,
        type: file.metadata.mimetype,
        url: data.signedUrl,
      }
    })
  )
).filter(
  (asset): asset is DownloadableAsset => asset !== null
)

return filesWithUrls.filter(Boolean);
})
