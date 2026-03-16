<template>
  <div class="min-h-screen flex flex-col leading-normal tracking-normal gradient2 overflow-hidden">
    <header>
      <Header :is-background-visible="true" :is-fixed="isFixed">
        <div class="container max-w-2xl mx-auto hidden md:block">
          <div class="sm:flex flex-row justify-center text-white font-bold text-2xl lg:text-4xl uppercase">
            <DepartmentLinksShort />
          </div>
        </div>
      </Header>
    </header>
    <main role="main" class="bg-white border-b py-2 flex-grow">
      <div class="container sm:px-5 md:max-w-screen-xl mx-auto">
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