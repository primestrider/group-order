import axiosInstance from "@/plugins/axios"
import type { CustomAxiosRequestConfig } from "@/shared/models/api"

import type {
  JsonPlaceholderAlbum,
  JsonPlaceholderComment,
  JsonPlaceholderPhoto,
  JsonPlaceholderPost,
  JsonPlaceholderTodo,
  JsonPlaceholderUser,
} from "../models/api.model"

/* =========================================================
 * POSTS API
 * ======================================================= */

/**
 * Fetch all posts.
 *
 * Endpoint:
 * GET /posts
 *
 * @returns {Promise<JsonPlaceholderPost[]>} Array of post objects
 */
export const fetchPosts = async (): Promise<JsonPlaceholderPost[]> => {
  const config: CustomAxiosRequestConfig = {
    url: "https://jsonplaceholder.typicode.com/posts",
    method: "GET",
  }

  const { data } = await axiosInstance.request<JsonPlaceholderPost[]>(config)
  return data
}

/**
 * Fetch a single post by ID.
 *
 * Endpoint:
 * GET /posts/{id}
 *
 * @param {number} id - Unique identifier of the post
 * @returns {Promise<JsonPlaceholderPost>} Post detail object
 */
export const fetchPostById = async (id: number): Promise<JsonPlaceholderPost> => {
  const config: CustomAxiosRequestConfig = {
    url: `https://jsonplaceholder.typicode.com/posts/${id}`,
    method: "GET",
  }

  const { data } = await axiosInstance.request<JsonPlaceholderPost>(config)
  return data
}

/**
 * Create a new post (simulated, not persisted in JSONPlaceholder).
 *
 * Endpoint:
 * POST /posts
 *
 * @param {Omit<JsonPlaceholderPost, "id">} payload - Post payload without ID
 * @returns {Promise<JsonPlaceholderPost>} Created post response
 */
export const createPost = async (
  payload: Omit<JsonPlaceholderPost, "id">,
): Promise<JsonPlaceholderPost> => {
  const config: CustomAxiosRequestConfig<Omit<JsonPlaceholderPost, "id">> = {
    url: "https://jsonplaceholder.typicode.com/posts",
    method: "POST",
    data: payload,
  }

  const { data } = await axiosInstance.request<JsonPlaceholderPost>(config)
  return data
}

/* =========================================================
 * COMMENTS API
 * ======================================================= */

/**
 * Fetch all comments by post ID.
 *
 * Endpoint:
 * GET /posts/{postId}/comments
 *
 * @param {number} postId - ID of the related post
 * @returns {Promise<JsonPlaceholderComment[]>} List of comments
 */
export const fetchCommentsByPostId = async (postId: number): Promise<JsonPlaceholderComment[]> => {
  const config: CustomAxiosRequestConfig = {
    url: `https://jsonplaceholder.typicode.com/posts/${postId}/comments`,
    method: "GET",
  }

  const { data } = await axiosInstance.request<JsonPlaceholderComment[]>(config)
  return data
}

/* =========================================================
 * USERS API
 * ======================================================= */

/**
 * Fetch all users.
 *
 * Endpoint:
 * GET /users
 *
 * @returns {Promise<JsonPlaceholderUser[]>} List of users
 */
export const fetchUsers = async (): Promise<JsonPlaceholderUser[]> => {
  const config: CustomAxiosRequestConfig = {
    url: "https://jsonplaceholder.typicode.com/users",
    method: "GET",
  }

  const { data } = await axiosInstance.request<JsonPlaceholderUser[]>(config)
  return data
}

/**
 * Fetch user detail by ID.
 *
 * Endpoint:
 * GET /users/{id}
 *
 * @param {number} id - User ID
 * @returns {Promise<JsonPlaceholderUser>} User detail
 */
export const fetchUserById = async (id: number): Promise<JsonPlaceholderUser> => {
  const config: CustomAxiosRequestConfig = {
    url: `https://jsonplaceholder.typicode.com/users/${id}`,
    method: "GET",
  }

  const { data } = await axiosInstance.request<JsonPlaceholderUser>(config)
  return data
}

/* =========================================================
 * TODOS API
 * ======================================================= */

/**
 * Fetch all todos.
 *
 * Endpoint:
 * GET /todos
 *
 * @returns {Promise<JsonPlaceholderTodo[]>} List of todos
 */
export const fetchTodos = async (): Promise<JsonPlaceholderTodo[]> => {
  const config: CustomAxiosRequestConfig = {
    url: "https://jsonplaceholder.typicode.com/todos",
    method: "GET",
  }

  const { data } = await axiosInstance.request<JsonPlaceholderTodo[]>(config)
  return data
}

/**
 * Fetch all todos by user ID.
 *
 * Endpoint:
 * GET /users/{userId}/todos
 *
 * @param {number} userId - User ID
 * @returns {Promise<JsonPlaceholderTodo[]>} List of user's todos
 */
export const fetchTodosByUserId = async (userId: number): Promise<JsonPlaceholderTodo[]> => {
  const config: CustomAxiosRequestConfig = {
    url: `https://jsonplaceholder.typicode.com/users/${userId}/todos`,
    method: "GET",
  }

  const { data } = await axiosInstance.request<JsonPlaceholderTodo[]>(config)
  return data
}

/* =========================================================
 * ALBUMS & PHOTOS API
 * ======================================================= */

/**
 * Fetch albums by user ID.
 *
 * Endpoint:
 * GET /users/{userId}/albums
 *
 * @param {number} userId - User ID
 * @returns {Promise<JsonPlaceholderAlbum[]>} List of albums
 */
export const fetchAlbumsByUserId = async (userId: number): Promise<JsonPlaceholderAlbum[]> => {
  const config: CustomAxiosRequestConfig = {
    url: `https://jsonplaceholder.typicode.com/users/${userId}/albums`,
    method: "GET",
  }

  const { data } = await axiosInstance.request<JsonPlaceholderAlbum[]>(config)
  return data
}

/**
 * Fetch photos by album ID.
 *
 * Endpoint:
 * GET /albums/{albumId}/photos
 *
 * @param {number} albumId - Album ID
 * @returns {Promise<JsonPlaceholderPhoto[]>} List of photos
 */
export const fetchPhotosByAlbumId = async (albumId: number): Promise<JsonPlaceholderPhoto[]> => {
  const config: CustomAxiosRequestConfig = {
    url: `https://jsonplaceholder.typicode.com/albums/${albumId}/photos`,
    method: "GET",
  }

  const { data } = await axiosInstance.request<JsonPlaceholderPhoto[]>(config)
  return data
}
