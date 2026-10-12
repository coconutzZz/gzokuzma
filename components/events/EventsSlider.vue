<template>
  <div v-if="events.length" class="custom-nav">
    <button ref="prevButtonRef" class="custom-btn-prev" aria-label="Prejšnji dogodek">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M16 4L8 12L16 20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>      
    <button ref="nextButtonRef" class="custom-btn-next" aria-label="Naslednji dogodek">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M8 4L16 12L8 20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>      
  </div>
  <div v-if="isLoading || !events.length" class="events-slider-content flex items-start w-full" :aria-busy="isLoading">
    <div class="w-full pt-5 pb-6 ml-5">
      <div class="flex items-center" aria-hidden="true">
          <div :class="isLoading ? 'animate-pulse bg-gray-300 ring-gray-300' : 'bg-gray-200 ring-gray-200'" class="mx-5 z-10 flex items-center justify-center w-6 h-6 rounded-full ring-8 shrink-0">
            <svg v-if="!isLoading" class="text-gray-500 w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
            </svg>
          </div>
          <div class="-mx-5 flex w-full bg-gray-200 h-1"></div>
      </div>
      <div v-if="isLoading" class="mt-5">
        <div class="w-[80%]">
          <div class="w-[10%] h-5 animate-pulse bg-gray-300 mt-5"></div>        
          <div class="w-[20%] h-5 animate-pulse bg-gray-300 mt-4"></div>
        </div>
      </div>
      <p v-else role="status" class="mt-5 mb-0 text-sm sm:text-base text-gray-500">
        Trenutno ni objavljenih dogodkov.
      </p>
    </div>
  </div>
  <swiper-container v-if="events.length" class="events-slider-content" ref="swiperRef" :init="false" space-between="0" free-mode="true">
    <swiper-slide class="pt-5 md:pb-6" v-for="(event, index) in events" :key="event.uuid" :class="index === 0 ? 'ml-5' : ''">
      <div class="flex items-center">
          <div :class="event.isPast ? 'bg-gray-200 ring-gray-200' : index === events.length - 1 ? 'bg-accent ring-accent' : 'bg-neutral ring-neutral'" class="mx-5 z-10 flex items-center justify-center w-6 h-6 rounded-full ring-8 shrink-0">
              <svg :class="event.isPast ? 'text-gray-500' : 'text-primary-500'" class="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
              </svg>
          </div>
          <div class="-mx-5 flex w-full bg-gray-200 h-1"></div>
      </div>
      <div v-if="!isLoading" class="mt-5">
        <div class="w-[80%]">
          <time :class="event.isPast ? 'text-gray-500' : 'text-gray-400 dark:text-gray-500'" class="block mb-2 text-xs sm:text-sm leading-none">{{ formatEventDate(event.content.date) }}</time>
          <h3 :class="event.isPast ? 'text-gray-500' : 'text-gray-900'" class="text-sm sm:text-lg font-semibold">{{ event.content.title}}</h3>
          <p :class="event.isPast ? 'text-gray-500' : 'text-gray-500 dark:text-gray-400'" class="text-sm">{{ `Kraj: ${event.content.location}` }}</p>
        </div>
      </div>
    </swiper-slide>
    <!--
    <swiper-slide class="pt-5 pb-6">
      <div class="flex items-center">
          <div class="mx-5 z-10 px-3 flex items-center justify-center rounded-full ring-8 ring-primary bg-primary ">
            <svg class="w-2.5 h-2.5 mr-2 text-secondary dark:text-blue-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
            </svg>
            <span>Vsi dogodki</span>     
          </div>
      </div>
    </swiper-slide>-->
  </swiper-container> 
</template>
<script setup>
import { DateTime } from "luxon";
const version = import.meta.env.DEV ? 'draft' : 'published'

const swiperRef = ref(null);
const prevButtonRef = ref(null);
const nextButtonRef = ref(null);
const events = ref([])
const isLoading = ref(true);
let mounted = false;

const storyblokApi = useStoryblokApi()

onMounted(async () => {
  mounted = true;
  const { data } = await storyblokApi.get("cdn/stories", {
    version,
    starts_with: 'dogodki/',
    sort_by: 'content.date:desc',
    per_page: 5,
    page: 1
  });

  if (!mounted) return;
  const now = DateTime.now().toMillis();
  // Fetch the latest dates first, then display a timeline from oldest to newest.
  const loadedEvents = (data.stories || []).slice().reverse().map(event => ({
    ...event,
    isPast: getEventDate(event.content.date).toMillis() < now
  }));
  // Keep the skeleton until Swiper is registered, so raw elements never stack vertically.
  // Empty timelines do not need the Swiper bundle.
  if (!loadedEvents.length) {
    isLoading.value = false;
    return;
  }
  const { register, Navigation, FreeMode, freeModeStyles } = await import('~/utils/events-swiper');
  if (!mounted) return;
  register();

  events.value = loadedEvents;
  isLoading.value = false;
  await nextTick();
  if (!mounted || !swiperRef.value) return;

  const swiperParams = {
    modules: [Navigation, FreeMode],
    injectStyles: [freeModeStyles],
    initialSlide: events.value.length - 1,
    breakpoints: {
      320: {
        slidesPerView: Math.min(2, events.value.length),
      },
      520: {
        slidesPerView: Math.min(2, events.value.length),
      },
      768: {
        slidesPerView: events.value.length
      }
    },
    navigation: {
      prevEl: prevButtonRef.value,
      nextEl: nextButtonRef.value,
    },
    on: {
      // When resizing makes the timeline scrollable, open its newest end again.
      unlock(swiper) {
        if (swiper.initialized) swiper.slideTo(events.value.length - 1, 0);
      }
    }
  }
  
  Object.assign(swiperRef.value, swiperParams);
  swiperRef.value.initialize();
});

onBeforeUnmount(() => {
  mounted = false;
});

// Storyblok event times refer to Slovenia, regardless of the visitor's timezone.
const getEventDate = (eventDate) => DateTime.fromFormat(eventDate || '', 'yyyy-MM-dd HH:mm', { zone: 'Europe/Ljubljana' });

const formatEventDate = (eventDate) => {
  if (eventDate) {
    const date = getEventDate(eventDate).setLocale('sl-si');

    const formatted = date.toLocaleString(DateTime.DATE_MED);
    return formatted;
  }
}

</script>
<style lang="scss">

/* Nav container */
.custom-nav {
  position: relative;
}

/* Shared button styles */
.custom-btn-prev,
.custom-btn-next {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color:theme('colors.primary.500');
  position: absolute;
  transform: translateY(-50%);
  z-index: 10;
  top: 32px
}

.custom-btn-prev {
  left: -10px;
  &.swiper-button-disabled {
    display: none;
  }
}

.custom-btn-next {
  right: -10px;
  &.swiper-button-disabled {
    display: none;
  }
}

.custom-btn-prev svg,
.custom-btn-next svg {
  width: 40px;
  height: 40px;
  display: block;
}
</style>
