<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from "@headlessui/vue"
import { useMutation } from "@tanstack/vue-query"
import { computed } from "vue"

import { translate } from "@/plugins/language"
import { showToast } from "@/plugins/toaster/toast"
import BaseButton from "@/shared/components/BaseButton.vue"

import { type OrderDetailResponse, OrderItemError } from "../models"
import type { CreateOrderRequest } from "../models/create-order.schema"
import { updateGroupOrder } from "../services/api"
import OrderForm from "./OrderForm.vue"

const { order } = defineProps<{
  order: OrderDetailResponse
}>()

/**
 * Dialog open state (v-model)
 */
const open = defineModel<boolean>({ required: true })

const close = () => {
  open.value = false
}

/**
 * Snapshot of current settings; OrderForm is re-mounted on every open
 */
const initialValues = computed<CreateOrderRequest>(() => ({
  orderName: order.orderName,
  orderDescription: order.orderDescription ?? "",
  maxParticipants: order.maxParticipants,
  lastOrderAt: order.lastOrderAt.getTime(),
  extraFee: order.extraFee,
  paymentInfo: order.paymentInfo,
  menu: order.menu.map((menuItem) => ({ ...menuItem })),
}))

const { mutate: updateOrderMutate, isPending } = useMutation({
  mutationFn: updateGroupOrder,

  onSuccess() {
    close()
    showToast(translate("features.order.order_detail.manage.notification.updated"), "success")
  },

  onError(error) {
    showToast(
      error.message === OrderItemError.MAX_BELOW_PARTICIPANTS
        ? translate("features.order.order_detail.manage.notification.max_below_participants")
        : translate("features.order.order_detail.manage.notification.error"),
      "error",
    )
  },
})
</script>

<template>
  <TransitionRoot appear :show="open" as="template">
    <Dialog as="div" class="relative z-50" @close="close">
      <TransitionChild
        as="template"
        enter="duration-200 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-150 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 flex items-center justify-center p-4">
        <TransitionChild
          as="template"
          enter="duration-200 ease-out"
          enter-from="opacity-0 scale-95"
          enter-to="opacity-100 scale-100"
          leave="duration-150 ease-in"
          leave-from="opacity-100 scale-100"
          leave-to="opacity-0 scale-95"
        >
          <DialogPanel
            class="w-full max-w-2xl rounded-2xl bg-secondary border border-border text-primary-text shadow-xl flex flex-col max-h-[90vh] overflow-y-auto p-4"
          >
            <DialogTitle class="text-lg font-semibold mb-2">
              {{ translate("features.order.order_detail.manage.edit_title") }}
            </DialogTitle>

            <OrderForm
              :initial-values="initialValues"
              :submit-label="translate('features.order.order_detail.manage.save')"
              :loading="isPending"
              :min-participants="order.participantsCount"
              @submit="(values) => updateOrderMutate({ orderId: order.id, ...values })"
            >
              <template #actions="{ canSubmit }">
                <div class="flex gap-2">
                  <BaseButton
                    type="button"
                    fluid
                    class="bg-accent-dark"
                    :disabled="isPending"
                    :label="translate('features.order.order_detail.add_item.form.button.cancel')"
                    @click="close"
                  />
                  <BaseButton
                    type="submit"
                    fluid
                    :loading="isPending"
                    :disabled="!canSubmit"
                    :label="translate('features.order.order_detail.manage.save')"
                  />
                </div>
              </template>
            </OrderForm>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
