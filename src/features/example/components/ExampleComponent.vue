<script setup lang="ts">
import { computed, ref } from "vue"

/* =========================================================
 * BASIC INTERACTIVE STATES
 * ======================================================= */

/**
 * Counter state untuk demo interaksi tombol
 */
const counter = ref<number>(0)

/**
 * State untuk input teks
 */
const name = ref<string>("")

/**
 * Toggle state (ON / OFF)
 */
const isEnabled = ref<boolean>(false)

/**
 * Progress value (0 - 100)
 */
const progress = ref<number>(40)

/**
 * Label status hasil dari toggle
 */
const statusLabel = computed<string>(() => (isEnabled.value ? "AKTIF" : "NON-AKTIF"))

/* =========================================================
 * METHODS
 * ======================================================= */

/**
 * Menambah nilai counter sebesar 1
 */
const increment = (): void => {
  counter.value++
}

/**
 * Mengurangi nilai counter sebesar 1
 */
const decrement = (): void => {
  counter.value--
}

/**
 * Toggle status ON / OFF
 */
const toggleStatus = (): void => {
  isEnabled.value = !isEnabled.value
}

/**
 * Menambah progress sebesar 10 (maks 100)
 */
const increaseProgress = (): void => {
  if (progress.value < 100) progress.value += 10
}

/**
 * Mengurangi progress sebesar 10 (min 0)
 */
const decreaseProgress = (): void => {
  if (progress.value > 0) progress.value -= 10
}
</script>

<template>
  <div class="space-y-6">
    <!-- ================= HEADER ================= -->
    <section class="rounded-2xl border border-neutral-700 bg-neutral-800 p-5">
      <h2 class="text-xl font-semibold text-white">UI Example Component</h2>
      <p class="mt-1 text-sm text-neutral-300">
        Halaman ini berisi contoh berbagai komponen UI sederhana: counter, input, button, toggle,
        badge, alert, progress, dan kartu statistik.
      </p>
    </section>

    <!-- ================= GRID SECTION ================= -->
    <section class="grid gap-4 md:grid-cols-2">
      <!-- ========= COUNTER ========= -->
      <div class="rounded-2xl border border-neutral-700 bg-neutral-800 p-5">
        <h3 class="font-semibold text-white">Counter</h3>
        <p class="text-sm text-neutral-400">Contoh interaksi tombol dengan state reaktif.</p>

        <div class="mt-4 flex items-center gap-3">
          <button
            @click="decrement"
            class="rounded-full border border-neutral-600 px-3 py-1 text-sm hover:bg-neutral-700"
          >
            -1
          </button>

          <div
            class="min-w-[70px] rounded-xl bg-black px-4 py-2 text-center text-xl font-bold text-emerald-400"
          >
            {{ counter }}
          </div>

          <button
            @click="increment"
            class="rounded-full bg-emerald-500 px-3 py-1 text-sm font-medium text-black hover:bg-emerald-400"
          >
            +1
          </button>
        </div>
      </div>

      <!-- ========= INPUT PREVIEW ========= -->
      <div class="rounded-2xl border border-neutral-700 bg-neutral-800 p-5">
        <h3 class="font-semibold text-white">Text Input</h3>
        <p class="text-sm text-neutral-400">Demo binding input menggunakan <code>v-model</code>.</p>

        <input
          v-model="name"
          type="text"
          placeholder="Ketik sesuatu..."
          class="mt-3 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />

        <div class="mt-3 rounded-xl bg-neutral-900 p-3 text-sm">
          Preview:
          <span class="font-semibold text-emerald-400">
            {{ name || "Belum diisi" }}
          </span>
        </div>
      </div>
    </section>

    <!-- ================= BUTTON VARIANTS ================= -->
    <section class="rounded-2xl border border-neutral-700 bg-neutral-800 p-5">
      <h3 class="font-semibold text-white">Button Variants</h3>

      <div class="mt-4 flex flex-wrap gap-2">
        <button class="rounded-xl bg-blue-600 px-4 py-2 text-sm hover:bg-blue-500">Primary</button>

        <button class="rounded-xl bg-neutral-700 px-4 py-2 text-sm hover:bg-neutral-600">
          Secondary
        </button>

        <button class="rounded-xl bg-emerald-600 px-4 py-2 text-sm hover:bg-emerald-500">
          Success
        </button>

        <button class="rounded-xl bg-red-600 px-4 py-2 text-sm hover:bg-red-500">Danger</button>
      </div>
    </section>

    <!-- ================= TOGGLE & BADGE ================= -->
    <section class="grid gap-4 md:grid-cols-2">
      <!-- Toggle -->
      <div class="rounded-2xl border border-neutral-700 bg-neutral-800 p-5">
        <h3 class="font-semibold text-white">Toggle</h3>

        <div class="mt-4 flex items-center justify-between">
          <span class="text-sm text-neutral-300">
            Status:
            <span :class="isEnabled ? 'text-emerald-400' : 'text-red-400'" class="font-semibold">
              {{ statusLabel }}
            </span>
          </span>

          <button
            @click="toggleStatus"
            class="relative inline-flex h-6 w-11 items-center rounded-full border border-neutral-700 bg-neutral-900"
          >
            <span
              class="h-4 w-4 rounded-full bg-white transition"
              :class="isEnabled ? 'translate-x-6' : 'translate-x-1'"
            />
          </button>
        </div>
      </div>

      <!-- Badges -->
      <div class="rounded-2xl border border-neutral-700 bg-neutral-800 p-5">
        <h3 class="font-semibold text-white">Badges</h3>

        <div class="mt-4 flex gap-2 flex-wrap">
          <span class="rounded-full bg-blue-500 px-3 py-1 text-xs">Info</span>
          <span class="rounded-full bg-emerald-500 px-3 py-1 text-xs">Success</span>
          <span class="rounded-full bg-yellow-500 px-3 py-1 text-xs text-black"> Warning </span>
          <span class="rounded-full bg-red-500 px-3 py-1 text-xs">Error</span>
        </div>
      </div>
    </section>

    <!-- ================= PROGRESS ================= -->
    <section class="rounded-2xl border border-neutral-700 bg-neutral-800 p-5">
      <h3 class="font-semibold text-white">Progress Bar</h3>

      <div class="mt-4 h-3 w-full overflow-hidden rounded-full bg-neutral-700">
        <div class="h-full bg-emerald-500 transition-all" :style="{ width: progress + '%' }" />
      </div>

      <div class="mt-3 flex gap-2">
        <button @click="decreaseProgress" class="rounded-xl bg-neutral-700 px-3 py-1 text-sm">
          -10
        </button>
        <button @click="increaseProgress" class="rounded-xl bg-emerald-600 px-3 py-1 text-sm">
          +10
        </button>

        <span class="ml-auto text-sm text-neutral-300"> {{ progress }}% </span>
      </div>
    </section>

    <!-- ================= ALERTS ================= -->
    <section class="grid gap-3 md:grid-cols-3">
      <div class="rounded-xl bg-blue-900/40 border border-blue-700 p-4 text-sm">
        Ini adalah alert Info.
      </div>

      <div class="rounded-xl bg-emerald-900/40 border border-emerald-700 p-4 text-sm">
        Ini adalah alert Success.
      </div>

      <div class="rounded-xl bg-red-900/40 border border-red-700 p-4 text-sm">
        Ini adalah alert Error.
      </div>
    </section>
  </div>
</template>
