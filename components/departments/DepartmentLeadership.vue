<script setup lang="ts">
import type { Fireman } from '~/server/types/supabase'

withDefaults(defineProps<{
  firemen: readonly Fireman[]
  isLoading?: boolean
  hasError?: boolean
}>(), { isLoading: false, hasError: false })
defineEmits<{ retry: [] }>()
</script>

<template>
  <section class="my-4 px-6 sm:px-2 md:col-span-2" :aria-busy="isLoading">
    <h2 class="text-2xl font-semibold">Vodstvo</h2>
    <p v-if="isLoading" role="status">Nalaganje vodstva...</p>
    <div v-else-if="hasError" role="alert">
      <p>Podatkov o vodstvu trenutno ni mogoče naložiti.</p>
      <Button type="button" @click="$emit('retry')">Poskusi znova</Button>
    </div>
    <div v-else-if="firemen.length" class="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
      <PersonCard v-for="person in firemen" :key="person.id" :person="person" />
    </div>
    <p v-else>Podatki o vodstvu še niso na voljo.</p>
  </section>
</template>
