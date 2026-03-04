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
  facebook_url: string
  hide_menu: boolean
  sort: number
}

export interface Fireman {
  id: string
  first_name: string
  last_name: string
  department_role: 'predsednik' | 'poveljnik' | 'podpoveljnik' | 'tajnik' | 'blagajnik'
  department_id: string,
  mobile_phone: string,
  email: string
}

export const roleOrder: Record<Fireman['department_role'], number> = {
  predsednik: 1,
  poveljnik: 2,
  podpoveljnik: 3,
  tajnik: 4,
  blagajnik: 5
};

export interface DownloadableAsset {
  id: string
  name: string,
  url: string
  created_at: string
  type: string
}