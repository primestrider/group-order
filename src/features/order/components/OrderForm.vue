<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod"
import { useForm } from "vee-validate"
import { computed, watch } from "vue"

import { translate } from "@/plugins/language"
import BaseButton from "@/shared/components/BaseButton.vue"
import BaseFormField from "@/shared/components/BaseFormField.vue"
import { useBaseFieldError } from "@/shared/composables/useBaseFieldError"
import { toDateTimeLocal, toTimestamp } from "@/shared/helpers/date"

import { type CreateOrderRequest, createOrderSchema } from "../models/create-order.schema"

/**
 * OrderForm
 *
 * Order settings form shared by "Create Order" and "Edit Order".
 * Owns validation; parent owns persistence and the mutation.
 */
const {
  initialValues,
  submitLabel,
  loading = false,
  minParticipants = 1,
} = defineProps<{
  initialValues: Partial<CreateOrderRequest>
  submitLabel: string
  loading?: boolean
  /**
   * Lower bound for max participants (edit: already joined participants)
   */
  minParticipants?: number
}>()

const emit = defineEmits<{
  submit: [values: CreateOrderRequest]
  change: [values: Partial<CreateOrderRequest>]
}>()

const { errors, defineField, values, meta, handleSubmit } = useForm<CreateOrderRequest>({
  validationSchema: toTypedSchema(createOrderSchema),
  initialValues,
})

/**
 * Field-level error helpers
 * Supports both client-side and backend errors
 */
const { fieldError, clearBackendError: clearError } = useBaseFieldError<CreateOrderRequest>(errors)

/**
 * Form fields (typed & reactive)
 */
const [orderName] = defineField("orderName")
const [orderDescription] = defineField("orderDescription")
const [maxParticipants] = defineField("maxParticipants")
const [lastOrderAt] = defineField("lastOrderAt")
const [extraFee] = defineField("extraFee")
const [paymentInfo] = defineField("paymentInfo")

/**
 * Adapter for `datetime-local` input
 *
 * - UI uses string format: YYYY-MM-DDTHH:mm
 * - Internal value stored as timestamp (number)
 */
const lastOrderAtInput = computed<string>({
  get() {
    return lastOrderAt.value ? toDateTimeLocal(lastOrderAt.value) : ""
  },
  set(value) {
    lastOrderAt.value = toTimestamp(value)
  },
})

watch(values, (formValues) => emit("change", { ...formValues }), { deep: true })

const onSubmit = handleSubmit((formValues) => emit("submit", formValues))

const inputClass =
  "w-full py-3 px-4 rounded-full bg-secondary border border-border text-primary-text placeholder:text-secondary-text outline-none focus:ring-2 focus:ring-white/10"
const textareaClass =
  "w-full py-3 px-4 rounded-3xl bg-secondary border border-border text-primary-text placeholder:text-secondary-text outline-none focus:ring-2 focus:ring-white/10"
</script>

<template>
  <form @submit.prevent="onSubmit" class="space-y-2 md:space-y-4" :aria-disabled="loading">
    <!-- Order Name -->
    <BaseFormField
      field-name="orderName"
      required
      :label="translate('features.order.create_order.form.orderName.label')"
      :error="fieldError('orderName')"
      :disabled="loading"
    >
      <input
        id="orderName"
        v-model="orderName"
        :disabled="loading"
        @input="clearError('orderName')"
        type="text"
        :placeholder="translate('features.order.create_order.form.orderName.placeholder')"
        :class="inputClass"
      />
    </BaseFormField>

    <!-- Order Description -->
    <BaseFormField
      field-name="orderDescription"
      :label="translate('features.order.create_order.form.orderDescription.label')"
      :error="fieldError('orderDescription')"
      :disabled="loading"
    >
      <textarea
        rows="3"
        id="orderDescription"
        v-model="orderDescription"
        :disabled="loading"
        @input="clearError('orderDescription')"
        :placeholder="translate('features.order.create_order.form.orderDescription.placeholder')"
        :class="textareaClass"
      />
    </BaseFormField>

    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
      <!-- Max Participants -->
      <BaseFormField
        field-name="maxParticipants"
        required
        :label="translate('features.order.create_order.form.maxParticipants.label')"
        :disabled="loading"
        :error="fieldError('maxParticipants')"
      >
        <input
          id="maxParticipants"
          v-model.number="maxParticipants"
          :disabled="loading"
          @input="clearError('maxParticipants')"
          type="number"
          :min="Math.max(1, minParticipants)"
          max="100"
          :placeholder="translate('features.order.create_order.form.maxParticipants.placeholder')"
          :class="inputClass"
        />
      </BaseFormField>

      <!-- Last Order At -->
      <BaseFormField
        field-name="lastOrderAt"
        required
        :label="translate('features.order.create_order.form.lastOrderAt.label')"
        :error="fieldError('lastOrderAt')"
        :disabled="loading"
      >
        <input
          id="lastOrderAt"
          v-model="lastOrderAtInput"
          :disabled="loading"
          @input="clearError('lastOrderAt')"
          type="datetime-local"
          :placeholder="translate('features.order.create_order.form.lastOrderAt.placeholder')"
          :class="inputClass"
        />
      </BaseFormField>
    </div>

    <!-- Extra Fee -->
    <BaseFormField
      field-name="extraFee"
      :label="translate('features.order.create_order.form.extraFee.label')"
      :hint="translate('features.order.create_order.form.extraFee.hint')"
      :error="fieldError('extraFee')"
      :disabled="loading"
    >
      <input
        id="extraFee"
        v-model.number="extraFee"
        :disabled="loading"
        @input="clearError('extraFee')"
        type="number"
        min="0"
        step="500"
        inputmode="numeric"
        :class="inputClass"
      />
    </BaseFormField>

    <!-- Payment Info -->
    <BaseFormField
      field-name="paymentInfo"
      :label="translate('features.order.create_order.form.paymentInfo.label')"
      :error="fieldError('paymentInfo')"
      :disabled="loading"
    >
      <textarea
        rows="2"
        id="paymentInfo"
        v-model="paymentInfo"
        :disabled="loading"
        @input="clearError('paymentInfo')"
        :placeholder="translate('features.order.create_order.form.paymentInfo.placeholder')"
        :class="textareaClass"
      />
    </BaseFormField>

    <slot name="actions" :can-submit="meta.valid && !meta.pending && !loading">
      <BaseButton
        fluid
        type="submit"
        :label="submitLabel"
        :loading="loading"
        :disabled="!meta.valid || meta.pending"
      />
    </slot>
  </form>
</template>
