<template>
  <div ref="container" class="relative inline-block" @focusout="onFocusOut">
    <Button
      ref="trigger"
      type="button"
      :disabled="disabled || !items.length"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      class="!px-3 !py-1.5 text-sm disabled:cursor-not-allowed disabled:hover:scale-100"
      @click="toggleMenu"
      @keydown.down.prevent="openMenu()"
      @keydown.up.prevent="openMenu(true)"
      @keydown.esc.stop.prevent="closeMenu(true)"
    >
      <span class="inline-flex items-center gap-1.5">
        <span>{{ prefix }} {{ selectedItem ? selectedItem.title : placeholder }}</span>
        <svg
          class="h-3.5 w-3.5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clip-rule="evenodd" />
        </svg>
      </span>
    </Button>

    <ul
      v-if="isOpen"
      ref="menu"
      role="listbox"
      :aria-label="placeholder"
      class="absolute left-0 top-full z-50 mt-2 max-h-60 min-w-full overflow-y-auto rounded-2xl bg-white py-2 shadow-lg ring-1 ring-black/10"
      @keydown.down.prevent="focusOption(activeIndex + 1)"
      @keydown.up.prevent="focusOption(activeIndex - 1)"
      @keydown.home.prevent="focusOption(0)"
      @keydown.end.prevent="focusOption(items.length - 1)"
      @keydown.esc.stop.prevent="closeMenu(true)"
    >
      <li v-for="(item, index) in items" :key="index" role="none">
        <button
          type="button"
          role="option"
          tabindex="-1"
          :aria-selected="isSelected(item)"
          class="block w-full px-4 py-2 text-left text-primary-500 hover:bg-primary-50 focus:bg-primary-50 focus:outline-none"
          :class="{ 'bg-primary-50 font-bold': isSelected(item) }"
          @focus="activeIndex = index"
          @click="selectItem(item)"
        >
          {{ item.title }}
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  modelValue: {
    type: String,
    default: undefined
  },
  placeholder: {
    type: String,
    default: 'Select an item'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  prefix: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'change'])
const container = ref(null)
const trigger = ref(null)
const menu = ref(null)
const isOpen = ref(false)
const activeIndex = ref(-1)
const selectedValue = shallowRef(props.modelValue)
const isSelected = (item) => Object.is(item.value, selectedValue.value)
const selectedItem = computed(() => props.items.find(isSelected))

watch(() => props.modelValue, (value) => {
  selectedValue.value = value
})

watch(() => [props.disabled, props.items.length], ([disabled, length]) => {
  if (disabled || !length) closeMenu()
})

async function openMenu(fromEnd = false) {
  if (props.disabled || !props.items.length) return

  isOpen.value = true
  const selectedIndex = props.items.findIndex(isSelected)
  await nextTick()
  focusOption(selectedIndex >= 0 ? selectedIndex : fromEnd ? props.items.length - 1 : 0)
}

function closeMenu(restoreFocus = false) {
  isOpen.value = false
  if (restoreFocus) trigger.value?.$el?.focus()
}

function toggleMenu() {
  if (isOpen.value) closeMenu()
  else openMenu()
}

function focusOption(index) {
  const length = props.items.length
  if (!length) return

  activeIndex.value = (index + length) % length
  menu.value?.querySelectorAll('[role="option"]')[activeIndex.value]?.focus()
}

function selectItem(item) {
  if (!isSelected(item)) {
    selectedValue.value = item.value
    emit('update:modelValue', item.value)
    emit('change', item.value)
  }
  closeMenu(true)
}

function onPointerDown(event) {
  if (!container.value?.contains(event.target)) closeMenu()
}

function onFocusOut(event) {
  if (!container.value?.contains(event.relatedTarget)) closeMenu()
}

onMounted(() => document.addEventListener('pointerdown', onPointerDown))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onPointerDown))
</script>
