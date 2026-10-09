import { toValue, type MaybeRefOrGetter } from 'vue'
import type { DepartmentHistory } from '../types/history'

export function useHistory(
  department: MaybeRefOrGetter<string | undefined>,
  enabled: MaybeRefOrGetter<boolean> = true,
  blockId = 'timeline'
) {
  return useAsyncData(
    `history-${toValue(department) || 'none'}-${blockId}`,
    async (): Promise<DepartmentHistory> => {
      const slug = toValue(department)
      if (!slug || !toValue(enabled)) return { department: slug ?? '', entries: [] }

      return $fetch<DepartmentHistory>('/api/history', { query: { department: slug } })
    },
    {
      watch: [() => toValue(department), () => toValue(enabled)],
      getCachedData(key, nuxtApp, ctx) {
        if (ctx.cause !== 'initial') return undefined
        const cached = nuxtApp.isHydrating ? nuxtApp.payload.data[key] : nuxtApp.static.data[key]
        return toValue(enabled) && cached?.department === toValue(department) ? cached : undefined
      }
    }
  )
}
