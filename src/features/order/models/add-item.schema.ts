import { z } from "zod"

/**
 * addItemSchema
 *
 * Validation schema for Add Item form.
 *
 * Rules:
 * - participantName: required, max 50 chars
 * - items:
 *   - minimum 1 item
 *   - maximum 10 items
 *   - each item:
 *     - itemName: required, max 100 chars
 *     - quantity: integer >= 1
 * - note: optional, max 200 chars
 */
export const addItemSchema = z.object({
  participantName: z
    .string()
    .min(1, "Participant name is required")
    .max(50, "Participant name must be at most 50 characters"),

  items: z
    .array(
      z.object({
        itemName: z
          .string()
          .min(1, "Item name is required")
          .max(100, "Item name must be at most 100 characters"),

        quantity: z
          .number({
            required_error: "Quantity is required",
            invalid_type_error: "Quantity must be a number",
          })
          .int("Quantity must be an integer")
          .min(1, "Quantity must be at least 1"),
      }),
    )
    .min(1, "At least one item is required")
    .max(10, "You can add up to 10 items only"),

  note: z.string().max(200, "Note must be at most 200 characters").optional(),
})

export type AddItemRequest = z.infer<typeof addItemSchema>

export type AddOrderItemPayload = AddItemRequest & {
  orderId: string
}
