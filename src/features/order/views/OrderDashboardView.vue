<script setup lang="ts">
import { computed, ref } from "vue"
import { useRouter } from "vue-router"

import { translate } from "@/plugins/language"
import BaseButton from "@/shared/components/BaseButton.vue"
import BaseCard from "@/shared/components/BaseCard.vue"

import { OrderPageName } from "../models"

const router = useRouter()
const orderId = ref("")
const touched = ref(false)

/**
 * Accepts either a raw order ID or a full share link (`.../order/<id>`)
 */
const parsedOrderId = computed<string>(() => {
  const value = orderId.value.trim()
  const match = /\/order\/([^/?#]+)/.exec(value)
  return match?.[1] ? decodeURIComponent(match[1]) : value
})

const joinError = computed<string | null>(() =>
  touched.value && !parsedOrderId.value
    ? translate("features.order.join_order.error_required")
    : null,
)

const submitJoin = (): void => {
  touched.value = true
  if (!parsedOrderId.value) return

  router.push({ name: OrderPageName.ORDER_DETAIL, params: { id: parsedOrderId.value } })
}
</script>

<template>
  <main class="min-h-screen flex flex-col items-center justify-center p-6">
    <transition
      appear
      enter-from-class="opacity-0 translate-y-4 scale-[0.985]"
      enter-active-class="transition-opacity transition-transform duration-[600ms] delay-[300ms] ease-[cubic-bezier(.16,.84,.24,1)]"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-from-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-to-class="opacity-0"
    >
      <section class="max-w-3xl w-full">
        <h1 class="text-primary-text text-4xl font-bold text-center">
          {{ translate("features.order.dashboard.title") }}
        </h1>
        <BaseCard class="mt-5">
          <template #content>
            <!-- Actions -->

            <div class="flex flex-col gap-4">
              <h4 class="text-primary-text text-xl font-semibold">
                {{ translate("features.order.dashboard.start_order") }}
              </h4>
              <!-- Create Order -->
              <RouterLink :to="{ name: OrderPageName.ORDER_CREATE }">
                <BaseButton
                  fluid
                  :label="translate('features.order.dashboard.create_order')"
                  class="cursor-pointer"
                ></BaseButton>
              </RouterLink>

              <!-- Divider -->
              <div class="relative my-1 flex items-center">
                <div class="flex-grow border-t border-border"></div>
                <span class="mx-3 text-secondary-text text-sm">{{
                  translate("features.order.dashboard.divider")
                }}</span>
                <div class="flex-grow border-t border-border"></div>
              </div>

              <!-- Join by UUID -->
              <h4 class="text-primary-text text-xl font-semibold">
                {{ translate("features.order.dashboard.join_order") }}
              </h4>

              <form @submit.prevent="submitJoin" class="w-full flex flex-col gap-2">
                <label class="sr-only" for="uuid">{{
                  translate("features.order.join_order.label")
                }}</label>

                <div class="flex flex-col gap-3 md:flex-row md:items-center">
                  <input
                    id="uuid"
                    v-model="orderId"
                    @input="touched = true"
                    type="text"
                    :placeholder="translate('features.order.join_order.placeholder')"
                    class="w-full md:flex-1 py-3 px-4 rounded-full bg-secondary border border-border text-primary-text placeholder:text-secondary-text outline-none focus:outline-none focus:ring-2 focus:ring-white/10 transition-shadow duration-200"
                    aria-describedby="uuid-help"
                  />

                  <BaseButton
                    type="submit"
                    fluid
                    :label="translate('features.order.join_order.button')"
                    class="w-full md:w-auto px-6 py-3 rounded-full font-semibold transition-transform transform bg-accent hover:bg-accent-hover text-primary-text disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white/10 active:translate-y-0"
                  ></BaseButton>
                </div>

                <p v-if="joinError" id="uuid-help" role="alert" class="ml-4 text-sm text-red-400">
                  {{ joinError }}
                </p>
              </form>
            </div>
          </template>
        </BaseCard>
      </section>
    </transition>
  </main>
</template>
