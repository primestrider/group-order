<script setup lang="ts">
import { useMutation } from "@tanstack/vue-query"
import { useSessionStorage } from "@vueuse/core"
import { useRouter } from "vue-router"

import { translate } from "@/plugins/language"
import { showToast } from "@/plugins/toaster/toast"
import BaseCard from "@/shared/components/BaseCard.vue"

import OrderForm from "../components/OrderForm.vue"
import { OrderPageName } from "../models"
import type { CreateOrderRequest } from "../models/create-order.schema"
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

const initialValues: Partial<CreateOrderRequest> = {
  lastOrderAt: nowPlus2Hours,
  extraFee: 0,
  ...cachedForm.value,
}

/**
 * Router instance
 * Used for navigation after successful order creation
 */
const router = useRouter()

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

  onError() {
    showToast(translate("features.order.create_order.error"), "error")
  },
})
</script>

<template>
  <main class="min-h-screen flex flex-col items-center justify-center p-6">
    <section class="max-w-3xl w-full flex flex-col justify-center gap-2">
      <RouterLink :to="{ name: OrderPageName.HOME }" replace>
        <span class="text-primary-text underline">{{
          translate("features.order.create_order.back_to_home")
        }}</span>
      </RouterLink>

      <BaseCard :title="translate('features.order.create_order.title')">
        <template #content>
          <OrderForm
            :initial-values="initialValues"
            :submit-label="translate('features.order.create_order.form.button.submit')"
            :loading="isLoadingCreate"
            @change="(values) => (cachedForm = values)"
            @submit="(values) => createOrderMutate(values)"
          />
        </template>
      </BaseCard>
    </section>
  </main>
</template>
