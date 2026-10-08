<template>
  <nav ref="headerNavigation" aria-label="Glavna navigacija" id="header" :class="{ 'fixed': isFixed }, isBackgroundVisible ? 'bg-primary-500' : 'bg-none'" class="w-full z-30 top-0 transition-colors duration-700">
    <div class="w-full container mx-auto flex flex-wrap items-center justify-between mt-0 py-2 max-w-screen-2xl md:max-w-screen-xl xl:max-w-screen-2xl">
      <div class="pl-4 flex items-center">
        <NuxtLink to="/" class="text-white no-underline hover:no-underline font-bold text-2xl lg:text-4xl" aria-label="Domov">
          <NuxtImg src="/img/gzo-znak.png" class="h-24" alt="Logotip GZO Kuzma"/>
        </NuxtLink>
      </div>
      <div class="block lg:hidden pr-4">
        <button
          ref="drawerTrigger"
          type="button"
          aria-label="Odpri meni"
          aria-haspopup="dialog"
          :aria-expanded="isDrawerOpen"
          :aria-controls="drawerId"
          @click="openDrawer"
          class="flex items-center p-2.5 text-white hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent transform transition hover:scale-105 duration-300 ease-in-out motion-reduce:transition-none motion-reduce:transform-none"
        >
          <svg aria-hidden="true" class="fill-current h-6 w-6" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
          </svg>
        </button>
      </div>
      <div ref="desktopMenu" class="w-full flex-grow lg:flex lg:items-center lg:w-auto hidden mt-2 lg:mt-0 bg-white lg:bg-transparent pr-4 z-20" id="nav-content">
        <ul class="list-reset lg:flex justify-end flex-1 items-center">
          <li v-for="blok in menuItems" :key="blok._uid" class="mr-3">
            <NuxtLink 
              :to="`/${(blok.link.url.length > 0 ? blok.link.url : blok.link.cached_url)}`" 
              class="relative inline-block py-2 mx-4 text-white font-bold no-underline group"
              active-class="is-active"
            >
              {{ blok.name }}
              
              <span class="absolute bottom-0 left-0 h-0.5 bg-white transition-all duration-300 w-0 group-hover:w-full group-[.is-active]:w-full"></span>
            </NuxtLink>      
          </li>
        </ul>
      </div>
    </div>    
    <slot />
    <div class="md:bg-secondary py-1 mb-2 md:mb-0 md:py-2" v-if="subMenu && subMenu.length > 1">
        <div class="w-full container mx-auto max-w-screen-2xl md:max-w-screen-xl">
          <div class="text-center">
            <NuxtLink
              v-for="item in subMenu"
              :key="item.id"
              :to="`/${item.full_slug}`"
              active-class="is-active"
              class="rounded-full md:mx-2 text-sm md:text-md font-semibold text-white/80 px-2 py-1 mb-4 mx-1 border-white/50 border-2 md:border-secondary md:text-white
            md:hover:border-2
          md:hover:border-white/50
          [&.is-active]:md:bg-white
          [&.is-active]:md:text-secondary
              [&.is-active]:bg-secondary [&.is-active]:text-white"
            >
              {{ item.name }}
            </NuxtLink>
          </div>
        </div>
    </div>
  </nav>
  <dialog
    ref="drawer"
    :id="drawerId"
    aria-label="Glavni meni"
    aria-modal="true"
    class="mobile-menu fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-none w-full max-w-none md:w-[50%] border-0 p-0 bg-white shadow-lg overflow-y-auto"
    @cancel.prevent="closeDrawer()"
    @close="syncDrawerClosed"
    @keydown.tab="wrapDrawerFocus"
    @pointerdown="onDrawerPointerDown"
    @click="onDrawerClick"
  >
    <ButtonClose
      type="button"
      aria-label="Zapri meni"
      autofocus
      @click="closeDrawer()"
      class="absolute right-2 top-5 min-h-11 min-w-11 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
    />
    <nav aria-label="Mobilna navigacija" class="flex flex-col justify-center min-h-full py-20">
      <div class="flex justify-center text-center">      
        <ul class="list-reset flex-row text-xl">
          <li v-for="blok in menuItems" :key="blok._uid" class="mr-3">
            <NuxtLink @click="closeDrawer()" :to="`/${(blok.link.url.length > 0 ? blok.link.url : blok.link.cached_url)}`" class="inline-block py-2 px-4 text-primary-500 font-bold no-underline">
              {{ blok.name }}
            </NuxtLink>
          </li>
        </ul>
      </div>  
      <div class="md:hidden mt-5 force-black">
        <DepartmentLinks @click="closeDrawer()" />
      </div> 
    </nav>
  </dialog>
