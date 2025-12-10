<script setup lang="ts">
import { computed } from "vue"

import type { ButtonProps } from "../models"

const props = withDefaults(defineProps<ButtonProps>(), {
  type: "button",
  disabled: false,
  variant: "primary",
  fluid: false,
})

const buttonClass = computed(() => [
  // Variant
  props.variant === "primary" ? "bg-accent hover:bg-accent-hover" : "bg-secondary hover:opacity-50",

  // Fluid
  props.fluid ? "w-full" : "md:w-auto",
])
</script>

<template>
  <button
    :type="props.type"
    :disabled="props.disabled"
    :class="buttonClass"
    class="px-6 py-3 rounded-full font-semibold transition-transform transform text-primary-text disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white/10 active:translate-y-0"
  >
    {{ props.label }}
  </button>
</template>
