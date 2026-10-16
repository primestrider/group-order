import type { OrderDetailItems } from "../models"

export type OrderRecapLine = {
  itemName: string
  quantity: number
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
    for (const { itemName, quantity } of participant.items) {
      const key = toItemKey(itemName)
      const line = totals.get(key)

      if (line) {
        line.quantity += quantity
      } else {
        totals.set(key, { itemName: cleanItemName(itemName), quantity })
      }
    }
  }

  return [...totals.values()].sort(
    (a, b) => b.quantity - a.quantity || a.itemName.localeCompare(b.itemName),
  )
}

/**
 * Plain-text recap, ready to paste into chat with the seller
 */
export const formatOrderRecapText = (
  orderName: string,
  orderItems: OrderDetailItems[],
  labels: { total: string; participants: string; note: string },
): string => {
  const totalLines = summarizeOrderItems(orderItems).map(
    (line) => `- ${line.itemName} x${line.quantity}`,
  )

  const participantLines = orderItems.map((participant) => {
    const items = participant.items
      .map((item) => `${cleanItemName(item.itemName)} x${item.quantity}`)
      .join(", ")
    const note = participant.note ? ` (${labels.note} ${participant.note})` : ""
    return `- ${participant.participantName}: ${items}${note}`
  })

  return [
    orderName,
    "",
    `${labels.total}:`,
    ...totalLines,
    "",
    `${labels.participants}:`,
    ...participantLines,
  ].join("\n")
}
