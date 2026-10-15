<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import type { AssociationPageContent } from '~/types/departments'
import { useDepartmentProfile } from '~/composables/useDepartmentProfile'
import { useFloatingActions } from '~/composables/useFloatingActions'

const props = withDefaults(defineProps<{
  blok?: AssociationPageContent
  postedOn?: string
  tagList?: string[]
  isLoading?: boolean
}>(), { isLoading: false })
const route = useRoute()
const open = shallowRef(false)
const departmentSlug = computed(() => Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug)
const {
  ready, department, firemen, files,
  departmentError, firemenError, filesError,
  isDepartmentLoading, isFiremenLoading, isFilesLoading,
  refreshDepartment, refreshFiremen, refreshFiles,
} = useDepartmentProfile(departmentSlug)
const isLoading = computed(() => props.isLoading || isDepartmentLoading.value)
const hasFeaturedContent = computed(() => isLoading.value || Boolean(props.blok?.featured_image?.filename || props.blok?.featured_text))
const canDonate = computed(() => Boolean(props.blok?.qr_code_bank_transfer?.filename))
const { registerAction } = useFloatingActions()

registerAction({
  id: 'association-facebook',
  label: '',
  icon: '/img/facebook.svg',
  mobileOnly: true,
  primary: true,
  isAvailable: () => Boolean(department.value?.facebook_url),
  onClick: () => { window.open(department.value?.facebook_url, '_blank', 'noopener,noreferrer') },
})
registerAction({
  id: 'association-donation',
  label: 'DONIRAJ DRUŠTVU',
  icon: '/img/donate.svg',
  mobileOnly: true,
  isAvailable: () => canDonate.value,
  onClick: () => { open.value = true },
})

await ready
</script>

<template>
  <div v-if="departmentError" role="alert" class="px-6 py-4">
    <p>Podatkov društva trenutno ni mogoče naložiti.</p>
    <Button type="button" @click="refreshDepartment()">Poskusi znova</Button>
  </div>
  <template v-else>
    <Association :department="department" :is-loading="isLoading" />
    <div class="grid grid-cols-1 md:text-sm lg:text-base mt-2"
      :class="hasFeaturedContent ? 'md:grid-cols-2' : 'max-w-2xl mx-auto'">
      <DepartmentFeaturedImage v-if="hasFeaturedContent" :image="blok?.featured_image"
        :department-name="department?.name" :is-loading="isLoading" />
      <DepartmentContact :department="department" :is-loading="isLoading"
        :has-featured-content="hasFeaturedContent" :can-donate="canDonate" @donate="open = true" />
      <DepartmentLeadership :firemen="firemen" :is-loading="isLoading || isFiremenLoading"
        :has-error="Boolean(firemenError)" @retry="refreshFiremen()" />
      <DepartmentDocuments :files="files" :is-loading="isLoading || isFilesLoading"
        :has-error="Boolean(filesError)" @retry="refreshFiles()" />
    </div>
  </template>

  <div v-if="blok?.body?.length" class="mt-4 md:mt-8">
    <StoryblokComponent v-for="block in blok.body" :key="block._uid" :blok="block" />
  </div>
  <DepartmentDonationModal v-model="open" :image="blok?.qr_code_bank_transfer" :department-name="department?.name" />
</template>
