import type { RouteRecordRaw } from "vue-router"

import { OrderPageName } from "../models"

const orderRoutes: RouteRecordRaw[] = [
  {
    path: "/",
    name: OrderPageName.HOME,
    component: () => import("@/features/order/views/HomeView.vue"),
  },
  {
    path: "/order/create",
    name: OrderPageName.CREATE_ORDER,
    component: () => import("@/features/order/views/CreateOrderView.vue"),
  },
  {
    path: "/order",
    name: OrderPageName.ORDER,
    component: () => import("@/features/order/views/OrderView.vue"),
  },
]

export default orderRoutes
