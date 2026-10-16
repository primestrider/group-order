<script setup lang="ts">
import { IconTrash } from "@tabler/icons-vue"
import { toTypedSchema } from "@vee-validate/zod"
import { useFieldArray, useForm } from "vee-validate"
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
  // cached / older values may not have a menu yet
  initialValues: { menu: [], ...initialValues },
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
 * Available items offered by the owner (max 30)
 */
const MAX_MENU_ITEMS = 30

const {
  fields: menuFields,
  push: pushMenuItem,
  remove: removeMenuItem,
} = useFieldArray<CreateOrderRequest["menu"][number]>("menu")

const addMenuItem = (): void => {
  if (menuFields.value.length >= MAX_MENU_ITEMS) return
  pushMenuItem({ itemName: "", price: 0 })
}

/**
 * Error for a field inside the menu array (vee-validate path: `menu[0].itemName`)
 */
const menuError = (index: number, key: keyof CreateOrderRequest["menu"][number]) =>
  (errors.value as Record<string, string | undefined>)[`menu[${index}].${key}`]

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

    <!-- Menu (available items) -->
    <div role="group" aria-labelledby="order-menu-label" class="space-y-2">
      <div class="ml-2 flex items-center justify-between gap-2">
        <p id="order-menu-label" class="text-sm font-medium text-slate-300">
          {{ translate("features.order.create_order.form.menu.label") }}
          <span class="block text-xs font-normal text-slate-400">
            {{ translate("features.order.create_order.form.menu.hint") }}
          </span>
        </p>

        <button
          type="button"
          class="text-xs shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-primary-text disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="menuFields.length >= MAX_MENU_ITEMS || loading"
          @click="addMenuItem"
        >
          + {{ translate("features.order.create_order.form.menu.add") }}
        </button>
      </div>

      <div
        v-for="(field, index) in menuFields"
        :key="field.key"
        class="grid grid-cols-12 gap-2 items-center"
      >
        <div class="col-span-7">
          <BaseFormField
            :field-name="`menu.${index}.itemName`"
            :error="menuError(index, 'itemName')"
          >
            <input
              v-model="field.value.itemName"
              type="text"
              :disabled="loading"
              :placeholder="
                translate('features.order.order_detail.add_item.form.items.placeholder')
              "
              :aria-label="translate('features.order.order_detail.add_item.form.items.label')"
              :class="inputClass"
            />
          </BaseFormField>
        </div>

        <div class="col-span-4">
          <BaseFormField :field-name="`menu.${index}.price`" :error="menuError(index, 'price')">
            <input
              v-model="field.value.price"
              type="number"
              min="0"
              step="500"
              inputmode="numeric"
              :disabled="loading"
              :placeholder="
                translate('features.order.order_detail.add_item.form.price.placeholder')
              "
              :aria-label="translate('features.order.order_detail.add_item.form.price.label')"
              :class="inputClass"
            />
          </BaseFormField>
        </div>

        <div class="col-span-1 flex justify-center">
          <button
            type="button"
            class="text-red-400 hover:text-red-300"
            :disabled="loading"
            :aria-label="translate('features.order.order_detail.add_item.form.button.remove_item')"
            @click="removeMenuItem(index)"
          >
            <IconTrash size="18" />
          </button>
        </div>
      </div>
    </div>

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
