<template>
  <div class="embla bg-black">
    <div class="embla__viewport" ref="emblaRef">
      <div class="embla__container">
        <div class="embla__slide" v-for="(image, index) in images" :key="image.filename">
          <div class="embla__slide__number">
            <img :src="image.filename" />
          </div>
        </div>          
      </div>
    </div>
    <div class="embla-thumbs">
      <div class="embla-thumbs__viewport">
        <div class="embla-thumbs__container">
          <div v-for="(image, index) in images" :key="image.filename" class="embla-thumbs__slide"
            :class="{'embla-thumbs__slide--selected': index === selectedIndex }">
            <button type="button" class="embla-thumbs__slide__number" @click="onThumbClick(index)">
              <img :src="image.filename" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import emblaCarouselVue from 'embla-carousel-vue'
import Autoplay from 'embla-carousel-autoplay'

const selectedIndex = ref(0);

const [emblaRef, emblaApi] = emblaCarouselVue({
    loop: true,
    containScroll: 'keepSnaps',
    dragFree: false
  }, [Autoplay()])

defineProps({
  images: {
    type: Array,
    default: []
  }
});

const onThumbClick = (index) => {
  if (emblaApi.value) {
    emblaApi.value.scrollTo(index)
    selectedIndex.value = index
  }
}

const onSelect = () => {
  if (!emblaApi.value) return
  selectedIndex.value = emblaApi.value.selectedScrollSnap()
}

onMounted(async () => {
  if (!emblaApi.value) return
  emblaApi.value.on('select', onSelect)
  onSelect() // initialize selectedIndex
})
</script>
<style lang="scss" scoped>
.embla {
  max-width: 48rem;
  margin: auto;
  --slide-height: 19rem;
  --slide-spacing: 1rem;
  --slide-size: 100%;
}
.embla__viewport {
  overflow: hidden;
}
.embla__container {
  display: flex;
  touch-action: pan-y pinch-zoom;
  margin-left: calc(var(--slide-spacing) * -1);
}
.embla__slide {
  transform: translate3d(0, 0, 0);
  flex: 0 0 var(--slide-size);
  min-width: 0;
  padding-left: var(--slide-spacing);
}
.embla__slide__number {
  box-shadow: inset 0 0 0 0.2rem var(--detail-medium-contrast);
  border-radius: 1.8rem;
  font-size: 4rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  height: var(--slide-height);
  user-select: none;
}
.embla-thumbs {
  --thumbs-slide-spacing: 0.8rem;
  --thumbs-slide-height: 6rem;
  margin-top: var(--thumbs-slide-spacing);
}
.embla-thumbs__viewport {
  overflow: hidden;
}
.embla-thumbs__container {
  display: flex;
  flex-direction: row;
  margin-left: calc(var(--thumbs-slide-spacing) * -1);
}
.embla-thumbs__slide {
  flex: 0 0 22%;
  min-width: 0;
  padding-left: var(--thumbs-slide-spacing);
}
@media (min-width: 576px) {
  .embla-thumbs__slide {
    flex: 0 0 15%;
  }
}
.embla-thumbs__slide__number {
  border-radius: 1.8rem;
  -webkit-tap-highlight-color: rgba(var(--text-high-contrast-rgb-value), 0.5);
  -webkit-appearance: none;
  appearance: none;
  background-color: transparent;
  touch-action: manipulation;
  display: inline-flex;
  text-decoration: none;
  cursor: pointer;
  border: 0;
  padding: 0;
  margin: 0;
  box-shadow: inset 0 0 0 0.2rem var(--detail-medium-contrast);
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--detail-high-contrast);
  display: flex;
  align-items: center;
  justify-content: center;
  height: var(--thumbs-slide-height);
  width: 100%;
}
.embla-thumbs__slide--selected .embla-thumbs__slide__number {
  color: var(--text-body);
}
</style>