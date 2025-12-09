<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod"
import { storeToRefs } from "pinia"

import { translate } from "@/plugins/language"

import {
  type LoginFormValues,
  type TodoFormValues,
  loginZodSchema,
  todoZodSchema,
} from "../models/form.schema"
import { useExampleStore } from "../stores/example.store"

/**
 * Initialize Example Pinia Store instance.
 * Used as the single source of truth for user & exampleTodo state.
 */
const exampleStore = useExampleStore()

/**
 * Destructure actions from the Example Store.
 */
const { login, addTodo, toggleTodo, removeTodo } = exampleStore

/**
 * Convert reactive state & getters from the store into refs
 * to preserve reactivity after destructuring.
 */
const { user, isAuthenticated, exampleTodos } = storeToRefs(exampleStore)

/**
 * Typed vee-validate schema for Login form.
 * Generated from Zod schema.
 */
const loginSchema = toTypedSchema(loginZodSchema)

/**
 * Typed vee-validate schema for exampleTodo form.
 * Generated from Zod schema.
 */
const todoSchema = toTypedSchema(todoZodSchema)

/**
 * Handle login form submission.
 * Will update the user state and authentication status.
 *
 * @param values - Validated login form values
 */
const handleLogin = (values: LoginFormValues) => {
  login(values.name)
}

/**
 * Handle add exampleTodo form submission.
 * Will append a new exampleTodo item into the store.
 *
 * @param values - Validated exampleTodo form values
 */
const handleAddTodo = (values: TodoFormValues) => {
  addTodo(values.title)
}
</script>

<template>
  <section class="flex flex-col gap-3 text-slate-100">
    <h2 class="text-xl font-semibold text-slate-100">
      {{ translate("features.example.form.title") }}
    </h2>

    <!-- LOGIN FORM -->
    <div class="space-y-4 rounded-xl p-4 border border-neutral-700 shadow-lg">
      <h3 class="text-lg font-semibold text-slate-100">
        {{ translate("features.example.form.login_title") }}
      </h3>

      <VForm :validation-schema="loginSchema" @submit="handleLogin" class="space-y-3">
        <div>
          <label for="login-name" class="mb-1 block text-sm font-medium text-slate-300">
            {{ translate("features.example.form.input.name.label") }}
          </label>
          <VField
            id="login-name"
            name="name"
            as="input"
            type="text"
            class="block w-full rounded-full mt-2 bg-neutral-700 px-3 py-2 text-sm text-slate-100 shadow-sm outline-none placeholder:text-slate-500 focus:-blue-500 focus:ring-2 focus:ring-blue-600"
          />
          <VErrorMessage name="name" class="mt-1 block text-xs text-red-400" />
        </div>

        <button
          type="submit"
          class="w-full inline-flex items-center justify-center bg-neutral-900 rounded-full px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          {{ translate("features.example.form.button.login") }}
        </button>
      </VForm>

      <p class="text-sm text-slate-400">
        Current user:
        <span class="font-medium text-slate-100">
          {{ user.name }}
        </span>
        <span v-if="isAuthenticated" class="ml-1 text-green-400"> (logged in) </span>
        <span v-else class="ml-1 text-red-400"> (not logged in) </span>
      </p>
    </div>

    <!-- ADD TODO FORM -->
    <div class="space-y-4 rounded-xl p-4 border border-neutral-700 shadow-lg">
      <h3 class="text-lg font-semibold text-slate-100">Add Todo</h3>

      <VForm :validation-schema="todoSchema" @submit="handleAddTodo" class="space-y-3">
        <div>
          <label for="exampleTodo-title" class="mb-1 block text-sm font-medium text-slate-300">
            Todo Title
          </label>
          <VField
            id="exampleTodo-title"
            name="title"
            as="input"
            type="text"
            class="block w-full rounded-full mt-2 bg-neutral-700 px-3 py-2 text-sm text-slate-100 shadow-sm outline-none placeholder:text-slate-500 focus:-blue-500 focus:ring-2 focus:ring-blue-600"
          />
          <VErrorMessage name="title" class="mt-1 block text-xs text-red-400" />
        </div>

        <button
          type="submit"
          class="w-full inline-flex items-center justify-center bg-neutral-900 rounded-full px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          Add Todo
        </button>
      </VForm>

      <ul class="space-y-2 text-sm">
        <li
          v-for="exampleTodo in exampleTodos"
          :key="exampleTodo.id"
          class="flex items-center justify-between rounded-full bg-neutral-700 px-3 py-2"
        >
          <span
            class="truncate"
            :class="{
              'line-through text-slate-500': exampleTodo.done,
              'text-slate-100': !exampleTodo.done,
            }"
          >
            {{ exampleTodo.title }}
          </span>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="text-xs font-medium text-blue-400 hover:text-blue-300"
              @click="toggleTodo(exampleTodo.id)"
            >
              toggle
            </button>
            <button
              type="button"
              class="text-xs font-medium text-red-400 hover:text-red-300"
              @click="removeTodo(exampleTodo.id)"
            >
              remove
            </button>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>
