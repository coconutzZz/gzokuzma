// server/api/firemen/[dept].get.ts
import type { Department, Fireman } from '../../types/supabase'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const deptSlug = event.context.params?.dept
  if (!deptSlug) throw createError({ statusCode: 400, statusMessage: 'Department slug missing' })

  const departmentRes = await $fetch<Department[]>(`${config.supabaseUrl}/rest/v1/Departments?slug=eq.${deptSlug}`, {
    headers: {
      apikey: config.supabaseServiceKey,
      Authorization: `Bearer ${config.supabaseServiceKey}`,
      Accept: 'application/json'
    }
  })

    console.log(departmentRes);
  

  if (!departmentRes || departmentRes.length === 0)
    
    throw createError({ statusCode: 404, statusMessage: 'Department not found' })

  const department = departmentRes[0]

  const firemen = await $fetch<Fireman[]>(`${config.supabaseUrl}/rest/v1/Firemen?department_id=eq.${department.id}`, {
    headers: {
      apikey: config.supabaseServiceKey,
      Authorization: `Bearer ${config.supabaseServiceKey}`,
      Accept: 'application/json'
    }
  })

  return firemen
})
