<script setup lang="ts">
import type { Department } from '~/server/types/supabase'

withDefaults(defineProps<{
  department: Department | null
  isLoading?: boolean
  hasFeaturedContent?: boolean
  canDonate?: boolean
}>(), { isLoading: false, hasFeaturedContent: false, canDonate: false })
defineEmits<{ donate: [] }>()
</script>

<template>
  <div class="px-2" :aria-busy="isLoading">
    <div class="mt-4 md:my-6 md:mx-2 sm:flex">
      <div v-if="!isLoading" class="px-4 sm:px-0 sm:w-1/2">
        <h2 class="text-2xl md:text-xl font-semibold">Kontaktni podatki</h2>
        <strong>Naslov:</strong><br>
        <address>{{ department?.street }} <br>9263 Kuzma</address>
        <strong>Email:</strong><br>
        <a v-if="department?.email" :href="`mailto:${department.email}`" class="text-blue-600 hover:underline">
          {{ department.email }}
        </a>
      </div>
      <div v-else class="px-4 sm:px-0 sm:w-1/2" aria-hidden="true">
        <div class="w-full h-4 mt-4 animate-pulse bg-gray-300"></div>
        <div class="w-3/4 h-4 mt-4 animate-pulse bg-gray-300"></div>
        <div class="w-full h-4 mt-4 animate-pulse bg-gray-300"></div>
        <div class="w-1/2 h-4 mt-4 animate-pulse bg-gray-300"></div>
      </div>
      <div class="sm:w-1/2 md:col-span-2">
        <hr class="my-5 sm:hidden">
        <div v-if="!isLoading" :class="{ 'flex flex-wrap gap-y-4': hasFeaturedContent }">
          <div class="px-4">Leto ustanovitve: <strong>{{ department?.year_founded }}</strong></div>
          <div class="px-4"><strong>Matična številka:</strong> {{ department?.company_register_number }}</div>
          <div class="px-4"><strong>Davčna številka:</strong> {{ department?.tax_number }}</div>
          <div class="px-4"><strong>TRR:</strong> {{ department?.iban }}</div>
        </div>
        <div v-else class="flex flex-wrap gap-y-4 ml-2 mt-2" aria-hidden="true">
          <div class="w-full h-4 mt-2 animate-pulse bg-gray-300"></div>
          <div class="w-3/4 h-4 animate-pulse bg-gray-300"></div>
          <div class="w-full h-4 animate-pulse bg-gray-300"></div>
        </div>
        <hr class="my-5 sm:hidden">
      </div>
    </div>
    <div class="md:col-span-2 hidden md:flex justify-center lg:justify-start">
      <a v-if="department?.facebook_url" :href="department.facebook_url" target="_blank" rel="noopener noreferrer"
        class="w-14 h-14 bg-primary-500 rounded-full flex items-center justify-center mt-4 lg:mt-0 transition-transform duration-200 hover:scale-110 hover:bg-primary-dark mr-2">
        <NuxtImg src="/img/facebook.svg" alt="Facebook" class="w-6 h-6" />
      </a>
      <Button v-if="canDonate" type="button" class="flex" rounded @click="$emit('donate')">
        <NuxtImg src="/img/donate.svg" alt="" class="w-6 h-6 mr-2" />
        DONIRAJ DRUŠTVU
      </Button>
    </div>
  </div>
</template>
