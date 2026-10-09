<!-- Copyright (C) 2026 gzokuzma contributors. SPDX-License-Identifier: GPL-3.0-or-later -->
<template>
  <footer role="contentinfo" class="bg-white">
    <slot name="above-footer"></slot>
    <section aria-label="Kontakt in povezave" class="bg-secondary/10 py-10">
      <div class="container mx-auto grid grid-cols-1 gap-y-8 px-4 sm:grid-cols-2 sm:px-5 md:max-w-screen-xl xl:max-w-screen-2xl">
        <div class="flex min-w-0 items-center justify-center gap-4 text-left sm:justify-end sm:pr-8 sm:text-right">
          <NuxtImg src="/img/gzo-znak.png" width="109" height="138" alt="Logotip GZO Kuzma" class="h-24 w-auto shrink-0" />
          <address v-if="association" class="min-w-0 not-italic">
            {{ association.name }}<br>
            {{ association.street }}<br>
            9263 Kuzma<br>
            <a :href="`mailto:${association.email}`" class="break-words hover:underline">
              {{ association.email }}
            </a>
          </address>
        </div>
        <nav aria-label="Koristne povezave" class="border-t border-secondary/40 pt-8 text-left sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
          <div class="mx-auto w-fit max-w-full sm:mx-0 sm:w-auto">
            <h2 class="text-lg font-semibold">Povezave</h2>
            <ul class="space-y-3">
              <li v-for="link in relevantLinks" :key="link.url">
                <a :href="link.url" target="_blank" rel="noopener noreferrer" class="hover:underline">
                  {{ link.label }}
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>
      <nav v-if="departments?.length" aria-label="Gasilska zveza in društva" class="container mx-auto mt-8 px-4 sm:px-5 md:max-w-screen-xl xl:max-w-screen-2xl">
        <ul class="flex flex-wrap justify-center gap-x-6 gap-y-3 border-t border-secondary/40 pt-6 text-sm">
          <li v-for="department in departments" :key="department.id">
            <NuxtLink
              :to="department.slug === 'zveza' ? '/zveza' : `/drustva/${department.slug}`"
              class="hover:underline"
              active-class="font-semibold"
            >
              {{ department.name }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </section>
    <div class="bg-secondary/15 text-center p-4 text-sm text-secondary/80 mt-auto">
      <p>&copy; {{ copyrightYear }}, Gasilska zveza Občine Kuzma</p>
      <p class="text-xs mb-0 mt-0">
        Spletna stran uporablja
        <a href="https://iframe-resizer.com/" target="_blank" rel="noopener noreferrer" class="underline hover:no-underline">iframe-resizer</a>
        avtorja Davida J. Bradshawa
        (<a href="https://iframe-resizer.com/gpl/" target="_blank" rel="noopener noreferrer" class="underline hover:no-underline">GPL v3</a>).
      </p>
    </div>
  </footer>
</template>
<script setup>
const { data: departments } = useDepartments()
const association = computed(() => departments.value?.find(department => department.slug === 'zveza'))

const relevantLinks = [
  { label: 'Gasilska regija Pomurje', url: 'https://gasilci-pomurje.si/' },
  { label: 'Gasilska Zveza Slovenije', url: 'https://gasilec.net/' },
  { label: 'Občina Kuzma', url: 'https://www.obcina-kuzma.si/' }
]

const copyrightYear = computed(() => {
  const today = new Date();
  return today.getFullYear();
})
</script>
