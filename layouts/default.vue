<template>
  <div v-if="isDev" class="fixed bottom-4 right-4 bg-black text-white text-sm px-3 py-1 rounded z-50">
    <span class="block sm:hidden">xs (&lt;640px)</span>
    <span class="hidden sm:block md:hidden">sm (≥640px)</span>
    <span class="hidden md:block lg:hidden">md (≥768px)</span>
    <span class="hidden lg:block xl:hidden">lg (≥1024px)</span>
    <span class="hidden xl:block 2xl:hidden">xl (≥1280px)</span>
    <span class="hidden 2xl:block">2xl (≥1536px)</span>
  </div>

  <div class="leading-normal tracking-normal text-white gradient2 overflow-hidden">
    <Header :is-background-visible="showHeader"/>
    <!--Hero-->
    <div class="relative pt-24 z-10" v-if="$slots.hero" >
      <div class="container px-24 mx-auto">
       <slot name="hero"></slot>
      </div>
    </div>
    <div :class="hasHero ? '-mt-24 sm:-mt-20 md:-mt-28 xl:-mt-48 2xl:-mt-52' : '-mt-5 sm:mt-0 lg:-mt-14 xl:-mt-32'" class="w-[200%] sm:w-full transition-transform duration-500 bg-primary-500">
      <svg viewBox="0 0 1420 266" xmlns="http://www.w3.org/2000/svg" class="">
        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
          <g transform="translate(0, 50)" fill="#FF4500" fill-rule="nonzero">
            <path d="M0,60 C120,30 300,10 480,40 C660,70 840,90 1080,70 C1260,55 1380,30 1440,20 L1440,180 L0,180 Z" opacity="0.15"></path>
            <path d="M0,90 C140,60 320,40 520,70 C700,100 860,120 1080,90 C1220,70 1380,50 1440,40 L1440,180 L0,180 Z" opacity="0.25"></path>
            <path d="M0,120 C160,90 360,70 560,100 C760,130 940,140 1160,110 C1300,90 1420,70 1440,60 L1440,180 L0,180 Z" opacity="0.35"></path>
          </g>
          <g transform="translate(0, 80)" fill="#FF6347" fill-rule="nonzero">
            <path d="M0,50 C100,80 280,110 440,100 C620,90 820,60 1000,80 C1180,100 1340,130 1440,150 L1440,180 L0,180 Z"></path>
          </g>
          <g transform="translate(0, 120)" fill="#FFF" fill-rule="nonzero">      
            <path d="M0,120 C160,90 360,70 560,100 C760,130 940,140 1160,110 C1300,90 1420,70 1440,60 L1440,180 L0,180 Z"></path>
          </g>
        </g>
      </svg>
    </div>
    <section class="bg-white border-b" :class="hasHero ? 'pt-5 sm:py-8' : 'py-2'">
      <div class="container px-5 md:max-w-screen-xl mx-auto">
        <slot />
      </div>
    </section>
    <slot name="above-footer"></slot>
    <footer class="bg-gray-100 text-center p-4 text-sm text-gray-500">
      &copy; {{ copyrightYear }}, Gasilska zveza Občine Kuzma
    </footer>
  </div>
</template>
<script setup>
import Header from '~/components/Header.vue';

const slots = useSlots();
const isDev = import.meta.dev

const hasHero = computed(() => !!slots.hero && slots.hero().length > 0)

const showHeader = ref(false);
let lastScrollY = 0;

const handleScroll = () => {
  const currentY = window.scrollY;
  
  if (currentY > lastScrollY) {
    showHeader.value = currentY > lastScrollY && currentY > 150;
  }
  else if (currentY < 150) {
    showHeader.value = false;
  }

  lastScrollY = currentY;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

const copyrightYear = computed(() => {
  const today = new Date();
  return today.getFullYear();
})

</script>
<style>
.gradient {
  background: linear-gradient(90deg, #FF6347 0%, #FF4500 100%);
}
.gradient2 {
  background: linear-gradient(90deg, #262C69 0%, #262C69 100%);
}
</style>