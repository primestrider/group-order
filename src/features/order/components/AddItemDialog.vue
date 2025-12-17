<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from "@headlessui/vue"
import { IconTrash } from "@tabler/icons-vue"
import { toTypedSchema } from "@vee-validate/zod"
import { useFieldArray, useForm } from "vee-validate"

import { translate } from "@/plugins/language"
import BaseButton from "@/shared/components/BaseButton.vue"
import BaseFormField from "@/shared/components/BaseFormField.vue"
import { useBaseFieldError } from "@/shared/composables/useBaseFieldError"

import { type AddItemRequest, addItemSchema } from "../models/add-item.schema"

/**
 * v-model for dialog open state
 */
const open = defineModel<boolean>({ required: true })

const close = () => {
  open.value = false
}

const { handleSubmit, errors, resetForm, defineField } = useForm<AddItemRequest>({
  validationSchema: toTypedSchema(addItemSchema),
  initialValues: {
    participantName: "",
    items: [{ itemName: "", quantity: 1 }],
    note: "",
  },
})

const { fieldError: addItemFieldError, clearBackendError: clearItemError } =
  useBaseFieldError<AddItemRequest>(errors)

const [participantName] = defineField("participantName")
const [note] = defineField("note")

const { fields: itemFields, push, remove } = useFieldArray<AddItemRequest["items"][number]>("items")

/**
 * Add new item (max 10)
 */
const addItem = () => {
  if (itemFields.value.length >= 10) return

  push({ itemName: "", quantity: 1 })
  clearItemError("items")
}

/**
 * Submit handler
 */
const submit = handleSubmit((values) => {
  console.log("ADD ITEM PAYLOAD:", values)
  resetForm()
  close()
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

            <!-- ✅ FORM WRAPPER -->
            <form class="flex flex-col flex-1" @submit.prevent="submit">
              <!-- Content -->
              <div class="px-4 mt-4 space-y-4">
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
                    @input="clearItemError('participantName')"
                    class="w-full py-3 px-4 rounded-full bg-secondary border border-border text-primary-text outline-none focus:ring-2 focus:ring-white/10"
                  />
                </BaseFormField>

                <!-- Items -->
                <div class="space-y-2">
                  <div class="ml-2 flex items-center justify-between">
                    <label class="text-sm font-medium text-primary-text/80">
                      {{ translate("features.order.order_detail.add_item.form.items.label") }}
                    </label>

                    <button
                      type="button"
                      :disabled="itemFields.length >= 10"
                      class="text-xs flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                      @click="addItem"
                    >
                      + {{ translate("features.order.order_detail.add_item.form.button.add_item") }}
                    </button>
                  </div>

                  <div class="max-h-[40vh] overflow-y-auto space-y-3 pr-1">
                    <div
                      v-for="(field, index) in itemFields"
                      :key="field.key"
                      class="grid grid-cols-12 gap-3 items-center"
                    >
                      <!-- Item Name -->
                      <div class="col-span-7">
                        <BaseFormField
                          :field-name="`items.${index}.itemName`"
                          required
                          :label="
                            translate('features.order.order_detail.add_item.form.items.label')
                          "
                        >
                          <input
                            v-model="field.value.itemName"
                            type="text"
                            @input="clearItemError(`items.${index}.itemName` as any)"
                            class="w-full py-3 px-4 rounded-full bg-secondary border border-border text-primary-text outline-none focus:ring-2 focus:ring-white/10"
                          />
                        </BaseFormField>
                      </div>

                      <!-- Quantity -->
                      <div class="col-span-3">
                        <BaseFormField
                          :field-name="`items.${index}.quantity`"
                          required
                          type="number"
                          min="1"
                          :label="
                            translate('features.order.order_detail.add_item.form.quantity.label')
                          "
                        >
                          <input
                            v-model="field.value.quantity"
                            type="number"
                            min="1"
                            @input="clearItemError(`items.${index}.quantity` as any)"
                            class="w-full py-3 px-4 rounded-full bg-secondary border border-border text-primary-text outline-none focus:ring-2 focus:ring-white/10"
                          />
                        </BaseFormField>
                      </div>

                      <!-- Remove -->
                      <div class="col-span-2 flex items-end justify-center">
                        <button
                          v-if="itemFields.length > 1"
                          type="button"
                          class="text-red-400 hover:text-red-300"
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

                  <p v-if="addItemFieldError('items')" class="ml-2 text-sm text-red-400">
                    {{ addItemFieldError("items") }}
                  </p>
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
                  :label="translate('features.order.order_detail.add_item.form.button.cancel')"
                  @click="close"
                />

                <BaseButton
                  type="submit"
                  fluid
                  :loading="true"
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
