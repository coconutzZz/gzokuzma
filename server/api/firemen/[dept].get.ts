import type { Fireman } from '../../types/supabase'
import { getDepartmentBySlug } from '../../services/departments'


export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const deptSlug = event.context.params?.dept
  if (!deptSlug) throw createError({ statusCode: 400, statusMessage: 'Department slug missing' })

  const department = await getDepartmentBySlug(deptSlug)

  const firemen = await $fetch<Fireman[]>(`${config.supabaseUrl}/rest/v1/Firemen?department_id=eq.${department.id}`, {
    headers: {
      apikey: config.supabaseServiceKey,
      Authorization: `Bearer ${config.supabaseServiceKey}`,
      Accept: 'application/json'
    }
  })

  return firemen
})
