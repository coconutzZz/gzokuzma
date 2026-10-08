<template>
  <div class="min-h-screen flex flex-col leading-normal tracking-normal gradient2 overflow-hidden">
    <header>
      <Header :is-background-visible="true" :is-fixed="isFixed">
        <div class="container max-w-2xl md:mx-auto">
          <div class="flex-row justify-center uppercase hidden md:flex">
            <DepartmentLinksShort :show-active-only="false" />
          </div>
          <div class="flex flex-row justify-center uppercase md:hidden">
            <DepartmentLinksShort :show-active-only="true" />
          </div>
        </div>
      </Header>
    </header>
    <main role="main" class="bg-white border-b pt-5 pb-10 md:pt-10 md:pb-20  flex-grow">
      <div class="container sm:px-5 md:max-w-screen-xl xl:max-w-screen-2xl mx-auto">
        <slot />
      </div>
    </main>
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
</script>