<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query"

import type { JsonPlaceholderComment } from "../../models/api.model"
import { fetchCommentsByPostId } from "../../services/api"

/**
 * Example post ID used to demonstrate comments fetching.
 */
const EXAMPLE_COMMENT_ID = 1 as const

/**
 * Query to fetch comments for a specific post.
 *
 * @see https://jsonplaceholder.typicode.com/posts/{id}/comments
 */
const {
  data: comments,
  isLoading: isCommentsLoading,
  isError: isCommentsError,
} = useQuery<JsonPlaceholderComment[], Error>({
  queryKey: ["jsonplaceholder", "post", EXAMPLE_COMMENT_ID, "comments"],
  queryFn: () => fetchCommentsByPostId(EXAMPLE_COMMENT_ID),
})
</script>

<template>
  <div class="space-y-3 rounded-xl border border-neutral-700 bg-neutral-800 p-4">
    <h3 class="text-lg font-semibold">Comments for Post #1</h3>

    <p class="text-xs text-neutral-400">
      Status:
      <span v-if="isCommentsLoading">loading...</span>
      <span v-else-if="isCommentsError">error loading comments</span>
      <span v-else> loaded {{ comments ? comments.length : 0 }} comments </span>
    </p>

    <ul v-if="comments && !isCommentsError" class="max-h-40 space-y-1 overflow-auto text-xs">
      <li v-for="comment in comments" :key="comment.id">
        <p class="font-semibold">{{ comment.email }}</p>
        <p class="text-neutral-300">
          {{ comment.body }}
        </p>
      </li>
    </ul>
  </div>
</template>
