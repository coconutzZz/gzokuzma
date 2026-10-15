import { createClient } from '@supabase/supabase-js'

export function getDepartmentFileStorage(department: string | undefined) {
  if (!department || !/^[a-z0-9][a-z0-9-]*$/.test(department)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid department slug' })
  }

  const config = useRuntimeConfig()
  return createClient(config.public.supabaseUrl, config.public.supabasePublishableKey)
    .storage.from(department)
}
