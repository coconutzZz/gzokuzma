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
<script setup>
const props = defineProps({ blok: Object, postedOn: String, tagList: Array })

const association = computed(() => props.blok.association[0].content);
const hasFeaturedContent = computed(() => props.blok.featured_image.filename || props.blok.featured_text)
</script>