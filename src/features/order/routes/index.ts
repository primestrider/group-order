import type { RouteRecordRaw } from "vue-router"

import { OrderPageName } from "../models"

const orderRoutes: RouteRecordRaw[] = [
  {
    path: "/",
    name: OrderPageName.HOME,
    component: () => import("@/features/order/views/OrderDashboardView.vue"),
  },
  {
    path: "/order/create",
    name: OrderPageName.ORDER_CREATE,
    component: () => import("@/features/order/views/OrderCreateView.vue"),
  },
  {
    path: "/order/:id",
    name: OrderPageName.ORDER_DETAIL,
    component: () => import("@/features/order/views/OrderDetailView.vue"),
  },
]

export default orderRoutes
