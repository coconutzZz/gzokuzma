<template>
  <StoryblokComponent :blok="association" :department="department" />    

  <div class="grid grid-cols-1 sm:grid-cols-2">
    <div v-if="hasFeaturedContent" class="mt-4 sm:mt-8">
      <img v-if="blok.featured_image.filename" :src="blok.featured_image.filename" />
      <!-- <p v-if="blok.featured_text" class="mt-4">
        {{ blok.featured_text }}
      </p> -->
    </div>
    <div class="px-2">

      <div class="mt-4 sm:m-8">
        <h2 class="text-2xl font-semibold">Kontaktni podatki</h2>
        <p>
           <strong>Naslov:</strong><br>
           <address>
             {{ department?.street }} <br>
             9263 Kuzma
           </address>
         </p>
         <p>
           <strong>Email:</strong><br>
           <a :href="`mailto:${department?.email}`" class="text-blue-600 hover:underline">
             {{ department?.email }}
           </a>
         </p>
      </div>
      <div class="sm:flex sm:col-span-2">
        <hr>
        
        <p>Leto ustanovitve: <strong>{{ department?.year_founded }}</strong></p>
        <p>
          <strong>Matična številka:</strong><br>
          {{ department?.company_register_number }}
        </p>
        <p>
          <strong>Davčna številka:</strong><br>
          {{ department?.tax_number }}
        </p>
        <p>
          <strong>TRR:</strong><br>
          {{ department?.iban }}
        </p>
      </div>
  
      <div class="mt-4" v-if="blok.qr_code_bank_transfer && blok.qr_code_bank_transfer.filename">
        <p>Za nakazilo prostovoljnih prispevkov, lahko uporabite QR kodo:</p>
        <img :src="blok.qr_code_bank_transfer.filename" class="h-52 mx-auto sm:mx-0 sm:h-auto"/>
      </div>
  
  
      <div class="mt-4">
        <h2 class="text-2xl font-semibold">Vodstvo</h2>
  
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
          <PersonCard v-for="p in firemen" :key="p.id" :person="p" />
        </div>
      </div>
    </div>
  </div>

  <div class="max-w-4xl mx-auto p-0 mt-5 sm:mt-10 md:p-6 grid grid-cols-1 sm:grid-cols-3 gap-0 sm:gap-10">
   
  </div>

</template> 
<script setup lang="ts">
import PersonCard from '~/components/PersonCard.vue';
import type { Fireman, Department } from '~/server/types/supabase'

const route = useRoute()

const props = defineProps({ blok: {
  type: Object,
  required: true

}, postedOn: String, tagList: Array })

const association = computed(() => props.blok.association[0].content);
const hasFeaturedContent = computed(() => props.blok.featured_image.filename || props.blok.featured_text)


let { data: department } = await useFetch<Department>(
  `/api/departments/${route.params.slug[0]}`
)

if (!department.value) {
  const res = await useFetch<Department>(
    `/api/departments/${association.value.id}`
  )
  department = res.data
}

let { data: firemen } = await useFetch<Fireman[]>(
  `/api/firemen/${department.value?.slug}`
)
</script>