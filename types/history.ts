import type { StoryblokRichTextDocumentNode } from '@storyblok/vue'

export interface HistoryImage {
  filename: string
  alt?: string
  title?: string
}

export interface HistoryEntryData {
  id: string
  year: string
  sortYear: number
  title: string
  description:
    | { type: 'text'; value: string }
    | { type: 'richtext'; value: StoryblokRichTextDocumentNode }
  gallerySlug?: string
  images?: HistoryImage[]
}

export interface DepartmentHistory {
  department: string
  entries: HistoryEntryData[]
}

export type HistoryManifest = Record<string, DepartmentHistory>

export interface StoryblokHistoryEntry {
  _uid?: string
  oid?: string
  year?: string | number
  title?: string
  description?: string | StoryblokRichTextDocumentNode
  images?: HistoryImage[]
}

export interface StoryblokHistory {
  _uid?: string
  entries?: StoryblokHistoryEntry[]
}
