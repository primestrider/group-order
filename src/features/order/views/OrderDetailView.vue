<script setup lang="ts">
import {
  IconCash,
  IconCircleCheck,
  IconClipboardCopy,
  IconLock,
  IconLockOpen,
  IconPencil,
  IconPlus,
  IconShare,
  IconTrash,
  IconUsers,
} from "@tabler/icons-vue"
import { useMutation } from "@tanstack/vue-query"
import { useClipboard, useNow, useShare } from "@vueuse/core"
import { computed, onMounted, onUnmounted, ref } from "vue"
import { useRoute, useRouter } from "vue-router"

import { auth } from "@/plugins/firebase/auth"
import { translate } from "@/plugins/language"
import { showToast } from "@/plugins/toaster/toast"
import BaseButton from "@/shared/components/BaseButton.vue"
import BaseCard from "@/shared/components/BaseCard.vue"
import BaseSkeleton from "@/shared/components/BaseSkeleton.vue"
import { useDateFormatter } from "@/shared/composables/useDateFormatter"
import { formatRupiah } from "@/shared/helpers/currency"
import { UtilsPageName } from "@/shared/models"

import AddItemDialog from "../components/AddItemDialog.vue"
import EditOrderDialog from "../components/EditOrderDialog.vue"
import OrderRecap from "../components/OrderRecap.vue"
import { isOrderOpen } from "../helpers/order"
import { extraFeeShare, participantTotal } from "../helpers/recap"
import {
  type OrderDetailItems,
  type OrderDetailResponse,
  OrderItemError,
  OrderStatus,
} from "../models"
import {
  listenOrderDetailRealtime,
  listenOrderItemsRealtime,
  removeOrderItem,
  setOrderItemPaid,
  setOrderStatus,
} from "../services/api"

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

const { formatDateTime, formatRelativeTime } = useDateFormatter()

/**
 * Order detail (realtime, so status / deadline edits by the owner show up immediately)
 */
const orderDetail = ref<OrderDetailResponse | null>(null)
const isLoadingGetDetail = ref<boolean>(true)

const redirectNotFound = (): void => {
  router.replace({ name: UtilsPageName.PAGE_NOT_FOUND })
}

const isOpenAddItem = ref<boolean>(false)
const handleOpenAddItem = (): void => {
  isOpenAddItem.value = true
}

const isOpenEditOrder = ref<boolean>(false)

const orderItems = ref<OrderDetailItems[]>([])

let unsubscribeOrderDetail: (() => void) | null = null
let unsubscribeOrderItems: (() => void) | null = null

const isMyItem = (item: OrderDetailItems): boolean => {
  return !!auth?.currentUser && item.id === auth.currentUser.uid
}

/**
 * Current user's existing item (used to prefill edit)
 */
const myItem = computed(() => orderItems.value.find(isMyItem) ?? null)

/**
 * Order creator manages the order and sees the recap
 */
const isOwner = computed(
  () => !!auth?.currentUser && orderDetail.value?.ownerUid === auth.currentUser.uid,
)

/**
 * Re-evaluated every 30s so the order closes without reload
 */
const now = useNow({ interval: 30_000 })

