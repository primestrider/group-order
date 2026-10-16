<script setup lang="ts">
import { IconCheck, IconClipboardCopy } from "@tabler/icons-vue"
import { useClipboard } from "@vueuse/core"
import { computed } from "vue"

import { translate } from "@/plugins/language"

import { formatOrderRecapText, summarizeOrderItems } from "../helpers/recap"
import type { OrderDetailItems } from "../models"

const { orderName, orderItems } = defineProps<{
  orderName: string
  orderItems: OrderDetailItems[]
}>()

/**
 * Total quantity per item across all participants
 */
const recapLines = computed(() => summarizeOrderItems(orderItems))

const totalQuantity = computed(() => recapLines.value.reduce((sum, line) => sum + line.quantity, 0))

const { copy, copied, isSupported: isClipboardSupported } = useClipboard()

const handleCopyRecap = async (): Promise<void> => {
  if (!isClipboardSupported.value) return

  await copy(
    formatOrderRecapText(orderName, orderItems, {
      total: translate("features.order.order_detail.recap.total"),
      participants: translate("features.order.order_detail.recap.participants"),
      note: translate("features.order.order_detail.note"),
    }),
  )
}
</script>

<template>
  <section
    class="rounded-2xl p-4 border border-accent/40 bg-accent/10 text-primary-text flex flex-col gap-3"
    aria-labelledby="order-recap-title"
  >
    <div class="flex items-center justify-between gap-3">
      <div>
        <h2 id="order-recap-title" class="text-base font-semibold">
          {{ translate("features.order.order_detail.recap.title") }}
        </h2>
        <p class="text-xs text-primary-text/60">
          {{ translate("features.order.order_detail.recap.owner_only") }}
        </p>
      </div>

      <button
        v-if="isClipboardSupported"
        type="button"
        class="text-xs flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition"
        @click="handleCopyRecap"
      >
        <IconCheck v-if="copied" class="w-4 h-4 text-green-400" />
        <IconClipboardCopy v-else class="w-4 h-4" />
        {{
          translate(
            copied
              ? "features.order.order_detail.recap.copied"
              : "features.order.order_detail.recap.copy",
          )
        }}
      </button>
    </div>

    <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 text-sm">
      <li
        v-for="line in recapLines"
        :key="line.itemName"
        class="flex justify-between gap-2 border-b border-white/5 py-1"
      >
        <span class="truncate">{{ line.itemName }}</span>
        <span class="font-semibold">× {{ line.quantity }}</span>
      </li>
    </ul>

    <p class="text-xs text-primary-text/60 text-right">
      {{ translate("features.order.order_detail.recap.total") }}: {{ totalQuantity }}
    </p>
  </section>
</template>
