<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from "@headlessui/vue"
import { IconTrash } from "@tabler/icons-vue"
import { useMutation } from "@tanstack/vue-query"
import { toTypedSchema } from "@vee-validate/zod"
import { useStorage } from "@vueuse/core"
import { useFieldArray, useForm } from "vee-validate"
import { computed, ref, watch } from "vue"

import { translate } from "@/plugins/language"
import { showToast } from "@/plugins/toaster/toast"
import BaseButton from "@/shared/components/BaseButton.vue"
import BaseFormField from "@/shared/components/BaseFormField.vue"
import { useBaseFieldError } from "@/shared/composables/useBaseFieldError"
import { formatRupiah } from "@/shared/helpers/currency"

import { sumItemLines } from "../helpers/recap"
import { type OrderDetailItems, OrderItemError, type OrderMenuItem } from "../models"
import { type AddItemRequest, addItemSchema } from "../models/add-item.schema"
import { upsertOrderItem } from "../services/api"

const {
  orderId,
  existingItem = null,
  menu = [],
} = defineProps<{
  orderId: string
  /**
   * Items offered by the order owner (suggestions + price prefill)
   */
  menu?: OrderMenuItem[]
  /**
   * Current user's saved item; when present the dialog edits it
   */
  existingItem?: OrderDetailItems | null
}>()

/**
 * Dialog open state (v-model)
 */
const open = defineModel<boolean>({ required: true })

/**
 * Draft storage key (scoped per order)
 */
const storageKey = `add-item-draft:${orderId}`

const emptyDraft = (): AddItemRequest => ({
  participantName: "",
  items: [{ itemName: "", quantity: 1, price: 0 }],
  note: "",
})

/**
 * Persistent draft state
 */
const draft = useStorage<AddItemRequest>(storageKey, emptyDraft())

// Drafts saved before prices existed have no `price`
draft.value.items = draft.value.items.map((item) => ({ ...item, price: item.price ?? 0 }))

/**
 * Internal flag to prevent draft overwrite during submit/reset
 */
const isSubmitting = ref(false)

/**
 * Close modal dialog
 */
const close = () => {
  open.value = false
}

/**
 * Form setup
 */
const { handleSubmit, errors, resetForm, defineField } = useForm<AddItemRequest>({
  validationSchema: toTypedSchema(addItemSchema),
  initialValues: draft.value,
})

const { fieldError: addItemFieldError, clearBackendError: clearItemError } =
  useBaseFieldError<AddItemRequest>(errors)

const [participantName] = defineField("participantName")
const [note] = defineField("note")

const { fields: itemFields, push, remove } = useFieldArray<AddItemRequest["items"][number]>("items")

/**
 * Error for a field inside the items array (vee-validate path: `items[0].itemName`)
 */
const itemError = (index: number, key: keyof AddItemRequest["items"][number]) =>
  (errors.value as Record<string, string | undefined>)[`items[${index}].${key}`]

/**
 * Prefill with the user's saved item when editing
 */
watch(open, (isOpen) => {
  if (!isOpen || !existingItem) return

  resetForm({
    values: {
      participantName: existingItem.participantName,
      items: existingItem.items.map((item) => ({ ...item })),
      note: existingItem.note ?? "",
    },
  })
})

const menuListId = `order-menu-${orderId}`

const toMenuKey = (itemName: string): string => itemName.trim().replace(/s+/g, " ").toLowerCase()

/**
 * Prefill price when the typed / picked name matches a menu item
 */
const applyMenuPrice = (item: AddItemRequest["items"][number]): void => {
  const menuItem = menu.find((entry) => toMenuKey(entry.itemName) === toMenuKey(item.itemName))
  if (menuItem) {
    item.price = menuItem.price
  }
}

/**
 * Live total of the items being entered
 */
const itemsTotal = computed(() =>
  sumItemLines(
    itemFields.value.map((field) => ({
      ...field.value,
      quantity: Number(field.value.quantity) || 0,
      price: Number(field.value.price) || 0,
    })),
  ),
)

