import type { RouteRecordRaw } from "vue-router"

import { UtilsPageName } from "../models"

const utilRoutes: RouteRecordRaw[] = [
  {
    path: "/:pathMatch(.*)*",
    name: UtilsPageName.PAGE_NOT_FOUND,
    component: () => import("@/shared/views/PageNotFound.vue"),
  },
]

export default utilRoutes
