import type { HistoryImage } from '../types/history'

export type HistoryGalleryVersion = 'draft' | 'published'

export function normalizeHistoryGalleryImages(images: unknown): HistoryImage[] {
  if (!Array.isArray(images)) return []

  return images.flatMap((image) => {
    if (!image || typeof image.filename !== 'string' || !image.filename.trim()) return []

    return [{
      filename: image.filename,
      alt: typeof image.alt === 'string' ? image.alt : undefined,
      title: typeof image.title === 'string' ? image.title : undefined
    }]
  })
}

export function createHistoryGalleryLoader(
  fetchImages: (slug: string, version: HistoryGalleryVersion) => Promise<HistoryImage[]>
) {
  const imagesBySlug = new Map<string, HistoryImage[]>()
  const pendingBySlug = new Map<string, Promise<HistoryImage[]>>()

  return (slug: string, version: HistoryGalleryVersion): Promise<HistoryImage[]> => {
    const key = `${version}:${slug}`
    const cached = imagesBySlug.get(key)
    if (cached) return Promise.resolve(cached)

    const pending = pendingBySlug.get(key)
    if (pending) return pending

    const request = Promise.resolve()
      .then(() => fetchImages(slug, version))
      .then((images) => {
        imagesBySlug.set(key, images)
        return images
      })
      .finally(() => pendingBySlug.delete(key))

    pendingBySlug.set(key, request)
    return request
  }
}
