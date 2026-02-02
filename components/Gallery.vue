<template>
  <div class="embla">
    <div class="embla__viewport rounded-xl" ref="emblaRef">
      <div class="embla__container">
        <div class="embla__slide flex items-center justify-center" v-for="(image, index) in images" :key="image.filename">
          <div class="embla__slide__wrapper select-none ">
            <a :href="image.filename" class="glightbox">
              <img :src="image.filename" class="rounded-xl"/>
            </a>
          </div>
        </div>          
      </div>
    </div>
    <div class="embla-thumbs">
      <div class="embla-thumbs__viewport" ref="emblaThumbsRef">
        <div class="embla-thumbs__container flex flex-row">
          <div v-for="(image, index) in images" :key="image.filename" class="embla-thumbs__slide"
            :class="{'embla-thumbs__slide--selected': index === selectedIndex }">
            <button type="button" @click="onThumbClick(index)">
              <img class="rounded-lg" :src="image.filename" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import emblaCarouselVue from 'embla-carousel-vue'

const { $glightbox } = useNuxtApp()
const selectedIndex = ref(0);

const [emblaRef /* used in template */, emblaApi] = emblaCarouselVue({
    loop: true,
    containScroll: 'keepSnaps',
    dragFree: false
  },[])

const [emblaThumbsRef /* used in template */, emblaApi2] = emblaCarouselVue({
  containScroll: 'keepSnaps',
  dragFree: true
},[])

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
  onSelect();
  $glightbox({
    selector: '.glightbox',
  });
})
</script>
<style lang="scss" scoped>
.embla {
  margin: auto;
  --slide-height: auto;
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
  max-height: 30em;
  padding-left: var(--slide-spacing);
  border-radius: 20px;
}
.embla__slide__wrapper {   
  height: var(--slide-height);
}
.embla-thumbs {
  --thumbs-slide-spacing: 0.4rem;
  margin-top: var(--thumbs-slide-spacing);
}
.embla-thumbs__viewport {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x mandatory;
}
.embla-thumbs__container {
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

</style>