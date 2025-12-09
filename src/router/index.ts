import { createRouter, createWebHistory } from "vue-router"

import exampleRoutes from "@/features/example/routes"
import utilRoutes from "@/shared/routes"
import orderRoutes from '@/features/order/routes'

const listRoutes = [...exampleRoutes, ...utilRoutes,
  ...orderRoutes,
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: listRoutes,
})

export default router
