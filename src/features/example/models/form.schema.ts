import { z } from "zod"

export const loginZodSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be at most 50 characters"),
})

export type LoginFormValues = z.infer<typeof loginZodSchema>

export const todoZodSchema = z.object({
  title: z
    .string()
    .min(3, "Todo title must be at least 3 characters")
    .max(100, "Todo title must be at most 100 characters"),
})

export type TodoFormValues = z.infer<typeof todoZodSchema>
