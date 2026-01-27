<template>
  <div
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
        {{ person.first_name + ' ' + person.last_name}}
      </h6>
      <div class="text-sm">
        {{ person.department_role }}
      </div>
      <div class="text-sm" v-if="person.mobile_phone">
        {{ person.mobile_phone }}
      </div>
      <div class="text-sm" v-if="person.email">
        {{ person.email }}
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { Fireman } from '~/server/types/supabase'
defineProps({
  person: {
    type: Object as PropType<Fireman>,
    required: true
  }
})
</script>