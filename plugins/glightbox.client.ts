import GLightbox from 'glightbox'
import 'glightbox/dist/css/glightbox.css'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      glightbox: (options = {}) =>
        GLightbox({
          touchNavigation: true,
          loop: false,
          ...options,
        }),
    },
  }
})
