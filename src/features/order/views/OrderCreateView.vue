<script setup lang="ts">
import { useMutation } from "@tanstack/vue-query"
import { toTypedSchema } from "@vee-validate/zod"
import { useSessionStorage } from "@vueuse/core"
import { useForm } from "vee-validate"
import { computed, watch } from "vue"
import { useRouter } from "vue-router"

import { translate } from "@/plugins/language"
import { showToast } from "@/plugins/toaster/toast"
import BaseButton from "@/shared/components/BaseButton.vue"
import BaseCard from "@/shared/components/BaseCard.vue"
import BaseFormField from "@/shared/components/BaseFormField.vue"
import { useBaseFieldError } from "@/shared/composables/useBaseFieldError"
import { toDateTimeLocal, toTimestamp } from "@/shared/helpers/date"

import { OrderPageName } from "../models"
import { type CreateOrderRequest, createOrderSchema } from "../models/create-order.schema"
import { createGroupOrder } from "../services/api"

/**
 * Session storage key for create order form
 * Used to persist form state across reloads
 */
const CREATE_ORDER_STORAGE_KEY = "create-order-form"

/**
 * Default value for `lastOrderAt`
 * Current time + 2 hours (timestamp in milliseconds)
 */
const nowPlus2Hours = Date.now() + 2 * 60 * 60 * 1000

/**
 * Session cache for form values
 * - Partial to allow schema evolution
 * - Automatically synced by VueUse
 */
const cachedForm = useSessionStorage<Partial<CreateOrderRequest>>(CREATE_ORDER_STORAGE_KEY, {})

/**
 * Router instance
 * Used for navigation after successful order creation
 */
const router = useRouter()

/**
 * Create Order form setup
 * - Schema-driven validation (Zod)
 * - Fully typed form values
 * - Initial values restored from sessionStorage
 */
const {
  errors: createOrderErrors,
  defineField,
  values: createOrderForm,
  meta,
  handleSubmit,
} = useForm<CreateOrderRequest>({
  validationSchema: toTypedSchema(createOrderSchema),
  initialValues: {
    lastOrderAt: nowPlus2Hours,
    ...cachedForm.value,
  },
})

/**
 * Field-level error helpers
 * Supports both client-side and backend errors
 */
const { fieldError: createOrderFieldError, clearBackendError: clearOrderError } =
  useBaseFieldError<CreateOrderRequest>(createOrderErrors)

/**
 * Form fields (typed & reactive)
 */
const [orderName] = defineField("orderName")
const [orderDescription] = defineField("orderDescription")
const [maxParticipants] = defineField("maxParticipants")
const [lastOrderAt] = defineField("lastOrderAt")

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

/**
 * Persist form values to sessionStorage
 * Automatically triggered on every form change
 */
watch(
  createOrderForm,
  (values) => {
    cachedForm.value = values
  },
  { deep: true },
)

/**
 * TanStack Query mutation for creating an order
 *
 * Handles:
 * - loading state
 * - error state
 * - success side effects (reset + redirect)
 */
const { mutate: createOrderMutate, isPending: isLoadingCreate } = useMutation({
  mutationFn: createGroupOrder,

  onSuccess(orderId: string) {
    // clear cached form
    cachedForm.value = {}

    // redirect to order detail
    router.replace({
      name: OrderPageName.ORDER_DETAIL,
      params: { id: orderId },
    })
  },

  onError(error) {
    if (error) {
      showToast(translate("features.order.create_order.error"), "error")
    }
  },
})

/**
 * Submit handler
 * Executed only when form is valid
 */
const handleCreateOrder = handleSubmit((values) => {
  createOrderMutate(values)
})
</script>

<template>
  <main class="min-h-screen flex flex-col items-center justify-center p-6">
    <section class="max-w-3xl w-full flex flex-col justify-center gap-2">
      <RouterLink :to="{ name: OrderPageName.HOME }" replace>
        <span class="text-primary-text underline">back to home</span>
      </RouterLink>

      <BaseCard title="Create Order">
        <template #content>
          <form
            @submit.prevent="handleCreateOrder"
            class="space-y-2 md:space-y-4"
            :aria-disabled="isLoadingCreate"
          >
            <!-- Order Name -->
            <BaseFormField
              field-name="orderName"
              required
              :label="translate('features.order.create_order.form.orderName.label')"
              :error="createOrderFieldError('orderName')"
              :disabled="isLoadingCreate"
            >
              <input
                id="orderName"
                v-model="orderName"
                :disabled="isLoadingCreate"
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
              :disabled="isLoadingCreate"
            >
              <textarea
                rows="3"
                id="orderDescription"
                v-model="orderDescription"
                :disabled="isLoadingCreate"
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
                :disabled="isLoadingCreate"
                :error="createOrderFieldError('maxParticipants')"
              >
                <input
                  id="maxParticipants"
                  v-model.number="maxParticipants"
                  :disabled="isLoadingCreate"
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
                :disabled="isLoadingCreate"
              >
                <input
                  id="lastOrderAt"
                  v-model="lastOrderAtInput"
                  :disabled="isLoadingCreate"
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
              :disabled="!meta.valid || meta.pending || isLoadingCreate"
            />
          </form>
        </template>
      </BaseCard>
    </section>
  </main>
</template>
