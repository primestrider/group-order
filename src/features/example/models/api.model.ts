/**
 * Represents a post resource from JSONPlaceholder.
 *
 * @see https://jsonplaceholder.typicode.com/posts
 */
export type JsonPlaceholderPost = {
  userId: number
  id: number
  title: string
  body: string
}

/**
 * Represents a comment resource from JSONPlaceholder.
 *
 * @see https://jsonplaceholder.typicode.com/comments
 */
export type JsonPlaceholderComment = {
  postId: number
  id: number
  name: string
  email: string
  body: string
}

/**
 * Represents a user resource from JSONPlaceholder.
 *
 * @see https://jsonplaceholder.typicode.com/users
 */
export type JsonPlaceholderUser = {
  id: number
  name: string
  username: string
  email: string
}

/**
 * Represents a todos resource from JSONPlaceholder.
 *
 * @see https://jsonplaceholder.typicode.com/todos
 */
export type JsonPlaceholderTodo = {
  userId: number
  id: number
  title: string
  completed: boolean
}

/**
 * Represents an album resource from JSONPlaceholder.
 *
 * @see https://jsonplaceholder.typicode.com/albums
 */
export type JsonPlaceholderAlbum = {
  userId: number
  id: number
  title: string
}

/**
 * Represents a photo resource from JSONPlaceholder.
 *
 * @see https://jsonplaceholder.typicode.com/photos
 */
export type JsonPlaceholderPhoto = {
  albumId: number
  id: number
  title: string
  url: string
  thumbnailUrl: string
}
