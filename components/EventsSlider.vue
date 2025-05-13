<template>
  <div class="custom-nav">
    <div class="custom-btn-prev">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M16 4L8 12L16 20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>      
    <div class="custom-btn-next">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M8 4L16 12L8 20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>      
  </div>
  <div v-if="isLoading" class="flex items-center w-full">
    <div class="w-full pt-5 pb-6 ml-5">
      <div class="flex items-center">
          <div class="animate-pulse bg-gray-300 ring-gray-300 mx-5 z-10 flex items-center justify-center w-6 h-6 rounded-full ring-8 shrink-0">                
          </div>
          <div class="-mx-5 flex w-full bg-gray-200 h-1"></div>
      </div>
      <div class="mt-5">
        <div class="w-[80%]">
          <div class="w-[10%] h-5 animate-pulse bg-gray-300 mt-5"></div>        
          <div class="w-[20%] h-5 animate-pulse bg-gray-300 mt-4"></div>        
          <div class="w-[5%] h-3 animate-pulse bg-gray-300 mt-2"></div>        
        </div>
      </div>
    </div>
  </div>
  <swiper-container ref="swiperRef" :init="false" space-between="0" free-mode="true">
    <swiper-slide class="pt-5 pb-6" v-for="(event, index) in events" :class="index === 0 ? 'ml-5' : ''">
      <div class="flex items-center">
          <div :class="index === 0 ? 'bg-accent ring-accent' : 'bg-neutral ring-neutral'" class="mx-5 z-10 flex items-center justify-center w-6 h-6 rounded-full ring-8 shrink-0">
              <svg class="text-primary-500 w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
              </svg>
          </div>
          <div class="-mx-5 flex w-full bg-gray-200 h-1"></div>
      </div>
      <div v-if="!isLoading" class="mt-5">
        <div class="w-[80%]">
          <time class="block mb-2 text-xs sm:text-sm leading-none text-gray-400 dark:text-gray-500">{{ formatEventDate(event.content.date) }}</time>
          <h3 class="text-sm  sm:text-lg font-semibold text-gray-900">{{ event.content.title}}</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ `Kraj: ${event.content.location}` }}</p>
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

const swiperRef = ref(null);
const events = ref([])
const isLoading = ref(true);

const storyblokApi = useStoryblokApi()

onBeforeMount(async () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); 
  const day = String(today.getDate()).padStart(2, '0');

  const { data } = await storyblokApi.get("cdn/stories", {
    version: "draft",
    starts_with: `dogodki/${year}`,
    sort_by: "created_at:asc",
    filter_query: {
      "date": { gt_date: `${year}-${month}-${day} 00:00:00`}
    },
    per_page: 5,
    page: 1
  });

  if (data.stories.length > 0) {
    events.value = data.stories;
  }

  const swiperParams = {
    breakpoints: {
      320: {
        slidesPerView: 2,
      },
      520: {
        slidesPerView: 2,
      },
      768: {
        slidesPerView: events.value.length
      }
    },
    navigation: {
      prevEl: '.custom-btn-prev',
      nextEl: '.custom-btn-next',
    }
  }
  
  Object.assign(swiperRef.value, swiperParams);
  swiperRef.value.initialize();
  
  isLoading.value = false;
});

const formatEventDate = (eventDate) => {
  if (eventDate) {
    const date = DateTime.fromFormat(eventDate, 'yyyy-MM-dd HH:mm', { zone: 'local' })
      .setLocale('sl-si');

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