</template>
<script setup>
const route = useRoute()
//const slug = ref(Array.isArray(route.params.slug) ? route.params.slug : [route.params.slug]);

const props = defineProps({
  isBackgroundVisible: {
    type: Boolean,
    default: false
  }, 
  isFixed: {
    type: Boolean,
    default: true
  }
});

const { data: menuItems } = useMainMenuStories();
const { data: menuStories, refresh } = await useMenuStories()

watch(() => route.path, (newPath) => {
  if (newPath.startsWith('/drustva')) {
    refresh()
  }
}, { immediate: true })

const subMenu = computed(() => {
  const stories = menuStories.value
  if (!stories || !Array.isArray(stories)) return [];

  const currentSlugPart = route.params.slug?.[0] || route.params.slug;
  if (!currentSlugPart) return [];

  return stories.filter(story => {
    return story.full_slug.includes(currentSlugPart + '/')
  })
});

const drawerId = `mobile-menu-${useId()}`
const drawer = ref(null)
const drawerTrigger = ref(null)
const headerNavigation = ref(null)
const desktopMenu = ref(null)
const isDrawerOpen = ref(false)
let desktopQuery
let scrollLocked = false
let hadScrollLock = false
let pointerStartedOnBackdrop = false

function openDrawer() {
  if (!drawer.value || drawer.value.open || desktopQuery?.matches) return

  // showModal handles initial focus, focus containment and an inert background.
  drawer.value.showModal()
  isDrawerOpen.value = true
  hadScrollLock = document.body.classList.contains('overflow-hidden')
  document.body.classList.add('overflow-hidden')
  scrollLocked = true
}

function unlockScroll() {
  if (!scrollLocked) return
  if (!hadScrollLock) document.body.classList.remove('overflow-hidden')
  scrollLocked = false
}

function syncDrawerClosed() {
  if (drawer.value?.open) return
  isDrawerOpen.value = false
  pointerStartedOnBackdrop = false
  unlockScroll()
}

function closeDrawer(restoreFocus = true) {
  if (!isDrawerOpen.value) return
  drawer.value?.close()
  syncDrawerClosed()
  if (restoreFocus && drawerTrigger.value?.getClientRects().length) {
    drawerTrigger.value.focus()
  }
}

function wrapDrawerFocus(event) {
  if (event.altKey || event.ctrlKey || event.metaKey) return
  const controls = [...drawer.value.querySelectorAll('a[href], button:not([disabled])')]
    .filter(element => element.getClientRects().length)
  const first = controls[0]
  const last = controls[controls.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}

function isBackdropEvent(event) {
  if (event.target !== drawer.value) return false
  const bounds = drawer.value.getBoundingClientRect()
  return event.clientX < bounds.left || event.clientX > bounds.right ||
    event.clientY < bounds.top || event.clientY > bounds.bottom
}

function onDrawerPointerDown(event) {
  pointerStartedOnBackdrop = isBackdropEvent(event)
}

function onDrawerClick(event) {
  if (pointerStartedOnBackdrop && isBackdropEvent(event)) closeDrawer()
  pointerStartedOnBackdrop = false
}

function onDesktopChange(event) {
  if (!event.matches || !isDrawerOpen.value) return
  closeDrawer(false)
  const desktopLink = desktopMenu.value?.querySelector('a[aria-current="page"]') ||
    desktopMenu.value?.querySelector('a[href]') || headerNavigation.value?.querySelector('a[href]')
  desktopLink?.focus()
}

watch(() => route.fullPath, () => closeDrawer())

onMounted(() => {
  desktopQuery = window.matchMedia('(min-width: 1024px)')
  desktopQuery.addEventListener('change', onDesktopChange)
})

onBeforeUnmount(() => {
  desktopQuery?.removeEventListener('change', onDesktopChange)
  closeDrawer(false)
  unlockScroll()
})

</script>
<style lang="scss" scoped>
  .mobile-menu::backdrop {
    background: rgb(0 0 0 / 0.5);
  }

  .mobile-menu[open] {
    animation: mobile-menu-enter 0.3s ease-out;
  }

  .mobile-menu :deep(a:focus-visible) {
    outline: 2px solid theme('colors.primary.500');
    outline-offset: 4px;
    border-radius: 0.25rem;
  }

  @keyframes mobile-menu-enter {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }

  @media (prefers-reduced-motion: reduce) {
    .mobile-menu[open] {
      animation: none;
    }
  }

  .force-black {
    color: black !important;
  }
</style>
