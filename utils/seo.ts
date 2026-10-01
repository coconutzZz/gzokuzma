export const SITE_NAME = 'Gasilska zveza Občine Kuzma'
export const SITE_DESCRIPTION = 'Gasilska zveza občine Kuzma povezuje lokalne gasilske enote, spodbuja varnost, preventivo in sodelovanje v skupnosti ter zagotavlja hitro in učinkovito pomoč v sili.'
export const DEFAULT_SHARE_IMAGE = '/img/share-default.png'

export interface SeoImage {
  filename?: string
  alt?: string
}

export interface PageSeoOptions {
  title?: string
  description?: string
  image?: string | SeoImage
  type?: 'website' | 'article'
}

export interface SeoStory {
  name?: string
  content?: Record<string, unknown>
}

// Read only rich-text text nodes; embedded components and their attributes are ignored.
function plainText(value: unknown): string {
  if (typeof value === 'string') return value.replace(/\s+/g, ' ').trim()
  if (!value || typeof value !== 'object') return ''
  const node = value as { text?: unknown; content?: unknown[] }
  if (typeof node.text === 'string') return node.text
  return Array.isArray(node.content)
    ? node.content.map(plainText).join(' ').replace(/\s+/g, ' ').trim()
    : ''
}

function excerpt(value: unknown): string {
  const text = plainText(value)
  if (text.length <= 200) return text
  const shortened = text.slice(0, 197).replace(/\s+\S*$/, '').trimEnd()
  return `${shortened}…`
}

function imageAsset(value: unknown): string | SeoImage | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (value && typeof value === 'object') {
    const asset = value as SeoImage
    if (typeof asset.filename === 'string' && asset.filename.trim()) return asset
  }
}

export function getStorySeo(story?: SeoStory, fallback: PageSeoOptions = {}): PageSeoOptions {
  const content = story?.content ?? {}
  const storyName = story?.name?.toLowerCase() === 'index' ? '' : story?.name
  return {
    title: plainText(content.seo_title) || plainText(content.title) || fallback.title || plainText(storyName),
    description: plainText(content.seo_description) || excerpt(content.description)
      || excerpt(content.featured_text) || excerpt(content.content) || fallback.description,
    image: imageAsset(content.seo_image) || imageAsset(content.image)
      || imageAsset(content.featured_image) || fallback.image,
    type: typeof content.component === 'string' && content.component.toLowerCase() === 'article' ? 'article' : 'website'
  }
}

function absoluteUrl(value: string, siteUrl: string): string | undefined {
  if (!value.trim()) return undefined
  try {
    const url = new URL(value, siteUrl)
    return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined
  } catch {
    return undefined
  }
}

export function resolvePageSeo(options: PageSeoOptions, path: string, siteUrl: string) {
  const title = plainText(options.title) || SITE_NAME
  const description = plainText(options.description) || SITE_DESCRIPTION
  const asset = imageAsset(options.image)
  const image = absoluteUrl(typeof asset === 'string' ? asset : asset?.filename ?? '', siteUrl)
    || new URL(DEFAULT_SHARE_IMAGE, siteUrl).href
  const isDefaultImage = image === new URL(DEFAULT_SHARE_IMAGE, siteUrl).href
  const imageAlt = isDefaultImage ? SITE_NAME : (typeof asset === 'object' && plainText(asset.alt)) || title
  // Keep filters and tracking parameters out of the shared page identity.
  const canonicalPath = path.split(/[?#]/)[0].replace(/\/index\/?$/, '').replace(/\/+$/, '') || '/'
  const url = new URL(canonicalPath, siteUrl).href

  return {
    title: title === SITE_NAME ? title : `${title} | ${SITE_NAME}`,
    description,
    ogTitle: title,
    ogDescription: description,
    ogImage: image,
    ogImageAlt: imageAlt,
    ogUrl: url,
    ogType: options.type || 'website',
    ogSiteName: SITE_NAME,
    ogLocale: 'sl_SI',
    twitterCard: 'summary_large_image' as const,
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: image,
    twitterImageAlt: imageAlt
  }
}
