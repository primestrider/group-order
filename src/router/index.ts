import { createRouter, createWebHistory } from "vue-router"

import exampleRoutes from "@/features/example/routes"
import utilRoutes from "@/shared/routes"

const listRoutes = [...exampleRoutes, ...utilRoutes]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: listRoutes,
})

export default router
