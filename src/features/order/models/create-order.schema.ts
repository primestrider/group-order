import { z } from "zod"

export const createOrderSchema = z.object({
  orderName: z
    .string()
    .min(3, "Order name must be at least 3 characters long")
    .max(50, "Order name cannot exceed 50 characters"),

  orderDescription: z
    .string()
    .max(200, "Order description cannot exceed 200 characters")
    .optional(),

  maxParticipants: z
    .number({
      invalid_type_error: "Please enter a valid number",
    })
    .int("Please enter a whole number")
    .min(1, "At least 1 participant is required")
    .max(100, "Maximum allowed participants is 100"),

  lastOrderAt: z
    .number({
      required_error: "Please select the last order date and time",
      invalid_type_error: "Invalid date and time",
    })
    .refine((value) => !Number.isNaN(new Date(value).getTime()), {
      message: "Please select a valid date and time",
    })
    .refine((value) => value > Date.now(), {
      message: "Please select a later date and time",
    }),
})

export type CreateOrderValues = z.infer<typeof createOrderSchema>
