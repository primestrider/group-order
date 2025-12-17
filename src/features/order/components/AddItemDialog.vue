<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from "@headlessui/vue"
import { IconTrash } from "@tabler/icons-vue"
import { useMutation } from "@tanstack/vue-query"
import { toTypedSchema } from "@vee-validate/zod"
import { useStorage } from "@vueuse/core"
import { useFieldArray, useForm } from "vee-validate"
import { ref, watch } from "vue"
import { useRoute } from "vue-router"

import { translate } from "@/plugins/language"
import { showToast } from "@/plugins/toaster/toast"
import BaseButton from "@/shared/components/BaseButton.vue"
import BaseFormField from "@/shared/components/BaseFormField.vue"
import { useBaseFieldError } from "@/shared/composables/useBaseFieldError"

import { type AddItemRequest, addItemSchema } from "../models/add-item.schema"
import { upsertOrderItem } from "../services/api"

/**
 * Dialog open state (v-model)
 */
const open = defineModel<boolean>({ required: true })

const route = useRoute()
const orderId = route.params.id as string

/**
 * Draft storage key (scoped per order)
 */
const storageKey = `add-item-draft:${orderId}`

/**
 * Persistent draft state
 */
const draft = useStorage<AddItemRequest>(storageKey, {
  participantName: "",
  items: [{ itemName: "", quantity: 1 }],
  note: "",
})

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
 * Add new item entry (max 10)
 */
const addItem = () => {
  if (itemFields.value.length >= 10) return
  push({ itemName: "", quantity: 1 })
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
    // Clear persisted draft
    draft.value = {
      participantName: "",
      items: [{ itemName: "", quantity: 1 }],
      note: "",
    }

    resetForm()
    close()
    showToast(
      translate("features.order.order_detail.add_item.notification_add_item.success"),
      "success",
    )
  },

  onError(error) {
    if (error) {
      console.log(error)
      showToast(
        translate("features.order.order_detail.add_item.notification_add_item.error"),
        "error",
      )
    }
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
              {{ translate("features.order.order_detail.add_item.form.title") }}
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
                    <div class="col-span-7">
                      <BaseFormField :field-name="`items.${index}.itemName`" required>
                        <input
                          v-model="field.value.itemName"
                          type="text"
                          :placeholder="
                            translate('features.order.order_detail.add_item.form.items.placeholder')
                          "
                          :disabled="isPendingAdd"
                          @input="clearItemError(`items.${index}.itemName` as any)"
                          class="w-full py-3 px-4 rounded-full bg-secondary border border-border text-primary-text outline-none focus:ring-2 focus:ring-white/10"
                        />
                      </BaseFormField>
                    </div>

                    <div class="col-span-3">
                      <BaseFormField :field-name="`items.${index}.quantity`" required>
                        <input
                          v-model="field.value.quantity"
                          type="number"
                          min="1"
                          :disabled="isPendingAdd"
                          @input="clearItemError(`items.${index}.quantity` as any)"
                          class="w-full py-3 px-4 rounded-full bg-secondary border border-border text-primary-text outline-none focus:ring-2 focus:ring-white/10"
                        />
                      </BaseFormField>
                    </div>

                    <div class="col-span-2 flex items-end justify-center">
                      <button
                        v-if="itemFields.length > 1"
                        type="button"
                        class="text-red-400 hover:text-red-300"
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
