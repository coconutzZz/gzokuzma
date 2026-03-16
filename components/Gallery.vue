<template>
  <div class="embla">
    <div class="embla__viewport rounded-xl" ref="emblaRef">
      <div class="embla__container">
        <div class="embla__slide flex items-center justify-center" v-for="(image, index) in images" :key="image.filename">
          <div class="embla__slide__wrapper select-none ">
            <a :href="image.filename" class="glightbox">
              <NuxtImg :src="image.filename" class="rounded-xl" :alt="image.alt || ''" 
                  provider="storyblok"/>
              <div class="embla_slide__title" v-if="image.title">{{ image.title }}</div>
            </a>
          </div>
        </div>          
      </div>
    </div>
    <div class="embla-thumbs" v-if="images.length > 1">
      <div class="embla-thumbs__viewport" ref="emblaThumbsRef">
        <div class="embla-thumbs__container flex flex-row">
          <div v-for="(image, index) in images" :key="image.filename" class="embla-thumbs__slide"
            :class="{'embla-thumbs__slide--selected': index === selectedIndex }">
            <button type="button" @click="onThumbClick(index)">
              <NuxtImg class="rounded-lg" :src="image.filename" :alt="image.alt || ''" 
                  provider="storyblok" />
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

const props = defineProps({
  images: {
    type: Array,
    default: []
  }
});

const [emblaRef /* used in template */, emblaApi] = emblaCarouselVue({
    loop: props.images.length > 1,
    containScroll: 'keepSnaps',
    dragFree: false
  },[])

const [emblaThumbsRef /* used in template */, emblaApi2] = emblaCarouselVue({
  containScroll: 'keepSnaps',
  dragFree: props.images.length > 1
},[])

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
.embla_slide__title {
  font-size: 1.0em;
}
@media (min-width: 576px) {
  .embla-thumbs__slide {
    flex: 0 0 15%;
  }
}

</style>