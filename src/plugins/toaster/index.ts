import Notifications from "@kyvg/vue3-notification"
import type { App } from "vue"

/**
 * Install vue3-notification plugin.
 *
 * This plugin provides a global `$notify` method
 * and the `<Notifications />` component.
 *
 * Must be installed once during app bootstrap.
 *
 * @param app - Vue application instance
 */
export const installToaster = (app: App): void => {
  app.use(Notifications)
}
