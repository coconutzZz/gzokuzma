<template>
 <div
  class="flex w-full max-w-md items-center rounded-lg bg-slate-50 p-4 shadow-sm hover:shadow-md transition-shadow"
>
  <!-- Avatar -->
  <div class="flex-shrink-0 mr-4">
    <img
      src="/assets/img/person.svg"
      alt="Person Avatar"
      class="h-16 w-16 rounded-full object-cover object-center"
    />
  </div>

  <!-- Info -->
  <div class="flex flex-col justify-center space-y-1">
    <!-- Name -->
    <h6 class="text-lg font-semibold text-slate-900 truncate">
      {{ person.first_name + ' ' + person.last_name }}
    </h6>

    <!-- Role / Department -->
    <div class="text-sm text-slate-600">
      {{ person.department_role }}
    </div>

    <!-- Contact Info -->
    <div class="flex flex-col text-sm text-slate-600 space-y-0.5">
      <div v-if="person.mobile_phone" class="flex items-center space-x-2">
        <span>{{ person.mobile_phone }}</span>
      </div>
      <div v-if="person.email" class="flex items-center space-x-2 truncate">
        <span class="truncate">{{ person.email }}</span>
      </div>
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