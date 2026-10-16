<script setup lang="ts">
import { IconChevronRight, IconUsers } from "@tabler/icons-vue"
import { useQuery } from "@tanstack/vue-query"
import { useNow } from "@vueuse/core"

import { translate } from "@/plugins/language"
import BaseSkeleton from "@/shared/components/BaseSkeleton.vue"
import { useDateFormatter } from "@/shared/composables/useDateFormatter"

import { isOrderOpen } from "../helpers/order"
import { OrderPageName } from "../models"
import { getMyOrders } from "../services/api"

/**
 * Orders created by the current (anonymous) user on this browser
 */
const {
  data: myOrders,
  isLoading,
  isError,
} = useQuery({
  queryKey: ["my-orders"],
  queryFn: getMyOrders,
  // status / participants change elsewhere; always refresh when the dashboard opens
  refetchOnMount: "always",
})

const { formatDateTime } = useDateFormatter()

const now = useNow({ interval: 30_000 })
</script>

<template>
  <section class="flex flex-col gap-3" aria-labelledby="my-orders-title">
    <h4 id="my-orders-title" class="text-primary-text text-xl font-semibold">
      {{ translate("features.order.my_orders.title") }}
    </h4>

    <div v-if="isLoading" class="flex flex-col gap-2">
      <BaseSkeleton v-for="i in 2" :key="i" height="md" width="full" />
    </div>

    <p v-else-if="isError" class="text-sm text-red-400">
      {{ translate("features.order.my_orders.error") }}
    </p>

    <p v-else-if="!myOrders?.length" class="text-sm text-secondary-text">
      {{ translate("features.order.my_orders.empty") }}
    </p>

    <ul v-else class="flex flex-col gap-2">
      <li v-for="order in myOrders" :key="order.id">
        <RouterLink
          :to="{ name: OrderPageName.ORDER_DETAIL, params: { id: order.id } }"
          class="flex items-center gap-3 rounded-2xl p-3 border border-white/10 bg-white/5 hover:border-white/20 transition text-primary-text focus:outline-none focus:ring-2 focus:ring-white/10"
        >
          <div class="flex-1 min-w-0">
            <p class="font-semibold truncate">{{ order.orderName }}</p>
            <p class="text-xs text-primary-text/60">
              {{ translate("features.order.create_order.form.lastOrderAt.label") }}
              {{ formatDateTime(order.lastOrderAt) }}
            </p>
          </div>

          <span class="flex items-center gap-1 text-xs text-primary-text/70 shrink-0">
            <IconUsers class="w-4 h-4" />
            {{ order.participantsCount }}/{{ order.maxParticipants }}
          </span>

          <span
            :class="[
              'text-xs px-2 py-1 rounded-full border shrink-0',
              isOrderOpen(order, now.getTime())
                ? 'bg-green-400/10 border-green-400/30 text-green-300'
                : 'bg-red-400/10 border-red-400/30 text-red-300',
            ]"
          >
            {{
              translate(
                isOrderOpen(order, now.getTime())
                  ? "features.order.order_detail.status.open"
                  : "features.order.order_detail.status.closed",
              )
            }}
          </span>

          <IconChevronRight class="w-4 h-4 opacity-60 shrink-0" />
        </RouterLink>
      </li>
    </ul>
  </section>
</template>
