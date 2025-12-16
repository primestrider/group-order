<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from "@headlessui/vue"

import { translate } from "@/plugins/language"

/**
 * v-model for dialog open state
 */
const open = defineModel<boolean>({
  required: true,
})

const close = () => {
  open.value = false
}
</script>

<template>
  <TransitionRoot appear :show="open" as="template">
    <Dialog as="div" class="relative z-50" @close="close">
      <!-- Overlay -->
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

      <!-- Modal Container -->
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
            class="w-full max-w-xl rounded-2xl bg-secondary border border-border p-4 text-primary-text shadow-xl"
          >
            <!-- Header -->
            <DialogTitle class="text-lg font-semibold">
              {{ translate("features.order.order_detail.add_item.form.title") }}
            </DialogTitle>

            <!-- Content -->
            <div class="mt-4 space-y-4">
              <!-- Placeholder form -->
              <div class="space-y-2">
                <label class="text-sm text-primary-text/70"> Item name </label>
                <input
                  type="text"
                  placeholder="e.g. Coffee Latte"
                  class="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 outline-none focus:ring-2 focus:ring-white/10"
                />
              </div>

              <div class="space-y-2">
                <label class="text-sm text-primary-text/70"> Quantity </label>
                <input
                  type="number"
                  min="1"
                  class="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 outline-none focus:ring-2 focus:ring-white/10"
                />
              </div>
            </div>

            <!-- Footer -->
            <div class="mt-6 flex justify-end gap-2">
              <button
                type="button"
                class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
                @click="close"
              >
                Cancel
              </button>

              <button
                type="button"
                class="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover transition"
              >
                Add Item
              </button>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
