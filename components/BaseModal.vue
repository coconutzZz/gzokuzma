<template>
<Teleport to="body">
  <Transition
    enter-active-class="transition-all duration-200"
    leave-active-class="transition-all duration-200"
    enter-from-class="opacity-0 translate-y-10 sm:scale-95"
    enter-to-class="opacity-100 translate-y-0 sm:scale-100"
    leave-from-class="opacity-100 translate-y-0 sm:scale-100"
    leave-to-class="opacity-0 translate-y-10 sm:scale-95"
  >
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex sm:items-center sm:justify-center"
    >
      <!-- backdrop -->
      <div
        class="absolute inset-0 bg-black/50"
        @click="$emit('update:modelValue', false)"
      />

      <!-- modal -->
      <div
        class="
          relative bg-white z-10
          w-full h-full
          sm:h-auto sm:max-w-lg
          rounded-none sm:rounded-xl
          p-6
        "
      >
        <slot />

        <button
          class="absolute top-3 right-3 text-gray-500 hover:text-black"
          @click="$emit('update:modelValue', false)"
        >
          ✕
        </button>
      </div>
    </div>
  </Transition>
</Teleport>
</template>

<script setup>
defineProps({
  modelValue: Boolean
})
defineEmits(['update:modelValue'])
</script>