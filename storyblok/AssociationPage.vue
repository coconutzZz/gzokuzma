<template>
  <StoryblokComponent :blok="association" :department="department" />    

  <div class="grid grid-cols-1 md:text-sm lg:text-base"
  :class="{ 
    'md:grid-cols-2': hasFeaturedContent,
    'max-w-2xl mx-auto': !hasFeaturedContent
    }">
    <div v-if="hasFeaturedContent" class="mt-4 sm:mt-8">
      <img v-if="blok.featured_image.filename" :src="blok.featured_image.filename" 
        class="sm:rounded-xl"/>
      <!-- <p v-if="blok.featured_text" class="mt-4">
        {{ blok.featured_text }}
      </p> -->
    </div>
    <div class="px-2">
      <div class="mt-4 md:my-6 md:mx-2 sm:flex">
        <div class="px-4 sm:px-0 sm:w-1/2">
          <h2 class="text-2xl md:text-xl font-semibold">Kontaktni podatki</h2>        
          <strong>Naslov:</strong><br>
          <address>
            {{ department?.street }} <br>
            9263 Kuzma
          </address>
          
          <strong>Email:</strong><br>
          <a :href="`mailto:${department?.email}`" class="text-blue-600 hover:underline">
            {{ department?.email }}
          </a>
        </div>
        <div class="sm:w-1/2 md:col-span-2">
          <hr class="my-5 sm:hidden">          
          <div :class="{ 'flex flex-wrap gap-y-4' : hasFeaturedContent }">
            <div class="px-4">
              Leto ustanovitve: 
              <strong>{{ department?.year_founded }}</strong>
            </div>
            <div class="px-4">
              <strong>Matična številka:</strong>
              {{ department?.company_register_number }}
            </div>
            <div class="px-4">
              <strong>Davčna številka:</strong>
              {{ department?.tax_number }}
            </div>
            <div class="px-4"><strong>TRR:</strong>
              {{ department?.iban }}
            </div>
          </div>
  
          <hr class="my-5 sm:hidden">
        </div>  
      </div>

      <div class="md:col-span-2 hidden md:flex justify-center lg:justify-start">
        <a
          :href="department?.facebook_url"
          target="_blank"
          rel="noopener noreferrer"
          v-if="department?.facebook_url"
          class="w-14 h-14 bg-primary-500 rounded-full flex items-center justify-center mt-4 lg:mt-0
                transition-transform duration-200 hover:scale-110 hover:bg-primary-dark mr-2"
        >
          <img src="/assets/img/facebook.svg" alt="Facebook" class="w-6 h-6" />
        </a>

        <Button
          v-if="blok.qr_code_bank_transfer && blok.qr_code_bank_transfer.filename"
          class="flex"
          @click="open = true"
        >
          <img src="/assets/img/donate.svg" alt="" class="w-6 h-6 mr-2" />
          DONIRAJ DRUŠTVU
        </Button>
      </div>
    </div>
    
    <div class="my-4 px-6 sm:px-2 md:col-span-2">
      <h2 class="text-2xl font-semibold">Vodstvo</h2>  
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
        <PersonCard v-for="p in sortedFiremen" :key="p.id" :person="p" />
      </div>
    </div>

    <div v-if="files && files.length > 0" class="mt-4 px-6 sm:px-2 md:col-span-2">
      <h2 class="text-2xl font-semibold">Dokumenti</h2>  
      <ul>
        <li v-for="file in files" :key="file.id">
          <a class="text-blue-600 hover:underline" :href="file.url" :title="file.name" target="_blank">{{ file.name }}</a>
        </li>
      </ul>
    </div>
  </div>

  <transition
    enter-active-class="transition-transform transition-opacity duration-300"
    enter-from-class="translate-y-16 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition-transform transition-opacity duration-300"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-16 opacity-0"
  >
    <Button
      v-if="blok.qr_code_bank_transfer && blok.qr_code_bank_transfer.filename && showButton"
      class="fixed bottom-4 right-4 md:hidden flex"
      @click="open = true"
    >
      <img src="/assets/img/donate.svg" alt="" class="w-6 h-6 mr-2" />
      DONIRAJ DRUŠTVU
    </Button>
  </transition>

 <BaseModal v-model="open">
  <div class="flex flex-col justify-center h-full -mt-10">
    <div class="sm:mt-20 text-center" v-if="blok.qr_code_bank_transfer && blok.qr_code_bank_transfer.filename">
      <p>Za nakazilo prostovoljnih prispevkov uporabite QR kodo:</p>
      <img :src="blok.qr_code_bank_transfer.filename" class="h-50 mx-auto"/>
    </div>
  </div>
</BaseModal>
</template> 
<script setup lang="ts">
import PersonCard from '~/components/PersonCard.vue';
import type { Fireman, Department, DownloadableAsset } from '~/server/types/supabase'
import { roleOrder } from '~/server/types/supabase'

const route = useRoute()

const open = ref(false)
const showButton = ref(false);

let lastScroll = 0;

const props = defineProps({ blok: {
  type: Object,
  required: true

}, postedOn: String, tagList: Array })

const association = computed(() => props.blok.association[0].content);
const hasFeaturedContent = computed(() => props.blok.featured_image.filename || props.blok.featured_text)

const deptSlug = route.params.slug[0];
let { data: department } = await useFetch<Department>(
  `/api/departments/${deptSlug}`,
  { 
    key: `dept-${deptSlug}`,
    getCachedData(key) {
      return useNuxtApp().payload.data[key] || useNuxtApp().static.data[key]
    }
  }
)

if (!department.value) {
  const { data: res } = await useFetch<Department>(
    `/api/departments/${association.value.id}`,
    { 
      key: `dept-${association.value.id}`,
      getCachedData(key) {
        return useNuxtApp().payload.data[key] || useNuxtApp().static.data[key]
      }
    }
  )
  department = res
}

const { data: firemen } = await useFetch<Fireman[]>(
  `/api/firemen/${department.value?.slug}`,
  { 
    key: `firemen-${department.value?.slug}`,
    watch: [department], // Re-fetch only if department changes
    getCachedData(key) {
      return useNuxtApp().payload.data[key] || useNuxtApp().static.data[key]
    }
  }
)

const { data: files } = await useFetch<DownloadableAsset[]>(
  `/api/files/${department.value?.slug}`,
  { 
    key: `files-${department.value?.slug}` ,
    watch: [department],
    getCachedData(key) {
      return useNuxtApp().payload.data[key] || useNuxtApp().static.data[key]
    }
  },
);

const handleScroll = () => {
  const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

  if (currentScroll > lastScroll && currentScroll > 100) {
    showButton.value = true;
  } else {
    showButton.value = false;
  }

  lastScroll = currentScroll <= 0 ? 0 : currentScroll; // reset for top
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);  
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

const sortedFiremen = computed(() => firemen.value?.sort(
  (a, b) => roleOrder[a.department_role] - roleOrder[b.department_role]) 
);


</script>