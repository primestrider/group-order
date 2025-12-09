<script setup lang="ts">
import type { Router } from "vue-router"
import { useRoute, useRouter } from "vue-router"

type TabItem = { label: string; path: string }

const tabs: TabItem[] = [
  { label: "Example", path: "/example" },
  { label: "Example Form", path: "/example/form" },
  { label: "Example Tanstack", path: "/example/tanstack" },
]

const router: Router = useRouter()
const route = useRoute()

const isActive = (path: string) => route.path === path

const goTo = (path: string) => {
  if (path === route.path) return

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  router.push(path).catch((err: any) => {
    if (err?.name !== "NavigationDuplicated") {
      console.error(err)
    }
  })
}
</script>

<template>
  <div class="min-h-screen bg-neutral-900 text-neutral-100 py-5 md:py-10 px-2 md:px-4">
    <div class="max-w-4xl mx-auto bg-neutral-800 rounded-2xl p-2 md:p-4">
      <!-- Tabs -->
      <div
        class="flex gap-x-3 rounded-xl bg-neutral-800 p-2 md:p-4 border border-neutral-700 tab-list-stack"
      >
        <button
          v-for="tab in tabs"
          :key="tab.path"
          type="button"
          @click="goTo(tab.path)"
          :class="[
            'w-full rounded-full py-2.5 text-sm font-medium leading-5 transition-colors duration-150 focus:outline-none cursor-pointer',
            isActive(tab.path)
              ? 'bg-black text-neutral-50 shadow-lg'
              : 'text-neutral-300 bg-neutral-700 hover:bg-neutral-600 hover:text-neutral-50',
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Content area -->
      <div class="mt-2 p-2 md:p-5 border border-neutral-700 rounded-xl">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* kecil: tabs ditumpuk vertical */
@media (max-width: 640px) {
  .tab-list-stack {
    flex-direction: column;
  }
}
</style>
