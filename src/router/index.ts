import { createRouter, createWebHistory } from "vue-router"

import orderRoutes from "@/features/order/routes"
import utilRoutes from "@/shared/routes"

const listRoutes = [...utilRoutes, ...orderRoutes]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: listRoutes,
})

export default router
