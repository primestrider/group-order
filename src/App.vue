<script setup lang="ts">
import { RouterView } from "vue-router"

import BaseToast from "./shared/components/BaseToast.vue"
</script>

<template>
  <BaseToast></BaseToast>
  <RouterView class="font-outfit bg-primary" />
</template>
