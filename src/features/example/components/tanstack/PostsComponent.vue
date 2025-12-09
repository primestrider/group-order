<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query"

import type { JsonPlaceholderComment, JsonPlaceholderPost } from "../../models/api.model"
import {
  createPost as createPostApi,
  fetchCommentsByPostId,
  fetchPostById,
  fetchPosts,
} from "../../services/api"

/**
 * Example post ID used to demonstrate detail and comments fetching.
 */
const EXAMPLE_POST_ID = 1 as const

/**
 * TanStack Query client instance.
 * Used for cache updates and manual invalidations.
 */
const queryClient = useQueryClient()

/**
 * Posts list query.
 *
 * - `queryKey` is namespaced (`["jsonplaceholder", "posts"]`) to avoid collisions.
 * - `staleTime` keeps the data "fresh" for 60 seconds before being considered stale.
 *
 * @see https://jsonplaceholder.typicode.com/posts
 */
const {
  data: posts,
  isLoading: isPostsLoading,
  isError: isPostsError,
} = useQuery<JsonPlaceholderPost[], Error>({
  queryKey: ["jsonplaceholder", "posts"],
  queryFn: fetchPosts,
})

/**
 * Single post detail query.
 *
 * @see https://jsonplaceholder.typicode.com/posts/{id}
 */
const {
  data: postDetail,
  isLoading: isPostDetailLoading,
  isError: isPostDetailError,
} = useQuery<JsonPlaceholderPost, Error>({
  queryKey: ["jsonplaceholder", "post", EXAMPLE_POST_ID],
  queryFn: () => fetchPostById(EXAMPLE_POST_ID),
})

/**
 * Comments for a specific post query.
 *
 * @see https://jsonplaceholder.typicode.com/posts/{id}/comments
 */
const {
  data: comments,
  isLoading: isCommentsLoading,
  isError: isCommentsError,
} = useQuery<JsonPlaceholderComment[], Error>({
  queryKey: ["jsonplaceholder", "post", EXAMPLE_POST_ID, "comments"],
  queryFn: () => fetchCommentsByPostId(EXAMPLE_POST_ID),
})

/**
 * Mutation to create a new post.
 *
 * JSONPlaceholder does not persist the created resource,
 * but the response can still be used to demonstrate API integration.
 *
 * On success, this mutation prepends the newly created post
 * to the cached posts list (if it exists).
 */
const {
  mutate: mutateCreatePost,
  data: createdPost,
  isPending: isCreatePostPending,
  isSuccess: isCreatePostSuccess,
} = useMutation<JsonPlaceholderPost, Error, Omit<JsonPlaceholderPost, "id">>({
  mutationKey: ["jsonplaceholder", "posts", "create"],
  mutationFn: (payload) => createPostApi(payload),
  onSuccess: (newPost) => {
    queryClient.setQueryData<JsonPlaceholderPost[] | undefined>(
      ["jsonplaceholder", "posts"],
      (old) => (old ? [newPost, ...old] : [newPost]),
    )
  },
})

/**
 * Click handler for the "Create Sample Post" button.
 *
 * Sends a fake post payload to JSONPlaceholder, which
 * returns a mock created post object.
 */
const handleCreatePost = (): void => {
  mutateCreatePost({
    userId: 1,
    title: "Sample Post from Vue Query",
    body: "This is a fake post created only for demo purposes.",
  })
}
</script>

<template>
  <div class="space-y-4">
    <!-- POSTS + CREATE POST -->
    <div class="space-y-3 rounded-xl border border-neutral-700 bg-neutral-800 p-4">
      <div class="flex items-center justify-between gap-2">
        <h3 class="text-lg font-semibold">Posts</h3>

        <button
          type="button"
          class="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
          :disabled="isCreatePostPending"
          @click="handleCreatePost"
        >
          {{ isCreatePostPending ? "Creating..." : "Create Sample Post" }}
        </button>
      </div>

      <p class="text-xs text-neutral-400">
        Status:
        <span v-if="isPostsLoading">loading...</span>
        <span v-else-if="isPostsError">error loading posts</span>
        <span v-else>
          loaded
          {{ posts ? posts.length : 0 }}
          posts
        </span>
      </p>

      <ul v-if="posts && !isPostsError" class="max-h-40 space-y-1 overflow-auto text-sm">
        <li v-for="post in posts" :key="post.id" class="truncate">
          <span class="text-xs text-neutral-500">#{{ post.id }}</span>
          <span class="ml-2 font-medium">{{ post.title }}</span>
        </li>
      </ul>

      <div
        v-if="isCreatePostSuccess && createdPost"
        class="mt-2 rounded-md border border-emerald-600 bg-emerald-900/40 p-2 text-xs"
      >
        <p class="font-semibold">Last created post (fake):</p>
        <p class="mt-1">
          <span class="font-medium">{{ createdPost.title }}</span>
          — {{ createdPost.body }}
        </p>
      </div>
    </div>

    <!-- DETAIL + COMMENTS -->
    <div class="grid gap-4 md:grid-cols-2">
      <!-- SINGLE POST -->
      <div class="space-y-2 rounded-xl border border-neutral-700 bg-neutral-800 p-4">
        <h3 class="font-semibold">Single Post (ID = 1)</h3>
        <p class="text-xs text-neutral-400">
          Status:
          <span v-if="isPostDetailLoading">loading...</span>
          <span v-else-if="isPostDetailError">error</span>
          <span v-else>success</span>
        </p>

        <div v-if="postDetail && !isPostDetailError" class="space-y-1 text-sm">
          <p class="font-semibold">
            {{ postDetail.title }}
          </p>
          <p class="text-neutral-300">
            {{ postDetail.body }}
          </p>
        </div>
      </div>

      <!-- COMMENTS -->
      <div class="space-y-2 rounded-xl border border-neutral-700 bg-neutral-800 p-4">
        <h3 class="font-semibold">Comments for Post #1</h3>
        <p class="text-xs text-neutral-400">
          Status:
          <span v-if="isCommentsLoading">loading...</span>
          <span v-else-if="isCommentsError">error</span>
          <span v-else>
            loaded
            {{ comments ? comments.length : 0 }}
            comments
          </span>
        </p>

        <ul v-if="comments && !isCommentsError" class="max-h-32 space-y-1 overflow-auto text-xs">
          <li v-for="comment in comments.slice(0, 5)" :key="comment.id">
            <span class="font-semibold">{{ comment.email }}</span
            >:
            <span class="text-neutral-300">{{ comment.body }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
