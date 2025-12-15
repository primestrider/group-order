<!-- src/components/form/BaseFormField.vue -->
<script setup lang="ts">
import { computed, useId } from "vue"

import type { BaseFormFieldProps } from "../models"

/**
 * BaseFormField
 *
 * A headless, accessible form field wrapper that provides:
 * - Label rendering (slot or prop-based)
 * - Error & hint display
 * - ARIA accessibility attributes
 *
 * This component does NOT manage form state or validation.
 * All values and errors must be provided by the parent.
 */
const {
  label = "",
  fieldName = "",
  error = null,
  required = false,
  hint = "",
  disabled = false,
} = defineProps<BaseFormFieldProps>()

/**
 * Generate a stable unique ID for aria-describedby.
 * Used when fieldName is not provided.
 */
const uid = useId()

/**
 * Whether field currently has an error.
 * Error is ignored when the field is disabled.
 */
const hasError = computed(() => Boolean(error) && !disabled)

/**
 * ID for error message (used by aria-describedby).
 */
const errorId = computed(() => (hasError.value ? `${fieldName || uid}-error` : undefined))

/**
 * ID for hint message (used by aria-describedby).
 */
const hintId = computed(() => (hint && !hasError.value ? `${fieldName || uid}-hint` : undefined))

/**
 * aria-describedby value.
 * Points to either hint or error message if present.
 */
const describedBy = computed(() => errorId.value || hintId.value)
</script>

<template>
  <div class="flex flex-col gap-1">
    <!-- Label -->
    <label
      v-if="label || $slots.label"
      :for="fieldName || undefined"
      class="text-sm font-medium transition"
      :class="disabled ? 'text-slate-500' : 'text-slate-300'"
    >
      <!-- Label slot (advanced customization) -->
      <slot name="label">
        {{ label }}
      </slot>

      <span v-if="required && !disabled" class="ml-0.5 text-red-400" aria-hidden="true"> * </span>
    </label>

    <!-- Input wrapper -->
    <div :aria-invalid="hasError" :aria-describedby="describedBy">
      <slot />
    </div>

    <!-- Hint -->
    <p v-if="hint && !hasError" :id="hintId" class="text-xs text-slate-400">
      {{ hint }}
    </p>

    <!-- Error (hidden when disabled) -->
    <p v-if="hasError" :id="errorId" class="text-xs text-red-400">
      {{ error }}
    </p>
  </div>
</template>
