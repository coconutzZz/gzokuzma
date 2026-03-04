import type { Fireman } from '../../types/supabase'
import { getDepartmentBySlug } from '../../services/departments'

import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const deptSlug = event.context.params?.dept
  if (!deptSlug) throw createError({ statusCode: 400, statusMessage: 'Department slug missing' })

  const department = await getDepartmentBySlug(deptSlug)
  
  const supabase = createClient(config.public.supabaseUrl, config.public.supabasePublishableKey)

  const { data } = await supabase
      .from('Firemen')
      .select('*')
      .eq('department_id', department.id);

  /*const firemen = await $fetch<Fireman[]>(`${config.supabaseUrl}/rest/v1/Firemen?department_id=eq.${department.id}`, {
    headers: {
      apikey: config.supabaseServiceKey,
      Authorization: `Bearer ${config.supabaseServiceKey}`,
      Accept: 'application/json'
    }
  })*/
    
  const firemen: Fireman[] | null = (data as Fireman[] | null) ?? null;

  return firemen
})
