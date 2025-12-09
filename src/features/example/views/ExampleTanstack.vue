<script setup lang="ts">
import CommentsComponent from "../components/tanstack/CommentsComponent.vue"
import PostsComponent from "../components/tanstack/PostsComponent.vue"
</script>

<template>
  <section class="space-y-6 p-4 text-slate-100">
    <header>
      <h2 class="text-xl font-semibold">TanStack Query JSONPlaceholder Demo</h2>
    </header>

    <PostsComponent></PostsComponent>
    <CommentsComponent></CommentsComponent>
  </section>
</template>