const isOrderClosed = computed(
  () => !!orderDetail.value && !isOrderOpen(orderDetail.value, now.value.getTime()),
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

/**
 * Deadline already passed (owner must move it to reopen)
 */
const isPastDeadline = computed(
  () => !!orderDetail.value && orderDetail.value.lastOrderAt.getTime() <= now.value.getTime(),
)

const feeShare = computed(() =>
  extraFeeShare(orderDetail.value?.extraFee ?? 0, orderItems.value.length),
)

const totalFor = (item: OrderDetailItems): number =>
  participantTotal(item, orderDetail.value?.extraFee ?? 0, orderItems.value.length)

const showManageError = (error: Error): void => {
  showToast(
    error.message === OrderItemError.CLOSED
      ? translate("features.order.order_detail.add_item.notification_add_item.closed")
      : translate("features.order.order_detail.manage.notification.error"),
    "error",
  )
}

/**
 * Owner: close early / reopen
 */
const { mutate: setStatusMutate, isPending: isPendingStatus } = useMutation({
  mutationFn: setOrderStatus,
  onSuccess(_, { status }) {
    showToast(
      translate(
        status === OrderStatus.CLOSED
          ? "features.order.order_detail.manage.notification.closed"
          : "features.order.order_detail.manage.notification.reopened",
      ),
      "success",
    )
  },
  onError: showManageError,
})

const handleToggleStatus = (): void => {
  if (!orderDetail.value) return

  setStatusMutate({
    orderId,
    status: orderDetail.value.status === OrderStatus.CLOSED ? OrderStatus.OPEN : OrderStatus.CLOSED,
  })
}

/**
 * Participant leaves / owner removes a participant
 */
const { mutate: removeItemMutate, isPending: isPendingRemove } = useMutation({
  mutationFn: removeOrderItem,
  onSuccess() {
    showToast(translate("features.order.order_detail.manage.notification.removed"), "success")
  },
  onError: showManageError,
})

const handleRemoveItem = (item: OrderDetailItems): void => {
  const message = isMyItem(item)
    ? translate("features.order.order_detail.manage.confirm_leave")
    : `${translate("features.order.order_detail.manage.confirm_remove")} ${item.participantName}?`

  if (!globalThis.confirm(message)) return

  removeItemMutate({ orderId, participantUid: item.id })
}

/**
 * Owner: mark paid / unpaid
 */
const { mutate: setPaidMutate } = useMutation({
  mutationFn: setOrderItemPaid,
  onError: showManageError,
})

onMounted(() => {
  unsubscribeOrderDetail = listenOrderDetailRealtime(
    orderId,
    (order) => {
      if (!order) {
        redirectNotFound()
        return
      }

      orderDetail.value = order
      isLoadingGetDetail.value = false
    },
    redirectNotFound,
  )

  unsubscribeOrderItems = listenOrderItemsRealtime(orderId, (data) => {
    orderItems.value = data
  })
})

onUnmounted(() => {
  unsubscribeOrderDetail?.()
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
            <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <h1 class="text-2xl md:text-3xl font-bold leading-tight break-words">
                {{ orderDetail.orderName }}
              </h1>

              <!-- Owner actions -->
              <div v-if="isOwner" class="flex flex-wrap gap-2 shrink-0">
                <button
                  type="button"
                  class="text-sm flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition"
                  @click="isOpenEditOrder = true"
                >
                  <IconPencil class="w-4 h-4" />
                  {{ translate("features.order.order_detail.manage.edit") }}
                </button>

                <button
                  type="button"
                  class="text-sm flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="
                    isPendingStatus || (orderDetail.status === OrderStatus.CLOSED && isPastDeadline)
                  "
                  :title="
                    orderDetail.status === OrderStatus.CLOSED && isPastDeadline
                      ? translate('features.order.order_detail.manage.reopen_hint')
                      : undefined
                  "
                  @click="handleToggleStatus"
                >
                  <template v-if="orderDetail.status === OrderStatus.CLOSED">
                    <IconLockOpen class="w-4 h-4" />
                    {{ translate("features.order.order_detail.manage.reopen") }}
                  </template>
                  <template v-else>
                    <IconLock class="w-4 h-4" />
                    {{ translate("features.order.order_detail.manage.close") }}
                  </template>
                </button>
              </div>
            </div>

            <!-- Description -->
            <p
              v-if="orderDetail.orderDescription"
              class="text-sm md:text-base text-primary-text/70 max-w-2xl whitespace-pre-line"
            >
              {{ orderDetail.orderDescription }}
            </p>

            <!-- Meta + Share -->
            <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <!-- Meta Chips -->
              <div class="flex flex-wrap items-center gap-3 text-sm">
                <!-- Status -->
                <div
                  :class="[
                    'px-3 py-1.5 rounded-full border',
                    isOrderClosed
                      ? 'bg-red-400/10 border-red-400/30 text-red-300'
                      : 'bg-green-400/10 border-green-400/30 text-green-300',
                  ]"
                >
                  {{
                    translate(
                      isOrderClosed
                        ? "features.order.order_detail.status.closed"
                        : "features.order.order_detail.status.open",
                    )
                  }}
                </div>

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
                  :title="formatDateTime(orderDetail.lastOrderAt)"
                >
                  {{ translate("features.order.create_order.form.lastOrderAt.label") }}
                  {{ formatDateTime(orderDetail.lastOrderAt) }}
                  <span v-if="!isPastDeadline" class="text-primary-text/60">
                    ({{ formatRelativeTime(orderDetail.lastOrderAt) }})
                  </span>
                </div>

                <!-- Extra fee -->
                <div
                  v-if="orderDetail.extraFee"
                  class="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-primary-text/80"
                >
                  {{ translate("features.order.create_order.form.extraFee.label") }}
                  {{ formatRupiah(orderDetail.extraFee) }}
                  <span v-if="orderItems.length" class="text-primary-text/60">
                    ({{ formatRupiah(feeShare) }}
                    {{ translate("features.order.order_detail.payment.per_person") }})
                  </span>
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
                    :aria-label="translate('features.order.order_detail.share_link')"
                    class="flex-1 min-w-0 px-3 py-1.5 bg-transparent text-sm text-primary-text/80 outline-none select-all"
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

            <!-- Payment info -->
            <div
              v-if="orderDetail.paymentInfo"
              class="flex gap-3 items-start rounded-2xl p-3 bg-white/5 border border-white/10 text-sm"
            >
              <IconCash class="w-5 h-5 shrink-0 opacity-80" />
              <div>
                <p class="font-semibold">
                  {{ translate("features.order.create_order.form.paymentInfo.label") }}
                </p>
                <p class="text-primary-text/80 whitespace-pre-line break-words">
                  {{ orderDetail.paymentInfo }}
                </p>
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
            :extra-fee="orderDetail.extraFee"
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
                <div class="flex items-center gap-2 shrink-0">
                  <span
                    v-if="item.isPaid"
                    class="text-xs px-2 py-1 rounded-full bg-accent/30 text-primary-text border border-accent/50"
                  >
                    {{ translate("features.order.order_detail.payment.paid") }}
                  </span>
                  <span
                    v-if="isMyItem(item)"
                    class="text-xs px-2 py-1 rounded-full bg-green-400/20 text-green-300 border border-green-400/30"
                  >
                    {{ translate("features.order.order_detail.you") }}
                  </span>
                </div>
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
                  <span class="shrink-0">
                    <span class="font-medium">× {{ i.quantity }}</span>
                    <span v-if="i.price" class="ml-2 text-primary-text/50">
                      {{ formatRupiah(i.price * i.quantity) }}
                    </span>
                  </span>
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

              <!-- Amount to pay -->
              <div
                v-if="totalFor(item)"
                class="flex justify-between text-sm border-t border-white/10 pt-2"
              >
                <span class="text-primary-text/60">
                  {{ translate("features.order.order_detail.payment.to_pay") }}
                </span>
                <span class="font-semibold text-primary-text">{{
                  formatRupiah(totalFor(item))
                }}</span>
              </div>

              <!-- Footer -->
              <div class="mt-auto flex items-center justify-between gap-2 text-xs">
                <span class="text-primary-text/40">
                  {{ formatDateTime(item.updatedAt ?? item.createdAt) }}
                </span>

                <div class="flex items-center gap-1">
                  <button
                    v-if="isOwner"
                    type="button"
                    class="flex items-center gap-1 px-2 py-1 rounded-full border border-white/10 hover:bg-white/10 transition"
                    :aria-pressed="item.isPaid"
                    @click="
                      setPaidMutate({ orderId, participantUid: item.id, isPaid: !item.isPaid })
                    "
                  >
                    <IconCircleCheck
                      class="w-4 h-4"
                      :class="item.isPaid ? 'text-green-400' : 'text-primary-text/50'"
                    />
                    {{
                      translate(
                        item.isPaid
                          ? "features.order.order_detail.payment.mark_unpaid"
                          : "features.order.order_detail.payment.mark_paid",
                      )
                    }}
                  </button>

                  <button
                    v-if="isOwner || (isMyItem(item) && !isOrderClosed)"
                    type="button"
                    class="flex items-center gap-1 px-2 py-1 rounded-full text-red-300 border border-red-400/20 hover:bg-red-400/10 transition disabled:opacity-50"
                    :disabled="isPendingRemove"
                    @click="handleRemoveItem(item)"
                  >
                    <IconTrash class="w-4 h-4" />
                    {{
                      translate(
                        isMyItem(item)
                          ? "features.order.order_detail.manage.leave"
                          : "features.order.order_detail.manage.remove",
                      )
                    }}
                  </button>
                </div>
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
            <template #icon>
              <IconPencil v-if="myItem" class="w-6 h-6 md:w-8 md:h-8" />
              <IconPlus v-else class="w-6 h-6 md:w-8 md:h-8" />
            </template>
          </BaseButton>
        </div>
      </template>
    </BaseCard>

    <AddItemDialog
      v-model="isOpenAddItem"
      :order-id="orderId"
      :existing-item="myItem"
    ></AddItemDialog>

    <EditOrderDialog v-if="orderDetail && isOwner" v-model="isOpenEditOrder" :order="orderDetail" />
  </main>
</template>
