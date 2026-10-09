// Match the asset CDN hostname, never a substring in the path or query string.
const storyblokAssetHosts = new Set([
  'a.storyblok.com', 'a2.storyblok.com',
  'a-us.storyblok.com', 'a2-us.storyblok.com',
  'a-ap.storyblok.com', 'a2-ap.storyblok.com',
  'a-ca.storyblok.com', 'a.storyblokchina.cn'
])

export function getStoryblokImageUrl(src: string): URL | undefined {
  try {
    const url = new URL(src.startsWith('//') ? `https:${src}` : src)
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return
    if (storyblokAssetHosts.has(url.hostname)) return url
  } catch {
    // Local paths, data URLs, and invalid URLs aren't Storyblok assets.
  }
}

export function canTransformStoryblokImage(src: string): boolean {
  const url = getStoryblokImageUrl(src)
  // Preserve signed URLs, existing transformations, SVGs, and animated GIFs.
  return Boolean(url && !url.search && /\.(?:jpe?g|png|webp|avif)$/i.test(url.pathname))
}

export function getStoryblokImageDimensions(src: string) {
  const url = getStoryblokImageUrl(src)
  const match = url?.pathname.match(/\/(\d+)x(\d+)\//)
  if (!match) return
  const width = Number(match[1])
  const height = Number(match[2])
  if (width > 0 && height > 0) return { width, height }
}

export function getImageDimensions(src: string, width?: string | number, height?: string | number) {
  const original = getStoryblokImageDimensions(src)
  const requestedWidth = Number(width)
  const requestedHeight = Number(height)
  if (requestedWidth > 0 && requestedHeight > 0) return { width: requestedWidth, height: requestedHeight }
  if (!original) return
  if (requestedWidth > 0) return { width: requestedWidth, height: Math.round(requestedWidth * original.height / original.width) }
  if (requestedHeight > 0) return { width: Math.round(requestedHeight * original.width / original.height), height: requestedHeight }
  return original
}
