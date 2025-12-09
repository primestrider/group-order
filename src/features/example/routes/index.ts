import type { RouteRecordRaw } from "vue-router"

import { ExamplePageName } from "../models"

const featureARoutes: RouteRecordRaw[] = [
  {
    path: "/example",
    component: () => import("@/features/example/layouts/ExampleLayout.vue"),
    children: [
      {
        path: "",
        name: ExamplePageName.EXAMPLE,
        component: () => import("@/features/example/views/ExampleView.vue"),
      },
      {
        path: "form",
        name: ExamplePageName.EXAMPLE_FORM,
        component: () => import("@/features/example/views/ExampleFormView.vue"),
      },
      {
        path: "tanstack",
        name: ExamplePageName.EXAMPLE_TANSTACK,
        component: () => import("@/features/example/views/ExampleTanstack.vue"),
      },
    ],
  },
]

export default featureARoutes
