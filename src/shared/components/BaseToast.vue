<script setup lang="ts">
interface NotificationItem {
  title?: string
  text?: string
  type?: "success" | "error" | "warn" | "info"
}

const toastStyle = (type?: NotificationItem["type"]) => {
  switch (type) {
    case "success":
      return {
        wrapper:
          "border border-[var(--color-success)]/40 " +
          "bg-[color-mix(in_srgb,var(--color-success)_14%,transparent)]",
        accent: "bg-[var(--color-success)]",
      }
    case "error":
      return {
        wrapper:
          "border border-[var(--color-danger)]/40 " +
          "bg-[color-mix(in_srgb,var(--color-danger)_14%,transparent)]",
        accent: "bg-[var(--color-danger)]",
      }
    case "warn":
      return {
        wrapper:
          "border border-[var(--color-warning)]/40 " +
          "bg-[color-mix(in_srgb,var(--color-warning)_14%,transparent)]",
        accent: "bg-[var(--color-warning)]",
      }
    case "info":
    default:
      return {
        wrapper:
          "border border-[var(--color-info)]/40 " +
          "bg-[color-mix(in_srgb,var(--color-info)_14%,transparent)]",
        accent: "bg-[var(--color-info)]",
      }
  }
}
</script>

<template>
  <Notifications group="base-toast" position="top center" class="pointer-events-none my-6" :max="3">
    <!-- ✅ SLOT YANG BENAR -->
    <template #body="{ item }">
      <transition name="toast">
        <div
          v-if="item"
          class="pointer-events-auto relative flex w-full overflow-hidden rounded-full my-2"
          :class="toastStyle(item.type).wrapper"
        >
          <!-- Content -->
          <div class="flex flex-col gap-1 px-4 py-3">
            <p v-if="item.title" class="text-sm font-semibold text-primary-text">
              {{ item.title }}
            </p>

            <p v-if="item.text" class="text-sm text-secondary-text leading-snug">
              {{ item.text }}
            </p>
          </div>
        </div>
      </transition>
    </template>
  </Notifications>
</template>

<style>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-14px) scale(0.96);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}
</style>
