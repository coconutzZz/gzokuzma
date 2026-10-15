import { computed, readonly, toValue, type MaybeRefOrGetter } from 'vue'
import type { NuxtApp } from '#app'
import type { Department, DownloadableAsset, Fireman } from '~/server/types/supabase'
import { roleOrder } from '~/server/types/supabase'

function getCachedProfileData<T>(key: string, nuxtApp: NuxtApp, context: { cause: string }): T | undefined {
  if (context.cause !== 'initial') return undefined
  return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]
}

export function useDepartmentProfile(departmentSlug: MaybeRefOrGetter<string | null | undefined>) {
  const slug = computed(() => toValue(departmentSlug)?.trim() || '')
  const enabled = computed(() => Boolean(slug.value))

  // Each endpoint accepts the route slug, so all requests can start together.
  const departmentRequest = useFetch<Department>(() => `/api/departments/${encodeURIComponent(slug.value)}`, {
    key: computed(() => `dept-${slug.value || 'none'}`),
    enabled,
    getCachedData: getCachedProfileData<Department>,
  })
  const firemenRequest = useFetch<Fireman[] | null>(() => `/api/firemen/${encodeURIComponent(slug.value)}`, {
    key: computed(() => `firemen-${slug.value || 'none'}`),
    enabled,
    getCachedData: getCachedProfileData<Fireman[] | null>,
  })
  const filesRequest = useFetch<DownloadableAsset[]>(() => `/api/files/${encodeURIComponent(slug.value)}`, {
    key: computed(() => `files-${slug.value || 'none'}`),
    enabled,
    getCachedData: getCachedProfileData<DownloadableAsset[]>,
  })

  const firemen = computed(() => [...(firemenRequest.data.value ?? [])].sort((a, b) =>
    (roleOrder[a.department_role] ?? Number.MAX_SAFE_INTEGER) -
    (roleOrder[b.department_role] ?? Number.MAX_SAFE_INTEGER),
  ))

  return {
    // Await this in the SFC to include every section in the server payload.
    ready: Promise.all([departmentRequest, firemenRequest, filesRequest]).then(() => undefined),
    department: computed(() => departmentRequest.data.value ?? null),
    firemen,
    files: computed(() => filesRequest.data.value ?? []),
    departmentError: readonly(departmentRequest.error),
    firemenError: readonly(firemenRequest.error),
    filesError: readonly(filesRequest.error),
    isDepartmentLoading: computed(() => enabled.value && ['idle', 'pending'].includes(departmentRequest.status.value)),
    isFiremenLoading: computed(() => enabled.value && ['idle', 'pending'].includes(firemenRequest.status.value)),
    isFilesLoading: computed(() => enabled.value && ['idle', 'pending'].includes(filesRequest.status.value)),
    refreshDepartment: () => departmentRequest.refresh(),
    refreshFiremen: () => firemenRequest.refresh(),
    refreshFiles: () => filesRequest.refresh(),
  }
}
