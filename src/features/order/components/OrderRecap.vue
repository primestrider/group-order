<script setup lang="ts">
import { IconCheck, IconClipboardCopy } from "@tabler/icons-vue"
import { useClipboard } from "@vueuse/core"
import { computed } from "vue"

import { translate } from "@/plugins/language"
import { formatRupiah } from "@/shared/helpers/currency"

import { formatOrderRecapText, summarizeOrderItems, summarizeOrderTotals } from "../helpers/recap"
import type { OrderDetailItems } from "../models"

const { orderName, orderItems, extraFee } = defineProps<{
  orderName: string
  orderItems: OrderDetailItems[]
  extraFee: number
}>()

/**
 * Total quantity per item across all participants
 */
const recapLines = computed(() => summarizeOrderItems(orderItems))

const totals = computed(() => summarizeOrderTotals(orderItems, extraFee))

const totalQuantity = computed(() => recapLines.value.reduce((sum, line) => sum + line.quantity, 0))

const { copy, copied, isSupported: isClipboardSupported } = useClipboard()

const handleCopyRecap = async (): Promise<void> => {
  if (!isClipboardSupported.value) return

  await copy(
    formatOrderRecapText(orderName, orderItems, extraFee, {
      total: translate("features.order.order_detail.recap.total"),
      participants: translate("features.order.order_detail.recap.participants"),
      note: translate("features.order.order_detail.note"),
      extraFee: translate("features.order.create_order.form.extraFee.label"),
      grandTotal: translate("features.order.order_detail.recap.grand_total"),
      paid: translate("features.order.order_detail.payment.paid"),
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
        <span class="shrink-0">
          <span class="font-semibold">× {{ line.quantity }}</span>
          <span v-if="line.subtotal" class="ml-2 text-primary-text/60">
            {{ formatRupiah(line.subtotal) }}
          </span>
        </span>
      </li>
    </ul>

    <dl class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
      <div>
        <dt class="text-xs text-primary-text/60">
          {{ translate("features.order.order_detail.recap.total") }}
        </dt>
        <dd class="font-semibold">{{ totalQuantity }}</dd>
      </div>
      <div>
        <dt class="text-xs text-primary-text/60">
          {{ translate("features.order.create_order.form.extraFee.label") }}
        </dt>
        <dd class="font-semibold">{{ formatRupiah(totals.extraFee) }}</dd>
      </div>
      <div>
        <dt class="text-xs text-primary-text/60">
          {{ translate("features.order.order_detail.recap.grand_total") }}
        </dt>
        <dd class="font-semibold">{{ formatRupiah(totals.grandTotal) }}</dd>
      </div>
      <div>
        <dt class="text-xs text-primary-text/60">
          {{ translate("features.order.order_detail.payment.paid") }}
        </dt>
        <dd class="font-semibold">{{ totals.paidCount }} / {{ orderItems.length }}</dd>
      </div>
    </dl>
  </section>
</template>
