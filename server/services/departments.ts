import type { Department } from '../types/supabase'

export async function getDepartmentBySlug(slug: string) {
  const config = useRuntimeConfig()

  const departments = await $fetch<Department[]>(
    `${config.supabaseUrl}/rest/v1/Departments?slug=eq.${slug}&limit=1`,
    {
      headers: {
        apikey: config.supabaseServiceKey,
        Authorization: `Bearer ${config.supabaseServiceKey}`,
        Accept: 'application/json'
      }
    }
  )

  if (!departments || departments.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Department not found'
    })
  }

  return departments[0]
}
