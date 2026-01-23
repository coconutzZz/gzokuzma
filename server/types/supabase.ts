// types/supabase.ts
export interface Department {
  id: string
  slug: string
  name: string
}

export interface Fireman {
  id: string
  name: string
  role: 'president' | 'commander' | 'fireman'
  department_id: string
}
