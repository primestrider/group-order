<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod"
import { storeToRefs } from "pinia"
import { useForm } from "vee-validate"

import { translate } from "@/plugins/language"

import { type LoginFormValues, loginZodSchema } from "../models/form.schema"
import { useExampleStore } from "../stores/example.store"

/**
 * Initialize Example Pinia Store instance.
 * Acts as the single source of truth for authentication state.
 */
const exampleStore = useExampleStore()

/**
 * Destructure authentication-related action from the store.
 */
const { login } = exampleStore

/**
 * Convert reactive state & getters from the store into refs
 * to preserve reactivity after destructuring.
 */
const { user, isAuthenticated } = storeToRefs(exampleStore)

/**
 * Initialize vee-validate form state using `useForm`.
 *
 * - `values`  → reactive form values (acts like `reactive(form)`)
 * - `errors`  → validation errors per field
 * - `handleSubmit` → wrapper for safe submit (validates first)
 * - `resetForm` → utility to reset form values & meta
 *
 * The form is prefilled using the current user's name from the store.
 */
const { handleSubmit, resetForm } = useForm<LoginFormValues>({
  validationSchema: toTypedSchema(loginZodSchema),
  initialValues: {
    name: user.value.name,
  },
})

/**
 * Handle login form submission.
 *
 * Flow:
 * 1. Receives already validated form values from vee-validate
 * 2. Dispatches `login` action to Pinia store
 * 3. Resets the form back to empty state
 *
 * @param values - Validated login form values
 */
const handleLogin = handleSubmit((values) => {
  login(values.name)

  resetForm({
    values: { name: "" },
  })
})
</script>

<template>
  <section
    class="flex flex-col gap-6 p-4 text-slate-100 border border-neutral-700 shadow-lg rounded-xl"
  >
    <h3 class="text-lg font-semibold">
      {{ translate("features.example.form.login_title") }}
    </h3>

    <VForm @submit="handleLogin" class="space-y-3">
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-300">
          {{ translate("features.example.form.input.name.label") }}
        </label>

        <VField
          name="name"
          as="input"
          type="text"
          class="block w-full rounded-full mt-2 bg-neutral-700 px-3 py-2 text-sm text-slate-100"
        />

        <VErrorMessage name="name" class="mt-1 block text-xs text-red-400" />
      </div>

      <button
        type="submit"
        class="w-full rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
      >
        {{ translate("features.example.form.button.login") }}
      </button>
    </VForm>

    <p class="text-sm text-slate-400">
      Current user:
      <span class="font-medium text-slate-100">{{ user.name }}</span>
      <span v-if="isAuthenticated" class="ml-1 text-green-400">(logged in)</span>
      <span v-else class="ml-1 text-red-400">(not logged in)</span>
    </p>
  </section>
</template>
