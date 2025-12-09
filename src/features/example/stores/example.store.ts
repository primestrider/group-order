import { defineStore } from "pinia"
import { computed, ref } from "vue"

import type { ExampleTodo, ExampleUser } from "../models"

export const useExampleStore = defineStore("example", () => {
  /**
   * State to store counter value
   */
  const count = ref<number>(0)

  /**
   * State to store currently logged-in user data
   */
  const user = ref<ExampleUser>({
    name: "John Doe",
    age: 25,
    isLogin: false,
  })

  /**
   * State to store exampleTodos list
   */
  const exampleTodos = ref<ExampleTodo[]>([
    { id: 1, title: "Learning Vue", done: false },
    { id: 2, title: "Learning Typescript", done: true },
    { id: 3, title: "Learning Axios", done: true },
  ])

  /**
   * Getter to get the double value of count
   * @returns The double value of count
   */
  const doubleCount = computed<number>(() => count.value * 2)

  /**
   * Getter to get completed todos only
   * @returns Array of todos with done status set to true
   */
  const completedTodos = computed<ExampleTodo[]>(() => {
    return exampleTodos.value.filter((todo) => todo.done)
  })

  /**
   * Getter to check whether user is authenticated or not
   * @returns True if user is logged in
   */
  const isAuthenticated = computed<boolean>(() => user.value.isLogin)

  /**
   * Increase count value by 1
   */
  const increment = (): void => {
    count.value++
  }

  /**
   * Decrease count value by 1
   * Count value will never go below zero
   */
  const decrement = (): void => {
    if (count.value > 0) {
      count.value--
    }
  }

  /**
   * Log in user by updating username and login status
   * @param name - The name of the user who will log in
   */
  const login = (name: string): void => {
    user.value.name = name
    user.value.isLogin = true
  }

  /**
   * Log out the current user
   */
  const logout = (): void => {
    user.value.isLogin = false
  }

  /**
   * Add a new exampleTodos to the exampleTodos list
   * @param title - The title of the exampleTodos
   */
  const addTodo = (title: string): void => {
    exampleTodos.value.push({
      id: Date.now(),
      title,
      done: false,
    })
  }

  /**
   * Toggle exampleTodos status (completed / not completed)
   * @param id - The ID of the exampleTodos to be toggled
   */
  const toggleTodo = (id: number): void => {
    const todo = exampleTodos.value.find((t) => t.id === id)
    if (todo) {
      todo.done = !todo.done
    }
  }

  /**
   * Remove a exampleTodos by its ID
   * @param id - The ID of the exampleTodos to be removed
   */
  const removeTodo = (id: number): void => {
    exampleTodos.value = exampleTodos.value.filter((t) => t.id !== id)
  }

  return {
    count,
    user,
    exampleTodos,

    doubleCount,
    completedTodos,
    isAuthenticated,

    increment,
    decrement,
    login,
    logout,
    addTodo,
    toggleTodo,
    removeTodo,
  }
})
