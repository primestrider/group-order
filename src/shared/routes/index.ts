import type { RouteRecordRaw } from "vue-router"

import { UtilsPageName } from "../models"

const utilRoutes: RouteRecordRaw[] = [
  // delete or change this later
  {
    path: "/landing",
    name: "LandingPage",
    component: () => import("@/shared/views/LandingPageView.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    name: UtilsPageName.PAGE_NOT_FOUND,
    component: () => import("@/shared/views/PageNotFound.vue"),
  },
]

export default utilRoutes
