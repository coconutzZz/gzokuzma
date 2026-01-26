<template>
  <StoryblokComponent :blok="association" />    

  <div class="max-w-4xl mx-auto p-0 mt-5 sm:mt-10 md:p-6 grid grid-cols-1 sm:grid-cols-3 gap-0 sm:gap-10">
    <div v-if="hasFeaturedContent" class="col-span-2">
      <img v-if="blok.featured_image.filename" :src="blok.featured_image.filename" />
      <p v-if="blok.featured_text" class="mt-4">
        {{ blok.featured_text }}
      </p>
    </div>
    <div :class="!hasFeaturedContent ? 'col-span-2' : ''">
      <h2 class="text-2xl font-semibold">Kontaktni podatki</h2>
      <p>
        <strong>Naslov:</strong><br>
        {{ association.street }} <br>
        9263 Kuzma
      </p>
      <p>
        <strong>Email:</strong><br>
        <a :href="`mailto:${association.email}`" class="text-blue-600 hover:underline">
          {{ association.email }}
        </a>
      </p>
      
      <h2 class="text-2xl font-semibold">Vodstvo</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
        <div v-for="p in firemen" :key="p.id"
          class="text-slate-800 flex w-full items-center rounded-md bg-slate-100"
        >
          <div class="mr-4 grid place-items-center h-20 w-20">
            <img
              src="/assets/img/person.svg" 
              class="relative inline-block h-10 w-10 rounded-l-md object-cover object-center"
            />
          </div>
          <div>
            <h6 class="text-xl font-semibold">
              {{ p.first_name + ' ' + p.last_name}}
            </h6>
            <div class="text-sm">
              {{ p.department_role }}
            </div>
            <div class="text-sm" v-if="p.mobile_phone">
              {{ p.mobile_phone }}
            </div>
          </div>
        </div>
      </div>
      
      <template v-if="hasFeaturedContent">
        <hr class="my-5">
        <p>Leto ustanovitve: <strong>{{ association.year_founded }}</strong></p>
        <p>
          <strong>Matična številka:</strong><br>
          {{ association.company_registration_number }}
        </p>
        <p>
          <strong>Davčna številka:</strong><br>
          {{ association.tax_number }}
        </p>
        <p>
          <strong>TRR:</strong><br>
          {{ association.iban }}
        </p>
        <p>Za nakazilo prostovoljnih prispevkov, lahko uporabite QR kodo:</p>
        <img v-if="blok.qr_code_bank_transfer && blok.qr_code_bank_transfer.filename" :src="blok.qr_code_bank_transfer.filename" class="h-52 mx-auto sm:mx-0 sm:h-auto"/>
      </template>
    </div>
    <div v-if="!hasFeaturedContent">
      <p>Leto ustanovitve: <strong>{{ association.year_founded }}</strong></p>
      <p>
        <strong>Matična številka:</strong><br>
        {{ association.company_registration_number }}
      </p>
      <p>
        <strong>Davčna številka:</strong><br>
        {{ association.tax_number }}
      </p>
      <p>
        <strong>TRR:</strong><br>
        {{ association.iban }}
      </p>
      <template v-if="blok.qr_code_bank_transfer && blok.qr_code_bank_transfer.filename">
        <p>Za nakazilo prostovoljnih prispevkov, lahko uporabite QR kodo:</p>
        <img :src="blok.qr_code_bank_transfer.filename" class="h-52 mx-auto sm:mx-0 sm:h-auto"/>
      </template>
    </div>
  </div>

</template> 
<script setup lang="ts">
import type { Fireman } from '~/server/types/supabase'

const route = useRoute()

const { data: firemen } = await useFetch<Fireman[]>(
  `/api/firemen/${route.params.slug[0]}`
)

const props = defineProps({ blok: {
  type: Object,
  required: true

}, postedOn: String, tagList: Array })

const association = computed(() => props.blok.association[0].content);
const hasFeaturedContent = computed(() => props.blok.featured_image.filename || props.blok.featured_text)
</script>