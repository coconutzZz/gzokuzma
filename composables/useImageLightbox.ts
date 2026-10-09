// Copyright (C) 2026 gzokuzma contributors. SPDX-License-Identifier: GPL-3.0-or-later
import { onBeforeUnmount, toValue, type MaybeRefOrGetter } from 'vue'
import type GLightbox from 'glightbox'

interface LightboxImage {
  filename: string
  alt?: string
}

export function useImageLightbox(images: MaybeRefOrGetter<LightboxImage[]>) {
  let lightbox: ReturnType<typeof GLightbox> | undefined
  let disposed = false
  let requestId = 0

  async function openLightbox(event: MouseEvent, index = 0) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

    const link = event.currentTarget as HTMLAnchorElement
    event.preventDefault()
    const request = ++requestId

    try {
      const { default: createLightbox } = await import('~/utils/glightbox')
      if (disposed || request !== requestId || !link.isConnected) return

      const currentImages = toValue(images)
      if (!currentImages[index]?.filename) return

      // Vue owns the click handlers; an empty selector avoids duplicate listeners.
      lightbox ??= createLightbox({ selector: '', touchNavigation: true, zoomable: true, loop: false })
      lightbox.setElements(currentImages.map(image => ({
        href: image.filename,
        type: 'image',
        alt: image.alt || '',
      })))
      lightbox.openAt(index)
    } catch {
      if (!disposed && request === requestId && link.isConnected) {
        window.location.assign(link.href)
      }
    }
  }

  onBeforeUnmount(() => {
    disposed = true
    requestId++
    lightbox?.destroy()
  })

  return { openLightbox }
}
