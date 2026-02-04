<template>
  <div class="min-h-screen flex flex-col leading-normal tracking-normal gradient2 overflow-hidden">
    <Header :is-background-visible="true" :is-fixed="isFixed" :sub-menu-items="menuStories">
      <div class="container max-w-2xl mx-auto hidden lg:block">
        <div class="sm:flex flex-row justify-center text-white font-bold text-2xl lg:text-4xl uppercase">
          <AssociationsMenu :show-images="false" />
        </div>
      </div>
    </Header>
    <section class="bg-white border-b py-2 flex-grow">
      <div class="container sm:px-5 md:max-w-screen-xl mx-auto">
        <slot />
      </div>
    </section>
    <!-- <slot name="above-footer"></slot> -->
    <Footer />
  </div>
</template>
<script setup>
const isFixed = ref(false);
/*let lastScrollY = 0;
const handleScroll = () => {
  const currentY = window.scrollY;
  
  if (currentY > lastScrollY) {
    isFixed.value = currentY > lastScrollY && currentY > 150;
  }
  else if (currentY < 150) {
    isFixed.value = false;
  }

  lastScrollY = currentY;
};*/

const { data: menuStories } = useMenuStories()

</script>