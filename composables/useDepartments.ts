import type { Department } from '../server/types/supabase';

export const useDepartments = () => {
  // Directly return the useFetch call
  return useFetch<Department[]>('/api/departments', {
    key: 'departments' // Ensuring a consistent key for hydration
  })
}