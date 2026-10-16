export enum OrderPageName {
  HOME = "Home",
  ORDER_CREATE = "OrderCreate",
  ORDER_DETAIL = "OrderDetail",
}

export enum OrderStatus {
  OPEN = "open",
  CLOSED = "closed",
}

/**
 * Business errors thrown by order services (used as `Error.message`)
 */
export enum OrderItemError {
  CLOSED = "ORDER_CLOSED",
  FULL = "ORDER_FULL",
  MAX_BELOW_PARTICIPANTS = "ORDER_MAX_BELOW_PARTICIPANTS",
}

export type OrderDetailResponse = {
  id: string
  orderName: string
  orderDescription?: string
  ownerUid: string
  maxParticipants: number
  participantsCount: number
  status: OrderStatus
  /**
   * Shipping / extra cost, split evenly between participants (IDR)
   */
  extraFee: number
  /**
   * Where participants should pay (bank account, e-wallet, ...)
   */
  paymentInfo: string
  lastOrderAt: Date
  createdAt: Date
}

export type OrderItemLine = {
  itemName: string
  quantity: number
  /**
   * Unit price in IDR (0 when unknown)
   */
  price: number
}

export type OrderDetailItems = {
  id: string // userUid (doc id)
  participantName: string
  note?: string | null
  items: OrderItemLine[]
  /**
   * Marked by the order owner
   */
  isPaid: boolean
  createdByUid: string
  createdAt: Date
  updatedAt?: Date
}
