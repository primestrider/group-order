<script setup lang="ts">
import { IconClipboardCopy, IconPlus, IconShare, IconUsers } from "@tabler/icons-vue"
import { useQuery } from "@tanstack/vue-query"
import { useClipboard, useNow, useShare } from "@vueuse/core"
import { computed, onMounted, onUnmounted, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"

import { auth } from "@/plugins/firebase/auth"
import { translate } from "@/plugins/language"
import BaseButton from "@/shared/components/BaseButton.vue"
import BaseCard from "@/shared/components/BaseCard.vue"
import BaseSkeleton from "@/shared/components/BaseSkeleton.vue"
import { useDateFormatter } from "@/shared/composables/useDateFormatter"
import { UtilsPageName } from "@/shared/models"

import AddItemDialog from "../components/AddItemDialog.vue"
import OrderRecap from "../components/OrderRecap.vue"
import { type OrderDetailItems } from "../models"
import { getDetailOrder, listenOrderItemsRealtime } from "../services/api"

const route = useRoute()
const router = useRouter()
const orderId = route.params.id as string

const shareLink = computed(() => {
  return `${globalThis.location.origin}${route.fullPath}`
})

const {
  copy,
  copied,
  isSupported: isClipboardSupported,
} = useClipboard({
  source: shareLink,
})

const handleCopyLink = async (): Promise<void> => {
  if (!isClipboardSupported.value) return
  await copy()
}

const { share, isSupported: isShareSupported } = useShare()

const handleShareLink = async (): Promise<void> => {
  if (!isShareSupported.value) return

  await share({
    title: orderDetail.value?.orderName
      ? `${translate("features.order.order_detail.share_title")}: ${orderDetail.value.orderName}`
      : translate("features.order.order_detail.share_title"),
    url: shareLink.value,
  })
}

const { formatDateTime } = useDateFormatter()

const {
  data: orderDetail,
  isLoading: isLoadingGetDetail,
  isError,
} = useQuery({
  queryKey: ["order", orderId],
  queryFn: () => getDetailOrder(orderId),
  enabled: !!orderId,
})

watch(isError, (hasError) => {
  if (hasError) {
    router.replace({ name: UtilsPageName.PAGE_NOT_FOUND })
  }
})

const isOpenAddItem = ref<boolean>(false)
const handleOpenAddItem = (): void => {
  isOpenAddItem.value = true
}

const orderItems = ref<OrderDetailItems[]>([])

let unsubscribeOrderItems: (() => void) | null = null

const isMyItem = (item: OrderDetailItems): boolean => {
  return !!auth?.currentUser && item.id === auth.currentUser.uid
}

/**
 * Current user's existing item (used to prefill edit)
 */
const myItem = computed(() => orderItems.value.find(isMyItem) ?? null)

/**
 * Order creator sees the item recap
 */
const isOwner = computed(
  () => !!auth?.currentUser && orderDetail.value?.ownerUid === auth.currentUser.uid,
)

/**
 * Re-evaluated every 30s so the order closes without reload
 */
const now = useNow({ interval: 30_000 })

const isOrderClosed = computed(
  () => !!orderDetail.value && orderDetail.value.lastOrderAt.getTime() <= now.value.getTime(),
)

const isOrderFull = computed(
  () => !!orderDetail.value && orderItems.value.length >= orderDetail.value.maxParticipants,
)

/**
 * Owner of an existing item may still edit it when the order is full
 */
const addItemBlockedReason = computed<string | null>(() => {
  if (isOrderClosed.value) {
    return translate("features.order.order_detail.add_item.notification_add_item.closed")
  }
  if (isOrderFull.value && !myItem.value) {
    return translate("features.order.order_detail.add_item.notification_add_item.full")
  }
  return null
})

onMounted(() => {
  unsubscribeOrderItems = listenOrderItemsRealtime(orderId, (data) => {
    orderItems.value = data
  })
})

onUnmounted(() => {
  unsubscribeOrderItems?.()
})
</script>

<template>
  <main class="min-h-screen flex justify-center p-6">
    <BaseCard class="w-full max-w-7xl relative">
      <template #content>
        <!-- Skeleton -->
        <template v-if="isLoadingGetDetail">
          <BaseSkeleton height="lg" width="full" />

          <div class="flex flex-col gap-3">
            <BaseSkeleton height="md" width="lg" />

            <div class="grid grid-cols-3 md:grid-cols-8 gap-2 w-full">
              <BaseSkeleton height="sm" v-for="i in 3" :key="i" />
            </div>
          </div>
        </template>

        <!-- Real Content -->
        <template v-else-if="orderDetail">
          <section class="space-y-4 text-primary-text">
            <!-- Title -->
            <h1 class="text-2xl md:text-3xl font-bold leading-tight">
              {{ orderDetail.orderName }}
            </h1>

            <!-- Description -->
            <p
              v-if="orderDetail.orderDescription"
              class="text-sm md:text-base text-primary-text/70 max-w-2xl"
            >
              {{ orderDetail.orderDescription }}
            </p>

            <!-- Meta + Share -->
            <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <!-- Meta Chips -->
              <div class="flex flex-wrap items-center gap-3 text-sm">
                <!-- Participants -->
                <div
                  class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
                >
                  <IconUsers class="w-4 h-4 opacity-80" />
                  <span>
                    {{ orderItems.length }}
                    /
                    {{ orderDetail.maxParticipants }}
                  </span>
                </div>

                <!-- Last Order Date -->
                <div
                  class="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-primary-text/80"
                >
                  {{ translate("features.order.create_order.form.lastOrderAt.label") }}
                  {{ formatDateTime(orderDetail.lastOrderAt) }}
                </div>
              </div>

              <!-- Share Link Input Group -->
              <div class="w-full md:w-auto md:min-w-[320px] md:max-w-xl">
                <div
                  class="flex items-stretch rounded-full bg-white/5 border border-white/10 focus-within:ring-2 focus-within:ring-white/10 transition-shadow duration-200"
                >
                  <!-- Input -->
                  <input
                    type="text"
                    readonly
                    :value="shareLink"
                    class="flex-1 px-3 py-1.5 bg-transparent text-sm text-primary-text/80 outline-none select-all"
                  />

                  <!-- Divider -->
                  <div class="w-px bg-white/10"></div>

                  <!-- Copy -->
                  <button
                    type="button"
                    class="px-3 py-1.5 flex items-center justify-center text-primary-text/80 hover:bg-white/10 transition"
                    @click="handleCopyLink"
                    :aria-label="translate('features.order.order_detail.copy_link')"
                  >
                    <IconClipboardCopy class="w-4 h-4" :class="copied ? 'text-green-400' : ''" />
                  </button>

                  <!-- Share -->
                  <button
                    v-if="isShareSupported"
                    type="button"
                    class="px-3 py-1.5 flex items-center justify-center text-primary-text/80 hover:bg-white/10 transition rounded-r-full"
                    @click="handleShareLink"
                    :aria-label="translate('features.order.order_detail.share_link')"
                  >
                    <IconShare class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </template>

        <hr class="h-px text-white/10 my-6" />

        <div
          v-if="isLoadingGetDetail"
          class="flex flex-col md:flex-row md:flex-wrap gap-5 md:gap-4"
        >
          <div v-for="i in 10" :key="i" class="w-full md:w-[48%] lg:w-[32%] space-y-2">
            <div class="space-y-3">
              <BaseSkeleton height="md" width="full" />
              <BaseSkeleton height="sm" width="xl" />
              <BaseSkeleton height="sm" width="sm" />
            </div>
          </div>
        </div>

        <!-- Real Content -->
        <template v-else-if="orderDetail">
          <OrderRecap
            v-if="isOwner && orderItems.length"
            class="mb-6"
            :order-name="orderDetail.orderName"
            :order-items="orderItems"
          />

          <!-- list items -->
          <p v-if="!orderItems.length" class="py-10 pb-20 text-center text-sm text-primary-text/60">
            {{ translate("features.order.order_detail.empty") }}
          </p>

          <!-- pb-20 keeps the floating add button from covering the last row -->
          <section v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
            <article
              v-for="item in orderItems"
              :key="item.id"
              :class="[
                'rounded-2xl p-4 flex flex-col gap-3 transition border',
                isMyItem(item)
                  ? 'border-green-400/40 bg-green-400/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20',
              ]"
            >
              <!-- Header -->
              <div class="flex items-start justify-between gap-3">
                <h3 class="text-base font-semibold text-primary-text break-words">
                  {{ item.participantName }}
                </h3>
                <span
                  v-if="isMyItem(item)"
                  class="text-xs px-2 py-1 rounded-full bg-green-400/20 text-green-300 border border-green-400/30"
                >
                  {{ translate("features.order.order_detail.you") }}
                </span>
              </div>

              <!-- Items list -->
              <ul class="space-y-1 text-sm text-primary-text/80">
                <li
                  v-for="(i, index) in item.items"
                  :key="index"
                  class="flex justify-between gap-2"
                >
                  <span class="truncate">
                    {{ i.itemName }}
                  </span>
                  <span class="font-medium"> × {{ i.quantity }} </span>
                </li>
              </ul>

              <!-- Note -->
              <div
                v-if="item.note"
                class="text-sm text-primary-text/60 border-t border-white/10 pt-2"
              >
                <span class="italic">{{ translate("features.order.order_detail.note") }}</span>
                {{ item.note }}
              </div>

              <!-- Footer -->
              <div class="mt-auto text-xs text-primary-text/40">
                {{ formatDateTime(item.updatedAt ?? item.createdAt) }}
              </div>
            </article>
          </section>
        </template>

        <div class="absolute bottom-5 right-5 flex items-center gap-3">
          <span
            v-if="orderDetail && addItemBlockedReason"
            class="text-xs text-primary-text/70 px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
          >
            {{ addItemBlockedReason }}
          </span>
          <BaseButton
            :disabled="isLoadingGetDetail || !orderDetail || !!addItemBlockedReason"
            :aria-label="
              translate(
                myItem
                  ? 'features.order.order_detail.add_item.form.edit_title'
                  : 'features.order.order_detail.add_item.form.title',
              )
            "
            @click="handleOpenAddItem"
          >
            <template #icon> <IconPlus class="w-6 h-6 md:w-8 md:h-8"></IconPlus> </template>
          </BaseButton>
        </div>
      </template>
    </BaseCard>

    <AddItemDialog
      v-model="isOpenAddItem"
      :order-id="orderId"
      :existing-item="myItem"
    ></AddItemDialog>
  </main>
</template>
