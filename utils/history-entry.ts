import type { HistoryEntryData, StoryblokHistoryEntry } from '../types/history'

export function normalizeHistoryEntry(blok: StoryblokHistoryEntry, fallbackId: string): HistoryEntryData {
  const year = String(blok.year ?? '')

  return {
    id: blok._uid || blok.oid || fallbackId,
    year,
    sortYear: Number.parseInt(year, 10) || 0,
    title: blok.title ?? '',
    description: typeof blok.description === 'object' && blok.description !== null
      ? { type: 'richtext', value: blok.description }
      : { type: 'text', value: blok.description ?? '' },
    images: blok.images
  }
}
