// types/supabase.ts
export interface Department {
  id: string
  slug: string
  name: string
}

export interface Fireman {
  id: string
  first_name: string
  last_name: string
  department_role: 'president' | 'commander' | 'fireman'
  department_id: string,
  mobile_phone: string
}
