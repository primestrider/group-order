import { notify } from "@kyvg/vue3-notification"

/**
 * Supported toast notification types.
 */
export type ToastType = "success" | "error" | "warn" | "info"

/**
 * Supported toast locations (notification groups).
 * Must match <Notifications group="..." /> in App.vue.
 */

/**
 * Show a toast notification.
 *
 * @param text - Main message to display
 * @param type - Notification type (default: "info")
 * @param options - Optional settings (location, title)
 */
export const showToast = (
  text: string,
  type: ToastType = "info",
  options?: {
    title?: string
  },
): void => {
  notify({
    text,
    type,
    title: options?.title,
    group: "base-toast",
  })
}
