<template>
  <div class="min-h-screen flex flex-col leading-normal tracking-normal text-white gradient2 overflow-hidden">
    <Header :is-background-visible="hasHeaderBg" />

    <HeroAssociations v-if="showHero" />

    <div :class="showHero ? '-mt-24 sm:-mt-20 md:-mt-28 xl:-mt-48 2xl:-mt-52' : '-mt-5 sm:mt-0 lg:-mt-14 xl:-mt-32'" class="w-[200%] sm:w-full transition-transform duration-500 bg-primary-500">
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

    <section class="bg-white border-b py-2 flex-grow">
      <div class="container px-5 md:max-w-screen-xl mx-auto">
        <slot />
      </div>
    </section>

    <FooterStats v-if="showFooterStats" />
    <Footer />
  </div>
</template>
<script setup>
const route = useRoute();
const showHero = computed(() => route.meta.hero === 'associations')
const showFooterStats = computed(() => route.meta.footerStats)

const hasHeaderBg = ref(false);
let lastScrollY = 0;

const handleScroll = () => {
  const currentY = window.scrollY;
  
  if (currentY > lastScrollY) {
    hasHeaderBg.value = currentY > lastScrollY && currentY > 150;
  }
  else if (currentY < 150) {
    hasHeaderBg.value = false;
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