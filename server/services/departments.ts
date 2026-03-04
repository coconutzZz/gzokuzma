import type { Department } from '../types/supabase'
import { createClient } from '@supabase/supabase-js'

export async function getDepartmentBySlug(slug: string) {
  const config = useRuntimeConfig()

  const supabase = createClient(config.public.supabaseUrl, config.public.supabasePublishableKey)

  const { data } = await supabase
      .from('Departments')
      .select('*')
      .eq('slug', slug)
      .limit(1);

  /*
  const departments = await $fetch<Department[]>(
    `${config.supabaseUrl}/rest/v1/Departments?slug=eq.${slug}&limit=1`,
    {
      headers: {
        apikey: config.supabaseServiceKey,
        Authorization: `Bearer ${config.supabaseServiceKey}`,
        Accept: 'application/json'
      }
    }
  )*/

  const department: Department | null = (data as Department[] | null)?.[0] ?? null;


  if (department ==  null) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Department not found'
    })
  }

  return department
}
