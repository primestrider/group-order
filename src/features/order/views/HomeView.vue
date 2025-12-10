<script setup lang="ts">
import { computed, ref } from "vue"
import { useRouter } from "vue-router"

import BaseButton from "@/shared/components/BaseButton.vue"
import BaseCard from "@/shared/components/BaseCard.vue"

import { OrderPageName } from "../models"

const router = useRouter()
const uuid = ref("")
const touched = ref(false)

const isValidUuid = computed<boolean>(() => {
  const v = uuid.value.trim()
  if (!v) return false
  const pattern = /^[0-9a-fA-F-]{6,36}$/
  return pattern.test(v)
})

const submitJoin = (): void => {
  touched.value = true
  if (!isValidUuid.value) return
  router.push({ path: "/join", query: { uuid: uuid.value.trim() } })
}
</script>

<template>
  <main class="min-h-screen flex flex-col items-center justify-center p-6">
    <transition
      appear
      enter-from-class="opacity-0 translate-y-4 scale-[0.985]"
      enter-active-class="transition-opacity transition-transform duration-[600ms] delay-[300ms] ease-[cubic-bezier(.16,.84,.24,1)]"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-from-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-to-class="opacity-0"
    >
      <section class="max-w-3xl w-full">
        <h1 class="text-primary-text text-4xl font-bold text-center">Group Order</h1>
        <BaseCard class="mt-5">
          <template #content>
            <!-- Actions -->

            <div class="flex flex-col gap-4">
              <h4 class="text-primary-text text-xl font-semibold">Start Order</h4>
              <!-- Create Order -->
              <RouterLink :to="{ name: OrderPageName.CREATE_ORDER }">
                <BaseButton fluid :label="'Create Order'" class="cursor-pointer"></BaseButton>
              </RouterLink>

              <!-- Divider -->
              <div class="relative my-1 flex items-center">
                <div class="flex-grow border-t border-border"></div>
                <span class="mx-3 text-secondary-text text-sm">or</span>
                <div class="flex-grow border-t border-border"></div>
              </div>

              <!-- Join by UUID -->
              <h4 class="text-primary-text text-xl font-semibold">Join Order</h4>

              <form @submit.prevent="submitJoin" class="w-full flex flex-col gap-2">
                <label class="sr-only" for="uuid">Order UUID</label>

                <div class="flex flex-col gap-3 md:flex-row md:items-center">
                  <input
                    id="uuid"
                    v-model="uuid"
                    @input="touched = true"
                    type="text"
                    placeholder="Enter Order UUID"
                    class="w-full md:flex-1 py-3 px-4 rounded-full bg-secondary border border-border text-primary-text placeholder:text-secondary-text outline-none focus:outline-none focus:ring-2 focus:ring-white/10 transition-shadow duration-200"
                    :aria-invalid="!isValidUuid"
                    aria-describedby="uuid-help"
                  />

                  <button
                    type="submit"
                    :disabled="!isValidUuid"
                    class="w-full md:w-auto px-6 py-3 rounded-full font-semibold transition-transform transform bg-accent hover:bg-accent-hover text-primary-text disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white/10 active:translate-y-0"
                  >
                    Join
                  </button>
                </div>

                <p
                  id="uuid-help"
                  class="text-sm mt-1"
                  :class="{
                    'text-danger': touched && !isValidUuid,
                    'text-secondary-text': !touched || isValidUuid,
                  }"
                >
                  <span v-if="!touched || isValidUuid">
                    You can paste the order UUID here and press Join.
                  </span>
                  <span v-else>Invalid UUID — please check and try again.</span>
                </p>
              </form>
            </div>
          </template>
        </BaseCard>
      </section>
    </transition>
  </main>
</template>