/**
 * Add new item entry (max 10)
 */
const addItem = () => {
  if (itemFields.value.length >= 10) return
  push({ itemName: "", quantity: 1, price: 0 })
  clearItemError("items")
}

/**
 * Sync form state into persistent draft
 */
watch(
  () => ({
    participantName: participantName.value,
    note: note.value,
    items: itemFields.value.map((f) => f.value),
  }),
  (values) => {
    if (!isSubmitting.value) {
      draft.value = values
    }
  },
  { deep: true },
)

/**
 * Mutation: add order item
 */
const { mutate: upsertOrderItemMutate, isPending: isPendingAdd } = useMutation({
  mutationFn: upsertOrderItem,

  onSuccess() {
    // Clear persisted draft (reset to empty, not the mount-time initial values)
    draft.value = emptyDraft()
    resetForm({ values: emptyDraft() })
    close()
    showToast(
      translate("features.order.order_detail.add_item.notification_add_item.success"),
      "success",
    )
  },

  onError(error) {
    const messageKey =
      error.message === OrderItemError.CLOSED
        ? "closed"
        : error.message === OrderItemError.FULL
          ? "full"
          : "error"

    showToast(
      translate(`features.order.order_detail.add_item.notification_add_item.${messageKey}`),
      "error",
    )
  },
})

/**
 * Submit handler
 */
