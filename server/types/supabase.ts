// types/supabase.ts
export interface Department {
  id: string
  slug: string
  name_prefix: string
  name: string
  street: string
  email: string
  iban: string
  tax_number: number
  company_register_number: number
  year_founded: number
  is_main_unit: boolean
}

export interface Fireman {
  id: string
  first_name: string
  last_name: string
  department_role: 'president' | 'commander' | 'fireman'
  department_id: string,
  mobile_phone: string,
  email: string
}
