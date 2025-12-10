<script setup lang="ts">
const { title } = defineProps<{ title?: string }>()
</script>

<template>
  <section
    class="bg-secondary border border-border rounded-2xl p-2 md:p-4 shadow-lg flex flex-col gap-5"
    aria-labelledby="card"
  >
    <h4 v-if="title" class="text-primary-text text-xl font-semibold">{{ title }}</h4>
    <slot name="content"> </slot>
  </section>
</template>
