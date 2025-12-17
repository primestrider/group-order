<script setup lang="ts">
import { IconLoader2 } from "@tabler/icons-vue"
import { computed, useSlots } from "vue"

import type { ButtonProps } from "../models"

/**
 * Props (destructured)
 */
const {
  label,
  type = "button",
  disabled = false,
  loading = false,
  variant = "primary",
  fluid = false,
} = defineProps<ButtonProps>()

const slots = useSlots()

/**
 * Button is icon-only if:
 * - no label
 * - has icon or icon-right slot
 */
const isIconOnly = computed(() => {
  return !label && (slots.icon || slots["icon-right"])
})

/**
 * Disabled state
 * - disabled OR loading
 */
const isDisabled = computed(() => disabled || loading)

/**
 * Button classes
 */
const buttonClass = computed(() => [
  // Variant
  variant === "primary" ? "bg-accent hover:bg-accent-hover" : "bg-secondary hover:opacity-50",

  // Width
  fluid ? "w-full" : "md:w-auto",

  // Layout
  "inline-flex items-center justify-center gap-2",

  // Padding
  isIconOnly.value ? "p-3" : "px-6 py-3",
])
</script>

<template>
  <button
    :type="type"
    :disabled="isDisabled"
    :class="buttonClass"
    class="rounded-full font-semibold transition-all duration-150 text-primary-text disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white/10 active:scale-95 cursor-pointer"
  >
    <!-- 🔄 Spinner (shown when loading) -->
    <IconLoader2 v-if="loading" class="animate-spin" :size="18" aria-hidden="true" />

    <!-- Left icon (hidden when loading) -->
    <slot v-if="!loading" name="icon" />

    <!-- Label (always shown if exists) -->
    <template v-if="label">
      {{ label }}
    </template>

    <!-- Right icon (hidden when loading) -->
    <slot v-if="!loading" name="icon-right" />
  </button>
</template>
