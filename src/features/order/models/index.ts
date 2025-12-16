export enum OrderPageName {
  HOME = "Home",
  ORDER_CREATE = "OrderCreate",
  ORDER_DETAIL = "OrderDetail",
}

export type OrderDetailResponse = {
  id: string
  orderName: string
  orderDescription?: string
  ownerUid: string
  maxParticipants: number
  participantsCount: number
  lastOrderAt: Date
  createdAt: Date
}
