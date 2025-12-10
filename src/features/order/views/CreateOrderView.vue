<script setup lang="ts">
import { TransitionRoot } from "@headlessui/vue"
import { onMounted, ref } from "vue"

import BaseCard from "@/shared/components/BaseCard.vue"

import { OrderPageName } from "../models"

const showSection = ref(false)

onMounted(() => {
  requestAnimationFrame(() => {
    showSection.value = true
  })
})
</script>

<template>
  <main class="min-h-screen flex flex-col items-center justify-center p-6">
    <!-- Section dengan transition -->
    <TransitionRoot
      appear
      :show="showSection"
      as="section"
      enter="transform transition duration-300 ease-out"
      enter-from="opacity-0 translate-y-4"
      enter-to="opacity-100 translate-y-0"
      leave="transform transition duration-500 ease-in"
      leave-from="opacity-100 translate-y-0"
      leave-to="opacity-0 translate-y-4"
    >
      <section class="max-w-3xl w-full flex flex-col gap-2">
        <RouterLink :to="{ name: OrderPageName.HOME }" replace
          ><span class="text-primary-text underline"> back to home</span></RouterLink
        >
        <BaseCard title="Create Order">
          <template #content>
            <span class="">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt, eius. Reiciendis
              corrupti obcaecati nemo voluptatibus nam porro minima ut. Voluptatum dolore obcaecati
              accusamus consequuntur doloribus saepe quaerat dicta fugit facilis.
            </span>
          </template>
        </BaseCard>
      </section>
    </TransitionRoot>
  </main>
</template>
