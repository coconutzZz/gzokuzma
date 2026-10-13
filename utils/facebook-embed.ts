export function getFacebookPostEmbed(src: unknown) {
  if (typeof src !== 'string') return null

  try {
    const url = new URL(src)
    if (!['https:', 'http:'].includes(url.protocol) ||
      !['facebook.com', 'www.facebook.com', 'm.facebook.com'].includes(url.hostname) ||
      url.pathname !== '/plugins/post.php') return null

    const href = url.searchParams.get('href')
    if (!href) return null

    const postUrl = new URL(href)
    if (!['https:', 'http:'].includes(postUrl.protocol) ||
      !['facebook.com', 'www.facebook.com', 'm.facebook.com'].includes(postUrl.hostname)) return null

    return {
      url: postUrl.href,
      width: url.searchParams.get('width') || '500',
      showText: url.searchParams.get('show_text') !== 'false',
    }
  } catch {
    return null
  }
}
