import type { Department } from '../../types/supabase'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const supabase = createClient(config.public.supabaseUrl, config.public.supabasePublishableKey)
    
  const { data } = await supabase
      .from('Departments')
      .select('*')
      .limit(10)
      .order("sort");

  const departments: Department[] = data as Department[] | [];
  return departments;
})