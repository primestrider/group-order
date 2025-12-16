<script setup lang="ts">
import { IconClipboardCopy, IconPlus, IconShare, IconUsers } from "@tabler/icons-vue"
import { useQuery } from "@tanstack/vue-query"
import { useClipboard, useShare } from "@vueuse/core"
import { computed, watch } from "vue"
import { useRoute, useRouter } from "vue-router"

import { translate } from "@/plugins/language"
import BaseButton from "@/shared/components/BaseButton.vue"
import BaseCard from "@/shared/components/BaseCard.vue"
import BaseSkeleton from "@/shared/components/BaseSkeleton.vue"
import { useDateFormatter } from "@/shared/composables/useDateFormatter"
import { UtilsPageName } from "@/shared/models"

import { getDetailOrder } from "../services/api"

const route = useRoute()
const router = useRouter()
const orderId = route.params.id as string

const shareLink = computed(() => {
  return `${window.location.origin}${route.fullPath}`
})

const {
  copy,
  copied,
  isSupported: isClipboardSupported,
} = useClipboard({
  source: shareLink,
})

const handleCopyLink = async (): Promise<void> => {
  if (!isClipboardSupported) return
  await copy()
}

const { share, isSupported: isShareSupported } = useShare()

const handleShareLink = async (): Promise<void> => {
  if (!isShareSupported) return

  await share({
    title: orderDetail.value?.orderName
      ? `Group Order: ${orderDetail.value.orderName}`
      : "Group Order",
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
                    {{ orderDetail.participantsCount }}
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
                    aria-label="Copy link"
                  >
                    <IconClipboardCopy class="w-4 h-4" :class="copied ? 'text-green-400' : ''" />
                  </button>

                  <!-- Share -->
                  <button
                    v-if="isShareSupported"
                    type="button"
                    class="px-3 py-1.5 flex items-center justify-center text-primary-text/80 hover:bg-white/10 transition rounded-r-full"
                    @click="handleShareLink"
                    aria-label="Share link"
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
        <template v-else-if="orderDetail"> List participants here </template>

        <div class="absolute bottom-5 right-5">
          <BaseButton>
            <template #icon> <IconPlus class="w-6 h-6 md:w-8 md:h-8"></IconPlus> </template>
          </BaseButton>
        </div>
      </template>
    </BaseCard>
  </main>
</template>
