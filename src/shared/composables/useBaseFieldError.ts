import { ref } from "vue"
import type { Ref } from "vue"

/**
 * useBaseFieldError
 *
 * Helper composable to merge:
 * - Client-side validation errors (vee-validate)
 * - Backend error (single top-level field only)
 *
 * DESIGN RULES:
 * - Backend error is allowed ONLY on top-level form fields (keyof T)
 * - Nested paths (e.g. `items.0.name`) are NOT supported by design
 * - Dynamic field array validation is handled by vee-validate
 * - Backend error always has higher priority than client-side error
 *
 * RECOMMENDED USAGE:
 * - Use this composable ONLY for backend errors
 * - Clear backend error when user edits the related top-level field
 *
 * @template T - Form values type
 *
 * @param clientErrors - Reactive vee-validate errors object
 */
export const useBaseFieldError = <T extends Record<string, unknown>>(
  clientErrors: Ref<Partial<Record<keyof T, string>>>,
) => {
  /**
   * Backend error message.
   * Only one backend error is supported at a time.
   */
  const serverError = ref<string | null>(null)

  /**
   * Target top-level field that the backend error belongs to.
   *
   * IMPORTANT:
   * This MUST be a top-level field key of the form (keyof T).
   * Do NOT use nested paths such as `items.0.itemName`.
   */
  const errorTargetField = ref<keyof T | null>(null)

  /**
   * Assign backend error to a specific top-level field.
   *
   * Backend error has higher priority than client-side validation error.
   *
   * @param field - Target top-level field name (keyof T)
   * @param message - Backend error message
   */
  const setBackendError = (field: keyof T, message: string) => {
    serverError.value = message
    errorTargetField.value = field
  }

  /**
   * Clear backend error when user edits the related field.
   *
   * NOTE:
   * This should be called ONLY with a top-level field name.
   * Clearing nested paths is intentionally NOT supported.
   *
   * @param field - Edited top-level field name (keyof T)
   */
  const clearBackendError = (field: keyof T) => {
    if (errorTargetField.value === field) {
      serverError.value = null
      errorTargetField.value = null
    }
  }

  /**
   * Resolve error message for a field.
   *
   * Priority:
   * 1. Backend error (if field matches errorTargetField)
   * 2. Client-side validation error (vee-validate)
   *
   * @param field - Target top-level field name
   * @returns Error message or undefined
   */
  const fieldError = <K extends keyof T>(field: K): string | undefined => {
    if (errorTargetField.value === field) {
      return serverError.value ?? clientErrors.value[field]
    }

    return clientErrors.value[field]
  }

  return {
    serverError,
    errorTargetField,
    setBackendError,
    clearBackendError,
    fieldError,
  }
}
