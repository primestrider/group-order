import { formatRupiah } from "@/shared/helpers/currency"

import type { OrderDetailItems, OrderItemLine } from "../models"

export type OrderRecapLine = {
  itemName: string
  quantity: number
  /**
   * Sum of price × quantity (participants may enter different prices)
   */
  subtotal: number
}

export type OrderRecapTotals = {
  itemsTotal: number
  extraFee: number
  grandTotal: number
  paidCount: number
}

const cleanItemName = (itemName: string): string => itemName.trim().replace(/\s+/g, " ")

/**
 * Normalize item name so "Es Teh", "es teh " and "es  teh" count as one item
 */
const toItemKey = (itemName: string): string => cleanItemName(itemName).toLowerCase()

/**
 * Sum quantities of the same item across all participants.
 *
 * - Display name follows the first occurrence (trimmed)
 * - Sorted by quantity desc, then name asc
 */
export const summarizeOrderItems = (orderItems: OrderDetailItems[]): OrderRecapLine[] => {
  const totals = new Map<string, OrderRecapLine>()

  for (const participant of orderItems) {
    for (const { itemName, quantity, price } of participant.items) {
      const key = toItemKey(itemName)
      const line = totals.get(key)

      if (line) {
        line.quantity += quantity
        line.subtotal += price * quantity
      } else {
        totals.set(key, {
          itemName: cleanItemName(itemName),
          quantity,
          subtotal: price * quantity,
        })
      }
    }
  }

  return [...totals.values()].sort(
    (a, b) => b.quantity - a.quantity || a.itemName.localeCompare(b.itemName),
  )
}

/**
 * Price of one participant's items (without extra fee)
 */
export const sumItemLines = (items: OrderItemLine[]): number =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0)

/**
 * Extra fee each participant pays; rounded up so the owner is never short
 */
export const extraFeeShare = (extraFee: number, participantCount: number): number =>
  participantCount > 0 ? Math.ceil(extraFee / participantCount) : 0

/**
 * Amount one participant has to pay
 */
export const participantTotal = (
  participant: OrderDetailItems,
  extraFee: number,
  participantCount: number,
): number => sumItemLines(participant.items) + extraFeeShare(extraFee, participantCount)

export const summarizeOrderTotals = (
  orderItems: OrderDetailItems[],
  extraFee: number,
): OrderRecapTotals => {
  const itemsTotal = orderItems.reduce((sum, item) => sum + sumItemLines(item.items), 0)

  return {
    itemsTotal,
    extraFee,
    grandTotal: itemsTotal + extraFee,
    paidCount: orderItems.filter((item) => item.isPaid).length,
  }
}

export type OrderRecapLabels = {
  total: string
  participants: string
  note: string
  extraFee: string
  grandTotal: string
  paid: string
}

/**
 * Plain-text recap, ready to paste into chat with the seller / participants
 */
export const formatOrderRecapText = (
  orderName: string,
  orderItems: OrderDetailItems[],
  extraFee: number,
  labels: OrderRecapLabels,
): string => {
  const totals = summarizeOrderTotals(orderItems, extraFee)

  const totalLines = summarizeOrderItems(orderItems).map(
    (line) =>
      `- ${line.itemName} x${line.quantity}` +
      (line.subtotal ? ` = ${formatRupiah(line.subtotal)}` : ""),
  )

  const participantLines = orderItems.map((participant) => {
    const items = participant.items
      .map((item) => `${cleanItemName(item.itemName)} x${item.quantity}`)
      .join(", ")
    const note = participant.note ? ` (${labels.note} ${participant.note})` : ""
    const amount = participantTotal(participant, extraFee, orderItems.length)
    const paid = participant.isPaid ? ` ✓ ${labels.paid}` : ""

    return (
      `- ${participant.participantName}: ${items}${note}` +
      (amount ? ` → ${formatRupiah(amount)}` : "") +
      paid
    )
  })

  const moneyLines = totals.grandTotal
    ? [
        "",
        ...(extraFee ? [`${labels.extraFee}: ${formatRupiah(extraFee)}`] : []),
        `${labels.grandTotal}: ${formatRupiah(totals.grandTotal)}`,
      ]
    : []

  return [
    orderName,
    "",
    `${labels.total}:`,
    ...totalLines,
    ...moneyLines,
    "",
    `${labels.participants}:`,
    ...participantLines,
  ].join("\n")
}
