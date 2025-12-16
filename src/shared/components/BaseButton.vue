<script setup lang="ts">
import { computed, useSlots } from "vue"

import type { ButtonProps } from "../models"

const props = withDefaults(defineProps<ButtonProps>(), {
  type: "button",
  disabled: false,
  variant: "primary",
  fluid: false,
})

const slots = useSlots()

const isIconOnly = computed(() => {
  return !props.label && (slots.icon || slots["icon-right"])
})

const buttonClass = computed(() => [
  // Variant
  props.variant === "primary" ? "bg-accent hover:bg-accent-hover" : "bg-secondary hover:opacity-50",

  // Width
  props.fluid ? "w-full" : "md:w-auto",

  // Layout
  "inline-flex items-center justify-center gap-2",

  // Padding
  isIconOnly.value ? "p-3" : "px-6 py-3",
])
</script>

<template>
  <button
    :type="props.type"
    :disabled="props.disabled"
    :class="buttonClass"
    class="rounded-full font-semibold transition-all duration-150 text-primary-text disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white/10 active:scale-95 cursor-pointer"
  >
    <!-- Left icon -->
    <slot name="icon" />

    <!-- Label -->
    <template v-if="props.label">
      {{ props.label }}
    </template>

    <!-- Right icon -->
    <slot name="icon-right" />
  </button>
</template>