const submit = handleSubmit((values) => {
  isSubmitting.value = true

  upsertOrderItemMutate({
    orderId,
    participantName: values.participantName,
    items: values.items,
    note: values.note,
  })

  isSubmitting.value = false
})
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
            class="w-full max-w-xl rounded-2xl bg-secondary border border-border text-primary-text shadow-xl flex flex-col max-h-[90vh]"
          >
            <!-- Header -->
            <DialogTitle class="px-4 pt-4 text-lg font-semibold">
              {{
                translate(
                  existingItem
                    ? "features.order.order_detail.add_item.form.edit_title"
                    : "features.order.order_detail.add_item.form.title",
                )
              }}
            </DialogTitle>

            <!-- FORM -->
            <form class="flex flex-col flex-1" @submit.prevent="submit">
              <div class="px-4 mt-4">
                <!-- Participant Name -->
                <BaseFormField
                  field-name="participantName"
                  required
                  :label="
                    translate('features.order.order_detail.add_item.form.participantName.label')
                  "
                  :error="addItemFieldError('participantName')"
                >
                  <input
                    v-model="participantName"
                    type="text"
                    :placeholder="
                      translate(
                        'features.order.order_detail.add_item.form.participantName.placeholder',
                      )
                    "
                    :disabled="isPendingAdd"
                    @input="clearItemError('participantName')"
                    class="w-full py-3 px-4 rounded-full bg-secondary border border-border text-primary-text outline-none focus:ring-2 focus:ring-white/10"
                  />
                </BaseFormField>

                <!-- Items -->

                <div class="ml-2 flex items-center justify-between">
                  <label class="text-sm font-medium text-primary-text/80">
                    {{ translate("features.order.order_detail.add_item.form.items.label") }}
                  </label>

                  <button
                    type="button"
                    class="text-xs flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="itemFields.length >= 10 || isPendingAdd"
                    @click="addItem"
                  >
                    + {{ translate("features.order.order_detail.add_item.form.button.add_item") }}
                  </button>
                </div>

                <div class="max-h-[40vh] overflow-y-auto pr-1">
                  <div
                    v-for="(field, index) in itemFields"
                    :key="field.key"
                    class="grid grid-cols-12 gap-2 items-center"
                  >
                    <div class="col-span-12 sm:col-span-5">
                      <BaseFormField
                        :field-name="`items.${index}.itemName`"
                        required
                        :error="itemError(index, 'itemName')"
                      >
                        <input
                          v-model="field.value.itemName"
                          type="text"
                          :list="menu.length ? menuListId : undefined"
                          @change="applyMenuPrice(field.value)"
                          :placeholder="
                            translate('features.order.order_detail.add_item.form.items.placeholder')
                          "
                          :disabled="isPendingAdd"
                          @input="clearItemError(`items.${index}.itemName` as any)"
                          class="w-full py-3 px-4 rounded-full bg-secondary border border-border text-primary-text outline-none focus:ring-2 focus:ring-white/10"
                        />
                      </BaseFormField>
                    </div>

                    <div class="col-span-4 sm:col-span-2">
                      <BaseFormField
                        :field-name="`items.${index}.quantity`"
                        required
                        :error="itemError(index, 'quantity')"
                      >
                        <input
                          v-model="field.value.quantity"
                          type="number"
                          min="1"
                          :disabled="isPendingAdd"
                          @input="clearItemError(`items.${index}.quantity` as any)"
                          :aria-label="
                            translate('features.order.order_detail.add_item.form.quantity.label')
                          "
                          class="w-full py-3 px-4 rounded-full bg-secondary border border-border text-primary-text outline-none focus:ring-2 focus:ring-white/10"
                        />
                      </BaseFormField>
                    </div>

                    <div class="col-span-6 sm:col-span-4">
                      <BaseFormField
                        :field-name="`items.${index}.price`"
                        :error="itemError(index, 'price')"
                      >
                        <input
                          v-model="field.value.price"
                          type="number"
                          min="0"
                          step="500"
                          inputmode="numeric"
                          :placeholder="
                            translate('features.order.order_detail.add_item.form.price.placeholder')
                          "
                          :aria-label="
                            translate('features.order.order_detail.add_item.form.price.label')
                          "
                          :disabled="isPendingAdd"
                          class="w-full py-3 px-4 rounded-full bg-secondary border border-border text-primary-text outline-none focus:ring-2 focus:ring-white/10"
                        />
                      </BaseFormField>
                    </div>

                    <div class="col-span-2 sm:col-span-1 flex items-end justify-center">
                      <button
                        v-if="itemFields.length > 1"
                        type="button"
                        class="text-red-400 hover:text-red-300"
                        :aria-label="
                          translate('features.order.order_detail.add_item.form.button.remove_item')
                        "
                        :disabled="isPendingAdd"
                        @click="
                          () => {
                            remove(index)
                            clearItemError('items')
                          }
                        "
                      >
                        <IconTrash size="18" />
                      </button>
                    </div>
                  </div>
                </div>

                <datalist v-if="menu.length" :id="menuListId">
                  <option
                    v-for="menuItem in menu"
                    :key="menuItem.itemName"
                    :value="menuItem.itemName"
                  >
                    {{ formatRupiah(menuItem.price) }}
                  </option>
                </datalist>

                <p class="mr-2 mt-1 text-right text-sm text-primary-text/70">
                  {{ translate("features.order.order_detail.add_item.form.price.total") }}:
                  <span class="font-semibold text-primary-text">{{
                    formatRupiah(itemsTotal)
                  }}</span>
                </p>

                <!-- Note -->
                <BaseFormField
                  field-name="note"
                  type="textarea"
                  :label="translate('features.order.order_detail.add_item.form.note.label')"
                  :error="addItemFieldError('note')"
                >
                  <textarea
                    v-model="note"
                    rows="3"
                    :placeholder="
                      translate('features.order.order_detail.add_item.form.note.placeholder')
                    "
                    :disabled="isPendingAdd"
                    @input="clearItemError('note')"
                    class="w-full py-3 px-4 rounded-3xl bg-secondary border border-border text-primary-text outline-none focus:ring-2 focus:ring-white/10"
                  />
                </BaseFormField>
              </div>

              <!-- Footer -->
              <div class="px-4 py-3 flex justify-end gap-2">
                <BaseButton
                  type="button"
                  fluid
                  class="bg-accent-dark"
                  :disabled="isPendingAdd"
                  :label="translate('features.order.order_detail.add_item.form.button.cancel')"
                  @click="close"
                />

                <BaseButton
                  type="submit"
                  fluid
                  :loading="isPendingAdd"
                  :label="translate('features.order.order_detail.add_item.form.button.confirm')"
                />
              </div>
            </form>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
