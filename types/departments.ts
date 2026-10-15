import type { SbBlokData } from '@storyblok/vue'

export interface DepartmentAsset {
  filename: string
  alt?: string
}

export interface AssociationPageContent extends SbBlokData {
  featured_image?: DepartmentAsset
  featured_text?: string
  qr_code_bank_transfer?: DepartmentAsset
  body?: SbBlokData[]
}
