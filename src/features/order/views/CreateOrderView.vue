<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod"
import { useSessionStorage } from "@vueuse/core"
import { useForm } from "vee-validate"
import { computed, watch } from "vue"

import { translate } from "@/plugins/language"
import BaseButton from "@/shared/components/BaseButton.vue"
import BaseCard from "@/shared/components/BaseCard.vue"
import BaseFormField from "@/shared/components/BaseFormField.vue"
import { useBaseFieldError } from "@/shared/composables/useBaseFieldError"
import { toDateTimeLocal, toTimestamp } from "@/shared/helpers/date"

import { OrderPageName } from "../models"
import { type CreateOrderValues, createOrderSchema } from "../models/create-order.schema"

/**
 * Session storage key for create order form
 */
const CREATE_ORDER_STORAGE_KEY = "create-order-form"

/**
 * Default value for `lastOrderAt`
 * Current time + 2 hours (timestamp)
 */
const nowPlus2Hours = Date.now() + 2 * 60 * 60 * 1000

/**
 * Session cache for form values
 * - Partial to allow schema evolution
 * - Automatically synced by VueUse
 */
const cachedForm = useSessionStorage<Partial<CreateOrderValues>>(CREATE_ORDER_STORAGE_KEY, {})

/**
 * Create Order form setup
 * - Schema-driven validation (Zod)
 * - Typed form values
 * - Initial values restored from sessionStorage
 */
const {
  errors: createOrderErrors,
  defineField,
  values: createOrderForm,
  meta,
  handleSubmit,
} = useForm<CreateOrderValues>({
  validationSchema: toTypedSchema(createOrderSchema),
  initialValues: {
    lastOrderAt: nowPlus2Hours,
    ...cachedForm.value, // restore cached values
  },
})

/**
 * Field-level error helpers
 * Supports client + backend error handling
 */
const { fieldError: createOrderFieldError, clearBackendError: clearOrderError } =
  useBaseFieldError<CreateOrderValues>(createOrderErrors)

/**
 * Form fields (typed & reactive)
 */
const [orderName] = defineField("orderName")
const [orderDescription] = defineField("orderDescription")
const [maxParticipants] = defineField("maxParticipants")
const [lastOrderAt] = defineField("lastOrderAt")

/**
 * Adapter for `datetime-local` input
 * - UI uses string (YYYY-MM-DDTHH:mm)
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

/**
 * Persist form values to sessionStorage
 * Automatically triggered on every change
 */
watch(
  createOrderForm,
  (values) => {
    cachedForm.value = values
  },
  { deep: true },
)

/**
 * Submit handler
 * Executed only when form is valid
 * Clears session cache on success
 */
const handleCreateOrder = handleSubmit((values) => {
  console.log("SUBMIT PAYLOAD:", values)

  // Clear cached form after successful submit
  cachedForm.value = {}
})
</script>

<template>
  <main class="min-h-screen flex flex-col items-center justify-center p-6">
    <section class="max-w-3xl w-full flex flex-col justify-center gap-2">
      <RouterLink :to="{ name: OrderPageName.HOME }" replace>
        <span class="text-primary-text underline"> back to home</span>
      </RouterLink>

      <BaseCard title="Create Order">
        <template #content>
          <form @submit.prevent="handleCreateOrder" class="space-y-2 md:space-y-4">
            <!-- Order Name -->
            <BaseFormField
              field-name="orderName"
              required
              :label="translate('features.order.create_order.form.orderName.label')"
              :error="createOrderFieldError('orderName')"
            >
              <input
                id="orderName"
                v-model="orderName"
                @input="clearOrderError('orderName')"
                type="text"
                :placeholder="translate('features.order.create_order.form.orderName.placeholder')"
                class="w-full py-3 px-4 rounded-full bg-secondary border border-border text-primary-text placeholder:text-secondary-text outline-none focus:ring-2 focus:ring-white/10"
              />
            </BaseFormField>

            <!-- Order Description -->
            <BaseFormField
              field-name="orderDescription"
              required
              :label="translate('features.order.create_order.form.orderDescription.label')"
              :error="createOrderFieldError('orderDescription')"
            >
              <textarea
                rows="3"
                id="orderDescription"
                v-model="orderDescription"
                @input="clearOrderError('orderDescription')"
                :placeholder="
                  translate('features.order.create_order.form.orderDescription.placeholder')
                "
                class="w-full py-3 px-4 rounded-3xl bg-secondary border border-border text-primary-text placeholder:text-secondary-text outline-none focus:ring-2 focus:ring-white/10"
              />
            </BaseFormField>

            <!-- Grid row -->
            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
              <!-- Max Participants -->
              <BaseFormField
                field-name="maxParticipants"
                required
                :label="translate('features.order.create_order.form.maxParticipants.label')"
                :error="createOrderFieldError('maxParticipants')"
              >
                <input
                  id="maxParticipants"
                  v-model.number="maxParticipants"
                  @input="clearOrderError('maxParticipants')"
                  type="number"
                  min="1"
                  max="100"
                  :placeholder="
                    translate('features.order.create_order.form.maxParticipants.placeholder')
                  "
                  class="w-full py-3 px-4 rounded-full bg-secondary border border-border text-primary-text placeholder:text-secondary-text outline-none focus:ring-2 focus:ring-white/10"
                />
              </BaseFormField>

              <!-- Last Order At -->
              <BaseFormField
                field-name="lastOrderAt"
                required
                :label="translate('features.order.create_order.form.lastOrderAt.label')"
                :error="createOrderFieldError('lastOrderAt')"
              >
                <input
                  id="lastOrderAt"
                  v-model="lastOrderAtInput"
                  @input="clearOrderError('lastOrderAt')"
                  type="datetime-local"
                  :placeholder="
                    translate('features.order.create_order.form.lastOrderAt.placeholder')
                  "
                  class="w-full py-3 px-4 rounded-full bg-secondary border border-border text-primary-text placeholder:text-secondary-text outline-none focus:ring-2 focus:ring-white/10"
                />
              </BaseFormField>
            </div>

            <!-- Submit -->
            <BaseButton
              fluid
              type="submit"
              :label="translate('features.order.create_order.form.button.submit')"
              :disabled="!meta.valid || meta.pending"
            />
          </form>
        </template>
      </BaseCard>
    </section>
  </main>
</template>
