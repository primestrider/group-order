import { type OrderDetailResponse, OrderStatus } from "../models"

/**
 * Order accepts new / edited items only while open and before the deadline.
 * Orders created before `status` existed are treated as open.
 */
export const isOrderOpen = (
  order: Pick<OrderDetailResponse, "status" | "lastOrderAt">,
  now: number = Date.now(),
): boolean => order.status !== OrderStatus.CLOSED && order.lastOrderAt.getTime() > now
