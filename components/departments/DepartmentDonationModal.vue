<script setup lang="ts">
import type { DepartmentAsset } from '~/types/departments'

const open = defineModel<boolean>({ default: false })
defineProps<{ image?: DepartmentAsset; departmentName?: string }>()
</script>

<template>
  <BaseModal v-model="open" :label="departmentName ? `Doniraj društvu ${departmentName}` : 'Doniraj društvu'">
    <div class="flex flex-col justify-center h-full -mt-10">
      <div v-if="image?.filename" class="sm:mt-20 text-center">
        <p>Za nakazilo prostovoljnih prispevkov, z vašo bančno aplikacijo skenirajte QR kodo. Podatki za UPN se bodo samodejno izpolnili.</p>
        <AppImage :src="image.filename" :alt="image.alt || 'QR koda za nakazilo'"
          class="w-full max-w-xs mx-auto object-contain" sizes="320px" loading="eager" />
      </div>
    </div>
  </BaseModal>
</template>
