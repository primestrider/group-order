<script setup lang="ts">
import { computed } from "vue"

/**
 * BaseSkeleton
 *
 * Reusable skeleton loader component for displaying loading placeholders.
 * Designed to be responsive, readable, and consistent across the app.
 *
 * Usage example:
 * <BaseSkeleton width="lg" height="xl" />
 * <BaseSkeleton lines="3" height="sm" />
 * <BaseSkeleton height="button" rounded="full" />
 */

/**
 * Skeleton width variants.
 * - xs: 25% width
 * - sm: 33% width
 * - md: 50% width
 * - lg: 66% width
 * - xl: 75% width
 * - full: 100% width
 */
type SkeletonWidth = "xs" | "sm" | "md" | "lg" | "xl" | "full"

/**
 * Skeleton height variants.
 * - xs: very small line
 * - sm: small text
 * - md: normal text (default)
 * - lg: subtitle
 * - xl: title
 * - button: button-sized skeleton
 */
type SkeletonHeight = "xs" | "sm" | "md" | "lg" | "xl" | "button"

/**
 * Border radius variants.
 */
type SkeletonRounded = "none" | "sm" | "md" | "lg" | "full"

/**
 * Component props
 */
const {
  width = "full",
  height = "md",
  rounded = "full",
  lines = 1,
  flex = false,
} = defineProps<{
  /** Width variant of the skeleton */
  width?: SkeletonWidth

  /** Height variant of the skeleton */
  height?: SkeletonHeight

  /** Border radius style */
  rounded?: SkeletonRounded

  /** Number of skeleton lines to render */
  lines?: number

  flex?: boolean
}>()

/**
 * Maps width variant to Tailwind width classes
 */
const widthClass = computed(() => {
  return {
    xs: "w-1/4",
    sm: "w-1/3",
    md: "w-1/2",
    lg: "w-2/3",
    xl: "w-3/4",
    full: "w-full",
  }[width]
})

/**
 * Maps height variant to Tailwind height classes
 */
const heightClass = computed(() => {
  return {
    xs: "h-2",
    sm: "h-3",
    md: "h-4",
    lg: "h-6",
    xl: "h-8",
    button: "h-12",
  }[height]
})

/**
 * Maps rounded variant to Tailwind border radius classes
 */
const roundedClass = computed(() => {
  return {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  }[rounded]
})

const flexClass = computed(() => (flex ? "flex-1" : ""))
</script>

<template>
  <div class="space-y-2">
    <div
      v-for="i in lines"
      :key="i"
      class="animate-pulse bg-white/10"
      :class="[widthClass, heightClass, roundedClass, flexClass]"
    />
  </div>
</template>
